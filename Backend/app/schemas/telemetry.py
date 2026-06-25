from typing import Any, List, Optional
from pydantic import BaseModel

# Shared properties
class TelemetryBase(BaseModel):
    frame_number: int
    timestamp: float
    data: dict  # Stores { "players": [...], "ball": {...} }

# Properties to receive via API on creation
class TelemetryCreate(TelemetryBase):
    match_id: int

class TelemetryInDBBase(TelemetryBase):
    id: int
    match_id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class Telemetry(TelemetryInDBBase):
    pass
