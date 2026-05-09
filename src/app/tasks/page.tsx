import { Suspense } from "react";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import TaskBrowser from "@/components/TaskBrowser";

export default function TasksPage() {
  const tasks = getTasksStatic();
  const categories = getCategoriesStatic();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Browse benchmark tasks by category, baseline family, and evaluation
        setting.
      </p>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
              Loading tasks...
            </div>
          }
        >
          <TaskBrowser tasks={tasks} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
