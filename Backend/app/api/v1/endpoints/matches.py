from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.db.session import get_db
from app.models import models
from app.schemas import match as match_schema

router = APIRouter()

@router.get("/", response_model=List[match_schema.Match])
def read_matches(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve matches for current user.
    """
    matches = db.query(models.Match).filter(
        models.Match.owner_id == current_user.id
    ).offset(skip).limit(limit).all()
    return matches

@router.post("/", response_model=match_schema.Match)
def create_match(
    *,
    db: Session = Depends(get_db),
    match_in: match_schema.MatchCreate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new match entry.
    """
    db_obj = models.Match(
        title=match_in.title,
        description=match_in.description,
        owner_id=current_user.id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{id}", response_model=match_schema.Match)
def read_match(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Get match by ID.
    """
    match = db.query(models.Match).filter(
        models.Match.id == id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

@router.delete("/{id}", response_model=match_schema.Match)
def delete_match(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a match.
    """
    match = db.query(models.Match).filter(
        models.Match.id == id, models.Match.owner_id == current_user.id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(match)
    db.commit()
    return match
