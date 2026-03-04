"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export function hexToHsl(hex: string): [number, number, number] {
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function getContrastColor(hex: string): string {
  if (!hex || typeof hex !== 'string') return "#ffffff";

  hex = hex.replace('#', '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  if (hex.length !== 6) return "#ffffff";

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#ffffff";

  let luminance = (0.299 * r + 0.587 * g + 0.114 * b);
  return luminance > 128 ? "#000000" : "#ffffff";
}

interface ColorContextType {
  color: string;
  textColor: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export function ColorProvider({ children }: { children: ReactNode }) {
  const [color, setColor] = useState<string>("");
  const [textColor, setTextColor] = useState<string>("#ffffff");

  useEffect(() => {
    const savedColor = localStorage.getItem("chatColor");
    if (savedColor) {
      setColor(savedColor);
    } else {
      setColor("#4a31b0"); //default color (purple)
    }
  }, []);

  useEffect(() => {
    if (color && typeof window !== "undefined") {
      localStorage.setItem("chatColor", color);
      setTextColor(getContrastColor(color));
      try {
        const [h, s] = hexToHsl(color);
        document.documentElement.style.setProperty("--theme-bg-base", `${h} ${s * 0.4}% 6.5%`);
        document.documentElement.style.setProperty("--theme-bg-surface", `${h} ${s * 0.3}% 4%`);
        document.documentElement.style.setProperty("--theme-bg-hover", `${h} ${s * 0.5}% 15%`);
        document.documentElement.style.setProperty("--theme-border", `${h} ${s * 0.3}% 14%`);
      } catch (e) {
        console.error("Failed to parse theme color", e);
      }
    }
  }, [color]);

  return (
    <ColorContext.Provider value={{ color, textColor, setColor }}>
      {children}
    </ColorContext.Provider>
  );
}

export function useColor() {
  const ctx = useContext(ColorContext);
  if (!ctx) {
    throw new Error("useColor must be used inside ColorProvider");
  }
  return ctx;
}
