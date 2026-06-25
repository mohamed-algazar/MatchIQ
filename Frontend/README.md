# Frontend Documentation

This directory contains the React-based frontend application, designed for professional football tactical analysis and match data visualization.

## Core Technology Stack

- **Framework**: React 19 (Vite + TypeScript)
- **Styling**: Tailwind CSS 4.0
- **Visualization**: D3.js (Passing Networks), Recharts (Performance Charts), Heatmap.js (Density Maps)
- **Icons**: Lucide React
- **Routing**: React Router 7

## Key Features

- **Tactical Dashboard**: High-fidelity visualizations for match intensity, possession, and player performance.
- **Spatial Analytics Suite**:
  - **Video Tracking Overlay**: Syncing match footage with canvas-based bounding box rendering.
  - **Interactive 2D Pitch**: Precision-rendered pitch markings for tactical placement.
  - **Passing Networks**: Visualizing squad interactions and passing weights.
- **Upload Workflow**: Professional drag-and-drop interface with real-time processing feedback.
- **Data Export**: Support for JSON and CSV extraction for further analytical study.

## Performance Optimizations

- **Memoization**: Strategic use of `React.memo` for heavy 2D canvas and SVG components.
- **Sync Engine**: High-performance requestAnimationFrame loop for real-time video telemetry overlays.

## Development Setup

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Dev Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:

   ```bash
   npm run build
   ```
