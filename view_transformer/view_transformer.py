import numpy as np 
import cv2

class ViewTransformer():
    def __init__(self):
        court_width = 68
        court_length = 105

        # =========================================================
        # Mapped EXACTLY to the green grass boundaries in your image:
        # Top-Left: Where grass meets the top/left edge near "NB"
        # Top-Right: Where grass meets the top/right edge 
        # Bottom-Right: Where grass meets the bottom/right edge near "PEPSI"
        # Bottom-Left: Where grass meets the bottom/left edge
        # =========================================================
        self.pixel_vertices = np.array([
            [130, 80],     # Top-Left grass edge
            [1820, 100],   # Top-Right grass edge
            [1870, 1080],  # Bottom-Right grass edge
            [70, 1080]     # Bottom-Left grass edge
        ])
        
        self.target_vertices = np.array([
            [0, 0],
            [court_length, 0],
            [court_length, court_width],
            [0, court_width]
        ])

        self.pixel_vertices = self.pixel_vertices.astype(np.float32)
        self.target_vertices = self.target_vertices.astype(np.float32)

        self.perspective_transformer = cv2.getPerspectiveTransform(
            self.pixel_vertices, self.target_vertices
        )

    def transform_point(self, point):
        reshaped_point = point.reshape(-1, 1, 2).astype(np.float32)
        transform_point = cv2.perspectiveTransform(reshaped_point, self.perspective_transformer)
        return transform_point.reshape(-1, 2)

    def add_transformed_position_to_tracks(self, tracks):
        for object, object_tracks in tracks.items():
            for frame_num, track in enumerate(object_tracks):
                for track_id, track_info in track.items():
                    position = track_info['position_adjusted']
                    position = np.array(position)
                    position_transformed = self.transform_point(position)
                    if position_transformed is not None:
                        position_transformed = position_transformed.squeeze().tolist()
                    tracks[object][frame_num][track_id]['position_transformed'] = position_transformed