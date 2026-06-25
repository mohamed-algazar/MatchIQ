import os
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models import models
from app.services.ai_processor import AIProcessor
from app.core.config import settings

@celery_app.task(name="app.tasks.video.process_video_task")
def process_video_task(match_id: int):
    """
    Asynchronous task to process match video using YOLO and AI pipeline.
    """
    db = SessionLocal()
    try:
        match = db.query(models.Match).filter(models.Match.id == match_id).first()
        if not match:
            return f"Match {match_id} not found"

        # Update status to processing
        match.status = "processing"
        db.commit()

        # Initialize AI Processor
        processor = AIProcessor()
        
        # Determine paths
        input_path = match.video_path
        if not os.path.isabs(input_path):
            input_path = os.path.abspath(input_path)
            
        output_filename = f"processed_{os.path.basename(input_path)}"
        output_path = os.path.join(settings.PROCESSED_VIDEO_DIR, output_filename)
        
        # Run AI Pipeline
        telemetry_records, stats_data = processor.process_video(input_path, output_path)

        # 1. Save Telemetry
        for i, frame_data in enumerate(telemetry_records):
            telemetry = models.Telemetry(
                match_id=match_id,
                frame_number=i,
                timestamp=i * 0.04,  # Assuming 25fps, should ideally get from cv2
                data=frame_data
            )
            db.add(telemetry)

        # 2. Save Statistics
        match_stats = models.MatchStatistics(
            match_id=match_id,
            **stats_data
        )
        db.add(match_stats)

        # 3. Finalize Match Entry
        match.processed_video_path = output_path
        match.status = "completed"
        db.commit()
        
        return f"Successfully processed match {match_id}"
        
    except Exception as e:
        if match:
            match.status = "failed"
            db.commit()
        return f"Error processing match {match_id}: {str(e)}"
    finally:
        db.close()
