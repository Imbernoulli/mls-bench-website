export interface EditRange {
  start: number;
  end: number;
}

export interface TaskFile {
  filename: string;
  edit_ranges: EditRange[];
  content?: string;
}

export interface BaselineOp {
  file: string;
  start_line: number;
  end_line: number;
  content: string;
}

export interface TaskMeta {
  id: string;
  name: string;
  summary: string;
  category: string;
  category_label: string;
  category_abbr?: string;
  description_html: string;
  description_md: string;
  baselines: string[];
  baselines_code?: Record<string, BaselineOp[]>;
  environments: string[];
  packages: string[];
  files: TaskFile[];
  rigorous_codebase: boolean;
  allow_create: boolean;
  has_agent_logs: boolean;
}

export interface Category {
  id: string;
  label: string;
  abbr?: string;
  tasks: string[];
}

export interface StandardModel {
  id: string;
  name: string;
  aliases: string[];
  color: string;
}

export interface MetricGroup {
  setting: string;
  metrics: string[];
}

export interface LeaderboardData {
  task_id: string;
  columns: string[];
  metric_columns: string[];
  /** Per-metric direction: "higher" or "lower". Missing means "higher". */
  metric_directions?: Record<string, "higher" | "lower">;
  metric_groups?: MetricGroup[];
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
