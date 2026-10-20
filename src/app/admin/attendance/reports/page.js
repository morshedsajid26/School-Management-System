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
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/shared/EmptyState";
import { mockStudents } from "@/data/mock/students";
import { mockClassesList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  CalendarCheck,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Info,
  ExternalLink,
  Phone,
  Mail,
} from "lucide-react";

const MONTHS = [
  { value: "0", label: "January 2026", days: 31 },
  { value: "1", label: "February 2026", days: 28 },
  { value: "2", label: "March 2026", days: 31 },
  { value: "3", label: "April 2026", days: 30 },
  { value: "4", label: "May 2026", days: 31 },
  { value: "5", label: "June 2026", days: 30 },
];

export default function MonthlyAttendanceReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("2"); // March 2026
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [selectedSection, setSelectedSection] = useState("A");
  const [search, setSearch] = useState("");
  const [thresholdFilter, setThresholdFilter] = useState("all"); // 'all', 'low', 'perfect'

  const studentDetailModal = useModal();
  const [activeStudent, setActiveStudent] = useState(null);

  const currentMonthMeta = MONTHS.find((m) => m.value === selectedMonth) || MONTHS[2];
  const totalDaysInMonth = currentMonthMeta.days;

  // Generate deterministic day-by-day attendance for students in selected grade & section
  const monthlyData = useMemo(() => {
    // Filter base students for the grade & section
    const cohort = mockStudents.filter(
      (s) => s.grade === selectedGrade && (selectedSection === "all" || s.section === selectedSection)
    );

    // If cohort is empty, fallback to Grade 10 students with adjusted section
    const activeCohort = cohort.length > 0 ? cohort : mockStudents.slice(0, 6);

    return activeCohort.map((student, idx) => {
      // Deterministic pattern based on student id
      const days = [];
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;
      let workingDays = 0;

      for (let day = 1; day <= totalDaysInMonth; day++) {
        // Weekends: say days 6, 7, 13, 14, 20, 21, 27, 28 are weekends (Friday/Saturday or Sat/Sun)
        const dayOfWeek = (day + 5) % 7; // offset
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

        if (isWeekend) {
          days.push({ day, status: "weekend", label: "H" });
        } else {
          workingDays++;
          // Deterministic seed for variety
          const seed = (student.name.length * 17 + day * 3 + idx * 7) % 100;
          let status = "present";
          let label = "P";

          if (seed < 82) {
            status = "present";
            label = "P";
            presentCount++;
          } else if (seed < 89) {
            status = "late";
            label = "L";
            lateCount++;
            presentCount++; // late still counts as attended
          } else if (seed < 95) {
            status = "absent";
            label = "A";
            absentCount++;
          } else {
            status = "leave";
            label = "LV";
            leaveCount++;
          }

          days.push({ day, status, label });
        }
      }

      const attendancePercentage = workingDays > 0 ? Math.round((presentCount / workingDays) * 100) : 100;

      return {
        ...student,
        workingDays,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        attendancePercentage,
        dailyRecords: days,
      };
    });
  }, [selectedGrade, selectedSection, totalDaysInMonth, selectedMonth]);

  // Filtered by search and threshold
  const filteredStudents = useMemo(() => {
    return monthlyData.filter((student) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.admissionNumber.toLowerCase().includes(query);

      let matchesThreshold = true;
      if (thresholdFilter === "low") {
        matchesThreshold = student.attendancePercentage < 80;
      } else if (thresholdFilter === "perfect") {
        matchesThreshold = student.attendancePercentage === 100;
      }

      return matchesSearch && matchesThreshold;
    });
  }, [monthlyData, search, thresholdFilter]);

  // Aggregate Stats
  const classStats = useMemo(() => {
    if (monthlyData.length === 0) return { avgRate: 0, perfectCount: 0, lowCount: 0, totalWorking: 0 };
    const avg = Math.round(
      monthlyData.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / monthlyData.length
    );
    const perfectCount = monthlyData.filter((s) => s.attendancePercentage >= 95).length;
    const lowCount = monthlyData.filter((s) => s.attendancePercentage < 80).length;
    const totalWorking = monthlyData[0]?.workingDays || 22;

    return { avgRate: avg, perfectCount, lowCount, totalWorking };
  }, [monthlyData]);

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;

    // Header row
    const headers = ["Roll No", "Student Name", "Grade", "Section", "Working Days", "Present", "Absent", "Late", "Attendance %"];
    const rows = filteredStudents.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.grade}"`,
      `"${s.section}"`,
      s.workingDays,
      s.presentCount,
      s.absentCount,
      s.lateCount,
      `"${s.attendancePercentage}%"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${selectedGrade}_${selectedSection}_${currentMonthMeta.label.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Monthly Attendance Reports & Sheets"
        subtitle={`Class-wise 31-day attendance register, individual percentages, and exportable analytics for ${currentMonthMeta.label}`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print Sheet
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Nav Tabs */}
      <AttendanceNavTabs />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Class Average Rate"
          value={`${classStats.avgRate}%`}
          change={`${classStats.avgRate >= 90 ? "+1.4% Good" : "Needs Attention"}`}
          changeType={classStats.avgRate >= 90 ? "positive" : "negative"}
          icon={TrendingUp}
          color="indigo"
        />
        <StatsCard
          title="Working School Days"
          value={`${classStats.totalWorking} Days`}
          change={`Month: ${currentMonthMeta.label.split(" ")[0]}`}
          changeType="neutral"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="High Attendance (≥95%)"
          value={`${classStats.perfectCount} Students`}
          change="Consistent Attendees"
          changeType="positive"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="At-Risk Absentees (<80%)"
          value={`${classStats.lowCount} Students`}
          change={classStats.lowCount > 0 ? "Requires Parent Notice" : "Zero At-Risk"}
          changeType={classStats.lowCount > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Filter and Control Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
            {/* Month Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Class / Cohort
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="Grade 10">Grade 10 (Science)</option>
                <option value="Grade 9">Grade 9 (General)</option>
                <option value="Grade 8">Grade 8 (Middle)</option>
                <option value="Grade 7">Grade 7 (Junior)</option>
                <option value="Grade 6">Grade 6 (Primary)</option>
              </select>
            </div>

            {/* Section Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="all">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Search Student
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name or Roll No..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Performance Threshold Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attendance Filter
              </label>
              <select
                value={thresholdFilter}
                onChange={(e) => setThresholdFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
              >
                <option value="all">All Students</option>
                <option value="low">At-Risk Absentees (&lt;80%)</option>
                <option value="perfect">High Attendance (≥95%)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Matrix Register */}
      <Card className="border-slate-200 overflow-hidden shadow-xs">
        <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-indigo-600" />
              <span>
                Monthly Attendance Register — {selectedGrade} ({selectedSection === "all" ? "All Sections" : `Section ${selectedSection}`})
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Showing records for {filteredStudents.length} students • Days 1 to {totalDaysInMonth} of {currentMonthMeta.label}
            </CardDescription>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">P</span>
              <span className="text-slate-600">Present</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">A</span>
              <span className="text-slate-600">Absent</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">L</span>
              <span className="text-slate-600">Late</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">LV</span>
              <span className="text-slate-600">Leave</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-slate-100 text-slate-400 font-bold text-[10px]">H</span>
              <span className="text-slate-400">Holiday</span>
            </span>
          </div>
        </CardHeader>

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No student attendance records found"
            description="Try adjusting your class, section, or search filters above."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200">
                  <th className="sticky left-0 z-20 bg-slate-100 py-3 px-4 text-left font-bold w-48 shadow-r">
                    Student Details
                  </th>
                  <th className="py-3 px-2 text-center font-bold text-slate-500 w-16">
                    Roll
                  </th>
                  {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((d) => (
                    <th
                      key={d}
                      className="py-2.5 px-1 text-center font-bold text-slate-600 min-w-[28px] border-l border-slate-200/60"
                    >
                      {d}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200">
                    P
                  </th>
                  <th className="py-3 px-2 text-center font-bold text-rose-700 bg-rose-50/50">
                    A
                  </th>
                  <th className="py-3 px-2 text-center font-bold text-amber-700 bg-amber-50/50">
                    L
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-indigo-700 bg-indigo-50/60 border-l border-slate-200">
                    Rate %
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredStudents.map((student) => {
                  const rate = student.attendancePercentage;
                  const rateColor =
                    rate >= 90
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : rate >= 75
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200";

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Sticky Student Name & Avatar */}
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200 shadow-r">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={student.avatar}
                            alt={student.name}
                            fallback={student.name.charAt(0)}
                            size="sm"
                          />
                          <div className="truncate max-w-[140px]">
                            <div className="font-bold text-slate-900 truncate" title={student.name}>
                              {student.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {student.admissionNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roll */}
                      <td className="py-2.5 px-2 text-center font-mono text-slate-500 font-semibold">
                        {student.rollNumber.split("-").pop()}
                      </td>

                      {/* Daily Status Cells */}
                      {student.dailyRecords.map((record) => {
                        let cellClass = "bg-slate-50/60 text-slate-300"; // weekend
                        if (record.status === "present") cellClass = "bg-emerald-100/90 text-emerald-800 font-bold";
                        if (record.status === "absent") cellClass = "bg-rose-100 text-rose-700 font-bold";
                        if (record.status === "late") cellClass = "bg-amber-100 text-amber-800 font-bold";
                        if (record.status === "leave") cellClass = "bg-purple-100 text-purple-800 font-bold";

                        return (
                          <td
                            key={record.day}
                            className="py-1 px-0.5 text-center border-l border-slate-100"
                          >
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] select-none ${cellClass}`}
                              title={`Day ${record.day}: ${record.status.toUpperCase()}`}
                            >
                              {record.label}
                            </span>
                          </td>
                        );
                      })}

                      {/* Summary Columns */}
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-700 bg-emerald-50/30 border-l border-slate-200">
                        {student.presentCount}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-700 bg-rose-50/30">
                        {student.absentCount}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-amber-700 bg-amber-50/30">
                        {student.lateCount}
                      </td>

                      {/* Attendance Rate */}
                      <td className="py-2.5 px-3 text-center border-l border-slate-200">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${rateColor}`}
                        >
                          {rate}%
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setActiveStudent(student);
                            studentDetailModal.open();
                          }}
                          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-semibold"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Student Details Modal */}
      <Modal
        isOpen={studentDetailModal.isOpen}
        onClose={studentDetailModal.close}
        title={activeStudent ? `${activeStudent.name} — Attendance Profile` : "Student Details"}
        size="lg"
      >
        {activeStudent && (
          <div className="space-y-6">
            {/* Student Header Info */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <Avatar
                src={activeStudent.avatar}
                alt={activeStudent.name}
                fallback={activeStudent.name.charAt(0)}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {activeStudent.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Roll: <span className="font-semibold text-slate-700">{activeStudent.rollNumber}</span> • Admission:{" "}
                  <span className="font-semibold text-slate-700">{activeStudent.admissionNumber}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class: <span className="font-semibold text-slate-700">{activeStudent.grade} - Section {activeStudent.section}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600">
                  {activeStudent.attendancePercentage}%
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Attendance Rate
                </div>
              </div>
            </div>

            {/* Attendance Breakdown Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3">
                <div className="text-xl font-bold text-emerald-700">{activeStudent.presentCount}</div>
                <div className="text-[11px] font-semibold text-emerald-600 uppercase">Days Present</div>
              </div>
              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3">
                <div className="text-xl font-bold text-rose-700">{activeStudent.absentCount}</div>
                <div className="text-[11px] font-semibold text-rose-600 uppercase">Days Absent</div>
              </div>
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3">
                <div className="text-xl font-bold text-amber-700">{activeStudent.lateCount}</div>
                <div className="text-[11px] font-semibold text-amber-600 uppercase">Late Arrivals</div>
              </div>
              <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3">
                <div className="text-xl font-bold text-purple-700">{activeStudent.leaveCount}</div>
                <div className="text-[11px] font-semibold text-purple-600 uppercase">Approved Leave</div>
              </div>
            </div>

            {/* Guardian & Emergency Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Guardian & Contact Information
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Emergency Contact:</span>
                  <span className="font-semibold text-slate-800">
                    {activeStudent.emergencyContactName || "Guardian"} ({activeStudent.emergencyRelationship || "Parent"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                    {activeStudent.emergencyContactPhone || activeStudent.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert(`Parent SMS notification alert dispatched to ${activeStudent.emergencyContactPhone || activeStudent.phone}`);
                }}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Send Attendance SMS Alert
              </Button>
              <Button variant="secondary" size="sm" onClick={studentDetailModal.close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
