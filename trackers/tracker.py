from ultralytics import YOLO
import supervision as sv
import pickle
import os
import numpy as np
import pandas as pd
import cv2
import sys 
sys.path.append('../')
from utils import get_center_of_bbox, get_bbox_width, get_foot_position

class Tracker:
    def __init__(self, model_path):
        self.model = YOLO(model_path) 
        self.tracker = sv.ByteTrack()

    def add_position_to_tracks(self, tracks):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    bbox = track_info['bbox']
                    if object == 'ball':
                        position = get_center_of_bbox(bbox)
                    else:
                        position = get_foot_position(bbox)
                    tracks[object][frame_num][track_id]['position'] = position

    def interpolate_ball_positions(self, ball_positions):
        ball_positions = [x.get(1,{}).get('bbox',[]) for x in ball_positions]
        df_ball_positions = pd.DataFrame(ball_positions, columns=['x1','y1','x2','y2'])
        df_ball_positions = df_ball_positions.interpolate()
        df_ball_positions = df_ball_positions.bfill()
        ball_positions = [{1: {"bbox":x}} for x in df_ball_positions.to_numpy().tolist()]
        return ball_positions

    def detect_frames(self, frames):
        batch_size = 20 
        detections = [] 
        for i in range(0, len(frames), batch_size):
            detections_batch = self.model.predict(frames[i:i+batch_size], conf=0.4, verbose=False)
            detections += detections_batch
        return detections

    '''
        The get_object_tracks function detects objects in the video frames and
        tracks them across frames. It uses the ByteTrack tracker to assign track IDs to the
        detected objects like players, goalkeepers, and referees and it uses Yolo detections to
        track the ball. The function also has the option to read from and write to stubs to save
        time during testing.
    '''
    def get_object_tracks(self, frames, read_from_stub=False, stub_path=None):
        # check if we can read the stubs and return the tracks from there so it is less time
        # consuming to test the rest of the pipeline
        if read_from_stub and stub_path is not None and os.path.exists(stub_path):
            with open(stub_path,'rb') as f:
                tracks = pickle.load(f)
            return tracks

        detections = self.detect_frames(frames)

        tracks = {
            "players": [],
            "goalkeepers": [],
            "referees": [],
            "ball": []
        }

        for frame_num, detection in enumerate(detections):
            cls_names = detection.names
            cls_names_inv = {v:k for k,v in cls_names.items()}

            detection_supervision = sv.Detections.from_ultralytics(detection)

            detection_with_tracks = self.tracker.update_with_detections(detection_supervision)

            tracks["players"].append({})
            tracks["goalkeepers"].append({})
            tracks["referees"].append({})
            tracks["ball"].append({})

            # loops through all the detections and adds the bounding box to
            # the correct track based on the class and track id
            for frame_detection in detection_with_tracks:
                bbox = frame_detection[0].tolist()
                cls_id = frame_detection[3]
                track_id = frame_detection[4]
            
                if cls_id == cls_names_inv['player']:
                    tracks["players"][frame_num][track_id] = {"bbox": bbox}
                elif cls_id == cls_names_inv['goalkeeper']:
                    tracks["goalkeepers"][frame_num][track_id] = {"bbox": bbox}
                elif cls_id == cls_names_inv['referee']:
                    tracks["referees"][frame_num][track_id] = {"bbox": bbox}

            # Ball detection done seperately bec the ByteTrack tracker is not good
            # at tracking the ball and often loses it, so we take
            # the best ball detection from the YOLO model for
            # each frame and add it to the tracks based on the confidence score
            best_ball_conf = -1
            for box in detection.boxes:
                cls_id = int(box.cls[0])
                if cls_id == cls_names_inv['ball']:
                    conf = float(box.conf[0])
                    if conf > best_ball_conf:
                        best_ball_conf = conf
                        tracks["ball"][frame_num][1] = {"bbox": box.xyxy[0].tolist()}

        if stub_path is not None:
            with open(stub_path,'wb') as f:
                pickle.dump(tracks, f)

        return tracks
    
    def draw_ellipse(self, frame, bbox, color, track_id=None):
        y2 = int(bbox[3])
        x_center, _ = get_center_of_bbox(bbox)
        width = get_bbox_width(bbox)

        cv2.ellipse(
            frame,
            center=(x_center, y2),
            axes=(int(width), int(0.35*width)),
            angle=0.0,
            startAngle=-45,
            endAngle=235,
            color=color,
            thickness=2,
            lineType=cv2.LINE_4
        )

        if track_id is not None:
            rectangle_width = 40
            rectangle_height = 20
            x1_rect = x_center - rectangle_width//2
            x2_rect = x_center + rectangle_width//2
            y1_rect = (y2 - rectangle_height//2) + 15
            y2_rect = (y2 + rectangle_height//2) + 15

            cv2.rectangle(frame,
                          (int(x1_rect), int(y1_rect)),
                          (int(x2_rect), int(y2_rect)),
                          color,
                          cv2.FILLED)
            
            x1_text = x1_rect + 12
            if track_id > 99:
                x1_text -= 10
            
            cv2.putText(
                frame,
                f"{track_id}",
                (int(x1_text), int(y1_rect+15)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                2
            )

        return frame

    def draw_traingle(self, frame, bbox, color):
        y = int(bbox[1])
        x, _ = get_center_of_bbox(bbox)

        triangle_points = np.array([
            [x, y],
            [x-10, y-20],
            [x+10, y-20],
        ])
        cv2.drawContours(frame, [triangle_points], 0, color, cv2.FILLED)
        cv2.drawContours(frame, [triangle_points], 0, (0,0,0), 2)

        return frame

    def draw_team_ball_control(self, frame, frame_num, team_ball_control):
        overlay = frame.copy()
        cv2.rectangle(overlay, (1350, 850), (1900, 970), (255, 255, 255), -1)
        cv2.addWeighted(overlay, 0.4, frame, 0.6, 0, frame)

        team_ball_control_till_frame = team_ball_control[:frame_num+1]
        
        team_1_num_frames = np.sum(team_ball_control_till_frame == 1)
        team_2_num_frames = np.sum(team_ball_control_till_frame == 2)
        total = team_1_num_frames + team_2_num_frames
        
        if total == 0:
            team_1 = team_2 = 0.5
        else:
            team_1 = team_1_num_frames / total
            team_2 = team_2_num_frames / total

        cv2.putText(frame, f"Team 1 Ball Control: {team_1*100:.2f}%", (1400,900), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)
        cv2.putText(frame, f"Team 2 Ball Control: {team_2*100:.2f}%", (1400,950), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 3)

        return frame

    def draw_annotations(self, video_frames, tracks, team_ball_control):
        for frame_num, frame in enumerate(video_frames):
            player_dict = tracks["players"][frame_num]
            ball_dict = tracks["ball"][frame_num]
            referee_dict = tracks["referees"][frame_num]

            # Draw players
            for track_id, player in player_dict.items():
                color = player.get("team_color", (0, 0, 255))
                frame = self.draw_ellipse(frame, player["bbox"], color, track_id)
                if player.get('has_ball', False):
                    frame = self.draw_traingle(frame, player["bbox"], (0,0,255))

            # Draw referees - yellow, no team assignment
            for track_id, referee in referee_dict.items():
                frame = self.draw_ellipse(frame, referee["bbox"], (0, 255, 255), None)

            # Draw ball
            for track_id, ball in ball_dict.items():
                frame = self.draw_traingle(frame, ball["bbox"], (0,255,0))

            frame = self.draw_team_ball_control(frame, frame_num, team_ball_control)

        return video_frames