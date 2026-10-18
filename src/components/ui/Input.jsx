"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = "left",
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          {Icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50",
              Icon && iconPosition === "left" ? "pl-10" : "pl-3.5",
              Icon && iconPosition === "right" ? "pr-10" : "pr-3.5",
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20",
              className
            )}
            {...props}
          />
          {Icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
