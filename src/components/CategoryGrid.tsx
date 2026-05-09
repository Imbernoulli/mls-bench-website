"use client";

import { Fragment, useRef, useState } from "react";
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
  // Small delay so the mouse can travel across the gap from the button to
  // the expanded panel (sibling in grid flow) without the panel collapsing
  // mid-transit. Cleared whenever any category area receives mouseenter.
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setActiveId(null), 160);
  };

  return (
    <div className="grid gap-3 [grid-auto-flow:row_dense] sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ category, tasks }) => {
        const style = categoryStyle(category.id);
        const isActive = activeId === category.id;
        return (
          <Fragment key={category.id}>
            <button
              type="button"
              aria-expanded={isActive}
              onMouseEnter={() => {
                cancelClose();
                setActiveId(category.id);
              }}
              onMouseLeave={scheduleClose}
              onFocus={() => {
                cancelClose();
                setActiveId(category.id);
              }}
              onBlur={scheduleClose}
              onClick={() =>
                setActiveId((current) =>
                  current === category.id ? null : category.id
                )
              }
              className="flex w-full flex-col justify-center gap-1 rounded-lg border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
              style={{
                backgroundColor: style.bg,
                borderColor: style.border,
                color: style.text,
                boxShadow: isActive
                  ? `0 0 0 2px ${style.border}`
                  : "none",
              }}
            >
              <span className="text-[15px] font-medium leading-tight text-foreground">
                {category.label}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {tasks.length} tasks
              </span>
            </button>

            {isActive && (
              <div
                aria-label={`${category.label} tasks`}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
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
