import { RESOURCE_LINKS } from "@/lib/resources";

const FOOTER_LINKS = [
  RESOURCE_LINKS.github,
  RESOURCE_LINKS.arxiv,
  RESOURCE_LINKS.discord,
  RESOURCE_LINKS.huggingFace,
];

function TinyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M5.5 4.5h6v6M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-[var(--color-text-secondary)]">
            MLS-Bench
          </p>
          <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[var(--color-text)]"
              >
                <TinyIcon />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
