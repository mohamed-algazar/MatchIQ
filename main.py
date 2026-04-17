import json
from utils import read_video, save_video
from trackers import Tracker
import os
from pathlib import Path
from visualizations.json_extractor import export_match_json

import cv2
import numpy as np
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator


def _resolve_input_video_path():
    root = Path(__file__).resolve().parent
    relative_name = Path("myvid.mp4")
    candidates = [
        root / "input_videos" / relative_name
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError(
        f"Input video not found. Checked: {', '.join(str(path) for path in candidates)}"
    )


def main():
    input_video_path = _resolve_input_video_path()
    video_frames = read_video(input_video_path)
    if not video_frames:
        raise ValueError(f"No frames could be read from video: {input_video_path}")

    print("Frames count:", len(video_frames))

    # Track
    tracker = Tracker('models/best.pt')
    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=False,
                                       stub_path='stubs/track_stubs.pkl')
    tracker.add_position_to_tracks(tracks)

    # Camera movement
    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(
        video_frames, read_from_stub=False, stub_path='stubs/camera_movement_stub.pkl')
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks, camera_movement_per_frame)

    # View transformer
    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)

    for frame_num in range(min(5, len(tracks['players']))):
        for track_id, track_info in tracks['players'][frame_num].items():
            pos = track_info.get('position_transformed')
            print(f"Frame {frame_num}, Player {track_id}: {pos}")
        break

    # Ball interpolation
    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

    # Speed and distance
    speed_and_distance_estimator = SpeedAndDistance_Estimator()
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    # Team assignment
    team_assigner = TeamAssigner()
    team_assigner.assign_team_color(video_frames[:5], tracks['players'][:5])

    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(
                video_frames[frame_num], track['bbox'], player_id)
            tracks['players'][frame_num][player_id]['team'] = team
            tracks['players'][frame_num][player_id]['team_color'] = \
                team_assigner.team_colors.get(team, (128, 128, 128))

    # Ball assignment
    player_assigner = PlayerBallAssigner()
    team_ball_control = []
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        players_only = {
            pid: p for pid, p in player_track.items()
            if p.get('team') in [1, 2]
        }
        assigned_player = player_assigner.assign_ball_to_player(players_only, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
            team_ball_control.append(team_ball_control[-1] if team_ball_control else 1)

    team_ball_control = np.array(team_ball_control)

    # Draw
    output_video_frames = tracker.draw_annotations(video_frames, tracks, team_ball_control)
    output_video_frames = camera_movement_estimator.draw_camera_movement(
        output_video_frames, camera_movement_per_frame)
    speed_and_distance_estimator.draw_speed_and_distance(output_video_frames, tracks)

    save_video(output_video_frames, 'output_videos/output_video.avi')
    export_match_json(tracks, team_ball_control, team_names=["Team A", "Team B"])


if __name__ == '__main__':
    main()