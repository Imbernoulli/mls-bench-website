"use client";

import { Component, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Error boundary to catch rendering failures
class MarkdownErrorBoundary extends Component<
  { children: ReactNode; fallback: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
          {this.props.fallback}
        </pre>
      );
    }
    return this.props.children;
  }
}

const mdComponents: Components = {
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");

    if (match) {
      return (
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          customStyle={{
            margin: 0,
            borderRadius: "6px",
            fontSize: "0.8rem",
            border: "1px solid #e5e5e5",
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      );
    }

    return (
      <code className="bg-[#f7f7f8] px-1.5 py-0.5 rounded text-[0.85em] font-mono">
        {children}
      </code>
    );
  },
  pre({ children }) {
    // Prevent double wrapping — react-markdown wraps code blocks in <pre>
    return <>{children}</>;
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4">
        <table className="text-sm border-collapse w-full">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border border-border px-3 py-2 bg-muted text-left text-sm font-medium">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="border border-border px-3 py-2 text-sm">{children}</td>
    );
  },
};

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: Props) {
  return (
    <MarkdownErrorBoundary fallback={content}>
      <div className={`prose prose-sm prose-neutral max-w-none ${className}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {content}
        </ReactMarkdown>
      </div>
    </MarkdownErrorBoundary>
  );
}
