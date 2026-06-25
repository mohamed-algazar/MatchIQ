# Backend Documentation

This directory contains the Python-based FastAPI backend, responsible for match management, authentication, and the asynchronous AI processing pipeline.

## Core Technology Stack

- **Framework**: FastAPI (Asynchronous Python)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Task Queue**: Celery with Redis broker
- **Authentication**: JWT (JSON Web Tokens) with passlib password hashing
- **Inference Pipeline**: PyTorch-ready structure (integration with YOLO and ByteTrack)

## Directory Structure

- `app/api`: REST API endpoints organized by version (V1).
- `app/core`: Configuration, security utilities, and Celery app definition.
- `app/db`: Database session management and base model classes.
- `app/models`: SQLAlchemy relational models for Users, Matches, and Telemetry.
- `app/schemas`: Pydantic models for data validation and API serialization.
- `app/tasks`: Asynchronous worker tasks for heavy video processing.

## Key Features

- **Scalable Auth**: Secure registration and login flow using OAuth2 password flow.
- **Match Lifecycle**: Complete CRUD operations for match metadata and footage.
- **Telemetry Storage**: High-frequency spatial data storage optimized for tactical retrieval.
- **Async Processing**: Offloading video inference to background workers to maintain API responsiveness.

## Development Setup

1. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   Verify settings in `app/core/config.py` or provide environment variables.
3. **Run Locally**:

   ```bash
   uvicorn app.main:app --reload
   ```
