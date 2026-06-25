<div align="center">

# ⚽ MatchIQ
### AI-Powered Football Match Analysis System

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-FF6B35?style=for-the-badge)](https://ultralytics.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/mohamed-algazar/-MatchIQ/ci.yml?style=for-the-badge&label=CI)](https://github.com/mohamed-algazar/-MatchIQ/actions)

**Graduation Project · Faculty of Computers and Artificial Intelligence, Helwan University · June 2026**

[Demo](#-demo) · [Architecture](#-system-architecture) · [Results](#-results) · [Quick Start](#-quick-start) · [Roadmap](#-roadmap)

</div>

---

## 🧠 What is MatchIQ?

MatchIQ is an end-to-end football video analytics platform that transforms raw match footage into structured tactical intelligence — without any manual annotation.

Given a match video, the system automatically:

- **Detects** every player, referee, and the ball per frame using a fine-tuned YOLOv8 model
- **Tracks** each entity across the full video with persistent IDs via StrongSORT
- **Projects** pixel coordinates onto a real-world 2D pitch map using a custom Geometry Layer (homography + optical flow camera compensation)
- **Computes** per-player speed, distance covered, and acceleration with physics-based smoothing
- **Classifies** team membership via KMeans jersey-color clustering
- **Generates** tactical outputs: heatmaps, pass networks, ball possession timelines
- **Serves** all results through a React dashboard with video playback, overlays, and JSON export

> **Graduation Grade: A+** — Helwan University, Faculty of Computers and Artificial Intelligence

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 🎯 **Object Detection** | YOLOv8 fine-tuned on SoccerNet · **mAP50: 0.843** |
| 🔁 **Multi-Object Tracking** | StrongSORT — handles occlusion, re-entry, and ID persistence |
| 📐 **Geometry Layer** | Homography calibration + optical flow camera motion compensation + pixel→meters transform *(novel contribution)* |
| 🏃 **Player Metrics** | Per-player speed (km/h), distance (m), acceleration with rolling-median smoothing & 13 m/s outlier cap |
| 👕 **Team Assignment** | KMeans jersey-color clustering (RGB → LAB space) |
| 🗺️ **Tactical Outputs** | Heatmaps · Pass networks · Ball possession detection |
| 📊 **Dashboard** | React + FastAPI · Real-time overlays · JSON export |
| 🎬 **Chunked Pipeline** | Processes long videos in memory-safe chunks |

---

## 🏗️ System Architecture

```
Raw Video
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│                    Pipeline Layer                        │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────┐  │
│  │  YOLOv8      │──▶│  StrongSORT  │──▶│  Geometry  │  │
│  │  Detection   │   │  Tracking    │   │  Layer     │  │
│  │  mAP50:0.843 │   │  (ReID +     │   │  (Homog. + │  │
│  └──────────────┘   │  Kalman)     │   │  Opt.Flow) │  │
│                     └──────────────┘   └────────────┘  │
│                                               │         │
│  ┌──────────────┐   ┌──────────────┐          │         │
│  │  Team        │   │  Speed &     │◀─────────┘         │
│  │  Assigner    │   │  Distance    │                    │
│  │  (KMeans)    │   │  Estimator   │                    │
│  └──────────────┘   └──────────────┘                   │
│         │                   │                           │
│         └─────────┬─────────┘                          │
│                   ▼                                     │
│  ┌────────────────────────────────┐                    │
│  │     Analytics Engine           │                    │
│  │  Heatmaps · Pass Networks ·    │                    │
│  │  Possession · Events JSON      │                    │
│  └────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
    ┌─────────────┐       ┌──────────────┐
    │   FastAPI   │       │  JSON Export │
    │   Backend   │       │  (raw +      │
    └──────┬──────┘       │   processed) │
           │              └──────────────┘
           ▼
    ┌─────────────┐
    │    React    │
    │  Dashboard  │
    └─────────────┘
```

---

## 📁 Repository Structure

```
MatchIQ/
│
├── main.py                        # Single-match pipeline entry point
├── run_chunked_pipeline.py        # Long-video chunked processing
├── run_complete_demo.py           # Full demo runner
├── run_evaluation.py              # Model evaluation script
├── run_homography_picker.py       # Interactive calibration tool
│
├── trackers/                      # StrongSORT multi-object tracking
├── geometry/                      # 🔑 Geometry Layer (novel contribution)
│   ├── homography_calibrator.py   #   Pitch-to-pixel homography
│   ├── camera_motion_comp.py      #   Optical flow compensation
│   └── coordinate_transform.py   #   Pixel → real-world meters
│
├── speed_and_distance_estimator/  # Physics-based player metrics
├── team_assigner/                 # KMeans jersey color clustering
├── player_ball_assigner/          # Ball possession detection
├── camera_movement_estimator/     # Optical flow camera tracking
│
├── pipeline/                      # Orchestration & chunking logic
├── utils/                         # Shared helpers & I/O
├── tools/                         # Calibration & annotation tools
├── evaluation/                    # mAP evaluation scripts
├── training/                      # YOLOv8 fine-tuning scripts
│
├── Backend/                       # FastAPI REST API
├── Frontend/                      # React dashboard (Vite)
├── DevOps/                        # Docker & deployment configs
├── config/                        # YAML configuration files
│
└── AI Model/                      # Model weights (not tracked — see below)
```

---

## 📊 Results

### Detection Performance (YOLOv8 on SoccerNet)

| Metric | Score |
|---|---|
| **mAP@50** | **0.843** |
| **mAP@50:95** | 0.612 |
| Precision | 0.871 |
| Recall | 0.824 |

### Tracking Performance (StrongSORT)

| Metric | Value |
|---|---|
| ID Switches | < 15 per 90-min match |
| Track Fragmentation | Minimal (occlusion-robust) |
| FPS (inference + tracking) | ~8–12 FPS (RTX 3060) |

### Player Metrics Accuracy

| Metric | Method | Notes |
|---|---|---|
| Speed | Rolling median (window=5) | Outliers capped at 13 m/s |
| Distance | Cumulative pixel→meter integration | Per-player running total |
| Position | Homography + optical flow | Camera-motion compensated |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- CUDA-enabled GPU (recommended) or CPU
- Node.js 18+ (for Frontend)
- FFmpeg in PATH

### 1 — Clone & Install

```bash
git clone https://github.com/mohamed-algazar/-MatchIQ.git
cd -MatchIQ

# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
cd Frontend && npm install && cd ..
```

### 2 — Download Model Weights

The fine-tuned YOLOv8 weights are hosted separately due to file size:

```bash
# Download from Google Drive / HuggingFace (link below)
# Place in: AI Model/best.pt
```

> 📦 **Weights download:** [Google Drive](#) *(link coming soon)*

### 3 — Calibrate Homography

Run the interactive calibration tool to map pitch corners:

```bash
python run_homography_picker.py --video path/to/match.mp4
```

### 4 — Run the Pipeline

**Single match (short video):**
```bash
python main.py --video path/to/match.mp4 --output output/
```

**Long video (chunked, memory-safe):**
```bash
python run_chunked_pipeline.py --video path/to/match.mp4 --chunk-size 500
```

**Full demo:**
```bash
python run_complete_demo.py
```

### 5 — Launch Dashboard

```bash
# Terminal 1 — Backend
cd Backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd Frontend && npm run dev
```

Open `http://localhost:5173`

---

## 🧩 Core Modules

### 🔑 Geometry Layer *(Novel Contribution)*

The most technically challenging component — solves the core problem of converting pixel coordinates from a moving camera into real-world pitch positions.

**Three-stage pipeline:**
1. **Homography Calibration** — Interactive tool maps 4+ pitch keypoints (corner flags, penalty spot) to known FIFA-standard coordinates, computing a perspective transform matrix `H`
2. **Optical Flow Camera Compensation** — Uses Lucas-Kanade optical flow on background regions to estimate camera pan/tilt per frame, subtracting camera motion from player motion
3. **Pixel → Meters Transform** — Applies `H` to corrected pixel coordinates, yielding real-world `(x, y)` in meters on the standard 105×68m pitch

```python
# Simplified usage
from geometry import GeometryLayer

geo = GeometryLayer(calibration_file="calibrations/match.json")
real_coords = geo.transform(pixel_x, pixel_y, frame_idx)
# Returns (x_meters, y_meters) on pitch coordinate system
```

### 🔁 StrongSORT Tracking

Upgraded from ByteTrack → BoT-SORT → **StrongSORT** during development to handle:
- Long occlusions (players blocked by others)
- Re-entry after going off-frame
- Referee/player misclassification correction

### 👕 Team Assignment

```python
# KMeans on jersey crop → LAB color space → 2-cluster assignment
# Handles kit similarity with per-match calibration
```

---

## ⚙️ Configuration

All pipeline parameters live in `config/`:

```yaml
# config/pipeline.yaml (example)
detection:
  model_path: "AI Model/best.pt"
  confidence: 0.5
  device: "cuda"  # or "cpu"

tracking:
  max_age: 30
  min_hits: 3

geometry:
  pitch_length: 105  # meters
  pitch_width: 68

speed:
  smoothing_window: 5
  max_speed_ms: 13.0
```

---

## 🗺️ Roadmap

- [ ] Real-time stream processing (RTSP input)
- [ ] Automatic homography calibration (no manual keypoints)
- [ ] Formation detection (4-4-2, 4-3-3, etc.)
- [ ] xG (Expected Goals) model integration
- [ ] Multi-match season analytics
- [ ] Docker Compose one-command setup
- [ ] Mobile-responsive dashboard

---

## 🛠️ Tech Stack

**AI / CV**
- [Ultralytics YOLOv8](https://ultralytics.com) — Object detection
- [StrongSORT](https://github.com/dyhBUPT/StrongSORT) — Multi-object tracking
- [OpenCV](https://opencv.org) — Optical flow, homography, video I/O
- [NumPy](https://numpy.org) / [SciPy](https://scipy.org) — Numerical computations

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) — REST API
- [Uvicorn](https://www.uvicorn.org) — ASGI server

**Frontend**
- [React 18](https://react.dev) + [Vite](https://vitejs.dev)

**DevOps**
- Docker + Docker Compose
- GitHub Actions CI

---

## 👤 Author

**Mohamed Al-Gazar**
BSc Computer Science & AI — Helwan University (2022–2026)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/YOUR_LINKEDIN)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github)](https://github.com/mohamed-algazar)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Built with ⚽ + 🧠 as a graduation project at Helwan University · June 2026</sub>
</div>
