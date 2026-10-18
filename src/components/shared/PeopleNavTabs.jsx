"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserPlus, GraduationCap, Briefcase } from "lucide-react";

export default function PeopleNavTabs({ className = "" }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Students Directory", href: "/admin/students", icon: Users, exact: true },
    { label: "New Student Admission", href: "/admin/students/admission", icon: UserPlus },
    { label: "Faculty & Teachers", href: "/admin/teachers", icon: GraduationCap },
    { label: "Administrative & Staff", href: "/admin/staff", icon: Briefcase },
  ];

  return (
    <div className={`flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto mb-6 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          (!tab.exact && pathname.startsWith(tab.href)) ||
          (tab.exact && (pathname === tab.href || (pathname.startsWith("/admin/students/") && pathname !== "/admin/students/admission")));

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
