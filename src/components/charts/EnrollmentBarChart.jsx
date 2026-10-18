"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

export default function EnrollmentBarChart({
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
  const maxCapacity = 350;

  const barWidth = 36;
  const gap = (chartWidth - barWidth * data.length) / (data.length - 1 || 1);

  return (
    <div className={cn("relative w-full select-none", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 100, 200, 300].map((val) => {
          const y = paddingY + chartHeight - (val / maxCapacity) * chartHeight;
          return (
            <g key={val}>
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
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = paddingX + idx * (barWidth + gap);
          const isHovered = hoveredIdx === idx;

          const totalH = (item.count / maxCapacity) * chartHeight;
          const maleH = (item.male / maxCapacity) * chartHeight;
          const femaleH = (item.female / maxCapacity) * chartHeight;
          const capacityH = (item.capacity / maxCapacity) * chartHeight;

          const baseY = paddingY + chartHeight;
          const capY = baseY - capacityH;
          const maleY = baseY - maleH;
          const femaleY = maleY - femaleH;

          return (
            <g
              key={item.grade}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Background Capacity Pill */}
              <rect
                x={x}
                y={capY}
                width={barWidth}
                height={capacityH}
                rx="6"
                fill="#f1f5f9"
                stroke={isHovered ? "#cbd5e1" : "transparent"}
              />

              {/* Female segment (top) */}
              <rect
                x={x}
                y={femaleY}
                width={barWidth}
                height={femaleH}
                fill="#a855f7"
                opacity={isHovered ? 1 : 0.9}
                className="transition-all duration-150"
              />

              {/* Male segment (bottom) */}
              <rect
                x={x}
                y={maleY}
                width={barWidth}
                height={maleH}
                rx="0"
                fill="#3b82f6"
                opacity={isHovered ? 1 : 0.9}
                className="transition-all duration-150"
              />

              {/* Total label above bar */}
              <text
                x={x + barWidth / 2}
                y={femaleY - 6}
                fill={isHovered ? "#0f172a" : "#64748b"}
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
              >
                {item.count}
              </text>

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                fill={isHovered ? "#0f172a" : "#64748b"}
                fontSize="11"
                fontWeight={isHovered ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.grade.replace("Grade ", "Gr ")}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs text-white shadow-xl -translate-x-1/2 -translate-y-full"
          style={{
            left: `${((paddingX + hoveredIdx * (barWidth + gap) + barWidth / 2) / width) * 100}%`,
            top: "20%",
          }}
        >
          <p className="font-bold text-white mb-1">
            {data[hoveredIdx].grade}
          </p>
          <div className="space-y-0.5 text-[11px]">
            <p className="flex justify-between gap-4 text-purple-300">
              <span>Female Students:</span>
              <strong className="text-white">{data[hoveredIdx].female}</strong>
            </p>
            <p className="flex justify-between gap-4 text-blue-300">
              <span>Male Students:</span>
              <strong className="text-white">{data[hoveredIdx].male}</strong>
            </p>
            <div className="pt-1 mt-1 border-t border-slate-700 flex justify-between gap-4 text-slate-300">
              <span>Enrolled / Capacity:</span>
              <strong className="text-emerald-400">
                {data[hoveredIdx].count} / {data[hoveredIdx].capacity} (
                {Math.round((data[hoveredIdx].count / data[hoveredIdx].capacity) * 100)}%)
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-500" />
          <span>Boys</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-purple-500" />
          <span>Girls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-slate-200" />
          <span>Room Max Cap</span>
        </div>
      </div>
    </div>
  );
}
