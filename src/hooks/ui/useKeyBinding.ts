import { useEffect } from "react";

type KeyHandler = (event: KeyboardEvent) => void;
type KeyConfig = Record<string, KeyHandler>;

/**
 * Hook to manage global key bindings
 */
export function useKeyBinding(config: KeyConfig, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = config[event.key];
      if (handler) {
        handler(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [config, enabled]);
}
