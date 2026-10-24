"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, CalendarCheck, BarChart3 } from "lucide-react";

export default function AttendanceNavTabs({ className = "" }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Batch-wise Student Attendance", href: "/admin/attendance", icon: CalendarCheck, exact: true },
    { label: "Monthly Reports & Analytics", href: "/admin/attendance/reports", icon: BarChart3, exact: false },
    { label: "Faculty Attendance (Auto-Tracked)", href: "/admin/attendance/teachers", icon: Users, exact: false },
  ];

  return (
    <div className={`flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto mb-6 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              isActive
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
