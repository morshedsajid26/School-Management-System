"use client";

import React from "react";
import Link from "next/link";
import { schoolInfo } from "@/data/mock/school";
import {
  School,
  CalendarCheck,
  BarChart3,
  Users2,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Faculty Course Roll Call",
      subtitle: "Period-by-period class attendance",
      description: "Assigned teachers take student attendance for their specific course sessions (e.g. Physics, Math) with 1-click status toggles and arrival timestamps.",
      href: "/teacher/attendance",
      icon: CalendarCheck,
      color: "from-indigo-600 to-indigo-700",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
      badge: "Teacher Portal",
    },
    {
      title: "Teacher Course Assignment",
      subtitle: "Admin faculty allocation",
      description: "Admin assigns teachers to specific classes, sections, and courses (e.g. Marcus Aurel -> Grade 10-A Physics) with weekly lecture load and room tracking.",
      href: "/admin/assignments",
      icon: Users2,
      color: "from-purple-600 to-purple-700",
      accent: "text-purple-600 bg-purple-50 border-purple-200",
      badge: "Admin Allocation",
    },
    {
      title: "Monthly Register Sheets",
      subtitle: "31-day attendance matrix",
      description: "Interactive visual matrix sheet showing all days of the month, student-by-student attendance percentages, chronic absentee filters, and CSV export.",
      href: "/admin/attendance/reports",
      icon: FileSpreadsheet,
      color: "from-emerald-600 to-emerald-700",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
      badge: "Excel / CSV Export",
    },
    {
      title: "Attendance Command Center",
      subtitle: "Live institutional metrics",
      description: "Monitor real-time school-wide attendance rates (95.4%), grade-by-grade performance, submission progress by homeroom teachers, and absentee tracking.",
      href: "/admin",
      icon: BarChart3,
      color: "from-blue-600 to-blue-700",
      accent: "text-blue-600 bg-blue-50 border-blue-200",
      badge: "Real-Time Analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                {schoolInfo.name}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Attendance Management System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition duration-150"
            >
              Take Attendance
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition duration-150"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Focused & Simplified Attendance Management</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Smart School <span className="text-indigo-600">Attendance System</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Record daily student roll calls, view comprehensive 31-day monthly attendance matrix sheets, monitor chronic absentees, and export reports in seconds.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/25 hover:bg-indigo-700 transition"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Take Today&apos;s Attendance</span>
            </Link>
            <Link
              href="/admin/attendance/reports"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50 transition shadow-2xs"
            >
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>Monthly Attendance Reports</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative flex flex-col justify-between bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-md">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${item.color} text-white shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                  <span>Open Module</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-400">
        <p>
          © 2026 {schoolInfo.name} • Attendance Management System • Academic Term: {schoolInfo.currentTerm}
        </p>
      </footer>
    </div>
  );
}
