import json
from utils import read_video, save_video
from trackers import Tracker
import os
from pathlib import Path
print("Current working dir:", os.getcwd())

import cv2


import numpy as np
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator


def _resolve_input_video_path():
    root = Path(__file__).resolve().parent
    relative_name = Path("08fd33_4.mp4")
    candidates = [
        root / "input_videos" / relative_name, 
        root / "input_vidoes" / relative_name,  
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    raise FileNotFoundError(
        f"Input video not found. Checked: {', '.join(str(path) for path in candidates)}"
    )

def get_next_match_id():
    counter_file = 'match_counter.txt'
    
    if os.path.exists(counter_file):
        with open(counter_file, 'r') as f:
            last_id = int(f.read().strip())
    else:
        last_id = 0
    
    new_id = last_id + 1
    
    with open(counter_file, 'w') as f:
        f.write(str(new_id))
    
    return f"match_{new_id:04d}"


def main():
    # Read Video
    input_video_path = _resolve_input_video_path()
    video_frames = read_video(input_video_path)
    if not video_frames:
        raise ValueError(f"No frames could be read from video: {input_video_path}")

    # Initialize Tracker
    tracker = Tracker('models/best.pt')

    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=True,
                                       stub_path='stubs/track_stubs.pkl')
    # Get object positions 
    tracker.add_position_to_tracks(tracks)

    # camera movement estimator
    print("Frames count:", len(video_frames))
  
    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames,
                                                                                read_from_stub=True,
                                                                                stub_path='stubs/camera_movement_stub.pkl')
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks,camera_movement_per_frame)


    # View Trasnformer
    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)

    # Interpolate Ball Positions
    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

    # Speed and distance estimator
    speed_and_distance_estimator = SpeedAndDistance_Estimator()
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    # Assign Player Teams
    team_assigner = TeamAssigner()
    team_assigner.assign_team_color(video_frames[0], 
                                    tracks['players'][0])
    
    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team = team_assigner.get_player_team(video_frames[frame_num],   
                                                 track['bbox'],
                                                 player_id)
            tracks['players'][frame_num][player_id]['team'] = team 
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team]

    
    # Assign Ball Aquisition
    player_assigner =PlayerBallAssigner()
    team_ball_control= []
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
            team_ball_control.append(team_ball_control[-1])
    team_ball_control= np.array(team_ball_control)
    team_1_possession = np.sum(team_ball_control == 'team_1') / len(team_ball_control)
    team_2_possession = np.sum(team_ball_control == 'team_2') / len(team_ball_control)

    # Build per-player records by merging tracks + speed_distance
    players = []
    for track_id, track_info in tracks['players'].items():
        player_entry = {
            "player_id": track_id,
            "team": track_info.get("team", "unknown"),
            "ball_control": track_info.get("ball_control", 0),
            "avg_speed": speed_and_distance_estimator[track_id].get("avg_speed", 0),
            "distance_covered": speed_and_distance_estimator[track_id].get("distance_covered", 0),
            "touches": track_info.get("touches", 0)
        }
        players.append(player_entry)

    # Draw output 
    ## Draw object Tracks
    output_video_frames = tracker.draw_annotations(video_frames, tracks,team_ball_control)

    ## Draw Camera movement
    output_video_frames = camera_movement_estimator.draw_camera_movement(output_video_frames,camera_movement_per_frame)

    ## Draw Speed and Distance
    speed_and_distance_estimator.draw_speed_and_distance(output_video_frames,tracks)

    # Save video
    save_video(output_video_frames, 'output_videos/output_video.avi')

    match_data = {
        "match_id": get_next_match_id(),
        "team_names": ["Team A", "Team B"],
        "team_possession": {
        "team_1": team_1_possession,
        "team_2": team_2_possession
        },
        "player": players ,
        'tracks': tracks,  
        'events': [],  # ← missing
        'camera_movement': camera_movement_per_frame
        }

    json_str = json.dumps(match_data, default=lambda o: o.__dict__, indent=4)
    with open('match_data.json', 'w') as json_file:
        json_file.write(json_str)


if __name__ == '__main__':
    main()
