import { useEffect } from "react";

/**
 * Hook to handle mobile keyboard offset by listening to VisualViewport resize
 */
export function useKeyboardOffset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const offset = window.innerHeight - vv.height;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--keyboard-offset",
          `${Math.max(0, offset)}px`
        );
      });
    };

    vv.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      vv.removeEventListener("resize", handleResize);
    };
  }, []);
}
