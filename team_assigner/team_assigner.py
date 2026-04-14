from sklearn.cluster import KMeans
import numpy as np
import cv2

class TeamAssigner:
    def __init__(self):
        self.team_colors = {}
        self.player_team_dict = {}
        self.kmeans = None
    
    def get_clustering_model(self, image):
        image_2d = image.reshape(-1, 3)
        kmeans = KMeans(n_clusters=2, init="k-means++", n_init=1)
        kmeans.fit(image_2d)
        return kmeans

    def get_player_color(self, frame, bbox):
        """Extract jersey color from the torso region only"""
        x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
        
        h = y2 - y1
        w = x2 - x1
        
        # Crop to jersey area only: 25%-65% height, 20%-80% width
        jersey_y1 = y1 + int(h * 0.25)
        jersey_y2 = y1 + int(h * 0.65)
        jersey_x1 = x1 + int(w * 0.20)
        jersey_x2 = x1 + int(w * 0.80)
        
        jersey_crop = frame[jersey_y1:jersey_y2, jersey_x1:jersey_x2]
        
        if jersey_crop.size == 0 or jersey_crop.shape[0] < 3 or jersey_crop.shape[1] < 3:
            return np.array([100, 100, 100])
        
        kmeans = self.get_clustering_model(jersey_crop)
        labels = kmeans.labels_
        clustered_image = labels.reshape(jersey_crop.shape[0], jersey_crop.shape[1])
        
        # الـ background عادةً في الـ corners
        corner_clusters = [
            clustered_image[0, 0],
            clustered_image[0, -1],
            clustered_image[-1, 0],
            clustered_image[-1, -1]
        ]
        # الـ background cluster هو الأكثر شيوعاً في الـ corners
        non_player_cluster = max(set(corner_clusters), key=corner_clusters.count)
        player_cluster = 1 - non_player_cluster
        
        return kmeans.cluster_centers_[player_cluster]

    def bgr_to_hsv_color(self, bgr_color):
        """تحويل لون BGR لـ HSV عشان نميز الألوان المتقاربة أحسن"""
        pixel = np.uint8([[bgr_color]])
        hsv = cv2.cvtColor(pixel, cv2.COLOR_BGR2HSV)
        return hsv[0][0].astype(float)

    def assign_team_color(self, frames, player_detections_list):
        player_colors_hsv = []
        frame_count = min(10, len(frames))  # نستخدم 10 frames بدل 5
        
        for frame_idx in range(frame_count):
            if frame_idx >= len(player_detections_list):
                break
            frame = frames[frame_idx]
            player_detection = player_detections_list[frame_idx]
            
            for _, detection in player_detection.items():
                bbox = detection["bbox"]
                bgr_color = self.get_player_color(frame, bbox)
                # نحول لـ HSV عشان الـ clustering يكون أدق
                hsv_color = self.bgr_to_hsv_color(bgr_color)
                player_colors_hsv.append(hsv_color)

        if len(player_colors_hsv) < 2:
            return

        player_colors_hsv = np.array(player_colors_hsv)

        kmeans = KMeans(n_clusters=2, init="k-means++", n_init=20, 
                       max_iter=300, random_state=42)
        kmeans.fit(player_colors_hsv)
        self.kmeans = kmeans

        # نرجع الألوان لـ BGR عشان نعرضها
        hsv_centers = kmeans.cluster_centers_
        bgr_colors = []
        for hsv in hsv_centers:
            pixel = np.uint8([[hsv]])
            bgr = cv2.cvtColor(pixel, cv2.COLOR_HSV2BGR)
            bgr_colors.append(bgr[0][0].astype(float))

        # الفريق الأفتح = team 1، الأغمق = team 2
        brightness = [np.mean(c) for c in bgr_colors]
        white_team = np.argmax(brightness)
        dark_team = np.argmin(brightness)

        self.team_colors[1] = tuple(map(int, bgr_colors[white_team]))
        self.team_colors[2] = tuple(map(int, bgr_colors[dark_team]))

        print(f"Team 1 (lighter color) color (BGR): {self.team_colors[1]}")
        print(f"Team 2 (darker color) color (BGR): {self.team_colors[2]}")

    def get_player_team(self, frame, player_bbox, player_id):
        if player_id in self.player_team_dict:
            return self.player_team_dict[player_id]

        if self.kmeans is None:
            return 0

        bgr_color = self.get_player_color(frame, player_bbox)
        hsv_color = self.bgr_to_hsv_color(bgr_color)
        team_id = self.kmeans.predict(hsv_color.reshape(1, -1))[0]
        team_id += 1

        self.player_team_dict[player_id] = team_id
        return team_id