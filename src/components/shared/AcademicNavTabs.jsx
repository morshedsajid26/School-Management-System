"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { School, DoorOpen, BookOpen, UserCheck, CalendarDays } from "lucide-react";

export default function AcademicNavTabs({ className = "" }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Class Management", href: "/admin/classes", icon: School },
    { label: "Section Management", href: "/admin/sections", icon: DoorOpen },
    { label: "Subject Management", href: "/admin/subjects", icon: BookOpen },
    { label: "Teacher Assignments", href: "/admin/assignments", icon: UserCheck },
    { label: "Class Routine & Timetable", href: "/admin/timetable", icon: CalendarDays },
    { label: "Homework & Tasks", href: "/admin/homework", icon: BookOpen },
  ];

  return (
    <div className={`flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto mb-6 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

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
