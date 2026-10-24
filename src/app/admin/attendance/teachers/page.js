"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import AttendanceNavTabs from "@/components/shared/AttendanceNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import Avatar from "@/components/ui/Avatar";
import {
  mockTeacherAttendanceRoster,
  mockAttendanceHistoryLogs,
  mockInitialCourseSubmissions,
} from "@/data/mock/attendance";
import { mockTeachers } from "@/data/mock/teachers";
import { mockAssignmentsList } from "@/data/mock/assignments";
import { useModal } from "@/hooks/useModal";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  History,
  Download,
  ChevronLeft,
  ChevronRight,
  Printer,
  ExternalLink,
  Zap,
  BookOpen,
  Sparkles,
  RotateCcw,
  Check,
  X,
} from "lucide-react";

const DEPARTMENTS = [
  "Science",
  "Mathematics",
  "Humanities",
  "Technology",
  "Athletics",
];

export default function AutomatedFacultyAttendancePage() {
  // Duty Date
  const [selectedDate, setSelectedDate] = useState("2026-03-18");

  // Filters
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "present", "pending", "leave"
  const [search, setSearch] = useState("");

  // Course submissions tracking
  const [courseSubmissions, setCourseSubmissions] = useState(() => {
    const initialMap = {};
    if (Array.isArray(mockInitialCourseSubmissions)) {
      mockInitialCourseSubmissions.forEach((item) => {
        initialMap[item.courseId] = item;
      });
    }

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sms_faculty_course_submissions");
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...initialMap, ...parsed };
        }
      } catch {
        // ignore
      }
    }
    return initialMap;
  });

  // Listen to cross-component or cross-tab storage updates
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem("sms_faculty_course_submissions");
        if (stored) {
          const parsed = JSON.parse(stored);
          setCourseSubmissions((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // History Modal
  const historyModal = useModal();

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Compile Faculty automated attendance list
  const automatedFacultyRoster = useMemo(() => {
    const submissionsList = Object.values(courseSubmissions);

    return mockTeachers.map((teacher) => {
      // Find all course submissions made by this teacher
      const teacherSubmissions = submissionsList.filter(
        (sub) => sub.teacherId === teacher.id || sub.teacherName === teacher.name
      );

      // Assigned courses for this teacher
      const assignedCourses = mockAssignmentsList.filter(
        (a) => a.teacherId === teacher.id
      );

      // Check if faculty has submitted attendance for any course
      const hasSubmitted = teacherSubmissions.length > 0;

      // Check if on official approved leave
      const isApprovedLeave = teacher.id === "TCH-006"; // Elena Rostova

      let status = "pending";
      let timeIn = "—";
      let verifiedSession = null;
      let remarks = "";

      if (hasSubmitted) {
        status = "present";
        const primarySession = teacherSubmissions[0];
        timeIn = primarySession.submittedAt || "08:35 AM";
        verifiedSession = {
          code: primarySession.subjectCode,
          name: primarySession.subjectName,
          classSection: `${primarySession.className} - ${primarySession.sectionName}`,
          period: primarySession.period,
          present: primarySession.present,
          total: primarySession.total,
          rate: primarySession.rate,
          submittedAt: primarySession.submittedAt,
        };
        remarks = `Auto-verified present via ${primarySession.subjectCode} roll call (${primarySession.present}/${primarySession.total} students attended).`;
      } else if (isApprovedLeave) {
        status = "leave";
        timeIn = "—";
        verifiedSession = {
          code: "LEAVE",
          name: "Approved Academic Conference",
          classSection: "Off-Campus Duty",
          period: "All Day",
          present: null,
          total: null,
          rate: null,
          submittedAt: "Pre-Approved",
        };
        remarks = "Official conference attendance approved by administration.";
      } else {
        status = "pending";
        timeIn = "—";
        const nextCourse = assignedCourses[0];
        verifiedSession = {
          code: nextCourse?.subjectCode || "PENDING",
          name: nextCourse?.subjectName || "Upcoming Class Session",
          classSection: nextCourse ? `${nextCourse.className} - ${nextCourse.sectionName}` : "Scheduled",
          period: "Upcoming Period Today",
          present: null,
          total: null,
          rate: null,
          submittedAt: "Awaiting Session",
        };
        remarks = `Awaiting course roll call submission for ${assignedCourses.length} assigned ${
          assignedCourses.length === 1 ? "lecture" : "lectures"
        } today.`;
      }

      return {
        id: teacher.id,
        teacherId: teacher.id,
        name: teacher.name,
        employeeId: teacher.employeeId,
        department: teacher.department,
        designation: teacher.designation,
        avatar: teacher.avatar,
        status,
        timeIn,
        verifiedSession,
        teacherSubmissions,
        assignedCourses,
        remarks,
      };
    });
  }, [courseSubmissions]);

  // Filtered Faculty Roster
  const displayedRecords = useMemo(() => {
    return automatedFacultyRoster.filter((teacher) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.employeeId.toLowerCase().includes(query) ||
        teacher.department.toLowerCase().includes(query) ||
        teacher.designation.toLowerCase().includes(query) ||
        (teacher.remarks && teacher.remarks.toLowerCase().includes(query));

      const matchesDept = deptFilter === "all" || teacher.department === deptFilter;
      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [automatedFacultyRoster, search, deptFilter, statusFilter]);

  // Overall Automated Attendance Metrics
  const stats = useMemo(() => {
    const total = automatedFacultyRoster.length;
    const present = automatedFacultyRoster.filter((t) => t.status === "present").length;
    const pending = automatedFacultyRoster.filter((t) => t.status === "pending").length;
    const leave = automatedFacultyRoster.filter((t) => t.status === "leave").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, pending, leave, percentage };
  }, [automatedFacultyRoster]);

  // Simulate Course Attendance Submission for a Pending Teacher (For testing / demonstration)
  const handleSimulateCourseAttendance = (teacher) => {
    const course = teacher.assignedCourses[0] || {
      id: `SIM-${teacher.id}`,
      subjectCode: "LEC-101",
      subjectName: "General Lecture Session",
      className: "Batch 2025",
      sectionName: "Section A",
    };

    const newSubmission = {
      courseId: course.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      subjectCode: course.subjectCode,
      subjectName: course.subjectName,
      className: course.className,
      sectionName: course.sectionName,
      period: "Period 2 (09:45 AM - 10:45 AM)",
      submittedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      present: 32,
      absent: 2,
      late: 0,
      total: 34,
      rate: 94.1,
    };

    setCourseSubmissions((prev) => {
      const updated = { ...prev, [course.id]: newSubmission };
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("sms_faculty_course_submissions", JSON.stringify(updated));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {
        // ignore
      }
      return updated;
    });

    showToast(
      `Course roll call for ${course.subjectName} submitted! ${teacher.name} is now automatically marked as PRESENT.`,
      "success"
    );
  };

  // Reset Submissions to initial mock state
  const handleResetSubmissions = () => {
    const initialMap = {};
    mockInitialCourseSubmissions.forEach((item) => {
      initialMap[item.courseId] = item;
    });
    setCourseSubmissions(initialMap);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sms_faculty_course_submissions");
        window.dispatchEvent(new Event("storage"));
      }
    } catch {
      // ignore
    }
    showToast("Reset faculty course attendance submissions to default schedule.", "info");
  };

  // Quick Date Navigation
  const changeDateByDays = (days) => {
    const parts = selectedDate.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  // Export Faculty CSV
  const handleExportCSV = () => {
    if (displayedRecords.length === 0) return;

    const headers = [
      "Employee ID",
      "Faculty Name",
      "Department",
      "Designation",
      "Automated Duty Status",
      "Check-In Time",
      "Triggering Course Session",
      "Activity Notes",
    ];

    const rows = displayedRecords.map((t) => [
      `"${t.employeeId}"`,
      `"${t.name}"`,
      `"${t.department}"`,
      `"${t.designation}"`,
      `"${t.status.toUpperCase()}"`,
      `"${t.timeIn}"`,
      `"${t.verifiedSession?.code || ""} - ${t.verifiedSession?.name || ""}"`,
      `"${(t.remarks || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Faculty_Attendance_Automated_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${displayedRecords.length} faculty attendance records.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-rose-600 text-white border-rose-500"
              : toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-slate-900 text-white border-slate-800"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Faculty Attendance (Automated)"
        subtitle="Real-time faculty attendance automatically verified as Present when instructors submit course roll calls."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="emerald" size="md" className="font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-500" />
              <span>Course-Driven Auto Tracking</span>
            </Badge>

            <Button
              variant="outline"
              size="md"
              icon={History}
              onClick={historyModal.open}
            >
              Faculty Logs
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Sheet
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Faculty CSV
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <AttendanceNavTabs />

      {/* Automated System Explanation Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Automated Faculty Attendance Active</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Zero Manual Marking
              </span>
            </h4>
            <p className="text-slate-600 mt-0.5">
              Per school policy, teachers do not take manual faculty roll call. An educator is automatically marked as <strong>Present</strong> the instant they conduct and submit student attendance for any assigned course session.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetSubmissions}
            title="Reset to default mock sessions"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          <Link
            href="/teacher/attendance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-2xs"
          >
            <span>Open Teacher Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Duty Date & Department Control Bar */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Date Selection */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                Duty Date:
              </span>
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => changeDateByDays(-1)}
                  title="Previous Day"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => changeDateByDays(1)}
                  title="Next Day"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate("2026-03-18")}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-indigo-200"
              >
                Today
              </button>
            </div>

            {/* Department Filter */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                Department:
              </span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatsCard
          title="Total Faculty"
          value={stats.total}
          icon={GraduationCap}
          variant="indigo"
          description="Active academic staff"
        />
        <StatsCard
          title="Auto-Verified Present"
          value={stats.present}
          icon={CheckCircle2}
          variant="emerald"
          description={`${stats.percentage}% conducted course roll call`}
        />
        <StatsCard
          title="Awaiting Course Roll Call"
          value={stats.pending}
          icon={Clock}
          variant="amber"
          description="Scheduled for later periods today"
        />
        <StatsCard
          title="Approved Leave"
          value={stats.leave}
          icon={Calendar}
          variant="purple"
          description="Official leave documented"
        />
      </div>

      {/* Automated Quorum Proportion Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>Faculty Verification Rate:</span>
            <strong className="text-emerald-600">{stats.percentage}% Present</strong>
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Auto-Verified Present ({stats.present})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Awaiting Course ({stats.pending})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Approved Leave ({stats.leave})
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${(stats.leave / (stats.total || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Faculty Attendance Register Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Academic Staff Attendance & Course Log</CardTitle>
              <CardDescription>
                Faculty attendance automatically synced from teacher course submissions across departments
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search faculty name, ID, department..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All Faculty" },
                  { id: "present", label: "Present (Auto)" },
                  { id: "pending", label: "Awaiting Course" },
                  { id: "leave", label: "On Leave" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      statusFilter === st.id
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {displayedRecords.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={GraduationCap}
                title="No faculty members found"
                description="Try clearing search filters or selecting all departments."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDeptFilter("all");
                      setStatusFilter("all");
                      setSearch("");
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Teacher Profile</TableHead>
                    <TableHead>Department & Role</TableHead>
                    <TableHead className="w-56 text-center">Automated Attendance Status</TableHead>
                    <TableHead>Triggering Course Session</TableHead>
                    <TableHead className="w-24 text-center">Time In</TableHead>
                    <TableHead className="text-right">Action / Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRecords.map((teacher) => (
                    <TableRow key={teacher.id}>
                      {/* Teacher Profile */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={teacher.avatar}
                            name={teacher.name}
                            size="md"
                            className="ring-1 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block truncate">
                              {teacher.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {teacher.employeeId}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Department & Role */}
                      <TableCell>
                        <p className="text-xs font-semibold text-slate-800">
                          {teacher.designation}
                        </p>
                        <Badge
                          variant={
                            teacher.department === "Science"
                              ? "blue"
                              : teacher.department === "Mathematics"
                              ? "indigo"
                              : teacher.department === "Humanities"
                              ? "amber"
                              : teacher.department === "Technology"
                              ? "purple"
                              : "rose"
                          }
                          size="sm"
                          className="mt-1"
                        >
                          Dept. of {teacher.department}
                        </Badge>
                      </TableCell>

                      {/* Automated Attendance Status (Read-Only) */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center">
                          {teacher.status === "present" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Auto-Verified Present</span>
                            </span>
                          )}
                          {teacher.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>Awaiting Course Roll Call</span>
                            </span>
                          )}
                          {teacher.status === "leave" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Calendar className="h-3.5 w-3.5 text-purple-600" />
                              <span>Approved Leave</span>
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Triggering Course Session */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {teacher.verifiedSession?.code}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
                              {teacher.verifiedSession?.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {teacher.verifiedSession?.classSection}
                            {teacher.verifiedSession?.rate !== null && (
                              <span className="text-emerald-700 font-semibold ml-1">
                                • {teacher.verifiedSession?.rate}% Attendance
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Time In */}
                      <TableCell className="text-center font-mono text-xs font-semibold text-slate-700">
                        {teacher.timeIn}
                      </TableCell>

                      {/* Action / Trigger Simulation */}
                      <TableCell className="text-right">
                        {teacher.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => handleSimulateCourseAttendance(teacher)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                            title="Simulate taking course attendance to test auto-present"
                          >
                            <Sparkles className="h-3 w-3 text-indigo-600" />
                            <span>Simulate Roll Call</span>
                          </button>
                        ) : teacher.status === "present" ? (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Logged at {teacher.timeIn}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-purple-600 font-medium">
                            Administrative Leave
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ATTENDANCE HISTORY LOGS MODAL */}
      <Modal
        isOpen={historyModal.isOpen}
        onClose={historyModal.close}
        title="Institutional Faculty Attendance History"
        description="Historical faculty presence records and teaching coverage logs."
        maxWidth="max-w-2xl"
        footer={
          <Button variant="primary" size="md" onClick={historyModal.close}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Date</TableHead>
                <TableHead>Department Scope</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Leave</TableHead>
                <TableHead className="text-right">Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendanceHistoryLogs
                .filter((l) => l.scope === "All Faculty")
                .map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs font-bold text-slate-800">
                      {log.date}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      {log.scope}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600">
                      {log.present}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-amber-600">
                      {log.absent || log.late}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-purple-600">
                      {log.leave || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-50 text-indigo-700 font-mono">
                        {log.rate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </Modal>
    </div>
  );
}
