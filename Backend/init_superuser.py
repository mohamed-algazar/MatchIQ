from app.db.session import SessionLocal
from app.models.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "admin@example.com").first()
    if not user:
        admin_user = User(
            email="admin@example.com",
            hashed_password=pwd_context.hash("admin123"),
            full_name="Administrator",
            is_superuser=True,
        )
        db.add(admin_user)
        db.commit()
        print("Superuser created successfully!")
    else:
        print("Superuser already exists.")
    db.close()

if __name__ == "__main__":
    init_db()
