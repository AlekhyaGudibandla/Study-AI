import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.orm import Session
from database import SessionLocal
import models
from auth import signup
import schemas

def verify_system():
    db = SessionLocal()
    try:
        # Create a test user through the official signup logic
        test_email = "final_victory@example.com"
        existing = db.query(models.User).filter(models.User.email == test_email).first()
        if existing:
            db.delete(existing)
            db.commit()
            
        print(f"Signing up user: {test_email}")
        user_in = schemas.UserCreate(email=test_email, password="password123")
        # Correct order based on auth.py: signup(user, db)
        user = signup(user_in, db)
        
        # Check progress
        if user.progress:
            print(f"Success: UserProgress created! Streak: {user.progress.current_streak}")
        else:
            print("Failure: UserProgress missing!")
            
    finally:
        db.close()

if __name__ == "__main__":
    verify_system()
