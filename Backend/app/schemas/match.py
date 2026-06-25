from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# Shared properties
class MatchBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

# Properties to receive via API on creation
class MatchCreate(MatchBase):
    title: str

# Properties to receive via API on update
class MatchUpdate(MatchBase):
    status: Optional[str] = None
    processed_video_path: Optional[str] = None

class MatchInDBBase(MatchBase):
    id: int
    video_path: Optional[str] = None
    processed_video_path: Optional[str] = None
    status: str
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class Match(MatchInDBBase):
    pass
