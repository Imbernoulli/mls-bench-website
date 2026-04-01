export interface TaskMeta {
  id: string;
  category: string;
  category_label: string;
  description_html: string;
  description_md: string;
  baselines: string[];
  environments: string[];
  packages: string[];
  files: { filename: string; edit_ranges: { start: number; end: number }[] }[];
  rigorous_codebase: boolean;
  allow_create: boolean;
  has_agent_logs: boolean;
}

export interface Category {
  id: string;
  label: string;
  tasks: string[];
}

export interface LeaderboardData {
  task_id: string;
  columns: string[];
  metric_columns: string[];
  rows: Record<string, string | number | boolean | null>[];
}

export interface ConversationIndex {
  [taskId: string]: { model: string; slug: string; total_steps: number }[];
}

export interface ConversationMessage {
  step: number;
  role: "user" | "assistant" | "tool_result";
  content?: string;
  content_truncated?: boolean;
  thinking?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  result?: string;
  result_truncated?: boolean;
}

export interface FileSnapshot {
  step: number;
  filename: string;
  original_name: string;
  content: string;
}

export interface Conversation {
  task_id: string;
  model: string;
  model_slug: string;
  total_steps: number;
  messages: ConversationMessage[];
  file_snapshots: FileSnapshot[];
}
