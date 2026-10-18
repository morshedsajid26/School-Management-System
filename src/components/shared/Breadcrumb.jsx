"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/utils/cn";

// Mapping custom pathname slugs to human-friendly titles
const ROUTE_LABELS = {
  admin: "Admin",
  academics: "Academics",
  "academic-years": "Academic Years & Terms",
  calendar: "School Calendar",
  classes: "Classes & Rooms",
  sections: "Section Management",
  subjects: "Subject Management",
  people: "People",
  students: "Students",
  teachers: "Teachers & Staff",
  staff: "Non-Teaching Staff",
  attendance: "Attendance",
  examinations: "Examinations",
  finance: "Finance & Fees",
  communication: "Communication",
  resources: "Resources",
  hr: "Human Resources",
  reports: "Reports & Analytics",
  settings: "School Settings",
  teacher: "Teacher Portal",
  student: "Student Portal",
  accountant: "Accountant Portal",
  login: "Sign In",
};

export default function Breadcrumb({ items, className = "" }) {
  const pathname = usePathname();

  // If items are not passed, generate them from pathname
  const breadcrumbItems = items || (() => {
    if (!pathname || pathname === "/") return [];

    const segments = pathname.split("/").filter(Boolean);
    let accumulatedPath = "";

    return segments.map((seg, index) => {
      accumulatedPath += `/${seg}`;
      const isLast = index === segments.length - 1;
      const label = ROUTE_LABELS[seg.toLowerCase()] || seg.charAt(0).toUpperCase() + seg.slice(1);

      return {
        label,
        href: isLast ? null : accumulatedPath,
        isCurrent: isLast,
      };
    });
  })();

  if (!breadcrumbItems.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            href="/admin"
            className="flex items-center text-slate-400 hover:text-slate-700 transition"
            title="Admin Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>

        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
            {item.href && !item.isCurrent ? (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-slate-800 font-medium transition"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
