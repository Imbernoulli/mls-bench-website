import type {
  TaskMeta,
  Category,
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

export async function getLeaderboard(
  taskId: string
): Promise<LeaderboardData | null> {
  try {
    return await fetchJson<LeaderboardData>(`/leaderboards/${taskId}.json`);
  } catch {
    return null;
  }
}

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

export function getTasksStatic(): TaskMeta[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, "tasks.json"), "utf-8");
  return JSON.parse(raw);
}

export function getCategoriesStatic(): Record<string, Category> {
  const raw = fs.readFileSync(path.join(DATA_DIR, "categories.json"), "utf-8");
  return JSON.parse(raw);
}

export function getLeaderboardStatic(taskId: string): LeaderboardData | null {
  const filePath = path.join(DATA_DIR, "leaderboards", `${taskId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

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
