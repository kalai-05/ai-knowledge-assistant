"use client";

import { useEffect, useRef, useState } from "react";
import {
  askAgent,
  askQuestion,
  checkHealth,
  NetworkError,
  uploadDocument,
  UploadResponse,
} from "@/lib/api";
import type { ApiStatus, ChatMode, Message } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";
import Header from "@/components/Header";
import KnowledgePanel from "@/components/KnowledgePanel";

const HEALTH_CHECK_INTERVAL = 30_000;

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export default function Home() {
  const [document, setDocument] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>("rag");
  const [chatError, setChatError] = useState("");
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const nextMessageId = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const healthy = await checkHealth();
      if (!cancelled) setApiStatus(healthy ? "online" : "offline");
    }

    ping();
    const interval = setInterval(ping, HEALTH_CHECK_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function trackRequestError(err: unknown) {
    if (err instanceof NetworkError) setApiStatus("offline");
  }

  function createMessage(message: Omit<Message, "id">): Message {
    nextMessageId.current += 1;
    return { ...message, id: nextMessageId.current };
  }

  async function handleUpload(file: File) {
    if (uploading || asking) return;

    if (!isPdf(file)) {
      setUploadError("Please select a PDF file.");
      return;
    }

    try {
      setUploadError("");
      setUploading(true);

      const result = await uploadDocument(file);

      setDocument(result);
      setMessages([]);
      setChatError("");
      setApiStatus("online");
    } catch (err) {
      trackRequestError(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !document || asking || uploading) return;

    setMessages((previous) => [
      ...previous,
      createMessage({ role: "user", content: trimmedQuestion }),
    ]);
    setChatError("");
    setAsking(true);

    // Capture the mode at send time so the answer is tagged correctly.
    const requestMode = mode;

    try {
      let assistantMessage: Omit<Message, "id">;

      if (requestMode === "agent") {
        const result = await askAgent(trimmedQuestion, document.document_id);
        assistantMessage = {
          role: "assistant",
          mode: "agent",
          content: result.answer,
          sources: result.sources,
          agent: {
            toolUsed: result.tool_used,
            toolReason: result.tool_reason,
          },
        };
      } else {
        const result = await askQuestion(trimmedQuestion, document.document_id);
        assistantMessage = {
          role: "assistant",
          mode: "rag",
          content: result.answer,
          sources: result.sources,
        };
      }

      setMessages((previous) => [...previous, createMessage(assistantMessage)]);
      setApiStatus("online");
    } catch (err) {
      trackRequestError(err);
      setChatError(
        err instanceof Error ? err.message : "Failed to generate answer"
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100 lg:h-dvh">
      <Header status={apiStatus} />

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-[minmax(0,1fr)] gap-4 p-4 lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-5 lg:p-5">
        <KnowledgePanel
          document={document}
          uploading={uploading}
          asking={asking}
          answered={messages.some((message) => message.role === "assistant")}
          error={uploadError}
          onUpload={handleUpload}
          onDismissError={() => setUploadError("")}
        />

        <ChatPanel
          document={document}
          messages={messages}
          mode={mode}
          asking={asking}
          uploading={uploading}
          error={chatError}
          onAsk={handleAsk}
          onModeChange={setMode}
          onDismissError={() => setChatError("")}
        />
      </main>
    </div>
  );
}
