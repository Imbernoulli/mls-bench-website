"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Category, TaskMeta } from "@/lib/types";
import { categoryStyle } from "@/lib/display";
import { tileSrc } from "@/lib/tile-versions";

interface CategoryWithTasks {
  category: Category;
  tasks: TaskMeta[];
}

interface Props {
  items: CategoryWithTasks[];
}

export default function CategoryGrid({ items }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 [grid-auto-flow:row_dense] sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ category, tasks }) => {
        const style = categoryStyle(category.id);
        const isActive = activeId === category.id;
        return (
          <Fragment key={category.id}>
            <button
              type="button"
              aria-expanded={isActive}
              onMouseEnter={() => setActiveId(category.id)}
              onFocus={() => setActiveId(category.id)}
              onClick={() =>
                setActiveId((current) =>
                  current === category.id ? null : category.id
                )
              }
              className="flex min-h-[132px] w-full flex-col justify-between rounded-lg border p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              style={{
                backgroundColor: style.bg,
                borderColor: style.border,
                color: style.text,
                boxShadow: isActive
                  ? `0 0 0 2px ${style.border}`
                  : "none",
              }}
            >
              <span className="text-base text-foreground">
                {category.label}
              </span>
              <span className="mt-2 text-sm text-muted-foreground">
                {tasks.length} tasks
              </span>
            </button>

            {isActive && (
              <div
                aria-label={`${category.label} tasks`}
                className="animate-in col-span-1 grid gap-3 bg-muted/35 p-3 sm:col-span-2 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-3"
              >
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="grid grid-cols-[86px_1fr] items-center gap-3 rounded-lg border border-border bg-card p-2 text-sm transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                  >
                    <Image
                      src={tileSrc(task.id, "column")}
                      alt=""
                      width={86}
                      height={54}
                      className="h-[54px] w-[86px] rounded object-cover"
                    />
                    <span className="font-medium leading-snug text-foreground">
                      {task.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
