import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Returns a debounced value that updates only after `delay` ms of no changes,
 * plus a `flush` function to immediately sync the debounced value (e.g. on Enter or blur).
 * Use for search inputs: bind input to immediate state, use debounced value for filtering/API.
 * Reduces UI jitter when typing triggers data updates.
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number
): [T, () => void] {
  const [debounced, setDebounced] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setDebounced(valueRef.current);
    }, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDebounced(valueRef.current);
  }, []);

  return [debounced, flush];
}
