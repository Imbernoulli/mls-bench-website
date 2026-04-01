"use client";

import MarkdownContent from "./MarkdownContent";

interface Props {
  markdown: string;
}

export default function TaskDescription({ markdown }: Props) {
  if (!markdown) {
    return <p className="text-muted-foreground text-sm">No description available.</p>;
  }
  return <MarkdownContent content={markdown} />;
}
