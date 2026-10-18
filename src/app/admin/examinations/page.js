"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ExamNavTabs from "@/components/shared/ExamNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import {
  mockExamCycles,
  mockExamSchedules,
} from "@/data/mock/examinations";
import { mockClassesList, mockSubjectsList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  Calendar,
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
  Award,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ExaminationSchedulesPage() {
  const [schedules, setSchedules] = useState(mockExamSchedules);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");

  // Modals
  const scheduleModal = useModal();
  const deleteModal = useModal();

  // Active Target
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    examName: "Term 2 Midterm Examination",
    className: "Grade 10",
    subjectId: "SUB-101",
    date: "2026-03-24",
    startTime: "09:00 AM",
    endTime: "11:30 AM",
    duration: "2.5 Hours",
    room: "Examination Hall A",
    maxMarks: 100,
    passingMarks: 40,
    status: "Scheduled",
  });
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const stats = useMemo(() => {
    const total = schedules.length;
    const scheduled = schedules.filter((s) => s.status === "Scheduled").length;
    const distinctClasses = new Set(schedules.map((s) => s.className)).size;
    const maxMarksAvg =
      total > 0
        ? Math.round(schedules.reduce((acc, curr) => acc + (Number(curr.maxMarks) || 0), 0) / total)
        : 100;

    return { total, scheduled, distinctClasses, maxMarksAvg };
  }, [schedules]);

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.examName.toLowerCase().includes(query) ||
        item.subjectName.toLowerCase().includes(query) ||
        item.subjectCode.toLowerCase().includes(query) ||
        item.className.toLowerCase().includes(query) ||
        item.room.toLowerCase().includes(query);

      const matchesClass = classFilter === "all" || item.className === classFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCycle = cycleFilter === "all" || item.examName === cycleFilter;

      return matchesSearch && matchesClass && matchesStatus && matchesCycle;
    });
  }, [schedules, search, classFilter, statusFilter, cycleFilter]);

  // Open Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      examName: "Term 2 Midterm Examination",
      className: "Grade 10",
      subjectId: mockSubjectsList[0]?.id || "SUB-101",
      date: "2026-03-25",
      startTime: "09:00 AM",
      endTime: "11:30 AM",
      duration: "2.5 Hours",
      room: "Examination Hall A",
      maxMarks: 100,
      passingMarks: 40,
      status: "Scheduled",
    });
    setFormErrors({});
    scheduleModal.open();
  };

  // Open Edit
  const handleOpenEdit = (schedule) => {
    setIsEditing(true);
    setEditingId(schedule.id);
    const subObj = mockSubjectsList.find((s) => s.code === schedule.subjectCode) || {};

    setFormData({
      examName: schedule.examName,
      className: schedule.className,
      subjectId: subObj.id || mockSubjectsList[0]?.id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      duration: schedule.duration,
      room: schedule.room,
      maxMarks: schedule.maxMarks,
      passingMarks: schedule.passingMarks,
      status: schedule.status,
    });
    setFormErrors({});
    scheduleModal.open();
  };

  // Open Delete
  const handleOpenDelete = (schedule) => {
    setSelectedSchedule(schedule);
    deleteModal.open();
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.examName.trim()) errors.examName = "Exam cycle name is required";
    if (!formData.className) errors.className = "Class is required";
    if (!formData.subjectId) errors.subjectId = "Subject is required";
    if (!formData.date) errors.date = "Exam date is required";
    if (!formData.room.trim()) errors.room = "Examination hall/room is required";

    const max = Number(formData.maxMarks);
    const pass = Number(formData.passingMarks);

    if (!max || max <= 0) errors.maxMarks = "Maximum marks must be greater than 0";
    if (!pass || pass <= 0) errors.passingMarks = "Passing marks must be greater than 0";
    if (pass > max) errors.passingMarks = "Passing marks cannot exceed maximum marks";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Schedule
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const subObj = mockSubjectsList.find((s) => s.id === formData.subjectId) || {};

    const payload = {
      examName: formData.examName,
      className: formData.className,
      subjectName: subObj.name || "Subject",
      subjectCode: subObj.code || "SUB",
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: formData.duration,
      room: formData.room,
      maxMarks: Number(formData.maxMarks),
      passingMarks: Number(formData.passingMarks),
      status: formData.status,
    };

    if (isEditing) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
      );
      showToast(`Updated examination paper for ${payload.subjectName} (${payload.className}).`);
    } else {
      const newSchedule = {
        id: `SCH-${String(schedules.length + 1).padStart(3, "0")}`,
        ...payload,
      };
      setSchedules((prev) => [newSchedule, ...prev]);
      showToast(`Scheduled ${payload.subjectName} exam for ${payload.className}!`);
    }

    scheduleModal.close();
  };

  // Delete Schedule
  const handleConfirmDelete = () => {
    if (!selectedSchedule) return;
    setSchedules((prev) => prev.filter((s) => s.id !== selectedSchedule.id));
    deleteModal.close();
    showToast(`Canceled exam schedule for ${selectedSchedule.subjectName}.`, "info");
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Schedule ID,Exam Cycle,Class,Subject Code,Subject Name,Date,Time,Room,Max Marks,Passing Marks,Status"]
        .concat(
          schedules.map(
            (s) =>
              `"${s.id}","${s.examName}","${s.className}","${s.subjectCode}","${s.subjectName}","${s.date}","${s.startTime} - ${s.endTime}","${s.room}","${s.maxMarks}","${s.passingMarks}","${s.status}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oakridge_Exam_Timetable_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Examination timetable exported to CSV successfully!");
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
        title="Examinations & Exam Schedules"
        subtitle="Manage standardized evaluation cycles, exam papers, hall venues, and invigilation timetables."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Timetable
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Schedule Exam Paper
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <ExamNavTabs />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Exam Cycle"
          value="Term 2 Midterms"
          icon={Calendar}
          variant="indigo"
          description="Beginning across cohorts"
        />
        <StatsCard
          title="Scheduled Papers"
          value={stats.scheduled}
          icon={FileCheck}
          variant="emerald"
          description={`${stats.total} total assessments logged`}
        />
        <StatsCard
          title="Cohorts Assessed"
          value={stats.distinctClasses}
          icon={School}
          variant="purple"
          description="Grade levels participating"
        />
        <StatsCard
          title="Evaluation Scale"
          value={`${stats.maxMarksAvg} Marks`}
          icon={Award}
          variant="amber"
          description="Standardized grading base"
        />
      </div>

      {/* Main Timetable Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Examination Papers Timetable</CardTitle>
              <CardDescription>
                Showing {filteredSchedules.length} examination session{filteredSchedules.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-60">
                <Input
                  placeholder="Search exam, subject, hall..."
                  icon={Search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-44">
                <Select
                  value={cycleFilter}
                  onChange={(e) => setCycleFilter(e.target.value)}
                  options={[
                    { label: "All Exam Cycles", value: "all" },
                    ...mockExamCycles.map((c) => ({ label: c.name, value: c.name })),
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  options={[
                    { label: "All Classes", value: "all" },
                    ...mockClassesList.map((c) => ({ label: c.name, value: c.name })),
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { label: "All Statuses", value: "all" },
                    { label: "Scheduled", value: "Scheduled" },
                    { label: "In Progress", value: "In Progress" },
                    { label: "Completed", value: "Completed" },
                  ]}
                />
              </div>

              {(search || classFilter !== "all" || statusFilter !== "all" || cycleFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setClassFilter("all");
                    setStatusFilter("all");
                    setCycleFilter("all");
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredSchedules.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Calendar}
                title="No examination sessions found"
                description="Try clearing search queries or adjusting class and cycle filters."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenCreate}
                  >
                    Schedule Exam Paper
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Exam Code & Paper</TableHead>
                    <TableHead>Cycle & Cohort</TableHead>
                    <TableHead>Scheduled Date & Time</TableHead>
                    <TableHead>Hall Venue</TableHead>
                    <TableHead>Max / Pass Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      {/* Code & Paper */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {schedule.subjectCode}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block">
                              {schedule.subjectName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {schedule.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Cycle & Cohort */}
                      <TableCell>
                        <p className="text-xs font-semibold text-slate-800">
                          {schedule.className}
                        </p>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                          {schedule.examName}
                        </span>
                      </TableCell>

                      {/* Scheduled Date */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-700">
                          <div className="flex items-center gap-1 font-semibold">
                            <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span>{schedule.date}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 block">
                            {schedule.startTime} - {schedule.endTime} ({schedule.duration})
                          </span>
                        </div>
                      </TableCell>

                      {/* Hall Venue */}
                      <TableCell className="text-xs font-medium text-slate-700">
                        {schedule.room}
                      </TableCell>

                      {/* Marks */}
                      <TableCell>
                        <span className="text-xs font-bold text-slate-900 block font-mono">
                          {schedule.maxMarks} Marks
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Passing: {schedule.passingMarks}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            schedule.status === "Scheduled"
                              ? "indigo"
                              : schedule.status === "Completed"
                              ? "emerald"
                              : "amber"
                          }
                          size="sm"
                        >
                          {schedule.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(schedule)}
                            title="Edit Exam Schedule"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(schedule)}
                            title="Cancel / Delete Schedule"
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

      {/* SCHEDULE / EDIT MODAL */}
      <Modal
        isOpen={scheduleModal.isOpen}
        onClose={scheduleModal.close}
        title={isEditing ? "Edit Examination Paper" : "Schedule New Examination Paper"}
        description="Allocate examination dates, venue halls, and maximum mark standards."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={scheduleModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveSchedule}>
              {isEditing ? "Save Changes" : "Confirm Schedule"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Examination Cycle *"
                value={formData.examName}
                error={formErrors.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                options={mockExamCycles.map((c) => ({ label: c.name, value: c.name }))}
              />
            </div>

            <Select
              label="Assessed Class Cohort *"
              value={formData.className}
              error={formErrors.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              options={mockClassesList.map((c) => ({ label: c.name, value: c.name }))}
            />

            <Select
              label="Subject Paper *"
              value={formData.subjectId}
              error={formErrors.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              options={mockSubjectsList.map((s) => ({
                label: `${s.code} - ${s.name}`,
                value: s.id,
              }))}
            />

            <Input
              label="Examination Date *"
              type="date"
              value={formData.date}
              error={formErrors.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <Input
              label="Examination Hall / Room *"
              placeholder="e.g. Examination Hall A"
              value={formData.room}
              error={formErrors.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />

            <Input
              label="Start Time *"
              placeholder="e.g. 09:00 AM"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />

            <Input
              label="End Time *"
              placeholder="e.g. 11:30 AM"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />

            <Input
              label="Maximum Marks *"
              type="number"
              min="1"
              max="500"
              value={formData.maxMarks}
              error={formErrors.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
            />

            <Input
              label="Passing Marks *"
              type="number"
              min="1"
              max={formData.maxMarks || 100}
              value={formData.passingMarks}
              error={formErrors.passingMarks}
              onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Scheduled", value: "Scheduled" },
                { label: "In Progress", value: "In Progress" },
                { label: "Completed", value: "Completed" },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {selectedSchedule && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Cancel Examination Paper"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Delete Exam Schedule
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Cancel Scheduled Examination?</p>
                <p className="text-rose-700 leading-relaxed">
                  Removing <strong>{selectedSchedule.subjectName}</strong> ({selectedSchedule.className}) scheduled for{" "}
                  <strong>{selectedSchedule.date}</strong> in {selectedSchedule.room}.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
