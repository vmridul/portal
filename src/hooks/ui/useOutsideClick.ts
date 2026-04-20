import { useEffect, RefObject } from "react";

/**
 * Hook that alerts when clicks happen outside of the passed ref(s)
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const refs = Array.isArray(ref) ? ref : [ref];
      
      // Do nothing if clicking ref's element or descendent elements
      const isInside = refs.some((r) => r.current && r.current.contains(event.target as Node));
      
      if (isInside) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}
