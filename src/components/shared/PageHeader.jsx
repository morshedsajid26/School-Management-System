import React from "react";
import { cn } from "@/utils/cn";

export default function PageHeader({
  title,
  subtitle,
  actions,
  badge,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 mb-6",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
