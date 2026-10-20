"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { mockAssignmentsList } from "@/data/mock/assignments";
import { mockTeachers } from "@/data/mock/teachers";
import {
  BookOpen,
  ClipboardCheck,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
  School,
  Sparkles,
  Users2,
} from "lucide-react";

export default function TeacherDashboardPage() {
  const { currentUser } = useAuth();

  // Allow switching teacher view for preview
  const [selectedTeacherId, setSelectedTeacherId] = useState("TCH-001");
  const activeTeacher = useMemo(() => {
    return mockTeachers.find((t) => t.id === selectedTeacherId) || mockTeachers[0];
  }, [selectedTeacherId]);

  // Assigned courses for this teacher
  const assignedCourses = useMemo(() => {
    return mockAssignmentsList.filter((a) => a.teacherId === selectedTeacherId);
  }, [selectedTeacherId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={`Faculty Portal: ${activeTeacher.name}`}
        subtitle={`Department: ${activeTeacher.department} • Manage assigned course sessions and record student attendance`}
        actions={
          <div className="flex items-center gap-2.5">
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs focus:ring-2 focus:ring-indigo-500"
            >
              {mockTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>

            <Link href="/teacher/attendance">
              <Button variant="primary" size="sm" leftIcon={<ClipboardCheck className="h-4 w-4" />}>
                Take Course Attendance
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Assigned Courses & Classes"
          value={`${assignedCourses.length} Classes`}
          change="Assigned by Academic Administration"
          changeType="neutral"
          icon={BookOpen}
          color="indigo"
        />
        <StatsCard
          title="Weekly Teaching Load"
          value={`${assignedCourses.reduce((acc, c) => acc + (Number(c.periodsPerWeek) || 0), 0)} Periods`}
          change="Scheduled lecture hours"
          changeType="positive"
          icon={Clock}
          color="emerald"
        />
        <StatsCard
          title="Today's Attendance Status"
          value="1 / 2 Taken"
          change="1 course pending roll call"
          changeType="neutral"
          icon={CalendarCheck}
          color="amber"
        />
      </div>

      {/* Assigned Courses Section with Take Attendance Action */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              My Assigned Teaching Courses
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Courses assigned to you by Admin. Click &quot;Take Attendance&quot; to mark student presence.
            </CardDescription>
          </div>

          <Link href="/admin/assignments">
            <Button variant="ghost" size="xs" className="text-indigo-600 font-semibold">
              View All Assignments
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {assignedCourses.map((course, idx) => (
              <div
                key={course.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {course.subjectName}
                    </span>
                    <Badge variant="indigo" size="sm">
                      {course.subjectCode}
                    </Badge>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {course.className} • {course.sectionName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Room: <strong className="text-slate-700">{course.room}</strong></span>
                    <span>•</span>
                    <span>Load: <strong className="text-slate-700">{course.periodsPerWeek} periods/week</strong></span>
                    <span>•</span>
                    <span>Term: <strong className="text-slate-700">{course.academicYear}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/teacher/attendance">
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<ClipboardCheck className="h-4 w-4" />}
                    >
                      Take Attendance
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/50">
          <div className="w-full flex items-center justify-between text-xs text-slate-500">
            <span>Course assignments are configured by school administration.</span>
            <Link
              href="/teacher/attendance"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Go to live roll call</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
