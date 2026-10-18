import React from "react";
import { cn } from "@/utils/cn";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-200/80 shadow-xs transition-all duration-200",
        hover && "hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={cn("px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold text-slate-900 tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={cn("text-xs text-slate-500 mt-0.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={cn("px-6 py-4 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
