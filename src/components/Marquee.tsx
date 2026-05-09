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
 * advanced by a requestAnimationFrame loop. Children are rendered TWICE
 * by the caller; when scrollLeft passes half the total width we wrap by
 * subtracting half-width — visually seamless because the second copy is
 * identical.
 *
 * Manual interaction must NOT fight the auto-loop. Two rules:
 *   1. Whenever the user is interacting (mouse drag, touch, wheel, keyboard
 *      arrow scroll) we hand control to the browser entirely — the RAF
 *      loop only watches scrollLeft and resyncs its float accumulator.
 *   2. The seamless-wrap correction is only applied when the user is NOT
 *      interacting; otherwise the scroll surface jitters when the wrap
 *      teleports them back across the seam mid-gesture.
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

      if (halfWidth <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (interactingRef.current) {
        // Browser owns scrollLeft during user interaction. Just track it
        // so the auto-loop resumes from where they left off — never write.
        posRef.current = el.scrollLeft;
      } else if (!reducedMotion && !hoverRef.current) {
        // Auto-loop frame: advance the float accumulator and commit it.
        const speed = halfWidth / (duration * 1000); // px/ms
        const dir = reverse ? -1 : 1;
        posRef.current += dir * speed * dt;
        // Seamless wrap (only safe when the user isn't dragging).
        if (posRef.current >= halfWidth) posRef.current -= halfWidth;
        else if (posRef.current < 0) posRef.current += halfWidth;
        el.scrollLeft = posRef.current;
      } else {
        // Hovered (paused) but not actively interacting — keep the
        // accumulator in sync with the DOM in case the user just used
        // the wheel or keyboard while parked over the strip.
        posRef.current = el.scrollLeft;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, reverse]);

  // ── User-interaction lock ────────────────────────────────────────────
  // Anything that scrolls the container manually (touch swipe, mouse
  // drag, trackpad fling, wheel, keyboard arrows, scrollbar drag) flips
  // `interactingRef` so the auto-loop steps aside until the user is
  // finished. We also suppress the in-flight click when a real drag
  // happened so the underlying <Link> doesn't fire from a swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let mouseDown = false;
    let mouseStartX = 0;
    let mouseStartScroll = 0;
    let movedDistance = 0;
    let releaseTimer = 0;

    const wakeInteract = () => {
      interactingRef.current = true;
      window.clearTimeout(releaseTimer);
    };
    const sleepInteract = (delayMs = 200) => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(() => {
        interactingRef.current = false;
      }, delayMs);
    };

    // Mouse drag: implement explicitly because pointerdown on an
    // overflow-x-auto element doesn't natively pan the content with the
    // mouse the way users expect.
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mouseDown = true;
      wakeInteract();
      mouseStartX = e.clientX;
      mouseStartScroll = el.scrollLeft;
      movedDistance = 0;
      el.style.cursor = "grabbing";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      const dx = e.clientX - mouseStartX;
      movedDistance = Math.abs(dx);
      el.scrollLeft = mouseStartScroll - dx;
      if (movedDistance > 4) e.preventDefault();
    };
    const onMouseUp = () => {
      if (!mouseDown) return;
      mouseDown = false;
      el.style.cursor = "grab";
      sleepInteract(120);
    };
    const onMouseLeaveDoc = () => {
      // Mouse exits browser/document while held — release.
      if (mouseDown) {
        mouseDown = false;
        el.style.cursor = "grab";
        sleepInteract(120);
      }
    };

    // Touch / wheel / scroll events — the browser already drives the
    // scroll position natively. We just need to know that an interaction
    // is in flight so the auto-loop doesn't overwrite scrollLeft.
    const onTouchStart = () => wakeInteract();
    const onTouchEnd = () => sleepInteract(250);
    const onWheel = () => {
      wakeInteract();
      sleepInteract(400);
    };
    const onScroll = () => {
      // Native scroll fired (any source) — refresh the interact lock so
      // the RAF tick doesn't immediately fight whatever just changed
      // scrollLeft.
      if (!mouseDown) sleepInteract(200);
    };

    // Click suppression after a real mouse drag.
    const onClickCapture = (e: MouseEvent) => {
      if (movedDistance > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.style.cursor = "grab";
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseLeaveDoc);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("click", onClickCapture, true);

    return () => {
      window.clearTimeout(releaseTimer);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseLeaveDoc);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
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
