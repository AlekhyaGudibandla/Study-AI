import os
import shutil
import hashlib
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
import models, schemas
from celery_worker import process_document_task, process_document_logic

USE_CELERY = os.getenv("USE_CELERY", "True").lower() == "true"

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

UPLOAD_DIR = "./temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt"}

def compute_file_hash(file_path: str) -> str:
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@router.post("/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    print("DEBUG: Received upload request")
    print(f"Uploading file: {file.filename}")
    
    # 1. Extension Validation
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Size Validation (Check before reading if possible, but UploadFile.size is available in newer FastAPI)
    # If not, we check after writing to buffer
    
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    print(f"DEBUG: File written to {file_path}")
    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"File too large ({file_size / 1024 / 1024:.2f}MB). Max limit is 10MB.")
    
    file_hash = compute_file_hash(file_path)
    
    # Check if duplicate
    existing_doc = db.query(models.Document).filter(
        models.Document.user_id == current_user.id,
        models.Document.file_hash == file_hash
    ).first()
    
    if existing_doc:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Document with same content already uploaded")
    
    new_doc = models.Document(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file.content_type or "application/octet-stream",
        size=file_size,
        file_hash=file_hash,
        status="PENDING",
        chroma_collection_id=current_user.id # One collection per user
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # Queue Async Ingestion Task
    if USE_CELERY:
        process_document_task.delay(new_doc.id, file_path, current_user.id)
    else:
        # Lite Mode: Use FastAPI BackgroundTasks
        background_tasks.add_task(process_document_logic, new_doc.id, file_path, current_user.id)
    
    return new_doc

@router.get("", response_model=list[schemas.DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    docs = db.query(models.Document).filter(models.Document.user_id == current_user.id).all()
    return docs
