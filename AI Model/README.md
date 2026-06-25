# Tactical AI Analysis Engine: Professional Computer Vision Pipeline

A high-performance computer vision engine specifically designed for football tactical analysis. This module leverages state-of-the-art object detection and tracking algorithms to transform raw match footage into structured spatial data.

## 1. Core Analytical Capabilities

The tactical engine implements a multi-stage pipeline to extract meaningful insights from video streams:

- **Object Detection & Tracking**: Utilizes YOLO (You Only Look Once) for high-precision detection of players, referees, and the ball, integrated with ByteTrack for consistent identity persistence across frames.
- **Team Identification**: Employs K-Means clustering for pixel-level color segmentation to automatically assign players to their respective teams based on kit colors.
- **Camera Movement Compensation**: Uses Optical Flow techniques to estimate camera motion, ensuring spatial accuracy even during dynamic panning and zooming.
- **Perspective Transformation**: Maps 2D pixel coordinates to a normalized 3D perspective pitch model, enabling distance and speed measurements in real-world meters.
- **Performance Metrics**: Calculates individual player statistics including top speed, total distance covered, and team-level metrics like possession percentage.

## 2. Technical Architecture

- **Primary Model**: YOLO (Optimized for sports-specific detection)
- **Tracking Algorithm**: ByteTrack / BoT-SORT
- **Coordinate System**: Normalized Pitch Grid (0-100 scale)
- **Data Output**: JSON-serialized telemetry and frame-by-frame coordinate mapping

## 3. Directory Structure

- `camera_movement_estimator/`: Logic for handling panning and zooming compensation.
- `team_assigner/`: K-Means based kit color clustering and assignment.
- `trackers/`: Core YOLO detection and tracking implementation.
- `view_transformer/`: Homography and perspective pitch mapping.
- `speed_and_distance_estimator/`: Analytical calculations for physical performance logs.
- `utils/`: Video I/O and frame manipulation helpers.

## 4. Requirements

- Python 3.11+
- [Ultralytics](https://github.com/ultralytics/ultralytics) (YOLO Implementation)
- [Supervision](https://github.com/roboflow/supervision) (Computer Vision Utilities)
- OpenCV, NumPy, Pandas, Matplotlib

## 5. Integration

This module is designed as a standalone inference engine that can be easily integrated into backend services. It is currently the core analytical driver for the **Football Analytics Platform**, invoked via the `AIProcessor` service.
