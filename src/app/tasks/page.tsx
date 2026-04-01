import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import TaskTable from "@/components/TaskTable";

export default function TasksPage() {
  const tasks = getTasksStatic();
  const categories = getCategoriesStatic();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <p className="mt-2 text-muted-foreground">
        Browse all benchmark tasks. Click a task to see its description,
        leaderboard, and agent conversation logs.
      </p>
      <div className="mt-8">
        <TaskTable tasks={tasks} categories={categories} />
      </div>
    </div>
  );
}
