import Link from "next/link";
import { getAllConversationPaths, getConversationStatic } from "@/lib/data";
import ConversationViewer from "@/components/ConversationViewer";

export function generateStaticParams() {
  return getAllConversationPaths();
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ taskId: string; model: string }>;
}) {
  const { taskId, model: modelSlug } = await params;
  const conversation = getConversationStatic(taskId, modelSlug);

  if (!conversation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Conversation not found</h1>
        <Link
          href={`/tasks/${taskId}`}
          className="mt-4 inline-block text-primary hover:underline"
        >
          Back to task
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/tasks" className="hover:text-primary">
          Tasks
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/tasks/${taskId}`} className="hover:text-primary">
          {taskId}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{conversation.model}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">
        Agent Conversation: {conversation.model}
      </h1>

      <ConversationViewer conversation={conversation} />
    </div>
  );
}
