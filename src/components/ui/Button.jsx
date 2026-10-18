"use client";

import React from "react";
import { cn } from "@/utils/cn";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-600/20",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 border border-slate-200",
    outline:
      "bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-600/20",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm shadow-emerald-600/20",
    dark:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 shadow-sm",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5",
    md: "text-sm px-4 py-2 rounded-lg gap-2",
    lg: "text-base px-5 py-2.5 rounded-xl gap-2.5",
    icon: "p-2 rounded-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      )}
      {children}
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className={cn("shrink-0", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      )}
    </button>
  );
}
