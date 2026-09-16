export type ChatMode = "rag" | "agent";

export interface AgentActivity {
  toolUsed: string;
  toolReason: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  // Assistant messages record which mode produced them, so mixed-mode
  // history only shows agent activity on agent answers.
  mode?: ChatMode;
  agent?: AgentActivity;
}

export type ApiStatus = "checking" | "online" | "offline";
