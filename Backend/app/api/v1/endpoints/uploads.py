from typing import Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.models import models
from app.schemas import match as match_schema
from app.services import video as video_service
from app.tasks.video import process_video_task

router = APIRouter()

@router.post("/{match_id}/upload", response_model=match_schema.Match)
def upload_video(
    *,
    db: Session = Depends(get_db),
    match_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Upload a match video and trigger asynchronous processing.
    """
    match = db.query(models.Match).filter(
        models.Match.id == match_id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    # Save file
    file_path = video_service.save_upload_file(file)
    
    # Update match metadata
    match.video_path = file_path
    match.status = "pending"
    db.commit()
    db.refresh(match)

    # Trigger async processing
    process_video_task.delay(match.id)

    return match
