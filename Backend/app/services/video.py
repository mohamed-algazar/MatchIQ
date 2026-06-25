import shutil
import os
import uuid
from fastapi import UploadFile
from app.core.config import settings

def save_upload_file(upload_file: UploadFile) -> str:
    """
    Saves an uploaded file to the raw video directory with a unique UUID prefix.
    """
    file_extension = os.path.splitext(upload_file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.RAW_VIDEO_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
        
    return file_path

def get_video_filename(path: str) -> str:
    return os.path.basename(path)
