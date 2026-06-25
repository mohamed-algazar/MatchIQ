from app.db.session import SessionLocal
from app.models import models

db = SessionLocal()
try:
    matches = db.query(models.Match).all()
    print(f"Total Matches: {len(matches)}")
    for m in matches:
        print(f"ID: {m.id}, Title: {m.title}, Status: {m.status}, Video Path: {m.video_path}")
finally:
    db.close()
