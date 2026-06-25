import sys
import os
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Any

# Add the AI Model directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
AI_MODEL_DIR = ROOT_DIR / "AI Model"
sys.path.append(str(AI_MODEL_DIR))

# Now import from the AI Model directory
from trackers import Tracker
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator
from utils import read_video, save_video

class AIProcessor:
    def __init__(self, model_path: str = None):
        self.AI_MODEL_DIR = AI_MODEL_DIR
        if model_path is None:
            model_path = str(AI_MODEL_DIR / "models" / "best.pt")
        self.tracker = Tracker(model_path)
        self.team_assigner = TeamAssigner()
        self.player_assigner = PlayerBallAssigner()
        self.view_transformer = ViewTransformer()
        self.speed_and_distance_estimator = SpeedAndDistance_Estimator()

    def process_video(self, input_video_path: str, output_video_path: str = None) -> Tuple[List[Dict], Dict]:
        """
        Processes a video and returns telemetry data and aggregated statistics.
        """
        # 1. Read Video
        video_frames = read_video(input_video_path)
        if not video_frames:
            raise ValueError(f"No frames could be read from video: {input_video_path}")

        # 2. Get Object Tracks
        tracks = self.tracker.get_object_tracks(video_frames, read_from_stub=False)
        self.tracker.add_position_to_tracks(tracks)

        # 3. Camera Movement Estimation
        camera_movement_estimator = CameraMovementEstimator(video_frames[0])
        camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames)
        camera_movement_estimator.add_adjust_positions_to_tracks(tracks, camera_movement_per_frame)

        # 4. View Transformation (Perspective)
        self.view_transformer.add_transformed_position_to_tracks(tracks)

        # 5. Interpolate Ball Positions
        tracks["ball"] = self.tracker.interpolate_ball_positions(tracks["ball"])

        # 6. Speed and Distance
        self.speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

        # 7. Team Assignment
        self.team_assigner.assign_team_color(video_frames[0], tracks['players'][0])
        
        for frame_num, player_track in enumerate(tracks['players']):
            for player_id, track in player_track.items():
                team = self.team_assigner.get_player_team(video_frames[frame_num], track['bbox'], player_id)
                tracks['players'][frame_num][player_id]['team'] = team
                tracks['players'][frame_num][player_id]['team_color'] = self.team_assigner.team_colors[team]

        # 8. Ball Acquisition & Possession
        team_ball_control = []
        for frame_num, player_track in enumerate(tracks['players']):
            ball_bbox = tracks['ball'][frame_num][1]['bbox']
            assigned_player = self.player_assigner.assign_ball_to_player(player_track, ball_bbox)

            if assigned_player != -1:
                tracks['players'][frame_num][assigned_player]['has_ball'] = True
                team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
            else:
                if team_ball_control:
                    team_ball_control.append(team_ball_control[-1])
                else:
                    team_ball_control.append(None)

        # 9. Calculate Statistics
        stats = self._calculate_stats(tracks, team_ball_control)

        # 10. Format Telemetry for Database
        telemetry_data = self._format_telemetry(tracks)

        # 11. Optionally save annotated video
        if output_video_path:
            output_frames = self.tracker.draw_annotations(video_frames, tracks, np.array([t if t else 0 for t in team_ball_control]))
            output_frames = camera_movement_estimator.draw_camera_movement(output_frames, camera_movement_per_frame)
            self.speed_and_distance_estimator.draw_speed_and_distance(output_frames, tracks)
            save_video(output_frames, output_video_path)

        return telemetry_data, stats

    def _calculate_stats(self, tracks: Dict, team_ball_control: List) -> Dict:
        """
        Calculates aggregated match statistics.
        """
        control_array = np.array([t for t in team_ball_control if t is not None])
        total_frames_with_control = len(control_array)
        
        possession_1 = 0
        possession_2 = 0
        if total_frames_with_control > 0:
            possession_1 = (control_array == 1).sum() / total_frames_with_control * 100
            possession_2 = (control_array == 2).sum() / total_frames_with_control * 100

        # Calculate movement stats
        total_dist_1 = 0
        total_dist_2 = 0
        max_speed = 0

        # Last frame contains cumulative distance
        last_frame_players = tracks['players'][-1]
        for pid, data in last_frame_players.items():
            dist = data.get('distance', 0)
            if data.get('team') == 1:
                total_dist_1 += dist
            elif data.get('team') == 2:
                total_dist_2 += dist
            
        # Find max speed across all frames and players
        all_speeds = []
        for frame in tracks['players']:
            for pid, data in frame.items():
                if 'speed' in data:
                    all_speeds.append(data['speed'])
        
        if all_speeds:
            max_speed = max(all_speeds)

        return {
            "possession_team_1": float(possession_1),
            "possession_team_2": float(possession_2),
            "total_distance_team_1": float(total_dist_1),
            "total_distance_team_2": float(total_dist_2),
            "top_speed": float(max_speed),
            "total_passes": 0 # Placeholder for future implementation
        }

    def _format_telemetry(self, tracks: Dict) -> List[Dict]:
        """
        Formats raw paths into database-friendly telemetry records per frame.
        """
        telemetry = []
        num_frames = len(tracks['players'])
        for i in range(num_frames):
            frame_data = {
                "players": [],
                "ball": None
            }
            
            # Players in this frame
            for pid, data in tracks['players'][i].items():
                frame_data["players"].append({
                    "id": pid,
                    "x": data['position'][0],
                    "y": data['position'][1],
                    "team": data.get('team'),
                    "has_ball": data.get('has_ball', False),
                    "speed": data.get('speed', 0),
                    "distance": data.get('distance', 0)
                })
            
            # Ball in this frame
            ball_data = tracks['ball'][i].get(1)
            if ball_data:
                frame_data["ball"] = {
                    "x": ball_data['position'][0],
                    "y": ball_data['position'][1]
                }
            
            telemetry.append(frame_data)
            
        return telemetry
