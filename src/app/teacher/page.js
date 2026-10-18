"use client";

import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, ClipboardCheck, Award, Clock, ArrowRight } from "lucide-react";

export default function TeacherDashboardPage() {
  const { currentUser } = useAuth();

  const myClasses = [
    { name: "Grade 10-A", subject: "Physics", time: "08:30 AM - 09:30 AM", room: "Hall 201", status: "Completed" },
    { name: "Grade 10-B", subject: "Physics", time: "10:00 AM - 11:00 AM", room: "Hall 202", status: "Next Up" },
    { name: "Grade 9-A", subject: "General Science", time: "01:15 PM - 02:15 PM", room: "Lab 3", status: "Upcoming" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Faculty Portal: ${currentUser?.name || "Teacher"}`}
        subtitle="Manage daily periods, record attendance, and evaluate term assessments."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={ClipboardCheck}
            onClick={() => alert("Quick attendance marker launched for Grade 10-B.")}
          >
            Mark Period Attendance
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Assigned Classes"
          value="3 Sections"
          description="98 total students under supervision"
          icon={BookOpen}
          variant="emerald"
        />
        <StatsCard
          title="Periods Today"
          value="3 Lessons"
          description="1 completed • 2 remaining"
          icon={Clock}
          variant="indigo"
        />
        <StatsCard
          title="Assignments to Grade"
          value="14 Pending"
          description="Term 2 Midterm Lab Reports"
          icon={Award}
          variant="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today&apos;s Class Schedule</CardTitle>
              <CardDescription>Timetable for Wednesday, March 18</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {myClasses.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/90 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                    <Badge variant={item.status === "Next Up" ? "indigo" : item.status === "Completed" ? "emerald" : "slate"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.subject} • {item.room}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Student Inquiries & Submissions</CardTitle>
              <CardDescription>Submissions waiting for evaluation</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Liam Alexander Chen</span>
                <span className="text-indigo-600">Grade 10-A</span>
              </div>
              <p className="text-slate-500">Submitted Physics Term Project: &quot;Kinetic Energy Models&quot;</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Sophia Isabella Rodriguez</span>
                <span className="text-indigo-600">Grade 10-A</span>
              </div>
              <p className="text-slate-500">Submitted Homework: Chapter 4 Wave Mechanics</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
