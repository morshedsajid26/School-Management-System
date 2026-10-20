"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import AttendanceTrendChart from "@/components/charts/AttendanceTrendChart";
import Avatar from "@/components/ui/Avatar";
import { schoolInfo } from "@/data/mock/school";
import { mockAttendanceStats, mockRecentAbsences } from "@/data/mock/attendance";
import { mockAttendanceTrendData } from "@/data/mock/dashboardOverview";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Phone,
  AlertTriangle,
  School,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminAttendanceDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const attendanceChartData = mockAttendanceTrendData[selectedPeriod] || mockAttendanceTrendData.month;

  // Cohort submission progress
  const classStatusList = [
    { grade: "Grade 10 - Section A", teacher: "Prof. Marcus Aurel", time: "08:15 AM", present: 32, total: 34, status: "Submitted" },
    { grade: "Grade 10 - Section B", teacher: "Emma Grace Taylor", time: "08:10 AM", present: 31, total: 32, status: "Submitted" },
    { grade: "Grade 9 - Section A", teacher: "Dr. Catherine Bennett", time: "08:20 AM", present: 29, total: 31, status: "Submitted" },
    { grade: "Grade 9 - Section B", teacher: "Jonathan Hayes", time: "08:18 AM", present: 30, total: 32, status: "Submitted" },
    { grade: "Grade 8 - Section A", teacher: "Amina Al-Mansoor", time: "Pending", present: 0, total: 30, status: "Pending" },
    { grade: "Grade 8 - Section B", teacher: "David K. Reynolds", time: "08:05 AM", present: 28, total: 30, status: "Submitted" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Attendance Command Center"
        subtitle={`Live institutional attendance monitoring, today's roll call status, and absentee records for ${schoolInfo.name}`}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/assignments">
              <Button variant="outline" size="sm" leftIcon={<Users2 className="h-4 w-4" />}>
                Assign Courses to Teachers
              </Button>
            </Link>
            <Link href="/admin/attendance">
              <Button variant="primary" size="sm" leftIcon={<CalendarCheck className="h-4 w-4" />}>
                Take Today's Attendance
              </Button>
            </Link>
            <Link href="/admin/attendance/reports">
              <Button variant="outline" size="sm" leftIcon={<BarChart3 className="h-4 w-4" />}>
                Monthly Reports
              </Button>
            </Link>
          </div>
        }
      />

      {/* Primary KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Attendance Rate"
          value={`${mockAttendanceStats.overallPercentage}%`}
          change="+1.2% from yesterday"
          changeType="positive"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatsCard
          title="Present Today"
          value={`${mockAttendanceStats.presentCount} / ${mockAttendanceStats.totalStudents}`}
          change="Students Marked Present"
          changeType="positive"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Absent Today"
          value={`${mockAttendanceStats.absentCount} Students`}
          change="12 Excused • 36 Unexcused"
          changeType="negative"
          icon={XCircle}
          color="rose"
        />
        <StatsCard
          title="Late Arrivals"
          value={`${mockAttendanceStats.lateCount} Students`}
          change="Average time: 8:22 AM"
          changeType="neutral"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Quick Access Action Bar */}
      <Card className="border-indigo-100 bg-linear-to-r from-indigo-50/70 via-white to-blue-50/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ready to mark today's roll call?
                </h3>
                <p className="text-xs text-slate-500">
                  Select a class cohort to record attendance, toggle statuses with 1 click, or generate monthly register sheets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto flex-wrap">
              <Link href="/admin/assignments" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" leftIcon={<Users2 className="h-4 w-4" />}>
                  Assign Courses
                </Button>
              </Link>
              <Link href="/admin/attendance" className="w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Mark Student Roll Call
                </Button>
              </Link>
              <Link href="/admin/attendance/reports" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                  Monthly Register
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart (2 columns) */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Attendance Trends & Benchmark
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Daily attendance rate vs institutional standard (94.0%)
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedPeriod("week")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedPeriod === "week" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod("month")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedPeriod === "month" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Month
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <AttendanceTrendChart data={attendanceChartData} height={230} />
          </CardContent>
        </Card>

        {/* Class-wise Attendance Performance (1 column) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Grade-Wise Rates Today
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Attendance performance across classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {mockAttendanceStats.byGrade.map((item) => (
              <div key={item.grade} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.grade}</span>
                  <span className="font-bold text-indigo-600">{item.present}% Present</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.present}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="pt-2 border-t border-slate-100">
            <Link
              href="/admin/attendance/reports"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View full monthly matrix breakdown</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Two Column Section: Class Roll Call Submission Status & Today's Absentees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Roll Call Status */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Today's Roll Call Status
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Status of daily attendance submission by homeroom teachers
              </CardDescription>
            </div>
            <Badge variant="indigo" size="sm">
              5 of 6 Submitted
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {classStatusList.map((cls, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{cls.grade}</span>
                      {cls.status === "Submitted" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="h-3 w-3" /> Submitted ({cls.time})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Teacher: <span className="text-slate-700 font-medium">{cls.teacher}</span>
                      {cls.status === "Submitted" && ` • ${cls.present}/${cls.total} Present`}
                    </div>
                  </div>

                  <div>
                    {cls.status === "Pending" ? (
                      <Link href="/admin/attendance">
                        <Button variant="primary" size="xs">
                          Mark Now
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/admin/attendance">
                        <Button variant="ghost" size="xs" className="text-slate-600 hover:text-indigo-600">
                          Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Absentee List */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Today's Reported Absences
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Students requiring parent notification or verified medical excuse
              </CardDescription>
            </div>
            <Link href="/admin/attendance">
              <Button variant="ghost" size="xs" className="text-indigo-600 font-bold">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {mockRecentAbsences.map((abs) => (
                <div key={abs.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900">
                      {abs.studentName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{abs.grade}</span>
                      <span>•</span>
                      <span>Reason: <span className="font-medium text-slate-700">{abs.reason}</span></span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Contact: {abs.reportedBy}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      variant={abs.status === "Excused" ? "success" : "danger"}
                      size="sm"
                    >
                      {abs.status}
                    </Badge>
                    <button
                      onClick={() => alert(`Dialing emergency contact for ${abs.studentName}...`)}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Contact Parent</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t border-slate-100">
            <div className="w-full flex items-center justify-between text-xs text-slate-500">
              <span>Automatic guardian SMS alert triggers at 10:00 AM</span>
              <Badge variant="neutral" size="sm">Auto Alert: On</Badge>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
