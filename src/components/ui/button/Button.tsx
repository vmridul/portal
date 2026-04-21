import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useColor } from "@/contexts/colorContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center outline-none rounded-xl font-regular transition-all duration-200 ease-in-out focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "hover:text-white/80",
        secondary:
          "border border-theme-border hover:bg-theme-border hover:text-white/90 text-white",
        other:
          "bg-theme-border hover:bg-theme-hover text-white hover:text-white/90",
        destructive: "bg-[#ae4447] hover:bg-[#ae4447]/80 text-white",
        ghost: "hover:bg-theme-border text-white",
      },
      size: {
        sm: "py-1 px-3 text-sm",
        md: "py-2 px-4 text-sm",
        lg: "py-2 px-6 text-base",
        iconSm: "p-1.5 text-sm",
        iconMd: "p-2 text-base",
        iconLg: "p-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, style, ...props },
    ref,
  ) => {
    const { color, textColor } = useColor();

    const variantStyle =
      variant === "primary"
        ? { backgroundColor: color, color: textColor }
        : undefined;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        style={{ ...variantStyle, ...style }}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Loading..." : children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
