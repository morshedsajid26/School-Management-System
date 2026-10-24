"use client";

import React, { useState, useMemo } from "react";
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
  mockStudentAttendanceRoster,
  mockAttendanceHistoryLogs,
} from "@/data/mock/attendance";
import { mockClassesList, mockSectionsList } from "@/data/mock/academicStructure";
import { mockAssignmentsList } from "@/data/mock/assignments";
import { mockStudents } from "@/data/mock/students";
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
  History,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  School,
  DoorOpen,
  BookOpen,
  Printer,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  X,
} from "lucide-react";

export default function BatchStudentAttendancePage() {
  // Attendance Date
  const [selectedDate, setSelectedDate] = useState("2026-03-18");

  // Selected Batch & Section
  const [selectedBatch, setSelectedBatch] = useState("Batch 2025");
  const [selectedSection, setSelectedSection] = useState("all"); // "all" or "A", "B", etc.

  // Available sections for the currently selected batch
  const currentBatchMeta = useMemo(() => {
    return mockClassesList.find((c) => c.name === selectedBatch) || mockClassesList[0];
  }, [selectedBatch]);

  const availableSections = useMemo(() => {
    if (currentBatchMeta && currentBatchMeta.sections && currentBatchMeta.sections.length > 0) {
      return currentBatchMeta.sections.map((s) => s.replace("Section ", "").trim());
    }
    return ["A", "B"];
  }, [currentBatchMeta]);

  // Section details for this batch
  const batchSectionDetails = useMemo(() => {
    return mockSectionsList.filter(
      (s) => s.className === selectedBatch || s.batchName === selectedBatch
    );
  }, [selectedBatch]);

  // Course assignments for current batch & section
  const cohortAssignments = useMemo(() => {
    return mockAssignmentsList.filter((a) => {
      const matchBatch = a.batchName === selectedBatch || a.className === selectedBatch;
      const matchSection =
        selectedSection === "all" || a.sectionName.includes(selectedSection);
      return matchBatch && matchSection;
    });
  }, [selectedBatch, selectedSection]);

  const [selectedSubjectCode, setSelectedSubjectCode] = useState("all");

  const currentCourseAssignment = useMemo(() => {
    if (selectedSubjectCode === "all") return null;
    return cohortAssignments.find((a) => a.subjectCode === selectedSubjectCode) || null;
  }, [cohortAssignments, selectedSubjectCode]);

  // Search & Status Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("roster"); // "roster" | "overview"

  // Modals
  const historyModal = useModal();

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Compile full batch roster
  const fullBatchRoster = useMemo(() => {
    // Collect all students for this batch from mockStudentAttendanceRoster & mockStudents
    const rosterMap = new Map();

    // 1. First add matching entries from mockStudentAttendanceRoster
    mockStudentAttendanceRoster.forEach((item) => {
      const itemBatch = item.batchName || item.batch || item.grade;
      if (itemBatch === selectedBatch) {
        rosterMap.set(item.studentId || item.id, {
          ...item,
          batch: selectedBatch,
          submittedBy: item.section === "B" ? "Dr. Catherine Bennett" : "Prof. Marcus Aurel",
          submittedAt: item.section === "B" ? "08:38 AM" : "08:35 AM",
        });
      }
    });

    // 2. Supplement from mockStudents if they belong to this batch
    mockStudents.forEach((student, idx) => {
      const studentBatch = student.batch || student.grade;
      if (studentBatch === selectedBatch && !rosterMap.has(student.id)) {
        // Deterministic status based on attendance rate & index
        let status = "present";
        let timeIn = "08:15 AM";
        let remarks = "On time, active participation";

        if (student.attendanceRate < 90) {
          status = "absent";
          timeIn = "—";
          remarks = "Unexcused absence";
        } else if (idx % 7 === 2) {
          status = "late";
          timeIn = "08:38 AM";
          remarks = "Late arrival due to transit delay";
        } else if (idx % 9 === 4) {
          status = "leave";
          timeIn = "—";
          remarks = "Documented family/medical leave";
        }

        rosterMap.set(student.id, {
          id: `SAR-${student.id}`,
          studentId: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          admissionNumber: student.admissionNumber,
          batch: selectedBatch,
          grade: selectedBatch,
          section: student.section || (idx % 2 === 0 ? "A" : "B"),
          status,
          timeIn,
          remarks,
          avatar: student.avatar,
          submittedBy: student.section === "B" ? "Dr. Catherine Bennett" : "Prof. Marcus Aurel",
          submittedAt: "08:35 AM",
        });
      }
    });

    // If still empty (e.g. for Batch 2028 or Prep), synthesize mock records
    if (rosterMap.size === 0) {
      const defaultCount = currentBatchMeta.studentCount || 10;
      for (let i = 1; i <= Math.min(defaultCount, 8); i++) {
        const sec = i % 2 === 0 ? "B" : "A";
        const id = `SYN-${selectedBatch}-${i}`;
        const isAbsent = i === 3;
        const isLate = i === 5;
        rosterMap.set(id, {
          id,
          studentId: `STU-${selectedBatch}-${i}`,
          name: `Student ${selectedBatch.replace("Batch ", "")}-${sec}-${String(i).padStart(2, "0")}`,
          rollNumber: `B${selectedBatch.slice(-2)}-${sec}-${String(i).padStart(2, "0")}`,
          admissionNumber: `ADM-2025-${String(100 + i)}`,
          batch: selectedBatch,
          grade: selectedBatch,
          section: sec,
          status: isAbsent ? "absent" : isLate ? "late" : "present",
          timeIn: isAbsent ? "—" : isLate ? "08:42 AM" : "08:15 AM",
          remarks: isAbsent ? "Unexcused absence" : isLate ? "Late arrival" : "Standard attendance",
          avatar: null,
          submittedBy: currentBatchMeta.classTeacher || "Assigned Faculty",
          submittedAt: "08:30 AM",
        });
      }
    }

    return Array.from(rosterMap.values());
  }, [selectedBatch, currentBatchMeta]);

  // Filter roster by section if specific section is selected
  const cohortRoster = useMemo(() => {
    return fullBatchRoster.filter((student) => {
      if (selectedSection === "all") return true;
      return student.section === selectedSection;
    });
  }, [fullBatchRoster, selectedSection]);

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

  // Aggregate Batch Metrics
  const cohortStats = useMemo(() => {
    const total = cohortRoster.length;
    const present = cohortRoster.filter((s) => s.status === "present").length;
    const absent = cohortRoster.filter((s) => s.status === "absent").length;
    const late = cohortRoster.filter((s) => s.status === "late").length;
    const leave = cohortRoster.filter((s) => s.status === "leave").length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, leave, percentage };
  }, [cohortRoster]);

  // Section comparison breakdown for this batch
  const sectionBreakdowns = useMemo(() => {
    return availableSections.map((sec) => {
      const secStudents = fullBatchRoster.filter((s) => s.section === sec);
      const total = secStudents.length;
      const present = secStudents.filter((s) => s.status === "present").length;
      const absent = secStudents.filter((s) => s.status === "absent").length;
      const late = secStudents.filter((s) => s.status === "late").length;
      const leave = secStudents.filter((s) => s.status === "leave").length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      const secMeta = batchSectionDetails.find((s) => s.name === `Section ${sec}`);

      return {
        section: sec,
        total,
        present,
        absent,
        late,
        leave,
        rate,
        room: secMeta?.room || `Hall ${sec}`,
        teacher: secMeta?.classTeacher || currentBatchMeta.classTeacher || "Class Faculty",
        submittedAt: sec === "B" ? "08:38 AM" : "08:35 AM",
        status: "Submitted",
      };
    });
  }, [availableSections, fullBatchRoster, batchSectionDetails, currentBatchMeta]);

  // Quick Date Navigation
  const changeDateByDays = (days) => {
    const parts = selectedDate.split("-");
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setDate(d.getDate() + days);
    const newStr = d.toISOString().split("T")[0];
    setSelectedDate(newStr);
  };

  // CSV Export for Batch
  const handleExportBatchCSV = () => {
    if (displayedRecords.length === 0) {
      showToast("No attendance records to export.", "error");
      return;
    }

    const headers = [
      "Roll No",
      "Student Name",
      "Admission No",
      "Batch",
      "Section",
      "Attendance Status",
      "Check-In Time",
      "Documented Notes / Excuse",
      "Submitted By Faculty",
    ];

    const rows = displayedRecords.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.admissionNumber || ""}"`,
      `"${selectedBatch}"`,
      `"Section ${s.section}"`,
      `"${s.status.toUpperCase()}"`,
      `"${s.timeIn}"`,
      `"${(s.remarks || "").replace(/"/g, '""')}"`,
      `"${s.submittedBy || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Batch_Attendance_${selectedBatch.replace(/\s+/g, "_")}_${selectedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${displayedRecords.length} student attendance records for ${selectedBatch}.`);
  };

  // Print Batch Sheet
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
              : "bg-slate-900 text-white border-slate-800"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
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
        title="Batch-Wise Student Attendance"
        subtitle="Institutional monitoring of student attendance records submitted by teachers across academic batches and sections."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="indigo" size="md" className="font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin View Only</span>
            </Badge>

            <Button
              variant="outline"
              size="md"
              icon={History}
              onClick={historyModal.open}
            >
              Attendance Logs
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
              onClick={handleExportBatchCSV}
            >
              Export Batch CSV
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <AttendanceNavTabs />

      {/* Read-Only Notice & Faculty Attribution Alert */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Read-Only Institutional Access
            </h4>
            <p className="text-slate-600">
              Student attendance is recorded and submitted by assigned subject teachers in the Teacher Portal. Administrators monitor, filter, and audit batch-wise attendance.
            </p>
          </div>
        </div>

        <Link
          href="/teacher/attendance"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 hover:border-indigo-300 transition shrink-0 shadow-2xs"
        >
          <span>Open Teacher Roll Call</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Attendance Control & Batch Selector Bar */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Date Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                Date:
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

            {/* Batch & Section Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Batch Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                  <School className="h-3.5 w-3.5" />
                  <span>Batch:</span>
                </span>
                <select
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setSelectedSection("all");
                    setSelectedSubjectCode("all");
                  }}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {mockClassesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.stream || "General"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                  <DoorOpen className="h-3.5 w-3.5" />
                  <span>Section:</span>
                </span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Sections (Batch Overview)</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course / Subject Filter */}
              {cohortAssignments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Period:</span>
                  </span>
                  <select
                    value={selectedSubjectCode}
                    onChange={(e) => setSelectedSubjectCode(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[220px] truncate cursor-pointer"
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

            {/* Batch Info Header Footer */}
            <div className="w-full mt-2 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg">
                  <School className="h-3.5 w-3.5 text-indigo-300" />
                  <span>{currentBatchMeta.name}</span>
                </span>
                <span>• Academic Year: <strong className="text-white">{currentBatchMeta.academicYear || "2025-2026"}</strong></span>
                <span>• Class Teacher: <strong className="text-white">{currentBatchMeta.classTeacher}</strong></span>
                <span>• Total Capacity: <strong className="text-white">{currentBatchMeta.studentCount || cohortStats.total} Students</strong></span>
              </div>

              <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-lg font-medium text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Attendance Verified & Submitted by Faculty</span>
              </div>
            </div>
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
          description={
            selectedSection === "all"
              ? `${selectedBatch} (All Sections)`
              : `${selectedBatch} - Section ${selectedSection}`
          }
        />
        <StatsCard
          title="Present"
          value={cohortStats.present}
          icon={CheckCircle2}
          variant="emerald"
          description={`${cohortStats.percentage}% batch attendance`}
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
            <span>{selectedBatch} Attendance Distribution:</span>
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

      {/* Section-Wise Comparison Cards (Batch Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-600" />
            <span>Section Breakdown for {selectedBatch}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {sectionBreakdowns.length} Sections Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sectionBreakdowns.map((sec) => {
            const isSelected = selectedSection === sec.section;
            return (
              <div
                key={sec.section}
                onClick={() => setSelectedSection(sec.section)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/70 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Section {sec.section}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {sec.room}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {sec.rate}% Rate
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-3">
                  Class Teacher: <span className="font-semibold text-slate-700">{sec.teacher}</span>
                </div>

                {/* Section mini stats */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total</span>
                    <span className="text-xs font-bold text-slate-800">{sec.total}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 block font-medium">Present</span>
                    <span className="text-xs font-bold text-emerald-700">{sec.present}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 block font-medium">Absent</span>
                    <span className="text-xs font-bold text-rose-700">{sec.absent}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 block font-medium">Late</span>
                    <span className="text-xs font-bold text-amber-700">{sec.late}</span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Submitted at {sec.submittedAt}
                  </span>
                  <span className="text-indigo-600 font-semibold hover:underline">
                    {isSelected ? "Active View" : "Filter Section →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Batch Attendance Roster Table Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>
                  {selectedBatch} Attendance Register
                </CardTitle>
                <Badge variant={selectedSection === "all" ? "indigo" : "slate"} size="sm">
                  {selectedSection === "all" ? "All Sections" : `Section ${selectedSection}`}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                View verified student attendance statuses, check-in timestamps, and documented notes submitted by class teachers.
              </CardDescription>
            </div>

            {/* View Mode Toggle & Reset Filter */}
            <div className="flex items-center gap-2">
              {selectedSection !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedSection("all")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  Show All Sections
                </button>
              )}

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportBatchCSV}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Quick Filters / Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search student or roll number..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">Status Filter:</span>
              <div className="flex items-center gap-1">
                {["all", "present", "absent", "late", "leave"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition capitalize ${
                      statusFilter === st
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "leave" ? "On Leave" : st}
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
                title="No students found in this batch query"
                description="Try clearing your search query or selecting a different batch section."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("all");
                      setSelectedSection("all");
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
                    <TableHead className="w-16">Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="w-24">Section</TableHead>
                    <TableHead className="w-44 text-center">Attendance Status</TableHead>
                    <TableHead className="w-28 text-center">Check-In</TableHead>
                    <TableHead>Documented Reason / Remarks</TableHead>
                    <TableHead className="w-48">Submitted By</TableHead>
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

                      {/* Section Badge */}
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                          Sec {student.section}
                        </span>
                      </TableCell>

                      {/* Read-Only Status Indicator Badge */}
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center">
                          {student.status === "present" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Present</span>
                            </span>
                          )}
                          {student.status === "absent" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>Absent</span>
                            </span>
                          )}
                          {student.status === "late" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              <span>Late</span>
                            </span>
                          )}
                          {student.status === "leave" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              <Calendar className="h-3.5 w-3.5 text-purple-600" />
                              <span>On Leave</span>
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Time In */}
                      <TableCell className="text-center font-mono text-xs font-semibold text-slate-600">
                        {student.timeIn}
                      </TableCell>

                      {/* Remarks (Read-Only) */}
                      <TableCell>
                        <span
                          className={`text-xs ${
                            student.remarks
                              ? "text-slate-700 font-medium"
                              : "text-slate-400 italic"
                          }`}
                        >
                          {student.remarks || "No incident notes recorded"}
                        </span>
                      </TableCell>

                      {/* Submitted By Teacher info */}
                      <TableCell>
                        <div className="text-xs">
                          <span className="font-semibold text-slate-800 block">
                            {student.submittedBy}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Logged at {student.submittedAt}
                          </span>
                        </div>
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
        title="Institutional Attendance History Logs"
        description="Historical batch logs and multi-day attendance trends across departments."
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
