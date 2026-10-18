import React from "react";
import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({
  title,
  value,
  description,
  trend, // { value: "+5.2%", isPositive: true, text: "vs last term" }
  icon: Icon,
  variant = "indigo", // "indigo" | "emerald" | "amber" | "blue" | "rose" | "purple"
  className = "",
}) {
  const iconThemes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs shrink-0",
              iconThemes[variant] || iconThemes.indigo
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md",
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-slate-500">
            {trend?.text || description}
          </span>
        </div>
      )}
    </div>
  );
}
