"use client";

import Link from "next/link";
import { RESOURCE_LINKS } from "@/lib/resources";

/* ------------------------------------------------------------------ */
/* Brand icons                                                        */
/* ------------------------------------------------------------------ */

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 10h14M10 2.75c2 2 3 4.42 3 7.25s-1 5.25-3 7.25M10 2.75C8 4.75 7 7.17 7 10s1 5.25 3 7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
      <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.52 7.52 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
    </svg>
  );
}

function ArxivIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M19.5 5.2A16.7 16.7 0 0 0 15.4 4l-.2.4c1.5.4 2.2 1 2.2 1a13.5 13.5 0 0 0-10.8 0s.7-.7 2.3-1L8.6 4a16.7 16.7 0 0 0-4.1 1.2C1.9 9 1.2 12.8 1.5 16.5A16.8 16.8 0 0 0 6.5 19l.6-.9a9.7 9.7 0 0 1-1.6-.8l.4-.3c3.1 1.5 6.7 1.5 9.8 0l.4.3c-.5.3-1 .6-1.6.8l.6.9a16.8 16.8 0 0 0 5-2.5c.4-4.3-.7-8-2.6-11.3ZM8.3 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  );
}

function HuggingFaceIcon() {
  return (
    <span aria-hidden="true" className="text-base leading-none">
      🤗
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Button style — sharp dark rectangles, brand-color icon, white       */
/* bold text. Per user feedback: the previous tinted-pill look read    */
/* as "ugly"; this is the explicit fallback they asked for —           */
/* dark filled rectangle + white bold text + no rounded corners.       */
/* ------------------------------------------------------------------ */

export const RESOURCE_BUTTONS = [
  {
    link: RESOURCE_LINKS.website,
    icon: <GlobeIcon />,
    iconColor: "#34d3ad",
  },
  {
    link: RESOURCE_LINKS.github,
    icon: <GitHubIcon />,
    iconColor: "#ffffff",
  },
  {
    link: RESOURCE_LINKS.arxiv,
    icon: <ArxivIcon />,
    iconColor: "#ff6868",
  },
  {
    link: RESOURCE_LINKS.discord,
    icon: <DiscordIcon />,
    iconColor: "#a8b0ff",
  },
  {
    link: RESOURCE_LINKS.huggingFace,
    icon: <HuggingFaceIcon />,
    iconColor: "#FFD21E",
  },
] as const;

interface Props {
  /** Render an "Explore Tasks" filled rectangle before the resource pills. */
  withExplore?: boolean;
}

const PILL_BASE =
  "inline-flex items-center gap-2 bg-foreground px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-colors hover:bg-foreground/85";

export default function ResourceButtons({ withExplore = false }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {withExplore && (
        <Link href="/tasks" className={PILL_BASE}>
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
          >
            <span style={{ color: item.iconColor }} className="inline-flex">
              {item.icon}
            </span>
            {link.label}
          </a>
        );
      })}
    </div>
  );
}
