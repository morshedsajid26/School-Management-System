"use client";

import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatusBadge from "@/components/shared/StatusBadge";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { Award, Calendar, CheckCircle2, Clock, BookOpen } from "lucide-react";

export default function StudentDashboardPage() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${currentUser?.name || "Student"}`}
        subtitle="Grade 10 • Section A • Roll No: 10-A-01 • Science Division"
        badge={<Badge variant="blue">Enrolled Student</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Cumulative GPA"
          value="3.88 / 4.0"
          description="Top 5% in Grade 10 Science"
          icon={Award}
          variant="indigo"
        />
        <StatsCard
          title="Attendance Rate"
          value="98.2%"
          description="46 of 47 days attended this term"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatsCard
          title="Term 2 Tuition Status"
          value="Settled"
          description="Receipt #TXN-8821 verified"
          icon={Calendar}
          variant="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Class Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Period 1: Advanced Physics</p>
                <p className="text-slate-500">Prof. Marcus Aurel • Room 201</p>
              </div>
              <span className="font-mono font-semibold text-slate-700">08:30 - 09:30</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Period 2: Pure Mathematics</p>
                <p className="text-slate-500">Dr. Catherine Bennett • Room 201</p>
              </div>
              <span className="font-mono font-semibold text-slate-700">09:45 - 10:45</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Period 3: Robotics & Coding</p>
                <p className="text-slate-500">David K. Reynolds • Tech Lab</p>
              </div>
              <span className="font-mono font-semibold text-slate-700">11:00 - 12:00</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Graded Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Midterm Calculus Quiz</p>
                <p className="text-slate-500">Mathematics • March 12</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">96 / 100 (A+)</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Thermodynamics Lab Report</p>
                <p className="text-slate-500">Physics • March 08</p>
              </div>
              <span className="text-sm font-bold text-emerald-600">92 / 100 (A)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
