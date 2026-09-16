"""
Agentic tool routing layer.

Flow:
1. Gemini picks ONE tool for the question (structured JSON output).
2. The application validates that choice against an allowlist and runs
   the matching Python function. The model never executes anything itself.
3. Gemini writes the final answer using ONLY the tool's result.

This is LLM-based routing + application-side tool execution, not Gemini
native function calling.
"""

import json
from typing import Any, Callable, Literal

from google.genai import types
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models
from app.services.rag_service import (
    GENERATION_MODEL,
    client,
    retrieve_relevant_chunks,
)


DEFAULT_TOOL = "search_document"

# Keeps the summary prompt bounded for very large documents.
MAX_SUMMARY_CONTEXT_CHARS = 200_000


class DocumentNotFoundError(Exception):
    pass


class ToolDecision(BaseModel):
    tool: Literal["search_document", "get_document_info", "summarize_document"]
    reason: str


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

def search_document(db: Session, query: str, document_id: int) -> dict:
    """Semantic search over one document, reusing the existing RAG retrieval."""
    chunks = retrieve_relevant_chunks(
        db=db,
        question=query,
        document_id=document_id,
        limit=4,
    )

    return {
        "chunks": [
            {"chunk_id": chunk.id, "content": chunk.content}
            for chunk in chunks
        ],
    }


def get_document_info(db: Session, document_id: int) -> dict:
    """Metadata for one document."""
    document = db.get(models.Document, document_id)

    if document is None:
        raise DocumentNotFoundError(f"Document {document_id} not found")

    chunk_count = (
        db.query(models.DocumentChunk)
        .filter(models.DocumentChunk.document_id == document_id)
        .count()
    )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "chunk_count": chunk_count,
    }


def summarize_document(db: Session, document_id: int) -> dict:
    """Summarize the whole document from all of its chunks, in upload order."""
    chunks = (
        db.query(models.DocumentChunk)
        .filter(models.DocumentChunk.document_id == document_id)
        .order_by(models.DocumentChunk.id)
        .all()
    )

    if not chunks:
        return {"summary": None, "chunks_used": 0}

    context = "\n\n".join(chunk.content for chunk in chunks)
    truncated = len(context) > MAX_SUMMARY_CONTEXT_CHARS
    context = context[:MAX_SUMMARY_CONTEXT_CHARS]

    prompt = f"""
Write a concise, structured summary of the document below.

Use a short overview paragraph followed by the key points as a bulleted list.
Use ONLY the document text. Do not invent information.

DOCUMENT:
{context}
"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    return {
        "summary": response.text,
        "chunks_used": len(chunks),
        "truncated": truncated,
    }


# Allowlist: the only functions the agent can run. The model's choice is
# looked up here by name; anything else falls back to DEFAULT_TOOL.
TOOLS: dict[str, Callable[[Session, str, int], dict]] = {
    "search_document": lambda db, question, doc_id: search_document(db, question, doc_id),
    "get_document_info": lambda db, question, doc_id: get_document_info(db, doc_id),
    "summarize_document": lambda db, question, doc_id: summarize_document(db, doc_id),
}


# ---------------------------------------------------------------------------
# Agent steps
# ---------------------------------------------------------------------------

ROUTER_PROMPT = """
You are the router for a document question-answering assistant.
Choose exactly ONE tool to answer the user's question.

Tools:
- search_document: semantic search over the document's content. Use for
  questions about specific facts, topics, skills, technologies, people,
  experience, or anything that needs particular passages of the text.
- get_document_info: document metadata only (document ID, filename,
  number of indexed chunks). Use for questions about the file itself.
- summarize_document: an overview of the entire document. Use for requests
  to summarize, give an overview, or explain what the document is mainly about.

Return the tool name and a one-sentence reason for the choice.

USER QUESTION:
{question}
"""


def choose_tool(question: str) -> ToolDecision:
    """Ask Gemini to pick a tool. Falls back to search_document on bad output."""
    fallback = ToolDecision(
        tool=DEFAULT_TOOL,
        reason="Defaulted to semantic search because the routing step did not return a valid tool.",
    )

    try:
        response = client.models.generate_content(
            model=GENERATION_MODEL,
            contents=ROUTER_PROMPT.format(question=question),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ToolDecision,
                temperature=0,
            ),
        )
    except Exception:
        return fallback

    decision = response.parsed

    if not isinstance(decision, ToolDecision):
        try:
            decision = ToolDecision.model_validate_json(response.text or "")
        except ValueError:
            return fallback

    if decision.tool not in TOOLS:
        return fallback

    return decision


def generate_final_answer(question: str, tool_name: str, tool_result: dict) -> str:
    """Answer the question grounded only in the tool's output."""
    prompt = f"""
You are an AI knowledge assistant.

The application ran the tool "{tool_name}" for the user's question.
Answer the question using ONLY the tool result below.

If the tool result does not contain the information needed, say:
"I could not find that information in the uploaded document."

Do not invent information.

TOOL RESULT (JSON):
{json.dumps(tool_result, ensure_ascii=False, indent=2)}

QUESTION:
{question}

ANSWER:
"""

    response = client.models.generate_content(
        model=GENERATION_MODEL,
        contents=prompt,
    )

    return response.text


def run_agent(db: Session, question: str, document_id: int) -> dict[str, Any]:
    if db.get(models.Document, document_id) is None:
        raise DocumentNotFoundError(f"Document {document_id} not found")

    decision = choose_tool(question)
    tool_result = TOOLS[decision.tool](db, question, document_id)

    sources: list[str] = []

    if decision.tool == "search_document":
        if not tool_result["chunks"]:
            return {
                "answer": "I could not find relevant information in the uploaded document.",
                "tool_used": decision.tool,
                "tool_reason": decision.reason,
                "sources": [],
            }

        sources = [f"Chunk {chunk['chunk_id']}" for chunk in tool_result["chunks"]]

    answer = generate_final_answer(question, decision.tool, tool_result)

    return {
        "answer": answer,
        "tool_used": decision.tool,
        "tool_reason": decision.reason,
        "sources": sources,
    }
