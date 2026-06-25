from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    
    matches = relationship("Match", back_populates="owner")
    
class MatchStatistics(Base):
    __tablename__ = "match_statistics"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    
    # Aggregated Metrics
    possession_team_1 = Column(Float)
    possession_team_2 = Column(Float)
    total_distance_team_1 = Column(Float)
    total_distance_team_2 = Column(Float)
    top_speed = Column(Float)
    total_passes = Column(Integer, default=0)
    
    match = relationship("Match", back_populates="statistics")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    video_path = Column(String)
    processed_video_path = Column(String)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="matches")
    telemetry = relationship("Telemetry", back_populates="match", cascade="all, delete-orphan")
    statistics = relationship("MatchStatistics", back_populates="match", uselist=False, cascade="all, delete-orphan")

class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    frame_number = Column(Integer, index=True)
    timestamp = Column(Float)
    data = Column(JSON)  # Stores serialized player/ball coordinates

    match = relationship("Match", back_populates="telemetry")
