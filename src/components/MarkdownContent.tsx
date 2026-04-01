"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClassName || "");
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
              <code
                className="bg-[#f7f7f8] px-1.5 py-0.5 rounded text-[0.85em]"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table className="text-sm">{children}</table>
              </div>
            );
          },
        }}
      />
    </div>
  );
}
