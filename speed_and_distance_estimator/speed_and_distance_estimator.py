import cv2
import sys  
import numpy as np
sys.path.append('../')
from utils import measure_distance, get_foot_position

class SpeedAndDistance_Estimator():
    def __init__(self):
        self.frame_rate = 24
        self.distance_accumulator = {}
        self.speed_history = {}
        
        # NEW: Store smoothed real-world coordinates to kill jitter
        self.smoothed_positions = {} 
        # 0.2 means 20% new position, 80% old position. Heavily smooths jitter.
        self.position_smoothing_alpha = 0.2  
        self.speed_window_size = 5

    def add_speed_and_distance_to_tracks(self, tracks):
        for object, object_tracks in tracks.items():
            if object == "ball" or object == "referees":
                continue 
            
            if object not in self.distance_accumulator:
                self.distance_accumulator[object] = {}
            if object not in self.speed_history:
                self.speed_history[object] = {}
            if object not in self.smoothed_positions:
                self.smoothed_positions[object] = {}

            # Initialize to 0 for all frames
            for frame_num in range(len(object_tracks)):
                for track_id in object_tracks[frame_num]:
                    if track_id not in self.distance_accumulator[object]:
                        self.distance_accumulator[object][track_id] = 0.0
                    if track_id not in self.speed_history[object]:
                        self.speed_history[object][track_id] = []
                    if track_id not in self.smoothed_positions[object]:
                        self.smoothed_positions[object][track_id] = None
                        
                    object_tracks[frame_num][track_id]['speed'] = 0.0
                    object_tracks[frame_num][track_id]['distance'] = 0.0
            
            number_of_frames = len(object_tracks)
            
            for frame_num in range(1, number_of_frames):
                for track_id in object_tracks[frame_num]:
                    if track_id not in object_tracks[frame_num - 1]:
                        self.speed_history[object][track_id].append(0.0)
                        continue

                    curr_pos = object_tracks[frame_num][track_id].get('position_transformed')
                    
                    if curr_pos is None:
                        self.speed_history[object][track_id].append(0.0)
                        continue
                        
                    curr_np = np.array(curr_pos)
                    
                    # Sanity check bounds
                    if np.any(curr_np < -5) or np.any(curr_np > 110):
                        self.speed_history[object][track_id].append(0.0)
                        continue
                    
                    # =========================================================
                    # THE FIX: Smooth the coordinates BEFORE calculating distance!
                    # This stops 2 pixels of YOLO jitter from becoming 0.3 meters
                    # =========================================================
                    prev_smoothed = self.smoothed_positions[object][track_id]
                    
                    if prev_smoothed is None:
                        # First time seeing this player
                        smoothed_pos = curr_np
                    else:
                        # Blend new position with previous smoothed position
                        smoothed_pos = (self.position_smoothing_alpha * curr_np) + \
                                       ((1 - self.position_smoothing_alpha) * prev_smoothed)
                    
                    self.smoothed_positions[object][track_id] = smoothed_pos
                    
                    # Calculate distance ONLY between smoothed positions
                    if prev_smoothed is not None:
                        dist = measure_distance(smoothed_pos, prev_smoothed)
                    else:
                        dist = 0.0
                    
                    # Max sprint is ~12 m/s. At 24fps, max per frame is 0.5m.
                    # Anything higher is a glitch or ID switch
                    if dist > 0.5: 
                        dist = 0.0 
                        
                    self.distance_accumulator[object][track_id] += dist
                    
                    # Instantaneous speed
                    frame_speed_kmh = (dist * self.frame_rate) * 3.6
                    self.speed_history[object][track_id].append(frame_speed_kmh)
                    
                    # Smooth speed over last 5 frames
                    window = self.speed_history[object][track_id][-self.speed_window_size:]
                    smoothed_speed = np.mean(window)
                    
                    # Absolute max cap (World record is ~45 km/h)
                    if smoothed_speed > 36.0: 
                        smoothed_speed = 36.0
                    
                    tracks[object][frame_num][track_id]['speed'] = smoothed_speed
                    tracks[object][frame_num][track_id]['distance'] = self.distance_accumulator[object][track_id]
    
    def draw_speed_and_distance(self, frames, tracks):
        for frame_num, frame in enumerate(frames):
            for object, object_tracks in tracks.items():
                if object == "ball" or object == "referees":
                    continue 
                
                for _, track_info in object_tracks[frame_num].items():
                   if "speed" in track_info and "distance" in track_info:
                       speed = track_info['speed']
                       distance = track_info['distance']
                       
                       if np.isnan(speed) or np.isnan(distance):
                           continue
                       
                       bbox = track_info['bbox']
                       position = get_foot_position(bbox)
                       position = list(position)
                       position[1] += 40

                       position = tuple(map(int, position))
                       cv2.putText(frame, f"{speed:.2f} km/h", position, cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
                       cv2.putText(frame, f"{distance:.2f} m", (position[0], position[1] + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
        return frames