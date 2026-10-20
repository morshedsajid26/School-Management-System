"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import AttendanceNavTabs from "@/components/shared/AttendanceNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import {
  mockStudentAttendanceRoster,
  mockAttendanceHistoryLogs,
} from "@/data/mock/attendance";
import { mockClassesList, mockSectionsList } from "@/data/mock/academicStructure";
import { mockAssignmentsList } from "@/data/mock/assignments";
import { useModal } from "@/hooks/useModal";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  Users,
  Check,
  AlertTriangle,
  History,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  School,
  X,
} from "lucide-react";

export default function StudentAttendancePage() {
  // Attendance Date (default static string for Next.js 16 static prerender compliance)
  const [selectedDate, setSelectedDate] = useState("2026-03-18");

  // Selected Class & Section
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [selectedSection, setSelectedSection] = useState("A");

  // Available course assignments for current class & section
  const cohortAssignments = useMemo(() => {
    return mockAssignmentsList.filter(
      (a) => a.className === selectedGrade && a.sectionName.includes(selectedSection)
    );
  }, [selectedGrade, selectedSection]);

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("all");

  const currentCourseAssignment = useMemo(() => {
    if (selectedSubjectCode === "all") return null;
    return cohortAssignments.find((a) => a.subjectCode === selectedSubjectCode) || null;
  }, [cohortAssignments, selectedSubjectCode]);

  // Filter & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Local Roster State
  const [roster, setRoster] = useState(mockStudentAttendanceRoster);

  // Modals
  const confirmSaveModal = useModal();
  const historyModal = useModal();
  const [studentHistoryTarget, setStudentHistoryTarget] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Roster for current Class & Section
  const cohortRoster = useMemo(() => {
    return roster.filter(
      (s) => s.grade === selectedGrade && s.section === selectedSection
    );
  }, [roster, selectedGrade, selectedSection]);

  // Displayed records after search and status filter
  const displayedRecords = useMemo(() => {
    return cohortRoster.filter((student) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        (student.admissionNumber && student.admissionNumber.toLowerCase().includes(query)) ||
        (student.remarks && student.remarks.toLowerCase().includes(query));

      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cohortRoster, search, statusFilter]);

  // Dynamic Metrics for current cohort
  const cohortStats = useMemo(() => {
    const total = cohortRoster.length;
    const present = cohortRoster.filter((s) => s.status === "present").length;
    const absent = cohortRoster.filter((s) => s.status === "absent").length;
    const late = cohortRoster.filter((s) => s.status === "late").length;
    const leave = cohortRoster.filter((s) => s.status === "leave").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, leave, percentage };
  }, [cohortRoster]);

  // Bulk Actions
  const handleBulkMark = (newStatus) => {
    setRoster((prev) =>
      prev.map((student) => {
        if (student.grade === selectedGrade && student.section === selectedSection) {
          return {
            ...student,
            status: newStatus,
            timeIn: newStatus === "present" ? "08:15 AM" : newStatus === "late" ? "08:35 AM" : "—",
          };
        }
        return student;
      })
    );
    showToast(`Bulk updated all students in ${selectedGrade}-${selectedSection} to ${newStatus.toUpperCase()}.`);
  };

  // Individual Status Change
  const handleStatusChange = (studentId, newStatus) => {
    setRoster((prev) =>
      prev.map((student) => {
        if (student.id === studentId) {
          let timeIn = student.timeIn;
          if (newStatus === "present" && (timeIn === "—" || !timeIn)) timeIn = "08:15 AM";
          if (newStatus === "late") timeIn = "08:35 AM";
          if (newStatus === "absent" || newStatus === "leave") timeIn = "—";

          return {
            ...student,
            status: newStatus,
            timeIn,
          };
        }
        return student;
      })
    );
  };

  // Update Remarks
  const handleRemarkChange = (studentId, newRemark) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks: newRemark } : s))
    );
  };

  // Save Attendance Sheet Confirmation
  const handleConfirmSave = () => {
    confirmSaveModal.close();
    showToast(
      `Attendance for ${selectedGrade} Section ${selectedSection} on ${selectedDate} saved successfully! (${cohortStats.present} Present, ${cohortStats.absent} Absent, ${cohortStats.late} Late).`
    );
  };

  // Quick Date Navigation
  const changeDateByDays = (days) => {
    const parts = selectedDate.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    const newStr = d.toISOString().split("T")[0];
    setSelectedDate(newStr);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
            toast.type === "info"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-emerald-600 text-white border-emerald-500"
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
        title="Student Attendance Register"
        subtitle="Record, verify, and monitor daily attendance rosters, late admissions, and excused leaves by class division."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={History}
              onClick={historyModal.open}
            >
              Attendance Logs
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Save}
              onClick={confirmSaveModal.open}
            >
              Save Attendance Sheet
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <AttendanceNavTabs />

      {/* Attendance Control & Date Selector Bar */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Date Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                Attendance Date:
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

            {/* Class & Section Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                  Cohort:
                </span>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {mockClassesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              {/* Course / Subject Selector */}
              {cohortAssignments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                    Course:
                  </span>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => setSelectedSubjectCode(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px] truncate"
                  >
                    <option value="all">General Class Roll Call</option>
                    {cohortAssignments.map((a) => (
                      <option key={a.id} value={a.subjectCode}>
                        {a.subjectName} ({a.teacherName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Assigned Faculty Banner */}
            {currentCourseAssignment && (
              <div className="w-full mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-200">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Assigned Faculty: <strong className="text-white font-bold">{currentCourseAssignment.teacherName}</strong></span>
                  <span className="text-slate-400">• Room: {currentCourseAssignment.room}</span>
                  <span className="text-slate-400">• Load: {currentCourseAssignment.periodsPerWeek} periods/wk</span>
                </div>
                <Link
                  href="/admin/assignments"
                  className="text-indigo-400 hover:text-white underline font-semibold flex items-center gap-1"
                >
                  Manage Faculty Assignments
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatsCard
          title="Total Students"
          value={cohortStats.total}
          icon={Users}
          variant="indigo"
          description={`${selectedGrade} - Section ${selectedSection}`}
        />
        <StatsCard
          title="Present"
          value={cohortStats.present}
          icon={CheckCircle2}
          variant="emerald"
          description={`${cohortStats.percentage}% attendance rate`}
        />
        <StatsCard
          title="Absent"
          value={cohortStats.absent}
          icon={XCircle}
          variant="rose"
          description="Unexcused absence"
        />
        <StatsCard
          title="Late Arrival"
          value={cohortStats.late}
          icon={Clock}
          variant="amber"
          description="Arrived past morning bell"
        />
        <StatsCard
          title="On Leave"
          value={cohortStats.leave}
          icon={Calendar}
          variant="purple"
          description="Approved leave/medical"
        />
      </div>

      {/* Visual Proportion Breakdown Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>Attendance Distribution:</span>
            <strong className="text-emerald-600">{cohortStats.percentage}% Present</strong>
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present ({cohortStats.present})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent ({cohortStats.absent})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late ({cohortStats.late})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Leave ({cohortStats.leave})
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(cohortStats.present / (cohortStats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{ width: `${(cohortStats.absent / (cohortStats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${(cohortStats.late / (cohortStats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${(cohortStats.leave / (cohortStats.total || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Roster Sheet Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                Homeroom Register — {selectedGrade} (Sec {selectedSection})
              </CardTitle>
              <CardDescription>
                Mark individual attendance status, check-in timestamps, and documented absence reasons
              </CardDescription>
            </div>

            {/* Quick Bulk Marking Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400 mr-1">
                Bulk Mark:
              </span>
              <button
                type="button"
                onClick={() => handleBulkMark("present")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleBulkMark("absent")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
              >
                All Absent
              </button>
              <button
                type="button"
                onClick={() => handleBulkMark("late")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
              >
                All Late
              </button>
            </div>
          </div>

          {/* Quick Filters / Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search student or roll #..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              <div className="flex items-center gap-1">
                {["all", "present", "absent", "late", "leave"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize ${
                      statusFilter === st
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
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
                icon={Users}
                title="No students found in this section"
                description="Try selecting a different grade division or resetting active search filters."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGrade("Grade 10");
                      setSelectedSection("A");
                      setSearch("");
                      setStatusFilter("all");
                    }}
                  >
                    Reset Cohort Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead className="w-16">Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-80 text-center">Attendance Status</TableHead>
                    <TableHead className="w-28">Check-In</TableHead>
                    <TableHead>Notes / Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedRecords.map((student) => (
                    <TableRow key={student.id}>
                      {/* Roll Number */}
                      <TableCell className="font-mono text-xs font-bold text-slate-800">
                        {student.rollNumber}
                      </TableCell>

                      {/* Student Profile */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.avatar}
                            name={student.name}
                            size="sm"
                            className="ring-1 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs block truncate">
                              {student.name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {student.admissionNumber}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Individual Status Interactive Pill Buttons */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              student.status === "present"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              student.status === "absent"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "late")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              student.status === "late"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Late</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "leave")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              student.status === "leave"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </TableCell>

                      {/* Time In */}
                      <TableCell className="font-mono text-xs font-semibold text-slate-600">
                        {student.timeIn}
                      </TableCell>

                      {/* Remarks Input */}
                      <TableCell>
                        <input
                          type="text"
                          value={student.remarks || ""}
                          placeholder="Add incident notes or excuse..."
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONFIRMATION MODAL TO SAVE ATTENDANCE */}
      <Modal
        isOpen={confirmSaveModal.isOpen}
        onClose={confirmSaveModal.close}
        title="Confirm Attendance Submission"
        description={`Date: ${selectedDate} • ${selectedGrade} (Section ${selectedSection})`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="md" onClick={confirmSaveModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" icon={Save} onClick={handleConfirmSave}>
              Save Register
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Total Cohort Size:</span>
              <strong className="text-slate-900">{cohortStats.total} Students</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-emerald-700">Present Count:</span>
              <strong className="text-emerald-700">{cohortStats.present} ({cohortStats.percentage}%)</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-rose-700">Absent Count:</span>
              <strong className="text-rose-700">{cohortStats.absent}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-amber-700">Late Arrivals:</span>
              <strong className="text-amber-700">{cohortStats.late}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-purple-700">Approved Leaves:</span>
              <strong className="text-purple-700">{cohortStats.leave}</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Once saved, attendance figures will be synchronized with student academic profiles and attendance reports.
          </p>
        </div>
      </Modal>

      {/* ATTENDANCE HISTORY LOGS MODAL */}
      <Modal
        isOpen={historyModal.isOpen}
        onClose={historyModal.close}
        title="Institutional Attendance History Logs"
        description="Historical homeroom logs and multi-day attendance trends."
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
                <TableHead>Cohort / Scope</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendanceHistoryLogs.map((log, idx) => (
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
                  <TableCell className="text-xs font-bold text-rose-600">
                    {log.absent}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-amber-600">
                    {log.late}
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
