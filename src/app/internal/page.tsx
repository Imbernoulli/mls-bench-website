import Link from "next/link";

export const metadata = {
  title: "Internal · MLS-Bench",
  robots: { index: false, follow: false },
};

const TOOLS = [
  {
    href: "/internal/synth",
    title: "Tasks",
    desc: "All dev/synth benchmark tasks — descriptions, editable scaffolds, baseline code, and reproduced leaderboards. Same layout as the public task pages, but includes in-development tasks not on the public site.",
  },
  {
    href: "/internal/logs",
    title: "Agent Reasoning Logs",
    desc: "Full agent conversation traces (reasoning, tool calls, test feedback) for every model run. Dropped from the public site at the paper freeze — kept here for internal review.",
  },
  {
    href: "/internal/innovation-audit",
    title: "Innovation Audit (创新性审计)",
    desc: "2026-05-29 10-agent audit of 50 tasks × 3 models: do agents do genuine ML science or just recombine baselines? Detailed Chinese report with per-task innovation scores. (中文)",
  },
];

export default function InternalIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Internal Tools</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Hidden pages for the MLS-Bench team. None of these are linked from the
        public navbar or indexed by search engines.
      </p>

      <div className="mt-8 grid gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold group-hover:text-primary">
                {t.title}
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">
                {t.href}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
