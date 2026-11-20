"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Tracks an element's content width with a ResizeObserver.
 * Returns a callback ref and the width (0 until the first measurement).
 */
export function useElementWidth<T extends HTMLElement>() {
  const [element, setElement] = useState<T | null>(null);
  const [width, setWidth] = useState(0);
  const ref = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return [ref, width] as const;
}
