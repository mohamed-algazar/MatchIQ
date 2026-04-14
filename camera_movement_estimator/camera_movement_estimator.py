import pickle
import cv2
import numpy as np
import os
import sys 
sys.path.append('../')
from utils import measure_distance, measure_xy_distance

class CameraMovementEstimator():
    def __init__(self, frame):
        self.minimum_distance = 5

        first_frame_grayscale = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        h, w = first_frame_grayscale.shape

        # Mask focuses on edges where there are no players (crowd/ads)
        mask_features = np.zeros_like(first_frame_grayscale)
        mask_features[:, 0:20] = 1
        mask_features[:, w-150:w] = 1

        self.features = dict(
            maxCorners=100,
            qualityLevel=0.3,
            minDistance=3,
            blockSize=7,
            mask=mask_features
        )

    def add_adjust_positions_to_tracks(self, tracks, camera_movement_per_frame):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    position = track_info['position']
                    camera_movement = camera_movement_per_frame[frame_num]
                    position_adjusted = (position[0]-camera_movement[0], position[1]-camera_movement[1])
                    tracks[object][frame_num][track_id]['position_adjusted'] = position_adjusted

    def get_camera_movement(self, frames, read_from_stub=False, stub_path=None):
        if read_from_stub and stub_path is not None and os.path.exists(stub_path):
            with open(stub_path, 'rb') as f:
                return pickle.load(f)
        
        camera_movement = [[0, 0]] * len(frames)
        old_gray = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
        old_features = cv2.goodFeaturesToTrack(old_gray, **self.features)

        for frame_num in range(1, len(frames)):
            frame_gray = cv2.cvtColor(frames[frame_num], cv2.COLOR_BGR2GRAY)

            if old_features is None or len(old_features) < 5:
                old_features = cv2.goodFeaturesToTrack(frame_gray, **self.features)
                old_gray = frame_gray.copy()
                continue
                
            # Calculate optical flow
            new_features, status, _ = cv2.calcOpticalFlowPyrLK(
                old_gray, frame_gray, old_features, None, 
                winSize=(15, 15), maxLevel=2, 
                criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
            )

            if new_features is None or status is None:
                old_gray = frame_gray.copy()
                continue
            
            # KEEP ONLY POINTS THAT WERE SUCCESSFULLY TRACKED
            good_old = old_features[status == 1]
            good_new = new_features[status == 1]

            if len(good_old) < 5:
                old_features = cv2.goodFeaturesToTrack(frame_gray, **self.features)
                old_gray = frame_gray.copy()
                continue

            # =================================================================
            # THE FIX: Use RANSAC to find the TRUE camera movement.
            # RANSAC looks at ALL points, ignores the outliers (like birds, 
            # players walking into the edge), and calculates the actual camera pan.
            # =================================================================
            transform, inliers = cv2.estimateAffinePartial2D(
                good_old, good_new, method=cv2.RANSAC, ransacReprojThreshold=3.0
            )

            if transform is not None:
                dx = transform[0, 2]
                dy = transform[1, 2]
                total_movement = np.sqrt(dx**2 + dy**2)
                
                if total_movement > self.minimum_distance:
                    camera_movement[frame_num] = [dx, dy]
                
                # =================================================================
                # THE FIX 2: Keep tracking the SAME points! Do not re-detect.
                # This stops the accumulated drift error over 16 seconds.
                # =================================================================
                old_features = good_new.reshape(-1, 1, 2)
            else:
                # Only re-detect features if the transform completely fails
                old_features = cv2.goodFeaturesToTrack(frame_gray, **self.features)

            old_gray = frame_gray.copy()

        if stub_path is not None:
            with open(stub_path, 'wb') as f:
                pickle.dump(camera_movement, f)

        return camera_movement

    def draw_camera_movement(self, frames, camera_movement_per_frame):
        for frame_num, frame in enumerate(frames):
            overlay = frame.copy()
            cv2.rectangle(overlay, (0, 0), (500, 100), (255, 255, 255), -1)
            cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

            x_movement, y_movement = camera_movement_per_frame[frame_num]
            cv2.putText(frame, f"Camera Movement X: {x_movement:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3)
            cv2.putText(frame, f"Camera Movement Y: {y_movement:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 3)

        return frames