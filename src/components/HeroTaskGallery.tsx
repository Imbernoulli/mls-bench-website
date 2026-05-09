"use client";

import Image from "next/image";
import Link from "next/link";
import { tileSrc } from "@/lib/tile-versions";
import Marquee from "./Marquee";

interface GalleryTask {
  id: string;
  name: string;
}

interface Props {
  tasks: GalleryTask[];
  /** Number of marquee rows. Defaults to 2 when there are >= 8 tasks. */
  rows?: number;
}

function TaskCard({ task }: { task: GalleryTask }) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      aria-label={task.name}
      className="group relative h-[118px] w-[180px] shrink-0 overflow-hidden rounded-lg border border-border bg-card"
    >
      <Image
        src={tileSrc(task.id, "column")}
        alt=""
        width={360}
        height={180}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
      <span className="absolute inset-x-3 bottom-3 translate-y-1 text-left text-sm font-semibold leading-tight text-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {task.name}
      </span>
    </Link>
  );
}

export default function HeroTaskGallery({ tasks, rows }: Props) {
  if (tasks.length === 0) return null;

  // Auto: 2 rows when there are enough tasks; otherwise a single row.
  const rowCount = rows ?? (tasks.length >= 8 ? 2 : 1);

  // Distribute tasks across rows in a stable, interleaved order so each row
  // gets a representative mix even if the input list is sorted by domain.
  const rowsTasks: GalleryTask[][] = Array.from({ length: rowCount }, () => []);
  tasks.forEach((task, idx) => {
    rowsTasks[idx % rowCount].push(task);
  });

  // Slightly different per-row durations so rows don't tick in lockstep.
  const baseDuration = 140;

  return (
    <div className="flex flex-col gap-3">
      {rowsTasks.map((rowTasks, rowIdx) => {
        if (rowTasks.length === 0) return null;
        const loop = [...rowTasks, ...rowTasks];
        const duration = baseDuration + rowIdx * 18;
        const reverse = rowIdx % 2 === 1;
        return (
          <Marquee
            key={rowIdx}
            duration={duration}
            reverse={reverse}
            rowClassName="flex w-max gap-3"
          >
            {loop.map((task, idx) => (
              <TaskCard key={`${task.id}-${idx}`} task={task} />
            ))}
          </Marquee>
        );
      })}
    </div>
  );
}
