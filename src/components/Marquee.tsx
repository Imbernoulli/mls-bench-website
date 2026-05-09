"use client";

import { ReactNode, useEffect, useRef } from "react";

interface MarqueeProps {
  children: ReactNode;
  /** Duration of one full cycle in seconds. Larger = slower. */
  duration?: number;
  /** Reverse the scroll direction (right-to-left → left-to-right). */
  reverse?: boolean;
  /** Tailwind classes for the inner flex row (e.g. gap, padding). */
  rowClassName?: string;
  /** Width of the fade mask on each side. */
  fadeWidth?: number;
}

/**
 * Infinite-loop marquee with manual swipe + drag support.
 *
 * Implementation: a native `overflow-x-auto` strip whose `scrollLeft` is
 * advanced by a requestAnimationFrame loop. The caller renders the children
 * twice; when scrollLeft passes half the total width, we wrap by subtracting
 * half-width — visually seamless because the second copy is identical.
 *
 * - **Touch / trackpad**: native horizontal scroll + momentum work for free.
 * - **Mouse drag**: a click-and-drag handler converts pointer movement into
 *   `scrollLeft` deltas (pauses the auto-loop while held).
 * - **Hover**: pauses the auto-loop so you can read a card.
 * - **prefers-reduced-motion**: auto-loop disabled, manual scroll still works.
 */
export default function Marquee({
  children,
  duration = 90,
  reverse = false,
  rowClassName = "flex w-max gap-3 px-1",
  fadeWidth = 56,
}: MarqueeProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const interactingRef = useRef(false);
  const hoverRef = useRef(false);
  /** Sub-pixel accumulator. Browsers round `scrollLeft` to integers, so a
   *  slow speed (e.g. 0.15 px/frame) would round to 0 every frame and the
   *  marquee would freeze. We accumulate float here and only commit
   *  rounded values to the DOM. */
  const posRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let lastTs: number | null = null;
    posRef.current = el.scrollLeft;

    const tick = (ts: number) => {
      const halfWidth = el.scrollWidth / 2;
      if (lastTs == null) lastTs = ts;
      const dt = ts - lastTs;
      lastTs = ts;

      if (halfWidth > 0) {
        if (interactingRef.current) {
          // User is dragging — keep accumulator in sync with the actual
          // scroll position so the auto-loop doesn't snap when released.
          posRef.current = el.scrollLeft;
        } else if (!reducedMotion && !hoverRef.current) {
          const speed = halfWidth / (duration * 1000); // px/ms
          const dir = reverse ? -1 : 1;
          posRef.current += dir * speed * dt;
        }
        // Wrap on the duplicated half so the loop is seamless.
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        else if (posRef.current < 0) posRef.current += halfWidth;
        el.scrollLeft = posRef.current;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, reverse]);

  // ── Mouse-drag handler ────────────────────────────────────────────────────
  // Tracks pointer down and translates pointer movement into scrollLeft.
  // Touch input is left to the browser's native overflow scroll.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let movedDistance = 0;

    const onDown = (e: PointerEvent) => {
      // Only react to mouse / pen primary button. Touch uses native scroll.
      if (e.pointerType === "touch") return;
      isDown = true;
      interactingRef.current = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      movedDistance = 0;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      movedDistance = Math.abs(dx);
      el.scrollLeft = startScroll - dx;
      if (movedDistance > 4) e.preventDefault();
    };
    const release = () => {
      if (!isDown) return;
      isDown = false;
      // Slight delay so a real click on a child link still fires before
      // we release the "interacting" lock and let auto-scroll resume.
      window.setTimeout(() => {
        interactingRef.current = false;
      }, 80);
      el.style.cursor = "grab";
    };
    // Suppress click after a real drag so the underlying <Link> doesn't
    // navigate when the user just wanted to swipe.
    const onClickCapture = (e: MouseEvent) => {
      if (movedDistance > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointerleave", release);
    el.addEventListener("pointercancel", release);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointerleave", release);
      el.removeEventListener("pointercancel", release);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        className="marquee-scroller overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className={rowClassName}>{children}</div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-background to-transparent"
        style={{ width: fadeWidth }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l from-background to-transparent"
        style={{ width: fadeWidth }}
      />
    </div>
  );
}
