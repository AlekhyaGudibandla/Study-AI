from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    full_name: Optional[str] = None
    domain: Optional[str] = None
    field_of_study: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class UserProgressResponse(BaseModel):
    current_streak: int
    total_study_minutes: int
    daily_goal_minutes: int
    last_activity_date: datetime
    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    user: UserResponse
    progress: Optional[UserProgressResponse]
    stats: dict # Aggregate counts for dashboard

class Token(BaseModel):
    access_token: str
    token_type: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    size: int
    status: str
    error_message: Optional[str] = None
    progress_percentage: int
    last_read: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: str
    created_at: datetime
    last_message: Optional[str] = None
    class Config:
        from_attributes = True

# We will add Generation schemas over time
