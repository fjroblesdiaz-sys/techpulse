import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-500":
              variant === "primary",
            "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500":
              variant === "secondary",
            "border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 focus:ring-slate-500":
              variant === "outline",
            "text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:ring-slate-500":
              variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500":
              variant === "danger",
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
