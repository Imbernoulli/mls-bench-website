"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ConversationViewer from "@/components/ConversationViewer";
import type { Conversation } from "@/lib/types";

// Hidden, internal-only viewer for full agent reasoning traces. The public
// site stopped shipping conversation JSONs at the paper freeze; this route
// restores them for internal reviewers. It is NOT in the navbar and is
// marked noindex (see metadata in the sibling layout / robots below). Data
// is fetched at runtime from /internal-logs/ (static assets emitted by
// MLS-Bench `scripts/gen_internal_logs.py`), so the page chunk stays small
// and each ~100KB+ conversation loads only when selected.

const BASE = "/internal-logs";

interface ConvoRef {
  model: string;
  slug: string;
  total_steps: number;
}
interface TaskEntry {
  id: string;
  name: string;
  conversations: ConvoRef[];
}
interface LogIndex {
  generated: string;
  tasks: TaskEntry[];
}

export default function InternalLogsPage() {
  const [index, setIndex] = useState<LogIndex | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`index.json: ${r.status}`);
        return r.json();
      })
      .then((d: LogIndex) => setIndex(d))
      .catch((e) => setIndexError(String(e)));
  }, []);

  // Deep-linking: open a specific trace directly via
  // /internal/logs?task=<id>&slug=<model-slug> (slug also accepts a raw
  // provider/model path, normalized to the dashed slug). Used by the
  // innovation-audit report to cite specific agent logs / proposals.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const t = p.get("task");
    const s = p.get("slug") || p.get("model");
    if (t) setTaskId(t);
    if (s) setSlug(s.replace(/\//g, "--"));
  }, []);

  const tasks = index?.tasks ?? [];
  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [tasks, query]);

  const selectedTask = tasks.find((t) => t.id === taskId) ?? null;

  useEffect(() => {
    if (!taskId || !slug) {
      setConvo(null);
      return;
    }
    setLoading(true);
    setConvo(null);
    fetch(`${BASE}/${taskId}/${slug}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((d: Conversation) => setConvo(d))
      .catch(() => setConvo(null))
      .finally(() => setLoading(false));
  }, [taskId, slug]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Agent Reasoning Logs</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Full agent conversation traces (reasoning, tool calls, test feedback)
        for internal review. Pick a task, then a model run.
        {index ? ` Generated ${index.generated}.` : ""}{" "}
        <Link href="/internal/synth" className="text-primary hover:underline">
          ← Synth tasks
        </Link>
      </p>

      {indexError && (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Failed to load log index ({indexError}). The bundle may not be
          deployed yet.
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_1fr]">
        {/* Left: task + model picker */}
        <aside className="md:sticky md:top-20 md:self-start">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tasks…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="mt-3 max-h-[28rem] overflow-y-auto rounded-md border border-border">
            {filteredTasks.map((t) => {
              const active = t.id === taskId;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTaskId(t.id);
                    setSlug(null);
                  }}
                  className={`block w-full border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted ${
                    active ? "bg-muted font-medium" : ""
                  }`}
                >
                  <div className="leading-snug">{t.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {t.id} · {t.conversations.length} run
                    {t.conversations.length === 1 ? "" : "s"}
                  </div>
                </button>
              );
            })}
            {filteredTasks.length === 0 && index && (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                No matching tasks.
              </div>
            )}
            {!index && !indexError && (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                Loading…
              </div>
            )}
          </div>

          {selectedTask && (
            <div className="mt-4">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                Model runs
              </div>
              <div className="flex flex-col gap-1">
                {selectedTask.conversations.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setSlug(c.slug)}
                    className={`rounded-md border border-border px-3 py-1.5 text-left text-sm hover:bg-muted ${
                      c.slug === slug ? "bg-muted font-medium" : ""
                    }`}
                  >
                    <span className="font-mono text-xs">{c.model}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      {c.total_steps} steps
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right: conversation */}
        <section className="min-w-0">
          {loading && (
            <div className="text-sm text-muted-foreground">
              Loading conversation…
            </div>
          )}
          {!loading && convo && <ConversationViewer conversation={convo} />}
          {!loading && !convo && (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {selectedTask
                ? "Select a model run on the left."
                : "Select a task on the left to view its agent runs."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
