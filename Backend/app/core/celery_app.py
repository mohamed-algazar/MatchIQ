from celery import Celery
import os

# For SQLite (Zero-Install mode), we use SQLAlchemy as the broker
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "sqla+sqlite:///./football_analytics.db")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "db+sqlite:///./football_analytics.db")

celery_app = Celery(
    "worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.tasks.video"]
)

celery_app.conf.task_routes = {
    "app.tasks.video.process_video_task": "main-queue",
}

celery_app.autodiscover_tasks(["app.tasks"])
