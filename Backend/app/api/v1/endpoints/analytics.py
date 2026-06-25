from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import tempfile

from app.api import deps
from app.db.session import get_db
from app.models import models
from app.schemas import telemetry as telemetry_schema
from app.schemas import statistics as statistics_schema
from app.services import report, cache

router = APIRouter()

@router.get("/{match_id}", response_model=List[telemetry_schema.Telemetry])
def get_match_telemetry(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
    limit: int = 1000,
) -> Any:
    """
    Get telemetry data for a specific match.
    Ensures the user owns the match.
    """
    cache_key = f"telemetry_{match_id}_{limit}"
    cached_data = cache.get_cache(cache_key)
    if cached_data:
        return cached_data

    match = db.query(models.Match).filter(
        models.Match.id == match_id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    telemetry = db.query(models.Telemetry).filter(
        models.Telemetry.match_id == match_id
    ).order_by(models.Telemetry.frame_number).limit(limit).all()
    
    # Pre-serialize for cache
    result = [telemetry_schema.Telemetry.model_validate(t).model_dump() for t in telemetry]
    cache.set_cache(cache_key, result, expire=600) # 10 min cache
    
    return telemetry

@router.get("/{match_id}/stats", response_model=statistics_schema.MatchStatistics)
def get_match_stats(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get aggregated statistics for a specific match.
    """
    cache_key = f"stats_{match_id}"
    cached_data = cache.get_cache(cache_key)
    if cached_data:
        return cached_data

    match = db.query(models.Match).filter(
        models.Match.id == match_id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    stats = db.query(models.MatchStatistics).filter(
        models.MatchStatistics.match_id == match_id
    ).first()
    
    if not stats:
        # Return zeros if stats don't exist yet
        return statistics_schema.MatchStatistics(
            id=0,
            match_id=match_id,
            possession_team_1=0.0,
            possession_team_2=0.0,
            total_distance_team_1=0.0,
            total_distance_team_2=0.0,
            top_speed=0.0,
            total_passes=0
        )
    
    result = statistics_schema.MatchStatistics.model_validate(stats).model_dump()
    cache.set_cache(cache_key, result, expire=600)
    return stats

@router.get("/{match_id}/report")
def download_report(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    """
    Generate and download a professional PDF report for the match.
    """
    match = db.query(models.Match).filter(
        models.Match.id == match_id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    stats = db.query(models.MatchStatistics).filter(
        models.MatchStatistics.match_id == match_id
    ).first()
    
    # Aggregated metrics for the report
    report_data = {
        "date": match.created_at.strftime("%Y-%m-%d"),
        "top_speed": stats.top_speed if stats else 0.0,
        "distance": (stats.total_distance_team_1 + stats.total_distance_team_2) if stats else 0.0,
        "touches": 0, # Placeholder
        "losses": 0, # Placeholder
        "possession": stats.possession_team_1 if stats else 0.0
    }
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        report.generate_player_report("ANALYST_SUMMARY", report_data, tmp.name)
        return FileResponse(tmp.name, filename=f"Match_Report_{match_id}.pdf", media_type="application/pdf")
