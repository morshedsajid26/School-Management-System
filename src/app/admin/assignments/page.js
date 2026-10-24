"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
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
import { mockAssignmentsList } from "@/data/mock/assignments";
import { mockTeachers } from "@/data/mock/teachers";
import { mockClassesList, mockSectionsList, mockSubjectsList, mockSemestersList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  BookOpen,
  School,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserX,
  Sparkles,
  MapPin,
  Calendar,
  X,
} from "lucide-react";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState(mockAssignmentsList);
  const [search, setSearch] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("teacher-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const assignmentModal = useModal();
  const deleteModal = useModal();

  // Active target
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const [formData, setFormData] = useState({
    teacherId: "TCH-001",
    classId: "CLS-10",
    sectionId: "SEC-10A",
    subjectId: "SUB-101",
    semester: "1st Semester",
    periodsPerWeek: 5,
    room: "Science Hall 201",
    academicYear: "2025-2026",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});
  const [duplicateConflict, setDuplicateConflict] = useState(null);

  // Available sections dynamically filtered for selected class in form
  const availableSectionsForForm = useMemo(() => {
    if (!formData.classId) return [];
    return mockSectionsList.filter((s) => s.classId === formData.classId);
  }, [formData.classId]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.status === "active").length;
    const uniqueTeachers = new Set(assignments.map((a) => a.teacherId)).size;
    const uniqueSections = new Set(assignments.map((a) => `${a.classId}-${a.sectionId}`)).size;
    const totalPeriods = assignments.reduce((acc, curr) => acc + (Number(curr.periodsPerWeek) || 0), 0);
    const avgLoad = uniqueTeachers > 0 ? (totalPeriods / uniqueTeachers).toFixed(1) : 0;

    return { total, active, uniqueTeachers, uniqueSections, avgLoad };
  }, [assignments]);

  // Filtered & Sorted Assignments
  const processedAssignments = useMemo(() => {
    let result = assignments.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.teacherName.toLowerCase().includes(query) ||
        item.employeeId.toLowerCase().includes(query) ||
        item.subjectName.toLowerCase().includes(query) ||
        item.subjectCode.toLowerCase().includes(query) ||
        item.className.toLowerCase().includes(query) ||
        item.sectionName.toLowerCase().includes(query) ||
        (item.semester && item.semester.toLowerCase().includes(query)) ||
        (item.room && item.room.toLowerCase().includes(query));

      const matchesTeacher = teacherFilter === "all" || item.teacherId === teacherFilter;
      const matchesClass = classFilter === "all" || item.className === classFilter || item.batchName === classFilter;
      const matchesSemester = semesterFilter === "all" || item.semester === semesterFilter;
      const matchesSection = sectionFilter === "all" || item.sectionName === sectionFilter;
      const matchesSubject = subjectFilter === "all" || item.subjectCode === subjectFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesTeacher &&
        matchesClass &&
        matchesSemester &&
        matchesSection &&
        matchesSubject &&
        matchesStatus
      );
    });

    result.sort((a, b) => {
      if (sortBy === "teacher-asc") return a.teacherName.localeCompare(b.teacherName);
      if (sortBy === "teacher-desc") return b.teacherName.localeCompare(a.teacherName);
      if (sortBy === "class-asc") return a.className.localeCompare(b.className);
      if (sortBy === "subject-asc") return a.subjectName.localeCompare(b.subjectName);
      if (sortBy === "periods-desc") return (b.periodsPerWeek || 0) - (a.periodsPerWeek || 0);
      return 0;
    });

    return result;
  }, [assignments, search, teacherFilter, classFilter, semesterFilter, sectionFilter, subjectFilter, statusFilter, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(processedAssignments.length / pageSize) || 1;
  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedAssignments.slice(start, start + pageSize);
  }, [processedAssignments, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      teacherId: mockTeachers[0]?.id || "TCH-001",
      classId: mockClassesList[0]?.id || "CLS-10",
      sectionId: mockSectionsList[0]?.id || "SEC-10A",
      subjectId: mockSubjectsList[0]?.id || "SUB-101",
      semester: mockSubjectsList[0]?.semester || "1st Semester",
      periodsPerWeek: 5,
      room: mockSectionsList[0]?.room || "Science Hall 201",
      academicYear: "2025-2026",
      status: "active",
    });
    setFormErrors({});
    setDuplicateConflict(null);
    assignmentModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (assignment) => {
    setIsEditing(true);
    setEditingId(assignment.id);
    setFormData({
      teacherId: assignment.teacherId,
      classId: assignment.classId,
      sectionId: assignment.sectionId,
      subjectId: assignment.subjectId,
      semester: assignment.semester || "1st Semester",
      periodsPerWeek: assignment.periodsPerWeek || 4,
      room: assignment.room || "",
      academicYear: assignment.academicYear || "2025-2026",
      status: assignment.status || "active",
    });
    setFormErrors({});
    setDuplicateConflict(null);
    assignmentModal.open();
  };

  // Open Delete Modal
  const handleOpenDelete = (assignment) => {
    setSelectedAssignment(assignment);
    deleteModal.open();
  };

  // Toggle Status
  const handleToggleStatus = (assignment) => {
    const newStatus = assignment.status === "active" ? "inactive" : "active";
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? { ...a, status: newStatus } : a))
    );
    showToast(
      `Assignment for ${assignment.teacherName} marked as ${newStatus === "active" ? "Active" : "Inactive"}.`,
      "info"
    );
  };

  // Check Duplicate Conflict
  const checkDuplicate = (teacherId, classId, sectionId, subjectId, ignoreId = null) => {
    // 1. Is the same subject already assigned to any teacher for this section?
    const existingConflict = assignments.find(
      (a) =>
        a.classId === classId &&
        a.sectionId === sectionId &&
        a.subjectId === subjectId &&
        a.id !== ignoreId
    );

    if (existingConflict) {
      return {
        type: "SUBJECT_TAKEN",
        message: `${existingConflict.subjectName} is already assigned to ${existingConflict.teacherName} (${existingConflict.employeeId}) for ${existingConflict.className} ${existingConflict.sectionName}.`,
        conflictAssignment: existingConflict,
      };
    }

    return null;
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.teacherId) errors.teacherId = "Please select an instructor";
    if (!formData.classId) errors.classId = "Please select a class";
    if (!formData.sectionId) errors.sectionId = "Please select a section";
    if (!formData.subjectId) errors.subjectId = "Please select a subject";
    if (!formData.periodsPerWeek || Number(formData.periodsPerWeek) <= 0) {
      errors.periodsPerWeek = "Weekly periods must be at least 1";
    }

    // Check duplicate
    const conflict = checkDuplicate(
      formData.teacherId,
      formData.classId,
      formData.sectionId,
      formData.subjectId,
      isEditing ? editingId : null
    );

    if (conflict) {
      setDuplicateConflict(conflict);
      errors.duplicate = conflict.message;
    } else {
      setDuplicateConflict(null);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Assignment
  const handleSaveAssignment = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const teacherObj = mockTeachers.find((t) => t.id === formData.teacherId) || {};
    const classObj = mockClassesList.find((c) => c.id === formData.classId) || {};
    const sectionObj = mockSectionsList.find((s) => s.id === formData.sectionId) || {};
    const subjectObj = mockSubjectsList.find((sub) => sub.id === formData.subjectId) || {};

    const assignmentPayload = {
      teacherId: formData.teacherId,
      teacherName: teacherObj.name || "Faculty Member",
      employeeId: teacherObj.employeeId || "EMP-T-XXX",
      department: teacherObj.department || subjectObj.department || "General",
      classId: formData.classId,
      className: classObj.name || "Batch 2025",
      batchName: classObj.name || "Batch 2025",
      sectionId: formData.sectionId,
      sectionName: sectionObj.name || "Section A",
      subjectId: formData.subjectId,
      subjectName: subjectObj.name || "Subject",
      subjectCode: subjectObj.code || "SUB-XXX",
      semester: formData.semester || subjectObj.semester || "1st Semester",
      periodsPerWeek: Number(formData.periodsPerWeek) || 4,
      room: formData.room || sectionObj.room || "Classroom",
      academicYear: formData.academicYear || "2025-2026",
      status: formData.status,
    };

    if (isEditing) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...assignmentPayload } : a))
      );
      showToast(
        `Assignment updated: ${assignmentPayload.teacherName} assigned to ${assignmentPayload.subjectName} (${assignmentPayload.className} ${assignmentPayload.sectionName}).`
      );
    } else {
      const newAssignment = {
        id: `ASN-${String(assignments.length + 1).padStart(3, "0")}`,
        ...assignmentPayload,
      };
      setAssignments((prev) => [newAssignment, ...prev]);
      showToast(
        `Assigned ${assignmentPayload.teacherName} to teach ${assignmentPayload.subjectName} in ${assignmentPayload.className} ${assignmentPayload.sectionName}!`
      );
    }

    assignmentModal.close();
  };

  // Delete Assignment Action
  const handleConfirmDelete = () => {
    if (!selectedAssignment) return;
    setAssignments((prev) => prev.filter((a) => a.id !== selectedAssignment.id));
    deleteModal.close();
    showToast(
      `Removed teaching assignment for ${selectedAssignment.teacherName} (${selectedAssignment.subjectName}).`,
      "info"
    );
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Assignment ID,Teacher Name,Employee ID,Department,Subject,Subject Code,Class,Section,Periods/Wk,Room,Status,Academic Year"]
        .concat(
          assignments.map(
            (a) =>
              `"${a.id}","${a.teacherName}","${a.employeeId}","${a.department}","${a.subjectName}","${a.subjectCode}","${a.className}","${a.sectionName}","${a.periodsPerWeek}","${a.room}","${a.status}","${a.academicYear}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oakridge_Teacher_Assignments_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Teacher assignment catalog exported to CSV successfully!");
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
        title="Teacher-Subject Assignment"
        subtitle="Allocate educators to classes, sections, and curriculum subjects with workload tracking and duplicate prevention."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Catalog
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Add New Assignment
            </Button>
          </div>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Assignments"
          value={stats.total}
          icon={UserCheck}
          variant="indigo"
          description="Subject allocations roster"
        />
        <StatsCard
          title="Assigned Faculty"
          value={stats.uniqueTeachers}
          icon={Building}
          variant="emerald"
          description="Active instructors allocated"
        />
        <StatsCard
          title="Covered Sections"
          value={stats.uniqueSections}
          icon={School}
          variant="purple"
          description="Cohorts receiving teaching"
        />
        <StatsCard
          title="Avg. Teaching Load"
          value={`${stats.avgLoad} per/wk`}
          icon={Clock}
          variant="amber"
          description="Average periods per faculty"
        />
      </div>

      {/* Main Assignments Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Teaching Assignments Catalog</CardTitle>
              <CardDescription>
                Showing {processedAssignments.length} assignment{processedAssignments.length !== 1 ? "s" : ""} across academic departments
              </CardDescription>
            </div>

            {/* Quick Filters / Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-60">
                <Input
                  placeholder="Search teacher, subject, room..."
                  icon={Search}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="w-36">
                <Select
                  value={semesterFilter}
                  onChange={(e) => {
                    setSemesterFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Semesters", value: "all" },
                    ...mockSemestersList.map((s) => ({ label: s, value: s })),
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Batches", value: "all" },
                    ...mockClassesList.map((c) => ({ label: c.name, value: c.name })),
                  ]}
                />
              </div>

              <div className="w-32">
                <Select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Sec", value: "all" },
                    { label: "Section A", value: "Section A" },
                    { label: "Section B", value: "Section B" },
                  ]}
                />
              </div>

              <div className="w-40">
                <Select
                  value={subjectFilter}
                  onChange={(e) => {
                    setSubjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Courses", value: "all" },
                    ...mockSubjectsList.map((s) => ({ label: `${s.code} - ${s.name}`, value: s.code })),
                  ]}
                />
              </div>

              <div className="w-40">
                <Select
                  value={teacherFilter}
                  onChange={(e) => {
                    setTeacherFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Teachers", value: "all" },
                    ...mockTeachers.map((t) => ({ label: t.name, value: t.id })),
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: "Teacher: A to Z", value: "teacher-asc" },
                    { label: "Teacher: Z to A", value: "teacher-desc" },
                    { label: "Batch: Order", value: "class-asc" },
                    { label: "Course: Name", value: "subject-asc" },
                    { label: "Workload (High to Low)", value: "periods-desc" },
                  ]}
                />
              </div>

              {(search || teacherFilter !== "all" || classFilter !== "all" || semesterFilter !== "all" || sectionFilter !== "all" || subjectFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setTeacherFilter("all");
                    setClassFilter("all");
                    setSemesterFilter("all");
                    setSectionFilter("all");
                    setSubjectFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
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
          {paginatedAssignments.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={UserCheck}
                title="No course assignments found"
                description={
                  search || teacherFilter !== "all" || classFilter !== "all" || subjectFilter !== "all"
                    ? "Try adjusting active search filters or selecting different criteria."
                    : "Get started by allocating your first course to a batch, semester, and instructor."
                }
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenCreate}
                  >
                    Assign Course
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Curriculum Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Target Batch & Section</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead>Workload & Schedule</TableHead>
                    <TableHead>Room / Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssignments.map((item) => (
                    <TableRow key={item.id}>
                      {/* Course Title & Code */}
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {item.subjectCode || item.courseCode}
                            </span>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {item.subjectName || item.courseName}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Semester */}
                      <TableCell>
                        <Badge variant="indigo" size="sm">
                          {item.semester || "1st Semester"}
                        </Badge>
                      </TableCell>

                      {/* Batch & Section */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-900 block">
                            {item.batchName || item.className}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {item.sectionName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Faculty / Instructor */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={item.teacherName}
                            size="sm"
                            className="ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-xs truncate block">
                              {item.teacherName}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] font-mono text-slate-500">
                                {item.employeeId}
                              </span>
                              <span className="text-[10px] text-indigo-600 font-medium">
                                • {item.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Workload */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold">{item.periodsPerWeek}</span>
                          <span className="text-slate-500 text-[11px]">periods / wk</span>
                        </div>
                      </TableCell>

                      {/* Room */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{item.room || "Science Hall 201"}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Assignment"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item)}
                            title={item.status === "active" ? "Mark Inactive" : "Mark Active"}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          >
                            {item.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            title="Remove Assignment"
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

          {/* Table Footer with Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                Showing{" "}
                <strong className="text-slate-800">
                  {processedAssignments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(currentPage * pageSize, processedAssignments.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{processedAssignments.length}</strong> assignments
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={6}>6</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                      currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      <Modal
        isOpen={assignmentModal.isOpen}
        onClose={assignmentModal.close}
        title={isEditing ? "Edit Teacher Assignment" : "Allocate Teacher to Subject & Cohort"}
        description={
          isEditing
            ? "Modify teacher workload, assigned class section, or subject instruction."
            : "Assign a qualified faculty educator to an academic class, section, and curriculum subject."
        }
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={assignmentModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveAssignment}>
              {isEditing ? "Save Assignment Changes" : "Confirm Assignment"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          {/* Duplicate Conflict Alert Banner */}
          {duplicateConflict && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Duplicate Assignment Conflict Detected</p>
                <p className="text-rose-700 leading-relaxed">{duplicateConflict.message}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Course Selector */}
            <Select
              label="1. Curriculum Course *"
              value={formData.subjectId}
              error={formErrors.subjectId}
              onChange={(e) => {
                const sub = mockSubjectsList.find((s) => s.id === e.target.value);
                setFormData({
                  ...formData,
                  subjectId: e.target.value,
                  semester: sub?.semester || formData.semester,
                });
                setDuplicateConflict(null);
              }}
              options={mockSubjectsList.map((s) => ({
                label: `${s.code} - ${s.name}`,
                value: s.id,
              }))}
            />

            {/* 2. Semester Selector */}
            <Select
              label="2. Course Semester *"
              value={formData.semester}
              onChange={(e) => {
                setFormData({ ...formData, semester: e.target.value });
                setDuplicateConflict(null);
              }}
              options={mockSemestersList.map((sem) => ({
                label: sem,
                value: sem,
              }))}
            />

            {/* 3. Batch Selector */}
            <Select
              label="3. Target Batch *"
              value={formData.classId}
              error={formErrors.classId}
              onChange={(e) => {
                const newClassId = e.target.value;
                const newSections = mockSectionsList.filter((s) => s.classId === newClassId);
                const firstSec = newSections[0] || null;

                setFormData({
                  ...formData,
                  classId: newClassId,
                  sectionId: firstSec ? firstSec.id : "",
                  room: firstSec ? firstSec.room : formData.room,
                });
                setDuplicateConflict(null);
              }}
              options={mockClassesList.map((c) => ({
                label: `${c.name} (${c.stream || "General"})`,
                value: c.id,
              }))}
            />

            {/* 4. Section Selector */}
            <Select
              label="4. Target Section *"
              value={formData.sectionId}
              error={formErrors.sectionId}
              onChange={(e) => {
                const sec = mockSectionsList.find((s) => s.id === e.target.value);
                setFormData({
                  ...formData,
                  sectionId: e.target.value,
                  room: sec ? sec.room : formData.room,
                });
                setDuplicateConflict(null);
              }}
              options={availableSectionsForForm.map((s) => ({
                label: `${s.name} (${s.room})`,
                value: s.id,
              }))}
            />

            {/* 5. Teacher Selector */}
            <Select
              label="5. Assigned Teacher / Instructor *"
              value={formData.teacherId}
              error={formErrors.teacherId}
              onChange={(e) => {
                setFormData({ ...formData, teacherId: e.target.value });
                setDuplicateConflict(null);
              }}
              options={mockTeachers.map((t) => ({
                label: `${t.name} (${t.employeeId} • ${t.department})`,
                value: t.id,
              }))}
            />

            {/* Weekly Periods */}
            <Input
              label="Weekly Periods / Load Hours *"
              type="number"
              min="1"
              max="30"
              value={formData.periodsPerWeek}
              error={formErrors.periodsPerWeek}
              onChange={(e) => setFormData({ ...formData, periodsPerWeek: e.target.value })}
            />

            {/* Room / Hall */}
            <Input
              label="Assigned Lecture Room / Hall"
              placeholder="e.g. Science Hall 201"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />

            {/* Status */}
            <Select
              label="Assignment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active Instruction", value: "active" },
                { label: "Inactive / Suspended", value: "inactive" },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {selectedAssignment && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Remove Teacher Assignment"
          description="Are you sure you want to de-allocate this instructor?"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Remove Assignment
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">De-allocation Notice</p>
                <p className="text-rose-700 leading-relaxed">
                  Removing this assignment will detach{" "}
                  <strong>{selectedAssignment.teacherName}</strong> from teaching{" "}
                  <strong>{selectedAssignment.subjectName}</strong> in{" "}
                  <strong>
                    {selectedAssignment.className} {selectedAssignment.sectionName}
                  </strong>
                  .
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              You can toggle this assignment to <strong>Inactive</strong> instead if this teacher is on temporary leave.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
