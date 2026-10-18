"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import AcademicNavTabs from "@/components/shared/AcademicNavTabs";
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
  PERIODS_CONFIG,
  DAYS_OF_WEEK,
  mockTimetableEntries,
} from "@/data/mock/timetable";
import { mockTeachers } from "@/data/mock/teachers";
import { mockClassesList, mockSectionsList, mockSubjectsList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Printer,
  Clock,
  Building,
  School,
  User,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Grid,
  List,
  Sparkles,
  MapPin,
  Coffee,
  X,
} from "lucide-react";

export default function ClassTimetablePage() {
  const [entries, setEntries] = useState(mockTimetableEntries);

  // View Filter Mode: "class" | "teacher"
  const [viewMode, setViewMode] = useState("class");
  // Presentation layout: "grid" | "list"
  const [layoutMode, setLayoutMode] = useState("grid");

  // Selected Class & Section for "class" view
  const [selectedClassId, setSelectedClassId] = useState("CLS-10");
  const [selectedSectionId, setSelectedSectionId] = useState("SEC-10A");

  // Selected Teacher for "teacher" view
  const [selectedTeacherId, setSelectedTeacherId] = useState("TCH-001");

  // List search & filters
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");

  // Modals
  const routineModal = useModal();
  const deleteModal = useModal();

  // Active target
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    day: "Monday",
    period: 1,
    startTime: "08:30",
    endTime: "09:20",
    classId: "CLS-10",
    sectionId: "SEC-10A",
    subjectId: "SUB-101",
    teacherId: "TCH-001",
    room: "Science Hall 201",
  });
  const [formErrors, setFormErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState(null);

  // Sections dynamically filtered for form
  const availableSectionsForForm = useMemo(() => {
    return mockSectionsList.filter((s) => s.classId === formData.classId);
  }, [formData.classId]);

  // Sections filtered for header view
  const availableSectionsForView = useMemo(() => {
    return mockSectionsList.filter((s) => s.classId === selectedClassId);
  }, [selectedClassId]);

  // Calculated Stats
  const stats = useMemo(() => {
    const totalPeriods = entries.length;
    const activeFaculty = new Set(entries.map((e) => e.teacherId)).size;
    const activeRooms = new Set(entries.map((e) => e.room)).size;
    const activeCohorts = new Set(entries.map((e) => `${e.classId}-${e.sectionId}`)).size;

    return { totalPeriods, activeFaculty, activeRooms, activeCohorts };
  }, [entries]);

  // Filtered entries for current view
  const currentViewEntries = useMemo(() => {
    if (viewMode === "class") {
      return entries.filter(
        (e) => e.classId === selectedClassId && e.sectionId === selectedSectionId
      );
    } else {
      return entries.filter((e) => e.teacherId === selectedTeacherId);
    }
  }, [entries, viewMode, selectedClassId, selectedSectionId, selectedTeacherId]);

  // Filtered entries for List Layout
  const listEntries = useMemo(() => {
    return entries.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.subjectName.toLowerCase().includes(query) ||
        item.subjectCode.toLowerCase().includes(query) ||
        item.teacherName.toLowerCase().includes(query) ||
        item.className.toLowerCase().includes(query) ||
        item.sectionName.toLowerCase().includes(query) ||
        item.room.toLowerCase().includes(query);

      const matchesDay = dayFilter === "all" || item.day === dayFilter;
      return matchesSearch && matchesDay;
    });
  }, [entries, search, dayFilter]);

  // Conflict Detection Engine
  const checkConflict = (day, period, teacherId, room, classId, sectionId, ignoreId = null) => {
    // 1. Teacher Conflict (same teacher scheduled in another class/section on the same day & period)
    const teacherConflict = entries.find(
      (e) =>
        e.day === day &&
        Number(e.period) === Number(period) &&
        e.teacherId === teacherId &&
        e.id !== ignoreId
    );

    if (teacherConflict) {
      return {
        type: "TEACHER_CLASH",
        title: "Instructor Schedule Clash",
        message: `${teacherConflict.teacherName} is already lecturing ${teacherConflict.className} ${teacherConflict.sectionName} (${teacherConflict.subjectCode}) in ${teacherConflict.room} on ${day} Period ${period}.`,
        conflict: teacherConflict,
      };
    }

    // 2. Room Conflict (same room occupied on the same day & period)
    const roomConflict = entries.find(
      (e) =>
        e.day === day &&
        Number(e.period) === Number(period) &&
        e.room.toLowerCase().trim() === room.toLowerCase().trim() &&
        e.id !== ignoreId
    );

    if (roomConflict) {
      return {
        type: "ROOM_CLASH",
        title: "Lecture Venue Double-Booking",
        message: `${roomConflict.room} is already booked by ${roomConflict.teacherName} for ${roomConflict.className} ${roomConflict.sectionName} on ${day} Period ${period}.`,
        conflict: roomConflict,
      };
    }

    // 3. Cohort Section Conflict (same class & section already has another subject scheduled)
    const cohortConflict = entries.find(
      (e) =>
        e.day === day &&
        Number(e.period) === Number(period) &&
        e.classId === classId &&
        e.sectionId === sectionId &&
        e.id !== ignoreId
    );

    if (cohortConflict) {
      return {
        type: "COHORT_CLASH",
        title: "Class Period Conflict",
        message: `${cohortConflict.className} ${cohortConflict.sectionName} already has ${cohortConflict.subjectName} with ${cohortConflict.teacherName} scheduled for ${day} Period ${period}.`,
        conflict: cohortConflict,
      };
    }

    return null;
  };

  // Open Create Modal (optionally prefilled with day & period)
  const handleOpenCreate = (prefillDay = "Monday", prefillPeriod = 1) => {
    setIsEditing(false);
    setEditingId(null);

    const periodConfig = PERIODS_CONFIG.find((p) => p.period === prefillPeriod) || PERIODS_CONFIG[0];
    const initialClass = mockClassesList[0]?.id || "CLS-10";
    const initialSections = mockSectionsList.filter((s) => s.classId === initialClass);
    const initialSec = initialSections[0] || mockSectionsList[0];

    setFormData({
      day: prefillDay,
      period: prefillPeriod,
      startTime: periodConfig.startTime,
      endTime: periodConfig.endTime,
      classId: viewMode === "class" ? selectedClassId : initialClass,
      sectionId: viewMode === "class" ? selectedSectionId : initialSec.id,
      subjectId: mockSubjectsList[0]?.id || "SUB-101",
      teacherId: viewMode === "teacher" ? selectedTeacherId : mockTeachers[0]?.id || "TCH-001",
      room: initialSec?.room || "Science Hall 201",
    });
    setFormErrors({});
    setConflictWarning(null);
    routineModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (entry) => {
    setIsEditing(true);
    setEditingId(entry.id);
    setFormData({
      day: entry.day,
      period: entry.period,
      startTime: entry.startTime,
      endTime: entry.endTime,
      classId: entry.classId,
      sectionId: entry.sectionId,
      subjectId: entry.subjectId,
      teacherId: entry.teacherId,
      room: entry.room,
    });
    setFormErrors({});
    setConflictWarning(null);
    routineModal.open();
  };

  // Open Delete Modal
  const handleOpenDelete = (entry) => {
    setSelectedEntry(entry);
    deleteModal.open();
  };

  // Period change handler (auto-fills preset start and end times)
  const handlePeriodChange = (periodNum) => {
    const config = PERIODS_CONFIG.find((p) => p.period === Number(periodNum));
    const newStart = config ? config.startTime : formData.startTime;
    const newEnd = config ? config.endTime : formData.endTime;

    setFormData((prev) => ({
      ...prev,
      period: Number(periodNum),
      startTime: newStart,
      endTime: newEnd,
    }));

    // Trigger real-time conflict check
    const conflict = checkConflict(
      formData.day,
      Number(periodNum),
      formData.teacherId,
      formData.room,
      formData.classId,
      formData.sectionId,
      isEditing ? editingId : null
    );
    setConflictWarning(conflict);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.day) errors.day = "Day is required";
    if (!formData.period) errors.period = "Period is required";
    if (!formData.classId) errors.classId = "Class is required";
    if (!formData.sectionId) errors.sectionId = "Section is required";
    if (!formData.subjectId) errors.subjectId = "Subject is required";
    if (!formData.teacherId) errors.teacherId = "Teacher is required";
    if (!formData.room.trim()) errors.room = "Room / Venue is required";

    // Clash validation
    const conflict = checkConflict(
      formData.day,
      formData.period,
      formData.teacherId,
      formData.room,
      formData.classId,
      formData.sectionId,
      isEditing ? editingId : null
    );

    if (conflict) {
      setConflictWarning(conflict);
      errors.conflict = conflict.message;
    } else {
      setConflictWarning(null);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save routine slot
  const handleSaveRoutine = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const classObj = mockClassesList.find((c) => c.id === formData.classId) || {};
    const sectionObj = mockSectionsList.find((s) => s.id === formData.sectionId) || {};
    const subjectObj = mockSubjectsList.find((sub) => sub.id === formData.subjectId) || {};
    const teacherObj = mockTeachers.find((t) => t.id === formData.teacherId) || {};

    const colorPalette = {
      Science: "blue",
      Mathematics: "indigo",
      Humanities: "amber",
      Technology: "purple",
      Athletics: "rose",
    };
    const color = colorPalette[subjectObj.department] || "indigo";

    const payload = {
      day: formData.day,
      period: Number(formData.period),
      startTime: formData.startTime,
      endTime: formData.endTime,
      classId: formData.classId,
      className: classObj.name || "Grade 10",
      sectionId: formData.sectionId,
      sectionName: sectionObj.name || "Section A",
      subjectId: formData.subjectId,
      subjectName: subjectObj.name || "Subject",
      subjectCode: subjectObj.code || "SUB",
      teacherId: formData.teacherId,
      teacherName: teacherObj.name || "Faculty Member",
      room: formData.room,
      color,
    };

    if (isEditing) {
      setEntries((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
      );
      showToast(`Updated routine slot: ${payload.subjectName} (${payload.day} Period ${payload.period}).`);
    } else {
      const newEntry = {
        id: `ROUT-${String(entries.length + 1).padStart(3, "0")}`,
        ...payload,
      };
      setEntries((prev) => [...prev, newEntry]);
      showToast(`Scheduled ${payload.subjectName} for ${payload.day} Period ${payload.period}!`);
    }

    routineModal.close();
  };

  // Delete routine slot
  const handleConfirmDelete = () => {
    if (!selectedEntry) return;
    setEntries((prev) => prev.filter((item) => item.id !== selectedEntry.id));
    deleteModal.close();
    showToast(`Removed routine slot for ${selectedEntry.subjectName} (${selectedEntry.day} Period ${selectedEntry.period}).`, "info");
  };

  const handlePrint = () => {
    window.print();
  };

  // Find slot for day and period in current filtered view
  const findSlot = (day, periodNum) => {
    return currentViewEntries.find(
      (e) => e.day === day && Number(e.period) === Number(periodNum)
    );
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
        title="Class Routine & Timetable"
        subtitle="Manage weekly period schedules by class, section, or educator with automated clash detection."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={Printer}
              onClick={handlePrint}
            >
              Print Routine
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => handleOpenCreate("Monday", 1)}
            >
              Add Routine Slot
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <AcademicNavTabs />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Scheduled Periods"
          value={stats.totalPeriods}
          icon={CalendarDays}
          variant="indigo"
          description="Active instructional periods"
        />
        <StatsCard
          title="Teaching Educators"
          value={stats.activeFaculty}
          icon={User}
          variant="emerald"
          description="Faculty on active timetable"
        />
        <StatsCard
          title="Venues & Labs"
          value={stats.activeRooms}
          icon={Building}
          variant="purple"
          description="Designated lecture halls"
        />
        <StatsCard
          title="Active Cohorts"
          value={stats.activeCohorts}
          icon={School}
          variant="amber"
          description="Class sections scheduled"
        />
      </div>

      {/* Timetable Control Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                View By:
              </span>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setViewMode("class")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === "class"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <School className="h-3.5 w-3.5" />
                  <span>Class & Section</span>
                </button>
                <button
                  onClick={() => setViewMode("teacher")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === "teacher"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Educator Schedule</span>
                </button>
              </div>
            </div>

            {/* Target Selectors based on View Mode */}
            <div className="flex flex-wrap items-center gap-3">
              {viewMode === "class" ? (
                <>
                  <div className="w-36">
                    <Select
                      value={selectedClassId}
                      onChange={(e) => {
                        const newClass = e.target.value;
                        setSelectedClassId(newClass);
                        const sec = mockSectionsList.filter((s) => s.classId === newClass)[0];
                        if (sec) setSelectedSectionId(sec.id);
                      }}
                      options={mockClassesList.map((c) => ({ label: c.name, value: c.id }))}
                    />
                  </div>

                  <div className="w-36">
                    <Select
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      options={availableSectionsForView.map((s) => ({
                        label: `${s.name}`,
                        value: s.id,
                      }))}
                    />
                  </div>
                </>
              ) : (
                <div className="w-64">
                  <Select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    options={mockTeachers.map((t) => ({
                      label: `${t.name} (${t.department})`,
                      value: t.id,
                    }))}
                  />
                </div>
              )}

              {/* Layout Switcher (Grid vs List) */}
              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                <button
                  onClick={() => setLayoutMode("grid")}
                  title="Weekly Grid View"
                  className={`p-1.5 rounded-lg transition ${
                    layoutMode === "grid"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayoutMode("list")}
                  title="List View"
                  className={`p-1.5 rounded-lg transition ${
                    layoutMode === "list"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {layoutMode === "grid" ? (
            /* WEEKLY TIMETABLE GRID */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200">
                    <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-36 border-r border-slate-200">
                      Period / Time
                    </th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th
                        key={day}
                        className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-700 border-r border-slate-200 last:border-r-0"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {PERIODS_CONFIG.map((periodConfig) => {
                    // Render Recess or Lunch Break Row
                    if (periodConfig.isBreak) {
                      return (
                        <tr
                          key={periodConfig.period}
                          className="bg-slate-100/60 text-slate-600"
                        >
                          <td className="py-2.5 px-4 text-xs font-semibold border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <Coffee className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                              <span className="font-bold text-slate-700">{periodConfig.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {periodConfig.startTime} - {periodConfig.endTime}
                            </span>
                          </td>
                          <td
                            colSpan={DAYS_OF_WEEK.length}
                            className="py-2 px-4 text-center text-xs font-medium text-slate-500 italic bg-amber-50/30 tracking-wider"
                          >
                            — {periodConfig.name} ({periodConfig.startTime} - {periodConfig.endTime}) —
                          </td>
                        </tr>
                      );
                    }

                    // Render Standard Period Row
                    return (
                      <tr key={periodConfig.period} className="hover:bg-slate-50/30 transition">
                        {/* Period Column */}
                        <td className="py-3 px-4 border-r border-slate-200 bg-slate-50/30 align-top">
                          <span className="text-xs font-bold text-slate-900 block">
                            {periodConfig.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            {periodConfig.startTime} - {periodConfig.endTime}
                          </span>
                        </td>

                        {/* Days Columns */}
                        {DAYS_OF_WEEK.map((day) => {
                          const slot = findSlot(day, periodConfig.period);

                          return (
                            <td
                              key={day}
                              className="p-2 border-r border-slate-200 last:border-r-0 align-top h-24"
                            >
                              {slot ? (
                                <div
                                  className={`h-full p-2.5 rounded-xl border transition shadow-2xs group relative flex flex-col justify-between ${
                                    slot.color === "blue"
                                      ? "bg-blue-50/70 border-blue-200 text-blue-900"
                                      : slot.color === "emerald"
                                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                                      : slot.color === "amber"
                                      ? "bg-amber-50/70 border-amber-200 text-amber-900"
                                      : slot.color === "purple"
                                      ? "bg-purple-50/70 border-purple-200 text-purple-900"
                                      : slot.color === "rose"
                                      ? "bg-rose-50/70 border-rose-200 text-rose-900"
                                      : "bg-indigo-50/70 border-indigo-200 text-indigo-900"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="font-mono text-[10px] font-bold px-1 rounded bg-white/70">
                                        {slot.subjectCode}
                                      </span>
                                      <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                                        <button
                                          onClick={() => handleOpenEdit(slot)}
                                          title="Edit Slot"
                                          className="p-1 hover:bg-white rounded text-slate-600 transition"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => handleOpenDelete(slot)}
                                          title="Delete Slot"
                                          className="p-1 hover:bg-white rounded text-rose-600 transition"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-xs font-bold leading-tight line-clamp-2">
                                      {slot.subjectName}
                                    </p>
                                  </div>

                                  <div className="pt-2 text-[10px] space-y-0.5 border-t border-black/5 mt-1">
                                    {viewMode === "class" ? (
                                      <p className="font-semibold truncate">{slot.teacherName}</p>
                                    ) : (
                                      <p className="font-semibold truncate">
                                        {slot.className} ({slot.sectionName})
                                      </p>
                                    )}
                                    <p className="opacity-75 flex items-center gap-1 truncate">
                                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                                      <span>{slot.room}</span>
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleOpenCreate(day, periodConfig.period)}
                                  className="w-full h-full rounded-xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition flex flex-col items-center justify-center text-slate-300 hover:text-indigo-600 p-2 group"
                                >
                                  <Plus className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition" />
                                  <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition mt-0.5">
                                    Add Slot
                                  </span>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* LIST VIEW TABLE */
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-full sm:w-64">
                  <Input
                    placeholder="Search subject, teacher, room..."
                    icon={Search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    options={[
                      { label: "All Days", value: "all" },
                      ...DAYS_OF_WEEK.map((d) => ({ label: d, value: d })),
                    ]}
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Day & Period</TableHead>
                    <TableHead>Subject & Code</TableHead>
                    <TableHead>Assigned Instructor</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Venue / Room</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listEntries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="font-bold text-slate-900 text-xs block">
                          {item.day} • Period {item.period}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {item.startTime} - {item.endTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700">
                            {item.subjectCode}
                          </span>
                          <span className="font-bold text-xs text-slate-800">
                            {item.subjectName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">
                        {item.teacherName}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-slate-800">
                          {item.className}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {item.sectionName}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-600">
                        {item.room}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Period"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Remove Period"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* CREATE / EDIT ROUTINE MODAL */}
      <Modal
        isOpen={routineModal.isOpen}
        onClose={routineModal.close}
        title={isEditing ? "Edit Timetable Period" : "Schedule New Timetable Period"}
        description="Allocate an academic lecture slot with real-time clash verification."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={routineModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveRoutine}>
              {isEditing ? "Save Changes" : "Confirm Slot Allocation"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveRoutine} className="space-y-4">
          {/* Conflict Warning Box */}
          {conflictWarning && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">{conflictWarning.title}</p>
                <p className="text-rose-700 leading-relaxed">{conflictWarning.message}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day of Week */}
            <Select
              label="Day of Week *"
              value={formData.day}
              error={formErrors.day}
              onChange={(e) => {
                setFormData({ ...formData, day: e.target.value });
                const conflict = checkConflict(
                  e.target.value,
                  formData.period,
                  formData.teacherId,
                  formData.room,
                  formData.classId,
                  formData.sectionId,
                  isEditing ? editingId : null
                );
                setConflictWarning(conflict);
              }}
              options={DAYS_OF_WEEK.map((d) => ({ label: d, value: d }))}
            />

            {/* Period Number */}
            <Select
              label="Period Slot *"
              value={formData.period}
              error={formErrors.period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              options={PERIODS_CONFIG.filter((p) => !p.isBreak).map((p) => ({
                label: `${p.name} (${p.startTime} - ${p.endTime})`,
                value: p.period,
              }))}
            />

            {/* Start Time */}
            <Input
              label="Start Time *"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />

            {/* End Time */}
            <Input
              label="End Time *"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />

            {/* Class */}
            <Select
              label="Class Cohort *"
              value={formData.classId}
              error={formErrors.classId}
              onChange={(e) => {
                const newClass = e.target.value;
                const sections = mockSectionsList.filter((s) => s.classId === newClass);
                const firstSec = sections[0] || null;

                setFormData({
                  ...formData,
                  classId: newClass,
                  sectionId: firstSec ? firstSec.id : "",
                  room: firstSec ? firstSec.room : formData.room,
                });

                const conflict = checkConflict(
                  formData.day,
                  formData.period,
                  formData.teacherId,
                  firstSec ? firstSec.room : formData.room,
                  newClass,
                  firstSec ? firstSec.id : "",
                  isEditing ? editingId : null
                );
                setConflictWarning(conflict);
              }}
              options={mockClassesList.map((c) => ({ label: c.name, value: c.id }))}
            />

            {/* Section */}
            <Select
              label="Section *"
              value={formData.sectionId}
              error={formErrors.sectionId}
              onChange={(e) => {
                const sec = mockSectionsList.find((s) => s.id === e.target.value);
                setFormData({
                  ...formData,
                  sectionId: e.target.value,
                  room: sec ? sec.room : formData.room,
                });

                const conflict = checkConflict(
                  formData.day,
                  formData.period,
                  formData.teacherId,
                  sec ? sec.room : formData.room,
                  formData.classId,
                  e.target.value,
                  isEditing ? editingId : null
                );
                setConflictWarning(conflict);
              }}
              options={availableSectionsForForm.map((s) => ({
                label: `${s.name} (${s.room})`,
                value: s.id,
              }))}
            />

            {/* Subject */}
            <Select
              label="Subject *"
              value={formData.subjectId}
              error={formErrors.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={mockSubjectsList.map((s) => ({
                label: `${s.code} - ${s.name}`,
                value: s.id,
              }))}
            />

            {/* Teacher */}
            <Select
              label="Lecturing Teacher *"
              value={formData.teacherId}
              error={formErrors.teacherId}
              onChange={(e) => {
                setFormData({ ...formData, teacherId: e.target.value });
                const conflict = checkConflict(
                  formData.day,
                  formData.period,
                  e.target.value,
                  formData.room,
                  formData.classId,
                  formData.sectionId,
                  isEditing ? editingId : null
                );
                setConflictWarning(conflict);
              }}
              options={mockTeachers.map((t) => ({
                label: `${t.name} (${t.employeeId})`,
                value: t.id,
              }))}
            />

            {/* Room / Venue */}
            <div className="md:col-span-2">
              <Input
                label="Lecture Room / Lab Venue *"
                placeholder="e.g. Science Hall 201"
                value={formData.room}
                error={formErrors.room}
                onChange={(e) => {
                  setFormData({ ...formData, room: e.target.value });
                  const conflict = checkConflict(
                    formData.day,
                    formData.period,
                    formData.teacherId,
                    e.target.value,
                    formData.classId,
                    formData.sectionId,
                    isEditing ? editingId : null
                  );
                  setConflictWarning(conflict);
                }}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {selectedEntry && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Delete Routine Period"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Delete Period Slot
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Clear scheduled instructional slot?</p>
                <p className="text-rose-700 leading-relaxed">
                  You are about to remove <strong>{selectedEntry.subjectName}</strong> on{" "}
                  <strong>
                    {selectedEntry.day} Period {selectedEntry.period}
                  </strong>{" "}
                  ({selectedEntry.startTime} - {selectedEntry.endTime}) for{" "}
                  <strong>
                    {selectedEntry.className} {selectedEntry.sectionName}
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
