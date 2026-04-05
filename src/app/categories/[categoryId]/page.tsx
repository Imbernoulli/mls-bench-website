import Link from "next/link";
import { getTasksStatic, getCategoriesStatic } from "@/lib/data";
import TaskTable from "@/components/TaskTable";

export function generateStaticParams() {
  const categories = getCategoriesStatic();
  return Object.keys(categories).map((id) => ({ categoryId: id }));
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const allTasks = getTasksStatic();
  const categories = getCategoriesStatic();
  const category = categories[categoryId];

  if (!category) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/categories" className="mt-4 text-primary hover:underline">
          Back to categories
        </Link>
      </div>
    );
  }

  const tasks = allTasks.filter((t) => category.tasks.includes(t.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.label}</span>
      </nav>

      <h1 className="text-3xl font-bold">{category.label}</h1>
      <p className="mt-2 text-muted-foreground">
        {tasks.length} task{tasks.length !== 1 ? "s" : ""} in this category.
      </p>

      <div className="mt-8">
        <TaskTable tasks={tasks} categories={categories} />
      </div>
    </div>
  );
}
