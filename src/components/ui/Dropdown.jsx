"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

export default function Dropdown({
  trigger,
  children,
  align = "right", // "left" | "right"
  width = "w-56",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 rounded-2xl bg-white shadow-xl border border-slate-200/80 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0",
            width,
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  icon: Icon,
  onClick,
  variant = "default", // "default" | "danger" | "success"
  className = "",
  badge,
}) {
  const variants = {
    default: "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
    danger: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
    success: "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between gap-2.5 transition duration-150 rounded-lg mx-auto select-none",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-current" />}
        <span className="truncate">{children}</span>
      </div>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
}

export function DropdownHeader({ children, className = "" }) {
  return (
    <div className={cn("px-3.5 py-2 border-b border-slate-100 mb-1", className)}>
      {children}
    </div>
  );
}

export function DropdownDivider({ className = "" }) {
  return <div className={cn("my-1 border-t border-slate-100", className)} />;
}
