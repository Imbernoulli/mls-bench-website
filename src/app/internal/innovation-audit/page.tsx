import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import MarkdownContent from "@/components/MarkdownContent";

// Hidden, internal-only static report on whether agents produce genuine ML
// science vs. baseline recombination (2026-05-29 10-agent audit). The report
// body lives in report.md (co-located) and is read at build time — the site
// is a static export, so this server component runs on Node during `next
// build`. Not linked from the public navbar; marked noindex below.

export const metadata = {
  title: "Internal · Innovation Audit",
  robots: { index: false, follow: false },
};

export default function InnovationAuditPage() {
  const md = fs.readFileSync(
    path.join(process.cwd(), "src/app/internal/innovation-audit/report.md"),
    "utf-8"
  );
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Internal · not linked from the main site
      </div>
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/internal" className="text-primary hover:underline">
          ← Internal tools
        </Link>
        <span className="mx-2">·</span>
        <Link href="/internal/logs" className="text-primary hover:underline">
          Agent reasoning logs
        </Link>
      </div>
      <MarkdownContent content={md} />
    </div>
  );
}
