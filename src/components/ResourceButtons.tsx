"use client";

import Link from "next/link";
import { RESOURCE_LINKS } from "@/lib/resources";

/* ------------------------------------------------------------------ */
/* Brand icons                                                        */
/* ------------------------------------------------------------------ */

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.52 7.52 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function ArxivIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
      <path
        d="m5 15 4.8-10M15 15 10.2 5M6.3 10h7.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 4.4c1.8 0 3.3 1 4.6 3M16 15.6c-1.8 0-3.3-1-4.6-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function HuggingFaceIcon() {
  return (
    <span aria-hidden="true" className="text-[12px] leading-none">
      🤗
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Button style — sharp brand-colored filled rectangles with bold      */
/* white text (dark text on the yellow Hugging Face one for contrast). */
/* No rounded corners; hover dims the bg slightly.                     */
/* ------------------------------------------------------------------ */

export const RESOURCE_BUTTONS = [
  {
    link: RESOURCE_LINKS.github,
    icon: <GitHubIcon />,
    bg: "#181717",
    bgHover: "#000000",
    text: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.arxiv,
    icon: <ArxivIcon />,
    bg: "#B31B1B",
    bgHover: "#8f1515",
    text: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.discord,
    icon: <DiscordIcon />,
    bg: "#5865F2",
    bgHover: "#4752c4",
    text: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.huggingFace,
    icon: <HuggingFaceIcon />,
    bg: "#FFD21E",
    bgHover: "#e8bd00",
    // White doesn't read on yellow — use a near-black text + dark icon.
    text: "#181717",
  },
] as const;

interface Props {
  /** Render an "Explore Tasks" filled rectangle before the resource pills. */
  withExplore?: boolean;
}

const PILL_BASE =
  "group inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide leading-none transition-colors";

export default function ResourceButtons({ withExplore = false }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {withExplore && (
        <Link
          href="/tasks"
          className={`${PILL_BASE} bg-foreground text-background hover:bg-foreground/85`}
        >
          Explore Tasks
        </Link>
      )}
      {RESOURCE_BUTTONS.map((item) => {
        const { link } = item;
        return (
          <a
            key={link.label}
            href={link.href}
            target={link.href === "#" ? undefined : "_blank"}
            rel={link.href === "#" ? undefined : "noopener noreferrer"}
            className={PILL_BASE}
            style={{
              backgroundColor: item.bg,
              color: item.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = item.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = item.bg;
            }}
          >
            <span className="inline-flex">{item.icon}</span>
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
