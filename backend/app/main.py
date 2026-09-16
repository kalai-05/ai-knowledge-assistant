from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import (
    AgentQuestionRequest,
    AgentQuestionResponse,
    QuestionRequest,
    QuestionResponse,
)
from app.services.rag_service import generate_rag_answer
from app.services.agent_service import DocumentNotFoundError, run_agent

from app.database import Base, engine, get_db
from app import models

from app.services.document_service import (
    extract_text_from_pdf,
    split_text_into_chunks,
)
from app.services.embedding_service import generate_embedding


# Create database tables based on SQLAlchemy models
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Knowledge Assistant API",
    description="RAG-based AI assistant using FastAPI, PostgreSQL, pgvector and Gemini",
    version="1.0.0",
)


# Allow Next.js frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Knowledge Assistant API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Only allow PDF files
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported",
        )

    # Read uploaded PDF
    file_bytes = await file.read()

    # Extract text from PDF
    text = extract_text_from_pdf(file_bytes)

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF",
        )

    # Split extracted text into overlapping chunks
    chunks = split_text_into_chunks(text)

    if not chunks:
        raise HTTPException(
            status_code=400,
            detail="Could not create chunks from document",
        )

    try:
        # Save document metadata
        document = models.Document(
            filename=file.filename,
        )

        db.add(document)
        db.flush()

        # Generate and store an embedding for every chunk
        for chunk in chunks:
            embedding = generate_embedding(chunk)

            document_chunk = models.DocumentChunk(
                document_id=document.id,
                content=chunk,
                embedding=embedding,
            )

            db.add(document_chunk)

        db.commit()
        db.refresh(document)

        return {
            "message": "Document processed successfully",
            "document_id": document.id,
            "filename": document.filename,
            "chunks_created": len(chunks),
        }

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(exc)}",
        )




@app.post("/ask", response_model=QuestionResponse)
def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
):
    try:
        result = generate_rag_answer(
            db=db,
            question=request.question,
            document_id=request.document_id,
        )

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(exc)}",
        )


@app.post("/agent/ask", response_model=AgentQuestionResponse)
def agent_ask_question(
    request: AgentQuestionRequest,
    db: Session = Depends(get_db),
):
    try:
        return run_agent(
            db=db,
            question=request.question,
            document_id=request.document_id,
        )

    except DocumentNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate agent answer: {str(exc)}",
        )
