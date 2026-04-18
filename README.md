# 🧠 Study AI — Personalized Learning Platform

> A production-grade, AI-powered learning system that transforms static study material into an interactive, personalized learning experience using Retrieval-Augmented Generation (RAG).

---

## 🚀 What is Study AI?

Study AI is designed to solve a fundamental problem in education:

> ❝ Students consume content, but don’t actively learn from it ❞

This platform converts **user-provided study material** into:

* interactive conversations
* adaptive quizzes
* dynamic flashcards
* measurable learning progress

Unlike generic AI tools, Study AI is **context-aware**, grounded in user data, and designed with **system-level scalability in mind**.

---

## 🏗️ Architecture Overview

Study AI follows a **modular, service-oriented architecture** that cleanly separates concerns between UI, API, and AI processing.

```text
┌────────────────────┐
│   Next.js Frontend │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│   FastAPI Backend  │
│  (Auth + Routing)  │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│   RAG Layer        │
│ (Retrieval Engine) │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│   ChromaDB         │
│ (Vector Storage)   │
└─────────┬──────────┘
          ↓
┌────────────────────┐
│   LLM (Groq)       │
└────────────────────┘

        ↓
┌────────────────────┐
│ PostgreSQL / SQLite│
│ (User + Metadata)  │
└────────────────────┘
```

---

## 🧠 Core System Design Principles

### 1. Separation of Concerns

* Frontend → UI & interaction
* Backend → API orchestration
* RAG Layer → AI intelligence

---

### 2. Cost-Efficient AI

* Local embeddings (no API cost)
* Free-tier LLM (Groq)
* Local vector DB (Chroma)

---

### 3. Local-First Development

* Fully runnable without cloud dependencies
* SQLite fallback for development
* Optional Docker for production

---

### 4. Extensibility

* Swappable LLM provider
* Replaceable vector DB (Pinecone/Qdrant)
* Modular services

---

## 🤖 RAG Pipeline (Deep Dive)

Study AI implements a full Retrieval-Augmented Generation pipeline:

```text
Document → Chunking → Embedding → Vector Store
                         ↓
User Query → Retrieval → Context Injection → LLM → Response
```

### Pipeline Details:

* **Chunking**

  * size: ~500–800 tokens
  * overlap: ~50–100

* **Embedding Model**

  * `all-MiniLM-L6-v2` (local, efficient)

* **Retrieval**

  * top-k similarity search (k = 5)

* **Generation**

  * Groq (Llama 3)

---

## 📦 Feature Set

### 📄 Document Intelligence

* Upload PDF, DOCX, PPTX
* Multi-document context awareness
* Persistent embedding storage

---

### 💬 Context-Aware AI Chat

* Grounded responses (no hallucination drift)
* Multi-turn conversations
* Document-specific querying

---

### 🧠 Flashcards System

* AI-generated from documents
* Manual creation support
* Deck-based organization
* Mastery tracking

---

### 📝 Quiz Engine

* AI-generated MCQs
* Manual quiz creation
* Score evaluation
* Attempt history

---

### 📊 Learning Analytics

* Accuracy tracking
* Quiz performance
* Flashcard mastery
* Activity history

---

### 🧭 Study Mode

* Distraction-free UI
* Focused learning environment

---

## 🧱 Data Model Design

Key entities:

* **User**
* **Document**
* **ChatSession**
* **ChatMessage**
* **FlashcardDeck**
* **Flashcard**
* **Quiz**
* **QuizQuestion**
* **QuizResult**

Designed to support:

* multi-session learning
* user-specific data isolation
* scalable analytics

---

## 🔌 API Design

### Auth

* `POST /auth/signup`
* `POST /auth/login`

### Documents

* `POST /upload`
* `GET /documents`
* `DELETE /documents/{id}`

### AI / RAG

* `POST /chat`

### Content Generation

* `POST /generate/flashcards`
* `POST /generate/quiz`
* `POST /generate/summary`

### Learning

* `GET /learning/flashcards`
* `POST /learning/flashcards`
* `GET /learning/progress`

---

## ⚙️ Tech Stack

### Frontend

* Next.js 14 (App Router)
* TypeScript
* Tailwind CSS
* Zustand

### Backend

* FastAPI
* SQLAlchemy + Alembic
* JWT Auth

### AI Layer

* Groq (Llama 3)
* HuggingFace Embeddings

### Storage

* ChromaDB (vector)
* PostgreSQL (Neon)
* SQLite (local fallback)

---

## ⚡ Performance Considerations

* Local embedding generation (zero API latency)
* Efficient top-k retrieval
* Avoid re-processing documents
* Optional caching (Redis / in-memory)

---

## ⚖️ Engineering Tradeoffs

| Decision          | Benefit        | Tradeoff                         |
| ----------------- | -------------- | -------------------------------- |
| Local vector DB   | Free + simple  | Limited scale                    |
| Groq API          | Fast inference | External dependency              |
| Sync RAG pipeline | Simplicity     | Not optimal for high concurrency |
| SQLite fallback   | Easy dev setup | Not production-grade             |

---

## 🔐 Security

* JWT authentication
* Input validation
* File upload constraints
* User-level data isolation

---

## ⚠️ Limitations

* Performance depends on document quality
* Large documents may increase latency
* Not optimized for real-time streaming yet
* Local vector DB not horizontally scalable

---

## 🧪 Local Setup

### Prerequisites

* Node.js 18+
* Python 3.10+

---

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### Environment Variables

```env
GROQ_API_KEY=your_key
DATABASE_URL=your_db_url
```

---

## 🐳 Docker (Optional)

```bash
docker-compose up --build
```

---

## 📈 Future Enhancements

* Async ingestion pipeline (queue-based)
* Hybrid search (BM25 + vector)
* Reranking models
* Real-time streaming responses
* Multi-user collaboration
* Personalized learning recommendations

---

## 💡 Why This Project Stands Out

Study AI is not just a feature demo — it demonstrates:

* end-to-end system design
* real-world AI integration
* scalable architecture thinking
* cost-aware engineering decisions

---

## 👩💻 Author

Built as a **production-oriented, project** focusing on:

> Systems • AI • Scalability • Product Thinking
