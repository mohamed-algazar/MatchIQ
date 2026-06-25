# DevOps Infrastructure Documentation

This directory contains the orchestration and containerization logic for the entire Football Analytics Platform. It is designed to provide a consistent, reproducible environment for development, staging, and production.

## Containerization Architecture

The platform is orchestrated using Docker Compose, which manages five specialized service containers.

### Core Services

1. **Frontend**: A React application built within a Node.js environment and served via a production-grade Nginx server. It handles the tactical dashboard and spatial visualizations.
2. **Backend**: A FastAPI REST server that manages business logic, user authentication, and match metadata. It serves as the primary gateway for the frontend.
3. **Worker**: A dedicated Celery worker process that executes long-running AI inference tasks in the background, ensuring the web API remains responsive.
4. **Database**: A PostgreSQL 15 relational database used for persisting user profiles, match statistics, and high-frequency telemetry data.
5. **Redis**: A high-performance in-memory data store acting as the message broker and result backend for the Celery task queue.

## Orchestration Details

The `docker-compose.yml` file in this directory uses a centralized context approach. It references source code in the sibling `Frontend/` and `Backend/` directories while utilizing Dockerfiles located within the `DevOps/` subtree.

### Internal Networking

All services communicate over an isolated internal virtual network (`football-network`). The Frontend and Backend expose external ports (80 and 8000 respectively) for client-side access.

### Data Persistence

Persistent data is managed through Docker Volumes:

- `postgres_data`: Ensures database records survive container restarts.
- `football_uploads`: Shared volume between the Backend and Worker to manage raw and processed match footage.

## Getting Started

### 1. Prerequisite Environment Setup

Copy the configuration template to a local `.env` file:

```bash
cp .env.example .env
```

Ensure you update the `SECRET_KEY` and database credentials for your specific environment.

### 2. Launching the System

From the project root, execute the following command:

```bash
docker-compose -f DevOps/docker-compose.yml up --build
```

This command builds the images according to the defined specifications and starts the entire cluster in the correct dependency order.

## Security and Best Practices

- **Secrets Management**: Never commit a populated `.env` file to version control.
- **Image Optimization**: The use of `slim` and `alpine` base images minimizes the attack surface and reduces deployment latency.
- **Nginx Configuration**: The frontend container includes a custom `nginx.conf` specifically tuned for Single Page Application (SPA) routing and API proxying.
