"use client";

import { useState } from "react";
import type { Conversation, ConversationMessage } from "@/lib/types";
import CodeBlock from "./CodeBlock";
import MarkdownContent from "./MarkdownContent";

interface Props {
  conversation: Conversation;
}

function MessageBubble({ msg }: { msg: ConversationMessage }) {
  const [expanded, setExpanded] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showFullResult, setShowFullResult] = useState(false);

  if (msg.role === "user") {
    const content = msg.content || "";
    const isLong = content.length > 3000;
    const displayContent = isLong && !expanded ? content.slice(0, 3000) : content;

    return (
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            User
          </span>
          <span className="text-xs text-muted-foreground">Step {msg.step}</span>
        </div>
        <MarkdownContent content={displayContent} />
        {isLong && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Show full ({content.length.toLocaleString()} chars)
          </button>
        )}
      </div>
    );
  }

  if (msg.role === "assistant") {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-[#10a37f]/10 px-2.5 py-0.5 text-xs font-medium text-[#10a37f]">
            Assistant
          </span>
          <span className="text-xs text-muted-foreground">Step {msg.step}</span>
          {msg.tool_name && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
              {msg.tool_name}
            </span>
          )}
        </div>

        {/* Thinking block */}
        {msg.thinking && (
          <div className="mb-3">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <span className="text-[10px]">{showThinking ? "\u25BC" : "\u25B6"}</span>
              Thinking ({msg.thinking.length.toLocaleString()} chars)
            </button>
            {showThinking && (
              <div className="mt-2 rounded-md border border-border bg-background p-3 max-h-96 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed">
                {msg.thinking}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {msg.content && (
          <MarkdownContent content={msg.content} />
        )}

        {/* Tool input */}
        {msg.tool_input && (
          <div className="mt-2">
            <details>
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Tool Input
              </summary>
              <div className="mt-2">
                <CodeBlock
                  code={JSON.stringify(msg.tool_input, null, 2)}
                  language="json"
                />
              </div>
            </details>
          </div>
        )}
      </div>
    );
  }

  if (msg.role === "tool_result") {
    const result = msg.result || "";
    const isLong = result.length > 1000;
    const displayResult =
      isLong && !showFullResult ? result.slice(0, 1000) : result;

    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Tool Result
          </span>
          <span className="text-xs text-muted-foreground">Step {msg.step}</span>
        </div>
        <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground max-h-96 overflow-y-auto">
          {displayResult}
          {isLong && !showFullResult && (
            <>
              {"\n"}
              <button
                onClick={() => setShowFullResult(true)}
                className="text-accent hover:underline"
              >
                Show full result ({result.length.toLocaleString()} chars)
              </button>
            </>
          )}
        </pre>
      </div>
    );
  }

  return null;
}

export default function ConversationViewer({ conversation }: Props) {
  const [visibleCount, setVisibleCount] = useState(20);

  const messages = conversation.messages;
  const visible = messages.slice(0, visibleCount);
  const hasMore = visibleCount < messages.length;

  return (
    <div>
      <div className="mb-4 rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Model: </span>
            <span className="font-medium">{conversation.model}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total steps: </span>
            <span className="font-medium">{conversation.total_steps}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Messages: </span>
            <span className="font-medium">{messages.length}</span>
          </div>
          {conversation.file_snapshots.length > 0 && (
            <div>
              <span className="text-muted-foreground">File snapshots: </span>
              <span className="font-medium">
                {conversation.file_snapshots.length}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 20)}
            className="rounded-md border border-border px-5 py-2 text-sm hover:bg-muted transition-colors"
          >
            Load more ({messages.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* File snapshots */}
      {conversation.file_snapshots.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">File Snapshots</h3>
          <div className="space-y-3">
            {conversation.file_snapshots.map((snap, i) => (
              <details key={i} className="rounded-lg border border-border">
                <summary className="cursor-pointer px-4 py-3 text-sm hover:bg-muted/50">
                  <span className="font-medium">Step {snap.step}</span>
                  <span className="ml-2 text-muted-foreground">
                    {snap.filename}
                  </span>
                </summary>
                <div className="border-t border-border p-4">
                  <CodeBlock code={snap.content} language="python" />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
