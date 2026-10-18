import React from "react";
import { cn } from "@/utils/cn";

export default function Badge({
  children,
  variant = "slate",
  size = "md",
  dot = false,
  className = "",
  ...props
}) {
  const variants = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    rose: "bg-rose-50 text-rose-700 border-rose-200/80",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "bg-transparent text-slate-600 border-slate-300",
  };

  const dotColors = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
    outline: "bg-slate-400",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border leading-none shrink-0",
        variants[variant] || variants.slate,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColors[variant] || "bg-current"
          )}
        />
      )}
      {children}
    </span>
  );
}
