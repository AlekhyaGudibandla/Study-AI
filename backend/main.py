from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

# Create tables in DB automatically for now (in prod we will use alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Tutor Personalized Platform")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Cognitive Sanctuary AI Tutor is running"}

@app.get("/api/v1/ping")
def ping():
    return {"status": "alive"}

import auth, documents, chat, learning
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(learning.router)

# Trigger reload
