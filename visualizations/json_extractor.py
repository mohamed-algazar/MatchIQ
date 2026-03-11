# import necessary libraries
import json
import os
from pathlib import Path
import numpy as np

# generate a unique match ID by incrementing a counter stored in a file
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

# Assign ball touches based on proximity to the ball
def assign_ball_touches(tracks, distance_threshold=70):
    # Check if the ball exists in this frame
    for frame_num, player_track in enumerate(tracks['players']):
        if not tracks['ball'][frame_num] or 1 not in tracks['ball'][frame_num]:
            continue
        # Calculate the center of the ball
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        ball_x = (ball_bbox[0] + ball_bbox[2]) / 2
        ball_y = (ball_bbox[1] + ball_bbox[3]) / 2

        # Check each player in the frame to see if they are close
        # enough to the ball to be considered as having touched it
        for player_id, track in player_track.items():
            player_bbox = track.get('bbox', [])
            if not player_bbox:
                continue

            player_x = (player_bbox[0] + player_bbox[2]) / 2
            player_y = (player_bbox[1] + player_bbox[3]) / 2

            distance = np.sqrt((ball_x - player_x)**2 + (ball_y - player_y)**2)

            # If the player is within the distance threshold, we consider it a touch
            if distance < distance_threshold:
                tracks['players'][frame_num][player_id]['has_ball'] = True
                tracks['players'][frame_num][player_id]['touches'] = track.get('touches', 0) + 1
            else:
                tracks['players'][frame_num][player_id]['has_ball'] = False
                
# Build player data dictionary by aggregating information across frames
def build_players(tracks):
    players = []
    # gather all unique player IDs across all frames
    all_player_ids = set()
    for frame_data in tracks['players']:
        all_player_ids.update(frame_data.keys())
    # Capture the first apperance of each player
    for track_id in all_player_ids:
        track_info = {}
        for frame_data in tracks['players']:
            if track_id in frame_data:
                track_info = frame_data[track_id]
                break
        # Calculate average position across all frames where the player appears
        positions = []
        for frame_num, frame_data in enumerate(tracks['players']):
            if track_id in frame_data:
                bbox = frame_data[track_id].get('bbox', [])
                if bbox:
                    x = (bbox[0] + bbox[2]) / 2
                    y = (bbox[1] + bbox[3]) / 2
                    positions.append({"frame": frame_num, "x": x, "y": y})

        avg_x = round(np.mean([p["x"] for p in positions]), 2) if positions else 0
        avg_y = round(np.mean([p["y"] for p in positions]), 2) if positions else 0

        # Build player dictionary with aggregated information
        player_entry = {
            "player_id": track_id,
            "team": track_info.get("team", "unknown"),
            "ball_control": track_info.get("has_ball", False),
            "avg_speed": track_info.get("speed", 0),
            "distance_covered": track_info.get("distance", 0),
            "touches": track_info.get("touches", 0),
            "avg_position": {"x": avg_x, "y": avg_y},
            "positions": positions
        }
        players.append(player_entry)

    return players

# Main function to export match data to JSON
def export_match_json(tracks, team_ball_control, team_names=["Team A", "Team B"]):
    # Calculate possession percentages based on ball control data
    team_ball_list = team_ball_control.tolist()
    team_1_possession = round(team_ball_list.count(1) / len(team_ball_list) * 100, 2)
    team_2_possession = round(100 - team_1_possession, 2)

    # Run touch assignment before building player data
    assign_ball_touches(tracks)

    # Build the match data dictionary to be exported as JSON
    match_data = {
        "match_id": get_next_match_id(),
        "team_names": team_names,
        "team_possession": {
            "team_1": team_1_possession,
            "team_2": team_2_possession
        },
        "player": build_players(tracks)
    }

    # Handle serialization of numpy data types when dumping to JSON
    def json_serializer(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    # Save the match data to a JSON file in the parent directory of this script
    output_path = Path(__file__).resolve().parent.parent / 'match_data.json'
    with open(output_path, 'w') as f:
        json.dump(match_data, f, indent=4, default=json_serializer)
    
    print(f"match_data.json saved to {output_path}")