"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import AttendanceTrendChart from "@/components/charts/AttendanceTrendChart";
import EnrollmentBarChart from "@/components/charts/EnrollmentBarChart";
import FeeCollectionChart from "@/components/charts/FeeCollectionChart";
import { schoolInfo } from "@/data/mock/school";
import {
  dashboardPeriods,
  mockSummaryMetrics,
  mockAttendanceTrendData,
  mockEnrollmentData,
  mockFeeCollectionData,
  mockRecentActivities,
  mockUpcomingEvents,
  mockImportantAlerts,
} from "@/data/mock/dashboardOverview";
import { mockAttendanceStats } from "@/data/mock/attendance";
import { formatCurrency } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  GraduationCap,
  Users2,
  Users,
  School,
  CalendarCheck,
  BadgeDollarSign,
  Plus,
  ArrowUpRight,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Download,
  Megaphone,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [alerts, setAlerts] = useState(mockImportantAlerts);
  const admissionModal = useModal();

  // Active metrics based on selected period
  const metrics = mockSummaryMetrics[selectedPeriod] || mockSummaryMetrics.month;
  const attendanceChartData = mockAttendanceTrendData[selectedPeriod] || mockAttendanceTrendData.month;
  const feeChartData = mockFeeCollectionData[selectedPeriod] || mockFeeCollectionData.month;

  // New Student state for admission modal
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("Grade 10");
  const [newStudentSection, setNewStudentSection] = useState("A");

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts.filter((a) => a.id !== alertId));
  };

  const handleCreateAdmission = (e) => {
    e.preventDefault();
    if (!newStudentName) return;
    alert(`Student "${newStudentName}" successfully registered into ${newStudentGrade}-${newStudentSection}!`);
    admissionModal.close();
    setNewStudentName("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Period Filter & Action Buttons */}
      <PageHeader
        title="Institutional Executive Overview"
        subtitle={`Real-time dashboard for ${schoolInfo.name} • ${schoolInfo.currentTerm}`}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Period Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs">
              <span className="text-slate-400 pl-2">
                <Filter className="h-3.5 w-3.5" />
              </span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 pr-6 py-1 focus:outline-none cursor-pointer"
                title="Filter by period"
              >
                {dashboardPeriods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => alert("Exporting consolidated executive report PDF...")}
            >
              Export Report
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={admissionModal.open}
            >
              New Admission
            </Button>
          </div>
        }
      />

      {/* Important Alerts Banner (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((alertItem) => (
            <div
              key={alertItem.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-150 ${
                alertItem.level === "warning"
                  ? "bg-amber-50/80 border-amber-200/80 text-amber-900"
                  : "bg-blue-50/80 border-blue-200/80 text-blue-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`p-2 rounded-xl shrink-0 ${
                    alertItem.level === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {alertItem.level === "warning" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{alertItem.title}</p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    {alertItem.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={alertItem.actionHref}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
                >
                  {alertItem.actionText}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(alertItem.id)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6 Summary Metric Cards (Prompt Requirement 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Students */}
        <StatsCard
          title="Students"
          value={metrics.totalStudents}
          trend={{ value: metrics.studentsTrend, isPositive: true }}
          icon={GraduationCap}
          variant="indigo"
        />

        {/* 2. Total Teachers */}
        <StatsCard
          title="Teachers"
          value={metrics.totalTeachers}
          trend={{ value: metrics.teachersTrend, isPositive: true }}
          icon={Users2}
          variant="emerald"
        />

        {/* 3. Total Staff */}
        <StatsCard
          title="Staff"
          value={metrics.totalStaff}
          description={metrics.staffTrend}
          icon={Users}
          variant="purple"
        />

        {/* 4. Total Classes */}
        <StatsCard
          title="Classes"
          value={metrics.totalClasses}
          description={metrics.classesTrend}
          icon={School}
          variant="blue"
        />

        {/* 5. Attendance Rate */}
        <StatsCard
          title="Attendance"
          value={`${metrics.attendanceRate}%`}
          trend={{ value: metrics.attendanceTrend, isPositive: true }}
          icon={CalendarCheck}
          variant="emerald"
        />

        {/* 6. Outstanding Fees */}
        <StatsCard
          title="Pending Fees"
          value={formatCurrency(metrics.outstandingFees)}
          description={metrics.feesTrend}
          icon={BadgeDollarSign}
          variant="amber"
        />
      </div>

      {/* Charts Row: Attendance Trend & Fee Collection (Prompt Requirement 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Attendance Trends & Target Benchmark</CardTitle>
              <CardDescription>
                Visualizing daily / periodic attendance rates vs the 94% baseline.
              </CardDescription>
            </div>
            <Link
              href="/admin/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
              Full Log <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <AttendanceTrendChart data={attendanceChartData} height={230} />
          </CardContent>
        </Card>

        {/* Fee Collection Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fee Collection vs Budget Target</CardTitle>
              <CardDescription>
                Realized student tuition inflows against projected financial quotas.
              </CardDescription>
            </div>
            <Link
              href="/admin/finance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
              Finance Ledger <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <FeeCollectionChart data={feeChartData} height={230} />
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Student Enrollment by Grade & Today's Attendance Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Enrollment Chart (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Student Enrollment by Grade Cohort</CardTitle>
                <CardDescription>
                  Demographic breakdown showing boys, girls, and total room capacity limits.
                </CardDescription>
              </div>
              <Badge variant="indigo">1,420 Total Enrolled</Badge>
            </CardHeader>
            <CardContent>
              <EnrollmentBarChart data={mockEnrollmentData} height={230} />
            </CardContent>
          </Card>
        </div>

        {/* Today's Attendance Summary (1 col) */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today&apos;s Attendance Summary</CardTitle>
              <CardDescription>{mockAttendanceStats.date}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Circular / Big Metric Progress */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-3xl font-extrabold text-indigo-700">
                  {mockAttendanceStats.overallPercentage}%
                </span>
                <p className="text-xs font-semibold text-indigo-900 mt-0.5">
                  Institutional Turnout
                </p>
                <p className="text-[11px] text-indigo-600/80">
                  {mockAttendanceStats.presentCount} of {mockAttendanceStats.totalStudents} students present
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                <CalendarCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present on Time
                </span>
                <span className="font-bold text-slate-900">{mockAttendanceStats.presentCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Unexcused Absences
                </span>
                <span className="font-bold text-rose-600">30</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Excused Leaves
                </span>
                <span className="font-bold text-purple-600">18</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Tardy / Late Arrivals
                </span>
                <span className="font-bold text-amber-600">{mockAttendanceStats.lateCount}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href="/admin/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 w-full text-center"
            >
              Open Daily Attendance Marker →
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Bottom Section: Recent Activities Table & Upcoming Events / Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Recent Audit Log & System Activities</CardTitle>
                <CardDescription>
                  Chronological event log across admissions, attendance, and finance.
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-slate-400">Live Feed</span>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>User & Persona</TableHead>
                    <TableHead>Activity Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentActivities.map((act) => (
                    <TableRow key={act.id}>
                      <TableCell>
                        <p className="font-bold text-xs text-slate-900">{act.user}</p>
                        <p className="text-[11px] text-slate-400">{act.userRole}</p>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 max-w-sm">
                        {act.action}
                      </TableCell>
                      <TableCell>
                        <Badge variant={act.badge} size="sm">
                          {act.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono text-slate-400">
                        {act.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upcoming Events & Campus Notices (1 col) */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Upcoming Academic Events</CardTitle>
                <CardDescription>Key milestones & deadlines</CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-3.5">
              {mockUpcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-slate-200/90 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={evt.color} size="sm">
                      {evt.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      {evt.date}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {evt.time} • {evt.venue}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Notice Shortcut */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm">Active Campus Notices</CardTitle>
                <Link
                  href="/admin/communication"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900">
                  Parent-Teacher Academic Consultation Day
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scheduled for next Friday in Science Hall 201.
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900">
                  Campus ID Badge Policy Reminder
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official RFID badges must be worn on all campus checkpoints.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Admission Modal */}
      <Modal
        isOpen={admissionModal.isOpen}
        onClose={admissionModal.close}
        title="Student Admission Registration"
        description="Enter new student credentials to append to the active institutional roster."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={admissionModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateAdmission}>
              Register Student
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAdmission} className="space-y-3.5">
          <Input
            label="Full Legal Name"
            placeholder="e.g. Maya Lin"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Grade"
              value={newStudentGrade}
              onChange={(e) => setNewStudentGrade(e.target.value)}
              options={["Grade 10", "Grade 9", "Grade 8", "Grade 7", "Grade 6"]}
            />
            <Select
              label="Section"
              value={newStudentSection}
              onChange={(e) => setNewStudentSection(e.target.value)}
              options={["A", "B", "C"]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
