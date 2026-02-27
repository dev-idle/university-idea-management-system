"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { useRecordViewMutation } from "./use-ideas";

/* ── Constants ──────────────────────────────────────────────────────────────── */

const DWELL_MS = 5_000; // 5-second dwell before timer path fires
const SESSION_WINDOW_MS = 20 * 60 * 1000; // 20-minute cooldown between session views
const STORAGE_KEY_PREFIX = "idea-view-ts"; // localStorage key prefix (scoped by userId)

/* ── localStorage helpers ───────────────────────────────────────────────────── */

function storageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

/** Read the { ideaId → timestamp } map from localStorage (with auto-cleanup). Scoped per user. */
function getTimestamps(userId: string | null): Record<string, number> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    const map: Record<string, number> = JSON.parse(raw);
    const now = Date.now();
    let dirty = false;
    for (const id of Object.keys(map)) {
      if (now - map[id] > SESSION_WINDOW_MS) {
        delete map[id];
        dirty = true;
      }
    }
    if (dirty) localStorage.setItem(storageKey(userId), JSON.stringify(map));
    return map;
  } catch {
    return {};
  }
}

/** Write a new timestamp for a given idea. */
function setTimestamp(ideaId: string, userId: string | null): void {
  try {
    const map = getTimestamps(userId);
    map[ideaId] = Date.now();
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
    /* localStorage unavailable — graceful degradation */
  }
}

/** Check whether the idea is still inside the 20-minute cooldown window. */
function isInCooldown(ideaId: string, userId: string | null): boolean {
  const ts = getTimestamps(userId)[ideaId];
  if (!ts) return false;
  return Date.now() - ts < SESSION_WINDOW_MS;
}

/* ── Hook ───────────────────────────────────────────────────────────────────── */

/**
 * Tracks idea views with two paths and a 20-minute session window.
 * Only records when the idea's cycle is ACTIVE — closed-cycle views are not counted.
 *
 * **Timer path (dwell 5 s):**
 * When `activeIdeaId` is set (expanded card in Hub or detail page) and the
 * user stays for 5 visible seconds, a view is recorded (if cycle ACTIVE).
 *
 * **Action path (vote / comment):**
 * `markViewedByAction(ideaId, cycleStatus)` records a view immediately — proving the user
 * has engaged. Skips when cycleStatus !== "ACTIVE".
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
export function useIdeaViewTracker(
  activeIdeaId: string | null,
  activeCycleStatus: string | null | undefined = undefined,
  skipRecording = false,
) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
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

  /** Central record function — checks cycle, in-memory, and localStorage. */
  const record = useCallback(
    (ideaId: string, cycleStatus?: string | null) => {
      if (skipRecording) return;
      if (cycleStatus !== "ACTIVE") return;
      if (recordedThisLoad.current.has(ideaId)) return;
      if (isInCooldown(ideaId, userId)) {
        recordedThisLoad.current.add(ideaId);
        return;
      }
      recordedThisLoad.current.add(ideaId);
      setTimestamp(ideaId, userId);
      recordView.mutate(ideaId);
    },
    [recordView, userId, skipRecording],
  );

  /* ── timer path ─────────────────────────────────────────────────────────── */

  const startTimer = useCallback(
    (remaining: number) => {
      clearTimer();
      startTimeRef.current = Date.now();
      timerIdRef.current = setTimeout(() => {
        timerIdRef.current = null;
        const id = activeIdRef.current;
        if (id) record(id, activeCycleStatus);
      }, remaining);
    },
    [clearTimer, record, activeCycleStatus],
  );

  const pauseTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearTimer();
      elapsedRef.current += Date.now() - startTimeRef.current;
    }
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    const id = activeIdRef.current;
    if (!id || recordedThisLoad.current.has(id) || isInCooldown(id, userId)) return;
    const remaining = DWELL_MS - elapsedRef.current;
    if (remaining <= 0) {
      record(id, activeCycleStatus);
    } else {
      startTimer(remaining);
    }
  }, [record, startTimer, userId, activeCycleStatus]);

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
  }, [pauseTimer, resumeTimer, userId]);

  /* ── react to activeIdeaId changes ──────────────────────────────────────── */

  useEffect(() => {
    clearTimer();
    elapsedRef.current = 0;
    activeIdRef.current = activeIdeaId;

    if (
      !activeIdeaId ||
      activeCycleStatus !== "ACTIVE" ||
      recordedThisLoad.current.has(activeIdeaId) ||
      isInCooldown(activeIdeaId, userId)
    ) {
      if (activeIdeaId && isInCooldown(activeIdeaId, userId)) {
        recordedThisLoad.current.add(activeIdeaId);
      }
      return;
    }

    if (document.visibilityState === "visible") {
      startTimer(DWELL_MS);
    }

    return () => {
      clearTimer();
      elapsedRef.current = 0;
    };
  }, [activeIdeaId, activeCycleStatus, userId, clearTimer, startTimer]);

  /* ── action path (vote / comment) ───────────────────────────────────────── */

  const markViewedByAction = useCallback(
    (ideaId: string, cycleStatus?: string | null) => {
      record(ideaId, cycleStatus);

      if (ideaId === activeIdRef.current) {
        clearTimer();
        elapsedRef.current = 0;
      }
    },
    [record, clearTimer],
  );

  return { markViewedByAction };
}
