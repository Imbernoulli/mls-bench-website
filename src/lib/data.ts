import type {
  TaskMeta,
  Category,
  StandardModel,
  LeaderboardData,
  ConversationIndex,
  Conversation,
} from "./types";

const DATA_BASE = "/data";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

export async function getTasks(): Promise<TaskMeta[]> {
  return fetchJson<TaskMeta[]>("/tasks.json");
}

export async function getCategories(): Promise<Record<string, Category>> {
  return fetchJson<Record<string, Category>>("/categories.json");
}

export async function getModels(): Promise<StandardModel[]> {
  return fetchJson<StandardModel[]>("/models.json");
}

export async function getLeaderboard(
  taskId: string
): Promise<LeaderboardData | null> {
  try {
    return await fetchJson<LeaderboardData>(`/leaderboards/${taskId}.json`);
  } catch {
    return null;
  }
}

// Conversation data is no longer transmitted to the website during the
// paper freeze (build_site_data.py skips the export). The fetcher
// helpers below remain so the dormant ConversationViewer route still
// compiles; they will return empty / null at runtime.
export async function getConversationIndex(): Promise<ConversationIndex> {
  try {
    return await fetchJson<ConversationIndex>("/conversations/index.json");
  } catch {
    return {};
  }
}

export async function getConversation(
  taskId: string,
  modelSlug: string
): Promise<Conversation | null> {
  try {
    return await fetchJson<Conversation>(
      `/conversations/${taskId}/${modelSlug}.json`
    );
  } catch {
    return null;
  }
}

// For static generation: read JSON files at build time
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export function getConversationIndexStatic(): ConversationIndex {
  const filePath = path.join(DATA_DIR, "conversations", "index.json");
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getConversationStatic(
  taskId: string,
  modelSlug: string
): Conversation | null {
  const filePath = path.join(
    DATA_DIR,
    "conversations",
    taskId,
    `${modelSlug}.json`
  );
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function getAllConversationPaths(): {
  taskId: string;
  model: string;
}[] {
  const index = getConversationIndexStatic();
  const paths: { taskId: string; model: string }[] = [];
  for (const [taskId, convos] of Object.entries(index)) {
    for (const c of convos) {
      paths.push({ taskId, model: c.slug });
    }
  }
  return paths;
}

export function getTasksStatic(): TaskMeta[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "tasks.json"), "utf-8");
  return JSON.parse(raw);
}

export function getCategoriesStatic(): Record<string, Category> {
  const raw = fs.readFileSync(path.join(DATA_DIR, "categories.json"), "utf-8");
  return JSON.parse(raw);
}

export function getModelsStatic(): StandardModel[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "models.json"), "utf-8");
  return JSON.parse(raw);
}

export function getLeaderboardStatic(taskId: string): LeaderboardData | null {
  const filePath = path.join(DATA_DIR, "leaderboards", `${taskId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export type Proposals = Record<string, Record<string, string>>;

export function getProposalsStatic(taskId: string): Proposals | null {
  const filePath = path.join(DATA_DIR, "proposals", `${taskId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/** Standardized human-readable annotation produced by the annotation pipeline.
 *  See SCHEMA.md in MLS-Bench .local-saves/annotations-prod/. */
export interface ProposalAnnotationDoc {
  model: string;
  name: string;
  tagline: string;
  kind: "formula" | "architecture" | "pseudocode" | "hybrid";
  formula?: string;
  diagram?: { nodes: { id: string; label: string }[]; edges: { from: string; to: string; label?: string }[] };
  pseudocode?: string;
  key_hyperparams?: { name: string; value: string; role?: string; learnable?: boolean }[];
  init_recovers?: string;
  diff_from_baseline: string;
  confidence: "high" | "medium" | "low";
}

export function getAnnotationsStatic(taskId: string): ProposalAnnotationDoc[] {
  const filePath = path.join(DATA_DIR, "annotations", `${taskId}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const arr = JSON.parse(raw);
  return Array.isArray(arr) ? arr : [];
}

/** Standardized baseline annotations (same schema as proposals). */
export function getBaselineAnnotationsStatic(taskId: string): ProposalAnnotationDoc[] {
  const filePath = path.join(DATA_DIR, "baseline_annotations", `${taskId}.json`);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const arr = JSON.parse(raw);
  return Array.isArray(arr) ? arr : [];
}
