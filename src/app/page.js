"use client";

import React from "react";
import Link from "next/link";
import { schoolInfo } from "@/data/mock/school";
import { useAuth } from "@/context/AuthContext";
import { ROLES, ROLE_LABELS } from "@/utils/constants";
import {
  School,
  ShieldCheck,
  GraduationCap,
  Users2,
  BadgeDollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const { switchRole } = useAuth();

  const portals = [
    {
      role: ROLES.ADMIN,
      title: "Admin Dashboard",
      subtitle: "Complete institutional governance & metrics",
      description: "Manage students, faculty, classes, fee collections, attendance, and system settings.",
      href: "/admin",
      icon: ShieldCheck,
      color: "from-indigo-600 to-indigo-700",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
      stats: "1,420 Students • 86 Staff",
    },
    {
      role: ROLES.TEACHER,
      title: "Teacher Portal",
      subtitle: "Academic workflows & gradebooks",
      description: "Take daily class attendance, enter semester grades, manage assignments, and timetables.",
      href: "/teacher",
      icon: Users2,
      color: "from-emerald-600 to-emerald-700",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
      stats: "My Classes & Rosters",
    },
    {
      role: ROLES.STUDENT,
      title: "Student Portal",
      subtitle: "Personal learning center",
      description: "View class schedules, homework assignments, exam report cards, and fee payment receipts.",
      href: "/student",
      icon: GraduationCap,
      color: "from-blue-600 to-blue-700",
      accent: "text-blue-600 bg-blue-50 border-blue-200",
      stats: "Grades & Timetable",
    },
    {
      role: ROLES.ACCOUNTANT,
      title: "Accountant Portal",
      subtitle: "Bursary & ledger management",
      description: "Track tuition fees, generate student invoices, monitor overdue dues, and manage institutional expenses.",
      href: "/accountant",
      icon: BadgeDollarSign,
      color: "from-amber-600 to-amber-700",
      accent: "text-amber-600 bg-amber-50 border-amber-200",
      stats: "Fee Collections & Invoices",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <School className="h-6 w-6" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                {schoolInfo.name}
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                {schoolInfo.code} • Established {schoolInfo.established}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition duration-150"
            >
              Sign In
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/30 transition duration-150"
            >
              Launch Admin Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation School Management System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
          Unified Academic & Administrative Operations
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A high-performance, modular frontend architecture designed for modern school administration. Select any persona below to preview live role-specific features.
        </p>

        {/* Quick Stats Banner */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-2xl font-bold text-slate-900">1,420</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Enrolled Students</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-2xl font-bold text-slate-900">86</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Faculty Members</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-2xl font-bold text-indigo-600">95.4%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Daily Attendance</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <p className="text-2xl font-bold text-emerald-600">91.2%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Fee Clearance</p>
          </div>
        </div>
      </section>

      {/* Role Selection Portals Grid */}
      <section className="px-6 py-10 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Select a Persona to Enter
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Instant access without credentials — explore customized dashboard views.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.role}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center border ${portal.accent}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 font-mono uppercase">
                      {ROLE_LABELS[portal.role].split(" ")[0]}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {portal.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {portal.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {portal.stats}
                  </span>
                  <Link
                    href={portal.href}
                    onClick={() => switchRole(portal.role)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-all"
                  >
                    Enter <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-6 text-center text-xs text-slate-500">
        <p>
          {schoolInfo.name} • {schoolInfo.address} • Academic Year {schoolInfo.currentAcademicYear}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          Frontend Prototype Built with Next.js App Router, JavaScript (JSX), and Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
