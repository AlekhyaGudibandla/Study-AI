import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sentence_transformers import SentenceTransformer

from database import get_db
from auth import get_current_user
import models, schemas
from llm import generate_llm_response
from celery_worker import get_chroma_client, get_embedder # Re-use the existing client or create a new instance

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])

# We only load sentence transformer here if we are actively embedding the queries

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    document_ids: Optional[List[str]] = [] # For specific document context

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    latency_ms: float

@router.post("", response_model=ChatResponse)
def chat_with_rag(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    start_time = time.time()
    
    # Session management
    session_id = request.session_id
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
    
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        session = models.ChatSession(id=session_id, user_id=current_user.id, document_ids=request.document_ids)
        db.add(session)
        db.commit()
    
    # Fetch conversation history (last 10 messages) for memory
    history = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session.id
    ).order_by(models.ChatMessage.created_at.desc()).limit(10).all()
    
    # Reverse to get chronological order
    history = history[::-1]
    
    # Save user message
    user_msg = models.ChatMessage(session_id=session.id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    # Step 1: Retrieval (RAG)
    # ... (remains similar)
    context_texts = []
    try:
        collection = get_chroma_client().get_collection(name=f"user_{current_user.id}")
        query_embedding = get_embedder().encode([request.message])[0].tolist()
        
        # We can add where {"document_id": {"$in": document_ids}} if specific docs requested
        filters = None
        doc_ids = request.document_ids or session.document_ids
        if doc_ids:
            # If multiple docs, we use $in operator
            if len(doc_ids) == 1:
                filters = {"document_id": doc_ids[0]}
            else:
                filters = {"document_id": {"$in": doc_ids}}
                
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            where=filters
        )
        if results and results['documents']:
            context_texts = results['documents'][0]
            print(f"RAG HIT: Found {len(context_texts)} chunks for doc_ids {doc_ids}")
        else:
            print(f"RAG MISS: No chunks found for doc_ids {doc_ids}")
    except Exception as e:
        print(f"Retrieval error (maybe no docs indexed yet): {e}")

    # Build context
    context_block = "\n".join(context_texts) if context_texts else "No specific document context available."
    print(f"DEBUG: Context block length: {len(context_block)}")
    
    history_block = ""
    for h in history:
        role = "Student" if h.role == "user" else "Tutor"
        history_block += f"{role}: {h.content}\n"

    system_prompt = f"""You are Cognitive Sanctuary Tutor, an AI educational assistant.
You provide clear, structured, and insightful tutoring. 
Use the following context from the user's documents to formulate your answer.
If the answer is not in the context, answer generally but mention it's not from their notes.

Format your response using Markdown for clarity (use bullet points, bold text, and headers where appropriate).

CONVERSATION HISTORY:
{history_block}

DOCUMENT CONTEXT:
{context_block}
"""

    # Step 2: Generation via Groq
    try:
        reply_text = generate_llm_response(system_prompt, request.message, json_mode=False)
    except Exception as e:
        print(f"Groq generation error: {e}")
        reply_text = "I encountered an error generating the response. Please try again later."
    
    # Save assistant message
    bot_msg = models.ChatMessage(session_id=session.id, role="assistant", content=reply_text)
    db.add(bot_msg)
    db.commit()

    latency = (time.time() - start_time) * 1000 # ms
    
    return ChatResponse(session_id=session.id, reply=reply_text, latency_ms=latency)

@router.get("/sessions", response_model=List[schemas.ChatSessionResponse])
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.user_id == current_user.id
    ).order_by(models.ChatSession.created_at.desc()).all()
    
    # Map to include a snippet of the last message for the UI
    results = []
    for s in sessions:
        last_msg = db.query(models.ChatMessage).filter(
            models.ChatMessage.session_id == s.id
        ).order_by(models.ChatMessage.created_at.desc()).first()
        
        results.append({
            "id": s.id,
            "created_at": s.created_at,
            "last_message": last_msg.content[:50] + "..." if last_msg else "New Chat"
        })
    return results

@router.get("/sessions/{session_id}/messages", response_model=List[schemas.ChatMessageResponse])
def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    session = db.query(models.ChatSession).filter(
        models.ChatSession.id == session_id,
        models.ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.created_at.asc()).all()
    
    return messages
