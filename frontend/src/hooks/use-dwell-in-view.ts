"use client";

import { useEffect, useRef, useCallback } from "react";

const DWELL_MS = 5_000;

export type UseDwellInViewOptions = {
  /**
   * Ref to the header section (byline + title). When the card height exceeds
   * the viewport, we observe this element instead so dwell counts when the
   * header is fully visible for 5s. Caller must attach this to the header.
   */
  headerRef?: React.RefObject<HTMLElement | null>;
};

/**
 * Returns the element to observe for dwell based on card height.
 * If card overflows viewport and headerRef is provided, use header; else use card.
 */
function getObservedElement(
  card: HTMLElement | null,
  header: HTMLElement | null | undefined,
): HTMLElement | null {
  if (!card) return null;
  if (!header) return card;

  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
  const cardHeight = card.getBoundingClientRect().height;

  return cardHeight > viewportHeight ? header : card;
}

/**
 * Calls onComplete when the observed element has been fully in view for 5 seconds.
 * Requires 100% of the element visible; pauses when partially out of view or tab hidden.
 *
 * When `headerRef` is provided and the card exceeds viewport height, observes only
 * the header (byline + title) so dwell still counts for long expanded articles.
 */
export function useDwellInView(
  enabled: boolean,
  onComplete: () => void,
  options?: UseDwellInViewOptions,
) {
  const cardRef = useRef<HTMLElement | null>(null);
  const headerRefParam = options?.headerRef;
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const elapsedRef = useRef(0);
  const completedRef = useRef(false);
  const observedElRef = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  const startTimer = useCallback(
    (remaining: number) => {
      clearTimer();
      startTimeRef.current = Date.now();
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = null;
        completedRef.current = true;
        onComplete();
      }, remaining);
    },
    [clearTimer, onComplete],
  );

  const checkInViewAndResume = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !enabled || completedRef.current || document.visibilityState !== "visible")
        return;
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;
      if (inView) {
        const remaining = DWELL_MS - elapsedRef.current;
        if (remaining > 0) startTimer(remaining);
      }
    },
    [enabled, startTimer],
  );

  useEffect(() => {
    const card = cardRef.current;
    const header = headerRefParam?.current ?? null;
    const el = getObservedElement(card, header ?? undefined);

    if (!el || !enabled || completedRef.current) return;

    observedElRef.current = el;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          if (document.visibilityState === "visible") {
            const remaining = DWELL_MS - elapsedRef.current;
            if (remaining > 0) startTimer(remaining);
          }
        } else {
          if (timerIdRef.current !== null) {
            clearTimer();
            elapsedRef.current += Date.now() - startTimeRef.current;
          }
        }
      },
      { threshold: 1 },
    );

    observer.observe(el);

    const maybeSwitchObserved = () => {
      const c = cardRef.current;
      const h = headerRefParam?.current ?? null;
      const next = getObservedElement(c, h ?? undefined);
      if (next && next !== observedElRef.current) {
        clearTimer();
        elapsedRef.current = 0;
        observer.disconnect();
        observedElRef.current = next;
        observer.observe(next);
        if (document.visibilityState === "visible") checkInViewAndResume(next);
      }
    };

    const resizeObserver =
      headerRefParam && card
        ? new ResizeObserver(maybeSwitchObserved)
        : null;
    if (resizeObserver) resizeObserver.observe(card);

    const onWindowResize = headerRefParam ? maybeSwitchObserved : undefined;
    if (onWindowResize) window.addEventListener("resize", onWindowResize);

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", maybeSwitchObserved);
      clearTimer();
    };
  }, [enabled, clearTimer, startTimer, checkInViewAndResume, headerRefParam]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && timerIdRef.current !== null) {
        clearTimer();
        elapsedRef.current += Date.now() - startTimeRef.current;
      } else if (document.visibilityState === "visible") {
        checkInViewAndResume(observedElRef.current);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [enabled, clearTimer, checkInViewAndResume]);

  return cardRef;
}
