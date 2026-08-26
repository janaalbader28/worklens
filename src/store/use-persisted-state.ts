"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * useState backed by localStorage, safe for SSR/hydration.
 *
 * The naive version of this (a hydrate-on-mount effect plus a separate
 * write-on-change effect) has a real race: on the very first mount, BOTH
 * effects fire in the same pass. The write effect still closes over the
 * pre-hydration value (the hydrate effect's setState hasn't re-rendered yet),
 * so it immediately overwrites whatever the hydrate effect just read back
 * with the initial default — silently discarding anything persisted from a
 * previous session. Gating the write effect on a `hydrated` flag (itself
 * state, so it lands in the same batched re-render as the hydrated value)
 * fixes it: the write effect only ever sees post-hydration values.
 */
export function usePersistedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see doc comment above
      if (raw) setValue(JSON.parse(raw));
    } catch {
      // Ignore malformed/unavailable storage — fall back to the initial value.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable (private browsing, quota) — edits still work in-session.
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
