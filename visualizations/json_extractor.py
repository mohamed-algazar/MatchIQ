import json
import os
from pathlib import Path
import numpy as np


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


def build_players(tracks):
    players = []
    for track_id, track_info in tracks['players'][0].items():
        
        positions = []
        for frame_num, frame_data in enumerate(tracks['players']):
            if track_id in frame_data:
                bbox = frame_data[track_id].get('bbox', [])
                if bbox:
                    x = (bbox[0] + bbox[2]) / 2
                    y = (bbox[1] + bbox[3]) / 2
                    positions.append({"frame": frame_num, "x": x, "y": y})

        player_entry = {
            "player_id": track_id,
            "team": track_info.get("team", "unknown"),
            "ball_control": track_info.get("has_ball", False),
            "avg_speed": track_info.get("speed", 0),
            "distance_covered": track_info.get("distance", 0),
            "touches": track_info.get("touches", 0),
            "positions": positions
        }
        players.append(player_entry)
    
    return players


def export_match_json(tracks, team_ball_control, team_names=["Team A", "Team B"]):
    team_ball_list = team_ball_control.tolist()
    team_1_possession = round(team_ball_list.count(1) / len(team_ball_list) * 100, 2)
    team_2_possession = round(100 - team_1_possession, 2)

    match_data = {
        "match_id": get_next_match_id(),
        "team_names": team_names,
        "team_possession": {
            "team_1": team_1_possession,
            "team_2": team_2_possession
        },
        "player": build_players(tracks)
    }

    def json_serializer(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    output_path = Path(__file__).resolve().parent.parent / 'match_data.json'
    with open(output_path, 'w') as f:
        json.dump(match_data, f, indent=4, default=json_serializer)
    
    print(f"match_data.json saved to {output_path}")