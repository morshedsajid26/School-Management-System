"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";

export default function FeeCollectionChart({
  data = [],
  height = 240,
  className = "",
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Find max value for scaling
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.collected || 0, d.target || 0)),
    1000
  ) * 1.15;

  const barGroupWidth = chartWidth / data.length;
  const barWidth = Math.min(22, (barGroupWidth - 16) / 2);

  return (
    <div className={cn("relative w-full select-none", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const val = maxVal * ratio;
          const y = paddingY + chartHeight - ratio * chartHeight;
          const label = val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${Math.round(val / 1000)}k`;

          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={paddingX - 10}
                y={y + 3}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
              >
                ${label}
              </text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {data.map((item, idx) => {
          const groupCenterX = paddingX + idx * barGroupWidth + barGroupWidth / 2;
          const isHovered = hoveredIdx === idx;

          const collectedH = ((item.collected || 0) / maxVal) * chartHeight;
          const targetH = ((item.target || 0) / maxVal) * chartHeight;

          const collectedY = paddingY + chartHeight - collectedH;
          const targetY = paddingY + chartHeight - targetH;

          return (
            <g
              key={item.label}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Target Bar (Left in group) */}
              <rect
                x={groupCenterX - barWidth - 2}
                y={targetY}
                width={barWidth}
                height={targetH}
                rx="4"
                fill="#cbd5e1"
                opacity={isHovered ? 1 : 0.8}
                className="transition-all duration-150"
              />

              {/* Collected Bar (Right in group) */}
              <rect
                x={groupCenterX + 2}
                y={collectedY}
                width={barWidth}
                height={collectedH}
                rx="4"
                fill="#10b981"
                opacity={isHovered ? 1 : 0.9}
                className="transition-all duration-150"
              />

              {/* X Axis Label */}
              <text
                x={groupCenterX}
                y={height - 10}
                fill={isHovered ? "#0f172a" : "#64748b"}
                fontSize="11"
                fontWeight={isHovered ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl bg-slate-900 px-3.5 py-2 text-xs text-white shadow-xl -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((paddingX + hoveredIdx * barGroupWidth + barGroupWidth / 2) / width) * 100}%`,
            top: "15%",
          }}
        >
          <p className="font-bold text-white mb-1">
            {data[hoveredIdx].label}
          </p>
          <div className="space-y-0.5 text-[11px]">
            <p className="flex justify-between gap-4 text-emerald-300">
              <span>Collected:</span>
              <strong className="text-white">{formatCurrency(data[hoveredIdx].collected)}</strong>
            </p>
            <p className="flex justify-between gap-4 text-slate-300">
              <span>Target:</span>
              <strong className="text-white">{formatCurrency(data[hoveredIdx].target)}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" />
          <span>Collected Fees</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-slate-300" />
          <span>Budget Target</span>
        </div>
      </div>
    </div>
  );
}
