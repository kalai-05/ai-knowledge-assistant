const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface UploadResponse {
  message: string;
  document_id: number;
  filename: string;
  chunks_created: number;
}

export interface AskResponse {
  answer: string;
  sources: string[];
}

export interface AgentAskResponse extends AskResponse {
  tool_used: string;
  tool_reason: string;
}

// Thrown when the API server cannot be reached at all.
export class NetworkError extends Error {
  constructor() {
    super("Backend unavailable. Check that the API server is running.");
    this.name = "NetworkError";
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new NetworkError();
  }
}

async function readErrorDetail(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const error = await response.json();
    if (typeof error?.detail === "string") return error.detail;
  } catch {
    // Non-JSON error body; use the fallback message.
  }
  return fallback;
}

export async function uploadDocument(
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await request("/documents/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await readErrorDetail(response, "Failed to upload document")
    );
  }

  return response.json();
}

async function postQuestion<T>(
  path: string,
  question: string,
  documentId: number,
  fallbackError: string
): Promise<T> {
  const response = await request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      document_id: documentId,
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorDetail(response, fallbackError));
  }

  return response.json();
}

// Standard RAG: retrieve relevant chunks, then generate a grounded answer.
export function askQuestion(
  question: string,
  documentId: number
): Promise<AskResponse> {
  return postQuestion<AskResponse>(
    "/ask",
    question,
    documentId,
    "Failed to generate answer"
  );
}

// Agentic tool routing: the LLM picks a tool, the backend runs it, then answers.
export function askAgent(
  question: string,
  documentId: number
): Promise<AgentAskResponse> {
  return postQuestion<AgentAskResponse>(
    "/agent/ask",
    question,
    documentId,
    "Failed to generate agent answer"
  );
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
