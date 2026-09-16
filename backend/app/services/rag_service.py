from google import genai
from sqlalchemy.orm import Session

from app import models
from app.database import settings
from app.services.embedding_service import generate_embedding


client = genai.Client(api_key=settings.gemini_api_key)

GENERATION_MODEL = "gemini-3.5-flash-lite"


def retrieve_relevant_chunks(
    db: Session,
    question: str,
    document_id: int | None = None,
    limit: int = 4,
):
    # Convert user's question into the same vector space
    question_embedding = generate_embedding(question)

    query = db.query(models.DocumentChunk)

    if document_id is not None:
        query = query.filter(
            models.DocumentChunk.document_id == document_id
        )

    # pgvector cosine distance:
    # smaller distance = more semantically similar
    chunks = (
        query
        .order_by(
            models.DocumentChunk.embedding.cosine_distance(
                question_embedding
            )
        )
        .limit(limit)
        .all()
    )

    return chunks


def generate_rag_answer(
    db: Session,
    question: str,
    document_id: int | None = None,
):
    chunks = retrieve_relevant_chunks(
        db=db,
        question=question,
        document_id=document_id,
    )

    if not chunks:
        return {
            "answer": "I could not find relevant information in the uploaded documents.",
            "sources": [],
        }

    context = "\n\n".join(
        [
            f"[Chunk {chunk.id}]\n{chunk.content}"
            for chunk in chunks
        ]
    )

    prompt = f"""
You are an AI knowledge assistant.

Answer the user's question using ONLY the context provided below.

If the answer cannot be found in the context, say:
"I could not find that information in the uploaded document."

Do not invent information.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    return {
        "answer": response.text,
        "sources": [
            f"Chunk {chunk.id}"
            for chunk in chunks
        ],
    }