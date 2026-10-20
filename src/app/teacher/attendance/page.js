"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import { mockAssignmentsList } from "@/data/mock/assignments";
import { mockTeachers } from "@/data/mock/teachers";
import { mockStudentAttendanceRoster } from "@/data/mock/attendance";
import { mockStudents } from "@/data/mock/students";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/hooks/useModal";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Users,
  Check,
  Search,
  ArrowRight,
  Save,
  AlertCircle,
  Calendar,
  School,
  FileCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export default function TeacherCourseAttendancePage() {
  const { currentUser } = useAuth();

  // Allow switching teacher view for testing & flexibility (default to Prof. Marcus Aurel or logged in user)
  const [selectedTeacherId, setSelectedTeacherId] = useState("TCH-001");
  const activeTeacher = useMemo(() => {
    return mockTeachers.find((t) => t.id === selectedTeacherId) || mockTeachers[0];
  }, [selectedTeacherId]);

  // Assigned courses for this teacher
  const teacherCourses = useMemo(() => {
    return mockAssignmentsList.filter((a) => a.teacherId === selectedTeacherId);
  }, [selectedTeacherId]);

  // Selected assignment/course
  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    return teacherCourses[0]?.id || "ASN-001";
  });

  // Ensure selectedCourseId updates if teacher changes
  const activeCourse = useMemo(() => {
    return teacherCourses.find((c) => c.id === selectedCourseId) || teacherCourses[0] || mockAssignmentsList[0];
  }, [teacherCourses, selectedCourseId]);

  // Date & Period
  const [selectedDate, setSelectedDate] = useState("2026-03-18");
  const [selectedPeriod, setSelectedPeriod] = useState("Period 1 (08:30 AM - 09:30 AM)");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Local Attendance State per course
  const [roster, setRoster] = useState(() => {
    // Merge mock roster with mockStudents
    return mockStudents.map((s, idx) => ({
      id: s.id,
      name: s.name,
      rollNumber: s.rollNumber,
      admissionNumber: s.admissionNumber,
      grade: s.grade,
      section: s.section,
      avatar: s.avatar,
      status: idx === 2 ? "late" : idx === 4 ? "absent" : "present",
      timeIn: idx === 2 ? "08:38 AM" : idx === 4 ? "—" : "08:25 AM",
      remarks: idx === 2 ? "Late due to bus delay" : "",
    }));
  });

  // Submission tracking
  const [submittedCourses, setSubmittedCourses] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filter roster for active course's class and section
  const currentClassRoster = useMemo(() => {
    if (!activeCourse) return [];
    return roster.filter(
      (s) => s.grade === activeCourse.className && s.section === activeCourse.sectionName.replace("Section ", "")
    );
  }, [roster, activeCourse]);

  // Filtered displayed students
  const displayedStudents = useMemo(() => {
    return currentClassRoster.filter((student) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.rollNumber.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [currentClassRoster, search, statusFilter]);

  // Dynamic Roster Stats
  const stats = useMemo(() => {
    const total = currentClassRoster.length;
    const present = currentClassRoster.filter((s) => s.status === "present").length;
    const absent = currentClassRoster.filter((s) => s.status === "absent").length;
    const late = currentClassRoster.filter((s) => s.status === "late").length;
    const leave = currentClassRoster.filter((s) => s.status === "leave").length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, leave, rate };
  }, [currentClassRoster]);

  // Toggle single student status
  const handleStatusChange = (studentId, newStatus) => {
    setRoster((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          let timeIn = s.timeIn;
          if (newStatus === "present" && (timeIn === "—" || !timeIn)) timeIn = "08:30 AM";
          if (newStatus === "late") timeIn = "08:42 AM";
          if (newStatus === "absent" || newStatus === "leave") timeIn = "—";
          return { ...s, status: newStatus, timeIn };
        }
        return s;
      })
    );
  };

  // Change individual student remarks
  const handleRemarksChange = (studentId, remarks) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  };

  // Bulk status update
  const handleBulkMark = (status) => {
    if (!activeCourse) return;
    const targetSection = activeCourse.sectionName.replace("Section ", "");
    setRoster((prev) =>
      prev.map((s) => {
        if (s.grade === activeCourse.className && s.section === targetSection) {
          return {
            ...s,
            status,
            timeIn: status === "present" ? "08:30 AM" : status === "late" ? "08:45 AM" : "—",
          };
        }
        return s;
      })
    );
    showToast(`Marked all students in ${activeCourse.className} - ${activeCourse.sectionName} as ${status.toUpperCase()}.`, "info");
  };

  // Submit course attendance
  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    if (!activeCourse) return;

    setSubmittedCourses((prev) => ({
      ...prev,
      [activeCourse.id]: {
        submittedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        teacherName: activeTeacher.name,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        rate: stats.rate,
      },
    }));

    showToast(
      `Attendance for ${activeCourse.subjectName} (${activeCourse.className}-${activeCourse.sectionName}) successfully submitted by ${activeTeacher.name}!`,
      "success"
    );
  };

  const isCurrentCourseSubmitted = Boolean(submittedCourses[activeCourse?.id]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-slate-900/30 border border-slate-700 animate-slide-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage.msg}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Faculty Course Attendance"
        subtitle="Mark period-by-period attendance for your assigned subjects and student cohorts"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Faculty:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                // switch to first course of new teacher
                const newCourses = mockAssignmentsList.filter((a) => a.teacherId === e.target.value);
                if (newCourses.length > 0) setSelectedCourseId(newCourses[0].id);
              }}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs focus:ring-2 focus:ring-indigo-500"
            >
              {mockTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Assigned Courses Tabs / Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            <span>Assigned Courses for {activeTeacher.name}</span>
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {teacherCourses.length} Assigned {teacherCourses.length === 1 ? "Class" : "Classes"}
          </span>
        </div>

        {teacherCourses.length === 0 ? (
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
            No courses assigned to this faculty member yet. Admin can assign courses from{" "}
            <a href="/admin/assignments" className="underline font-bold">
              Teacher Course Assignment
            </a>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {teacherCourses.map((c) => {
              const isSelected = c.id === activeCourse?.id;
              const isSubmitted = Boolean(submittedCourses[c.id]);

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600/30"
                      : "bg-white text-slate-800 border-slate-200/90 hover:border-indigo-400 hover:shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.subjectCode}
                      </span>
                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <Check className="h-3 w-3" /> Submitted
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          Pending
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold text-sm leading-snug line-clamp-1 ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {c.subjectName}
                    </h4>
                    <p className={`text-xs mt-1 font-medium ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                      {c.className} • {c.sectionName}
                    </p>
                  </div>

                  <div className={`mt-3 pt-2 text-[11px] border-t flex items-center justify-between ${
                    isSelected ? "border-indigo-500 text-indigo-100" : "border-slate-100 text-slate-400"
                  }`}>
                    <span>{c.room}</span>
                    <span>{c.periodsPerWeek} periods/wk</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Session Control Panel */}
      {activeCourse && (
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="indigo" size="sm">
                  {activeCourse.subjectCode}
                </Badge>
                <CardTitle className="text-base font-bold text-slate-900">
                  {activeCourse.subjectName} — {activeCourse.className} ({activeCourse.sectionName})
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Room: <span className="font-semibold text-slate-700">{activeCourse.room}</span> • Assigned Teacher:{" "}
                <span className="font-semibold text-slate-700">{activeTeacher.name}</span>
              </CardDescription>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Date Input */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Period 1 (08:30 AM - 09:30 AM)">Period 1 (08:30 AM - 09:30 AM)</option>
                <option value="Period 2 (09:45 AM - 10:45 AM)">Period 2 (09:45 AM - 10:45 AM)</option>
                <option value="Period 3 (11:00 AM - 12:00 PM)">Period 3 (11:00 AM - 12:00 PM)</option>
                <option value="Period 4 (01:00 PM - 02:00 PM)">Period 4 (01:00 PM - 02:00 PM)</option>
                <option value="Period 5 (02:15 PM - 03:15 PM)">Period 5 (02:15 PM - 03:15 PM)</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Live Metrics for this Session */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Students
                </span>
                <span className="text-xl font-black text-slate-800">{stats.total}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Present
                </span>
                <span className="text-xl font-black text-emerald-700">{stats.present}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                  Absent
                </span>
                <span className="text-xl font-black text-rose-700">{stats.absent}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
                  Attendance Rate
                </span>
                <span className="text-xl font-black text-amber-700">{stats.rate}%</span>
              </div>
            </div>

            {/* Quick Actions & Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Bulk Mark:</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleBulkMark("present")}
                  className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  All Present
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleBulkMark("absent")}
                  className="text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  All Absent
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                  <option value="late">Late Only</option>
                </select>
              </div>
            </div>

            {/* Student Roll Call Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-3 text-center font-bold w-14">Roll</th>
                    <th className="py-3 px-4 text-left font-bold">Student Name</th>
                    <th className="py-3 px-4 text-center font-bold">Mark Attendance</th>
                    <th className="py-3 px-3 text-center font-bold w-24">Arrival Time</th>
                    <th className="py-3 px-4 text-left font-bold">Session Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      {/* Roll */}
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-500">
                        {student.rollNumber.split("-").pop()}
                      </td>

                      {/* Student info */}
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={student.avatar}
                            alt={student.name}
                            fallback={student.name.charAt(0)}
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {student.admissionNumber}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "present")}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                              student.status === "present"
                                ? "bg-emerald-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-emerald-700"
                            }`}
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "absent")}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                              student.status === "absent"
                                ? "bg-rose-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-rose-700"
                            }`}
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "late")}
                            className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                              student.status === "late"
                                ? "bg-amber-500 text-white shadow-2xs"
                                : "text-slate-600 hover:text-amber-700"
                            }`}
                          >
                            L
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "leave")}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                              student.status === "leave"
                                ? "bg-purple-600 text-white shadow-2xs"
                                : "text-slate-600 hover:text-purple-700"
                            }`}
                          >
                            LV
                          </button>
                        </div>
                      </td>

                      {/* Arrival Time */}
                      <td className="py-2.5 px-3 text-center font-mono text-xs text-slate-600">
                        {student.timeIn}
                      </td>

                      {/* Remarks */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="Note (e.g. lab performance, test score)..."
                          value={student.remarks || ""}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                <span>
                  Recording as: <strong className="text-slate-800">{activeTeacher.name}</strong> • Subject:{" "}
                  <strong className="text-slate-800">{activeCourse.subjectName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {isCurrentCourseSubmitted && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Already Submitted Today
                  </span>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmitAttendance}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Submit Period Attendance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
