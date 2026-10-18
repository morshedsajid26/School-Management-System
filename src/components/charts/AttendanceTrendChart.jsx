"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";

export default function AttendanceTrendChart({
  data = [],
  height = 240,
  className = "",
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-slate-400">
        No attendance data available for this range
      </div>
    );
  }

  // Min and max bounds for percentage
  const minVal = 90;
  const maxVal = 100;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.rate - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, ...d };
  });

  // Calculate target reference line y coordinate
  const targetY = paddingY + chartHeight - ((94 - minVal) / (maxVal - minVal)) * chartHeight;

  // Generate SVG path command with smooth bezier curves
  const linePath = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, "");

  // Area path closing at bottom
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className={cn("relative w-full select-none", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[92, 94, 96, 98, 100].map((val) => {
          const y = paddingY + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
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
                fontFamily="sans-serif"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Benchmark target line */}
        <line
          x1={paddingX}
          y1={targetY}
          x2={width - paddingX}
          y2={targetY}
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Gradient Area Fill */}
        <path d={areaPath} fill="url(#attendanceGradient)" />

        {/* Line Stroke */}
        <path
          d={linePath}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & hover detection */}
        {points.map((p, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />
              {/* Invisible larger hit target for easy mouse hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X Axis Label */}
              <text
                x={p.x}
                y={height - 10}
                fill={isHovered ? "#0f172a" : "#64748b"}
                fontWeight={isHovered ? "bold" : "normal"}
                fontSize="11"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip on Hover */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-20 pointer-events-none rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 6}%`,
          }}
        >
          <p className="font-semibold text-slate-200">
            {points[hoveredIndex].label}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <span className="font-bold text-white">
              {points[hoveredIndex].rate}% attendance
            </span>
          </div>
          <p className="text-[10px] text-amber-300 mt-0.5">
            Target: 94.0% (+{(points[hoveredIndex].rate - 94.0).toFixed(1)}%)
          </p>
        </div>
      )}

      {/* Chart Legend */}
      <div className="flex items-center justify-end gap-5 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded-full bg-indigo-600" />
          <span>Actual Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 bg-amber-500 border-dashed" />
          <span>School Target (94%)</span>
        </div>
      </div>
    </div>
  );
}
