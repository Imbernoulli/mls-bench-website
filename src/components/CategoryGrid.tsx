"use client";

import { Fragment, useEffect, useRef, useState } from "react";
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

const ANIM_MS = 280;

function CategoryRow({
  item,
  isActive,
  onActivate,
  onScheduleClose,
  onCancelClose,
}: {
  item: CategoryWithTasks;
  isActive: boolean;
  onActivate: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const { category, tasks } = item;
  const style = categoryStyle(category.id);

  // Local animation state — `mounted` keeps the panel in the DOM while it's
  // collapsing; `shown` is the visual open state that drives the CSS classes.
  const [mounted, setMounted] = useState(isActive);
  const [shown, setShown] = useState(isActive);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (timerRef.current != null) clearTimeout(timerRef.current);

    if (isActive) {
      setMounted(true);
      // Double-RAF so the browser commits the collapsed-state styles before
      // we flip to the open class — otherwise the transition is skipped.
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setShown(true);
        });
      });
    } else {
      setShown(false);
      timerRef.current = window.setTimeout(() => {
        setMounted(false);
      }, ANIM_MS + 20);
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timerRef.current != null) clearTimeout(timerRef.current);
    };
  }, [isActive]);

  return (
    <Fragment>
      <Link
        href={`/tasks?category=${encodeURIComponent(category.id)}`}
        aria-expanded={isActive}
        onMouseEnter={onActivate}
        onMouseLeave={onScheduleClose}
        onFocus={onActivate}
        onBlur={onScheduleClose}
        className="flex w-full flex-col justify-center gap-1 rounded-lg border px-4 py-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
        style={{
          backgroundColor: style.bg,
          borderColor: style.border,
          color: style.text,
          boxShadow: isActive ? `0 0 0 2px ${style.border}` : "none",
        }}
      >
        <span className="text-[15px] font-medium leading-tight text-foreground">
          {category.label}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {tasks.length} tasks
        </span>
      </Link>

      {mounted && (
        <div
          aria-label={`${category.label} tasks`}
          aria-hidden={!shown}
          onMouseEnter={() => {
            onCancelClose();
            onActivate();
          }}
          onMouseLeave={onScheduleClose}
          className={[
            "col-span-1 sm:col-span-2 xl:col-span-3",
            "grid transition-[grid-template-rows,opacity] ease-out",
            shown
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
          style={{ transitionDuration: `${ANIM_MS}ms` }}
        >
          <div className="overflow-hidden">
            <div
              className={[
                "grid gap-3 bg-muted/35 p-3 sm:grid-cols-2 xl:grid-cols-3",
                "transition-transform ease-out",
                shown ? "translate-y-0" : "-translate-y-1",
              ].join(" ")}
              style={{ transitionDuration: `${ANIM_MS}ms` }}
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
          </div>
        </div>
      )}
    </Fragment>
  );
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
      {items.map((item) => (
        <CategoryRow
          key={item.category.id}
          item={item}
          isActive={activeId === item.category.id}
          onActivate={() => {
            cancelClose();
            setActiveId(item.category.id);
          }}
          onScheduleClose={scheduleClose}
          onCancelClose={cancelClose}
        />
      ))}
    </div>
  );
}
