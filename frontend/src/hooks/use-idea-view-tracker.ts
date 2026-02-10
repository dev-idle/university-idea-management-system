"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRecordViewMutation } from "./use-ideas";

/* ── Constants ──────────────────────────────────────────────────────────────── */

const DWELL_MS = 10_000; // 10-second dwell before timer path fires
const SESSION_WINDOW_MS = 20 * 60 * 1000; // 20-minute cooldown between session views
const STORAGE_KEY = "idea-view-timestamps"; // localStorage key

/* ── localStorage helpers ───────────────────────────────────────────────────── */

/** Read the { ideaId → timestamp } map from localStorage (with auto-cleanup). */
function getTimestamps(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const map: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    let dirty = false;
    // Prune entries older than 20 minutes to keep storage lean
    for (const id of Object.keys(map)) {
      if (now - map[id] > SESSION_WINDOW_MS) {
        delete map[id];
        dirty = true;
      }
    }
    if (dirty) localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return map;
  } catch {
    return {};
  }
}

/** Write a new timestamp for a given idea. */
function setTimestamp(ideaId: string): void {
  try {
    const map = getTimestamps();
    map[ideaId] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* localStorage unavailable — graceful degradation */
  }
}

/** Check whether the idea is still inside the 20-minute cooldown window. */
function isInCooldown(ideaId: string): boolean {
  const ts = getTimestamps()[ideaId];
  if (!ts) return false;
  return Date.now() - ts < SESSION_WINDOW_MS;
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

/**
 * Tracks idea views with two paths and a 20-minute session window.
 *
 * **Timer path (dwell 10 s):**
 * When `activeIdeaId` is set (expanded card in Hub or detail page) and the
 * user stays for 10 visible seconds, a view is recorded.
 *
 * **Action path (vote / comment):**
 * `markViewedByAction(ideaId)` records a view immediately — proving the user
 * has engaged. Unlike does NOT remove the view.
 *
 * **Mutual exclusion:** Whichever path fires first for an idea disables the
 * other for the remainder of the 20-minute session window.
 *
 * **20-minute session window (anti-spam):**
 * After a view is recorded, no new views can be recorded for that idea for 20
 * minutes. This persists across page refreshes, tab close/reopen, and route
 * changes via localStorage. The backend also enforces the same window
 * (zero-trust).
 *
 * **Visibility:** The dwell timer pauses when the tab is hidden and resumes
 * when the tab becomes visible again.
 */
export function useIdeaViewTracker(activeIdeaId: string | null) {
  const recordView = useRecordViewMutation();

  // In-memory guard for the current page load — avoids redundant localStorage
  // reads / API calls within a single render cycle.
  const recordedThisLoad = useRef(new Set<string>());

  // Timer refs
  const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const activeIdRef = useRef<string | null>(null);

  /* ── helpers ────────────────────────────────────────────────────────────── */

  const clearTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  /** Central record function — checks both in-memory and localStorage. */
  const record = useCallback(
    (ideaId: string) => {
      if (recordedThisLoad.current.has(ideaId)) return;
      if (isInCooldown(ideaId)) {
        // Already within a 20-min window — mark in-memory to skip future checks
        recordedThisLoad.current.add(ideaId);
        return;
      }
      recordedThisLoad.current.add(ideaId);
      setTimestamp(ideaId);
      recordView.mutate(ideaId);
    },
    [recordView],
  );

  /* ── timer path ─────────────────────────────────────────────────────────── */

  const startTimer = useCallback(
    (remaining: number) => {
      clearTimer();
      startTimeRef.current = Date.now();
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = null;
        const id = activeIdRef.current;
        if (id) record(id);
      }, remaining);
    },
    [clearTimer, record],
  );

  const pauseTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimer();
      elapsedRef.current += Date.now() - startTimeRef.current;
    }
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    const id = activeIdRef.current;
    if (!id || recordedThisLoad.current.has(id) || isInCooldown(id)) return;
    const remaining = DWELL_MS - elapsedRef.current;
    if (remaining <= 0) {
      record(id);
    } else {
      startTimer(remaining);
    }
  }, [record, startTimer]);

  /* ── visibilitychange ───────────────────────────────────────────────────── */

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pauseTimer();
      } else {
        resumeTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pauseTimer, resumeTimer]);

  /* ── react to activeIdeaId changes ──────────────────────────────────────── */

  useEffect(() => {
    clearTimer();
    elapsedRef.current = 0;
    activeIdRef.current = activeIdeaId;

    if (
      !activeIdeaId ||
      recordedThisLoad.current.has(activeIdeaId) ||
      isInCooldown(activeIdeaId)
    ) {
      // Already in cooldown — add to in-memory set so we skip future checks
      if (activeIdeaId && isInCooldown(activeIdeaId)) {
        recordedThisLoad.current.add(activeIdeaId);
      }
      return;
    }

    // Start 10 s dwell timer only when the tab is visible
    if (document.visibilityState === "visible") {
      startTimer(DWELL_MS);
    }

    return () => {
      clearTimer();
      elapsedRef.current = 0;
    };
  }, [activeIdeaId, clearTimer, startTimer]);

  /* ── action path (vote / comment) ───────────────────────────────────────── */

  const markViewedByAction = useCallback(
    (ideaId: string) => {
      // record() already handles in-memory + cooldown checks
      record(ideaId);

      // If this action is for the currently-timed idea, cancel the dwell timer
      if (ideaId === activeIdRef.current) {
        clearTimer();
        elapsedRef.current = 0;
      }
    },
    [record, clearTimer],
  );

  return { markViewedByAction };
}
