"use client";

import React, { useState, useMemo } from "react";
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
  mockTeacherAttendanceRoster,
  mockAttendanceHistoryLogs,
} from "@/data/mock/attendance";
import { useModal } from "@/hooks/useModal";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Search,
  Filter,
  Check,
  AlertTriangle,
  History,
  Save,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  UserCheck,
  X,
} from "lucide-react";

const DEPARTMENTS = [
  "Science",
  "Mathematics",
  "Humanities",
  "Technology",
  "Athletics",
];

export default function TeacherAttendancePage() {
  // Static initial date for Next.js 16 build compliance
  const [selectedDate, setSelectedDate] = useState("2026-03-18");

  // Filters
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Local Roster State
  const [roster, setRoster] = useState(mockTeacherAttendanceRoster);

  // Modals
  const confirmSaveModal = useModal();
  const historyModal = useModal();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Faculty Roster
  const displayedRecords = useMemo(() => {
    return roster.filter((teacher) => {
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
  }, [roster, search, deptFilter, statusFilter]);

  // Overall Attendance Metrics
  const stats = useMemo(() => {
    const total = roster.length;
    const present = roster.filter((t) => t.status === "present").length;
    const absent = roster.filter((t) => t.status === "absent").length;
    const late = roster.filter((t) => t.status === "late").length;
    const leave = roster.filter((t) => t.status === "leave").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, leave, percentage };
  }, [roster]);

  // Bulk Actions
  const handleBulkMark = (newStatus) => {
    setRoster((prev) =>
      prev.map((teacher) => ({
        ...teacher,
        status: newStatus,
        timeIn: newStatus === "present" ? "07:50 AM" : newStatus === "late" ? "08:25 AM" : "—",
      }))
    );
    showToast(`Bulk updated all educators to ${newStatus.toUpperCase()}.`);
  };

  // Individual Status Change
  const handleStatusChange = (teacherId, newStatus) => {
    setRoster((prev) =>
      prev.map((teacher) => {
        if (teacher.id === teacherId) {
          let timeIn = teacher.timeIn;
          if (newStatus === "present" && (timeIn === "—" || !timeIn)) timeIn = "07:50 AM";
          if (newStatus === "late") timeIn = "08:25 AM";
          if (newStatus === "absent" || newStatus === "leave") timeIn = "—";

          return {
            ...teacher,
            status: newStatus,
            timeIn,
          };
        }
        return teacher;
      })
    );
  };

  // Update Remarks
  const handleRemarkChange = (teacherId, newRemark) => {
    setRoster((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, remarks: newRemark } : t))
    );
  };

  // Save Confirmation
  const handleConfirmSave = () => {
    confirmSaveModal.close();
    showToast(
      `Faculty attendance for ${selectedDate} confirmed successfully! (${stats.present} Present, ${stats.absent} Absent, ${stats.late} Late, ${stats.leave} On Leave).`
    );
  };

  // Date Navigation
  const changeDateByDays = (days) => {
    const parts = selectedDate.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
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
        title="Teacher & Faculty Attendance"
        subtitle="Monitor daily academic faculty arrivals, duty check-ins, leave approvals, and pedagogical availability."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={History}
              onClick={historyModal.open}
            >
              Faculty Logs
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Save}
              onClick={confirmSaveModal.open}
            >
              Confirm Daily Sheet
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <AttendanceNavTabs />

      {/* Date & Department Control Bar */}
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
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatsCard
          title="Total Faculty"
          value={stats.total}
          icon={GraduationCap}
          variant="indigo"
          description="Enrolled teaching staff"
        />
        <StatsCard
          title="Present On Campus"
          value={stats.present}
          icon={CheckCircle2}
          variant="emerald"
          description={`${stats.percentage}% reporting for duty`}
        />
        <StatsCard
          title="Unnotified Absent"
          value={stats.absent}
          icon={XCircle}
          variant="rose"
          description="Substitute required"
        />
        <StatsCard
          title="Late Arrival"
          value={stats.late}
          icon={Clock}
          variant="amber"
          description="Checked in after 08:00 AM"
        />
        <StatsCard
          title="Approved Leave"
          value={stats.leave}
          icon={Calendar}
          variant="purple"
          description="Academic & medical leave"
        />
      </div>

      {/* Faculty Attendance Proportion Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>Faculty Quorum:</span>
            <strong className="text-emerald-600">{stats.percentage}% Present</strong>
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Present ({stats.present})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Absent ({stats.absent})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Late ({stats.late})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Leave ({stats.leave})
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-300"
            style={{ width: `${(stats.present / (stats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{ width: `${(stats.absent / (stats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${(stats.late / (stats.total || 1)) * 100}%` }}
          />
          <div
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${(stats.leave / (stats.total || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Faculty Attendance Table Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Academic Staff Duty Register</CardTitle>
              <CardDescription>
                Faculty daily attendance status, arrival timestamps, and designated lecture duties
              </CardDescription>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-400 mr-1">
                Bulk Action:
              </span>
              <button
                type="button"
                onClick={() => handleBulkMark("present")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleBulkMark("late")}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
              >
                Mark All Late
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search teacher, ID, department..."
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
                icon={GraduationCap}
                title="No educators found"
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
                    <TableHead className="w-80 text-center">Duty Status</TableHead>
                    <TableHead className="w-28">Time In</TableHead>
                    <TableHead>Duty Remarks</TableHead>
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
                        >
                          Dept. of {teacher.department}
                        </Badge>
                      </TableCell>

                      {/* Interactive Duty Status Buttons */}
                      <TableCell>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, "present")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              teacher.status === "present"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, "absent")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              teacher.status === "absent"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, "late")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              teacher.status === "late"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            <span>Late</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(teacher.id, "leave")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              teacher.status === "leave"
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Leave</span>
                          </button>
                        </div>
                      </TableCell>

                      {/* Check-In */}
                      <TableCell className="font-mono text-xs font-semibold text-slate-700">
                        {teacher.timeIn}
                      </TableCell>

                      {/* Remarks */}
                      <TableCell>
                        <input
                          type="text"
                          value={teacher.remarks || ""}
                          placeholder="Duty notes or reason..."
                          onChange={(e) => handleRemarkChange(teacher.id, e.target.value)}
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
        title="Confirm Faculty Register Submission"
        description={`Date: ${selectedDate} • Institutional Quorum Audit`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="md" onClick={confirmSaveModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" icon={Save} onClick={handleConfirmSave}>
              Confirm Faculty Sheet
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Total Teaching Faculty:</span>
              <strong className="text-slate-900">{stats.total} Educators</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-emerald-700">Present On Campus:</span>
              <strong className="text-emerald-700">{stats.present} ({stats.percentage}%)</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-rose-700">Unnotified Absent:</span>
              <strong className="text-rose-700">{stats.absent}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-amber-700">Late Arrivals:</span>
              <strong className="text-amber-700">{stats.late}</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-purple-700">Approved Leave:</span>
              <strong className="text-purple-700">{stats.leave}</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Confirming will update faculty HR records and synchronize substitute arrangements if needed.
          </p>
        </div>
      </Modal>

      {/* ATTENDANCE HISTORY LOGS MODAL */}
      <Modal
        isOpen={historyModal.isOpen}
        onClose={historyModal.close}
        title="Faculty Attendance History Logs"
        description="Daily teacher attendance records and department quorums."
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
                <TableHead>Scope</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead className="text-right">Attendance Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendanceHistoryLogs.filter((l) => l.scope.includes("Faculty")).map((log, idx) => (
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
