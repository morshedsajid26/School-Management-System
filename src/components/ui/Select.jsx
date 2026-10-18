"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      placeholder = "Select an option",
      className = "",
      containerClassName = "",
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 cursor-pointer",
              error
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20",
              className
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children ||
              options.map((opt) => {
                const isObj = typeof opt === "object";
                const val = isObj ? opt.value : opt;
                const lbl = isObj ? opt.label : opt;
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
