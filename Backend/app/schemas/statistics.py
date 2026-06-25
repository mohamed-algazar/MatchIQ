from pydantic import BaseModel
from typing import Optional

class MatchStatisticsBase(BaseModel):
    possession_team_1: float
    possession_team_2: float
    total_distance_team_1: float
    total_distance_team_2: float
    top_speed: float
    total_passes: int

class MatchStatisticsCreate(MatchStatisticsBase):
    match_id: int

class MatchStatistics(MatchStatisticsBase):
    id: int
    match_id: int

    class Config:
        from_attributes = True
