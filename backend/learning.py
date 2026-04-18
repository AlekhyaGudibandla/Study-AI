import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from database import get_db
from auth import get_current_user
import models, schemas
from llm import generate_llm_response
from celery_worker import get_chroma_client, get_embedder

router = APIRouter(prefix="/api/v1/learning", tags=["learning"])

class GenerateRequest(BaseModel):
    topic: str
    document_ids: Optional[List[str]] = None
    count: int = 5

@router.post("/generate/flashcards")
def generate_flashcards(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Retrieve local context to base the flashcards on
    context_block = "General knowledge."
    if request.document_ids:
        try:
            collection = get_chroma_client().get_collection(name=f"user_{current_user.id}")
            query_embedding = get_embedder().encode([request.topic])[0].tolist()
            # Fetch up to 10 chunks to generate flashcards from
            filters = {"document_id": request.document_ids[0]} if len(request.document_ids) == 1 else {"document_id": {"$in": request.document_ids}}
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=10,
                where=filters
            )
            if results and results['documents']:
                context_block = "\n".join(results['documents'][0])
        except Exception as e:
            print(f"Retrieval error: {e}")

    system_prompt = """You are an expert tutor. Create flashcards based on the provided topic and context.
Output ONLY a valid JSON object matching this schema:
{
  "flashcards": [
    {"question": "What is...", "answer": "It is..."}
  ]
}"""

    user_prompt = f"Topic: {request.topic}\nContext: {context_block}\nCount: {request.count} flashcards."
    
    try:
        response_text = generate_llm_response(system_prompt, user_prompt, json_mode=True)
        data = json.loads(response_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/generate/quiz")
def generate_quiz(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    context_block = "General knowledge."
    if request.document_ids:
        try:
            collection = get_chroma_client().get_collection(name=f"user_{current_user.id}")
            query_embedding = get_embedder().encode([request.topic])[0].tolist()
            filters = {"document_id": request.document_ids[0]} if len(request.document_ids) == 1 else {"document_id": {"$in": request.document_ids}}
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=10,
                where=filters
            )
            if results and results['documents']:
                context_block = "\n".join(results['documents'][0])
        except Exception:
            pass

    system_prompt = """You are an expert tutor. Create a multiple-choice quiz based on the provided topic and context.
Output ONLY a valid JSON object matching this schema:
{
  "questions": [
    {
      "question_text": "What is...",
      "options": ["A", "B", "C", "D"],
      "correct_option_index": 0
    }
  ]
}"""

    user_prompt = f"Topic: {request.topic}\nContext: {context_block}\nCount: {request.count} questions."
    
    try:
        response_text = generate_llm_response(system_prompt, user_prompt, json_mode=True)
        data = json.loads(response_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
