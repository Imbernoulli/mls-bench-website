"use client";

import { useMemo, useState } from "react";
import type { BaselineOp, StandardModel } from "@/lib/types";
import type { ModelSweep } from "@/lib/sweep";
import { resolveCanonicalModel } from "@/lib/display";
import ProposalAnnotation, { type Annotation } from "./ProposalAnnotation";

type Proposals = Record<string, Record<string, string>>;

interface Props {
  baselinesCode?: Record<string, BaselineOp[]>;
  proposals?: Proposals | null;
  models: StandardModel[];
  annotations?: Annotation[];
  baselineAnnotations?: Annotation[];
  sweeps?: ModelSweep[];
}

type EntryKind = "baseline" | "agent";
interface Entry {
  key: string;          // unique selector key
  label: string;        // display label
  kind: EntryKind;
  rawName: string;      // baseline name OR raw proposal key
  canonicalId?: string; // for agent entries
  color: string;        // brand color for agent, neutral for baseline
}

export default function MethodSummary({
  baselinesCode,
  proposals,
  models,
  annotations,
  baselineAnnotations,
  sweeps,
}: Props) {
  const annotationByModel = useMemo(
    () => new Map<string, Annotation>((annotations ?? []).map((a) => [a.model, a])),
    [annotations],
  );
  const baselineAnnotationByName = useMemo(
    () => new Map<string, Annotation>(
      (baselineAnnotations ?? []).map((a) => [a.model, a]),
    ),
    [baselineAnnotations],
  );
  const sweepByCanonical = useMemo(
    () => new Map<string, ModelSweep>((sweeps ?? []).map((s) => [s.modelId, s])),
    [sweeps],
  );

  // Mirror TaskCodeViewer's de-dup logic so the picker labels match the Code
  // section's tabs.
  const agentEntries = useMemo<Entry[]>(() => {
    const annotatedKeys = new Set(annotations?.map((a) => a.model) ?? []);
    const byCanonical = new Map<
      string,
      { rawKey: string; label: string; canonicalId: string; color: string }
    >();
    for (const rawKey of Object.keys(proposals || {})) {
      const canonical = resolveCanonicalModel(rawKey, models);
      if (!canonical) continue;
      const candidate = {
        rawKey,
        label: canonical.name,
        canonicalId: canonical.id,
        color: canonical.color,
      };
      const existing = byCanonical.get(canonical.id);
      if (!existing) {
        byCanonical.set(canonical.id, candidate);
        continue;
      }
      const score = (k: string) =>
        (annotatedKeys.has(k) ? 4 : 0) +
        (k === canonical.id ? 2 : 0) +
        (k < existing.rawKey ? 1 : 0);
      if (score(rawKey) > score(existing.rawKey)) {
        byCanonical.set(canonical.id, candidate);
      }
    }
    return Array.from(byCanonical.values())
      .sort((a, b) => {
        const ai = models.findIndex((m) => m.id === a.canonicalId);
        const bi = models.findIndex((m) => m.id === b.canonicalId);
        return ai - bi;
      })
      .map((e) => ({
        key: `agent:${e.rawKey}`,
        label: e.label,
        kind: "agent" as EntryKind,
        rawName: e.rawKey,
        canonicalId: e.canonicalId,
        color: e.color,
      }));
  }, [proposals, models, annotations]);

  const baselineEntries = useMemo<Entry[]>(() => {
    const names = Object.keys(baselinesCode || {});
    return names.map((name) => ({
      key: `baseline:${name}`,
      label: name,
      kind: "baseline" as EntryKind,
      rawName: name,
      color: "#64748b",
    }));
  }, [baselinesCode]);

  // Pick a default: first agent that has an annotation, else first baseline
  // that has one, else first overall entry.
  const allEntries = [...agentEntries, ...baselineEntries];
  const defaultEntry = useMemo<Entry | null>(() => {
    const agentWithAnn = agentEntries.find((e) => annotationByModel.has(e.rawName));
    if (agentWithAnn) return agentWithAnn;
    const baseWithAnn = baselineEntries.find((e) =>
      baselineAnnotationByName.has(e.rawName),
    );
    if (baseWithAnn) return baseWithAnn;
    return allEntries[0] ?? null;
  }, [agentEntries, baselineEntries, annotationByModel, baselineAnnotationByName, allEntries]);

  const [activeKey, setActiveKey] = useState<string | null>(
    defaultEntry?.key ?? null,
  );
  const active = allEntries.find((e) => e.key === activeKey) ?? defaultEntry;

  if (!active) {
    return (
      <p className="text-sm text-muted-foreground">
        No method summaries available for this task.
      </p>
    );
  }

  const annotation =
    active.kind === "agent"
      ? annotationByModel.get(active.rawName)
      : baselineAnnotationByName.get(active.rawName);
  const sweep =
    active.kind === "agent" && active.canonicalId
      ? sweepByCanonical.get(active.canonicalId)
      : undefined;

  return (
    <div>
      {/* Caption goes first, just under the section heading, with a sweep
          badge on the right when applicable. */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>
          Auto-summarized from each method's code by an LLM reviewer — not the
          model's original output. Browse via the picker below; the Code section
          is independent.
        </span>
        {sweep && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
            <span aria-hidden>🏆</span>
            Beats every baseline on every metric
          </span>
        )}
      </div>

      {/* Picker — Baselines on row 1, Agents on row 2. Each row has its own
          inline label so the kinds stay visually distinct even when there are
          many entries. */}
      {baselineEntries.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Baselines
          </span>
          {baselineEntries.map((e) => {
            const isActive = active.key === e.key;
            return (
              <button
                key={e.key}
                onClick={() => setActiveKey(e.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
                {e.label}
              </button>
            );
          })}
        </div>
      )}
      {agentEntries.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Agents
          </span>
          {agentEntries.map((e) => {
            const isActive = active.key === e.key;
            const swept =
              e.canonicalId ? sweepByCanonical.has(e.canonicalId) : false;
            return (
              <button
                key={e.key}
                onClick={() => setActiveKey(e.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
                {e.label}
                {swept && <span aria-hidden>🏆</span>}
              </button>
            );
          })}
        </div>
      )}

      {annotation ? (
        <ProposalAnnotation
          annotation={annotation}
          modelName={active.label}
          modelColor={active.color}
          mode={active.kind === "agent" ? "proposal" : "baseline"}
        />
      ) : (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          No summary annotation is available for {active.label}.
        </p>
      )}
    </div>
  );
}
