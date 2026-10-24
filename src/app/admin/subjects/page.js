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
import { mockSubjectsList, mockSemestersList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Layers,
  GraduationCap,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";

const BATCH_COHORTS = ["Batch 2025", "Batch 2024", "Batch 2026", "Batch 2027", "Batch 2028"];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState(mockSubjectsList);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const createEditModal = useModal();
  const detailModal = useModal();
  const confirmModal = useModal();

  // Form State
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "Science",
    semester: "1st Semester",
    applicableClasses: ["Batch 2025", "Batch 2024"],
    weeklyPeriods: 4,
    type: "Core",
    status: "active",
    leadTeacher: "Prof. Marcus Aurel",
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter & Sort
  const processedSubjects = useMemo(() => {
    let result = subjects.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.leadTeacher?.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        departmentFilter === "all" || item.department === departmentFilter;
      const matchesSemester =
        semesterFilter === "all" || item.semester === semesterFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesDept && matchesSemester && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "code-asc") return a.code.localeCompare(b.code);
      if (sortBy === "periods-desc") return b.weeklyPeriods - a.weeklyPeriods;
      return 0;
    });

    return result;
  }, [subjects, search, departmentFilter, semesterFilter, statusFilter, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(processedSubjects.length / pageSize) || 1;
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedSubjects.slice(start, start + pageSize);
  }, [processedSubjects, currentPage, pageSize]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingSubjectId(null);
    setFormData({
      name: "",
      code: "",
      department: "Science",
      semester: "1st Semester",
      applicableClasses: ["Batch 2025", "Batch 2024"],
      weeklyPeriods: 4,
      type: "Core",
      status: "active",
      leadTeacher: "Prof. Marcus Aurel",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit
  const handleOpenEdit = (sub) => {
    setEditingSubjectId(sub.id);
    setFormData({
      name: sub.name,
      code: sub.code,
      department: sub.department,
      semester: sub.semester || "1st Semester",
      applicableClasses: sub.applicableClasses ? [...sub.applicableClasses] : ["Batch 2025"],
      weeklyPeriods: sub.weeklyPeriods,
      type: sub.type,
      status: sub.status,
      leadTeacher: sub.leadTeacher || "Faculty",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Toggle class applicability checkbox
  const toggleClassApplicability = (className) => {
    if (formData.applicableClasses.includes(className)) {
      if (formData.applicableClasses.length > 1) {
        setFormData({
          ...formData,
          applicableClasses: formData.applicableClasses.filter((c) => c !== className),
        });
      }
    } else {
      setFormData({
        ...formData,
        applicableClasses: [...formData.applicableClasses, className],
      });
    }
  };

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Course title is required.";
    if (!formData.code.trim()) errors.code = "Course code is required (e.g. CSE-201).";
    if (formData.applicableClasses.length === 0) {
      errors.classes = "Select at least one applicable batch.";
    }
    const periods = Number(formData.weeklyPeriods);
    if (!periods || periods <= 0) {
      errors.weeklyPeriods = "Weekly periods must be at least 1.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Subject
  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingSubjectId) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editingSubjectId
            ? { ...s, ...formData, weeklyPeriods: Number(formData.weeklyPeriods) }
            : s
        )
      );
    } else {
      const newSub = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        ...formData,
        weeklyPeriods: Number(formData.weeklyPeriods),
      };
      setSubjects([newSub, ...subjects]);
    }
    createEditModal.close();
  };

  // Delete Subject
  const promptDelete = (sub) => {
    confirmModal.open({
      title: `Delete ${sub.name}?`,
      message: `Are you sure you want to remove ${sub.name} (${sub.code}) from the curriculum? Course assignments and teacher allocations will be affected.`,
      confirmText: "Delete Course",
      variant: "danger",
      action: () => {
        setSubjects((prev) => prev.filter((item) => item.id !== sub.id));
        confirmModal.close();
        detailModal.close();
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        subtitle="Catalog academic courses, configure semester assignments, target batches, and credit hour allocations."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Course
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Offered Subjects"
          value={`${subjects.length} Courses`}
          description="Core & Elective disciplines"
          icon={BookOpen}
          variant="indigo"
        />
        <StatsCard
          title="Academic Departments"
          value="5 Disciplines"
          description="Science, Math, Humanities, Tech, Athletics"
          icon={Layers}
          variant="emerald"
        />
        <StatsCard
          title="Average Period Load"
          value="4.2 Periods / Wk"
          description="Per enrolled student timetable"
          icon={Clock}
          variant="blue"
        />
      </div>

      {/* Search & Filter Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search subject title, code, lead teacher..."
                icon={Search}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="w-full sm:w-40">
                <Select
                  value={semesterFilter}
                  onChange={(e) => {
                    setSemesterFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "Semester (All)", value: "all" },
                    ...mockSemestersList.map((sem) => ({ label: sem, value: sem })),
                  ]}
                />
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "Department (All)", value: "all" },
                    { label: "Science", value: "Science" },
                    { label: "Mathematics", value: "Mathematics" },
                    { label: "Humanities", value: "Humanities" },
                    { label: "Technology", value: "Technology" },
                    { label: "Athletics", value: "Athletics" },
                  ]}
                />
              </div>

              <div className="w-full sm:w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "Status (All)", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: "Course Name (A-Z)", value: "name-asc" },
                    { label: "Course Name (Z-A)", value: "name-desc" },
                    { label: "Course Code", value: "code-asc" },
                    { label: "Periods (Highest)", value: "periods-desc" },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Academic Course Catalog</CardTitle>
            <CardDescription>
              Showing {processedSubjects.length} courses configured across semesters and batches.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedSubjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Course Title & Code</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Applicable Batches</TableHead>
                  <TableHead>Weekly Load</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div
                        onClick={() => detailModal.open(sub)}
                        className="cursor-pointer group"
                      >
                        <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                          {sub.name}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sub.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="indigo" size="sm">
                        {sub.semester || "1st Semester"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {sub.department}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(sub.applicableBatches || sub.applicableClasses).map((cls) => (
                          <Badge key={cls} variant="slate" size="sm">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{sub.weeklyPeriods} periods</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.type === "Core" ? "indigo" : "amber"}
                        size="sm"
                      >
                        {sub.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => detailModal.open(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Course"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => promptDelete(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No courses match criteria"
              description="Adjust your search query or reset semester and department filters."
              actionLabel="Reset Search"
              onAction={() => {
                setSearch("");
                setDepartmentFilter("all");
                setSemesterFilter("all");
                setStatusFilter("all");
              }}
            />
          )}

          {/* Pagination Controls */}
          {processedSubjects.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
                >
                  <option value={6}>6 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                </select>
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, processedSubjects.length)} of{" "}
                  {processedSubjects.length} entries
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 font-semibold text-slate-900">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Course Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={editingSubjectId ? "Edit Course Definition" : "Create New Academic Course"}
        description="Configure course title, code, semester assignment, batches, and load."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingSubjectId ? "Save Course" : "Create Course"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Course Title *"
              placeholder="e.g. Data Structures & Algorithms"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="Course Code *"
              placeholder="e.g. CSE-201"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              error={formErrors.code}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Semester *"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              options={mockSemestersList}
            />
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={["Science", "Mathematics", "Humanities", "Technology", "Athletics", "Business"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Weekly Periods / Credits *"
              type="number"
              placeholder="4"
              value={formData.weeklyPeriods}
              onChange={(e) => setFormData({ ...formData, weeklyPeriods: e.target.value })}
              error={formErrors.weeklyPeriods}
            />
            <Select
              label="Course Classification"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={["Core", "Elective", "Lab", "Remedial"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Lead Faculty Instructor"
              placeholder="e.g. Prof. Marcus Aurel"
              value={formData.leadTeacher}
              onChange={(e) => setFormData({ ...formData, leadTeacher: e.target.value })}
            />
            <Select
              label="Course Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Applicable Batches *
            </label>
            <div className="flex flex-wrap gap-2">
              {BATCH_COHORTS.map((cls) => {
                const isSelected = formData.applicableClasses.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassApplicability(cls)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
            {formErrors.classes && (
              <p className="text-xs text-rose-600 font-medium mt-1">
                {formErrors.classes}
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* View Subject Details Modal */}
      {detailModal.modalData && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title={`${detailModal.modalData.name} (${detailModal.modalData.code})`}
          description="Curriculum specifications and timetable load."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => promptDelete(detailModal.modalData)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    detailModal.close();
                    handleOpenEdit(detailModal.modalData);
                  }}
                >
                  Edit Subject
                </Button>
                <Button variant="secondary" size="sm" onClick={detailModal.close}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {detailModal.modalData.code}
                </span>
                <StatusBadge status={detailModal.modalData.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {detailModal.modalData.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Department of {detailModal.modalData.department} • {detailModal.modalData.type} Course
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Weekly Load</span>
                <span className="text-slate-900 font-bold text-sm">
                  {detailModal.modalData.weeklyPeriods} Periods / Wk
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Lead Faculty</span>
                <span className="text-slate-900 font-bold text-sm">
                  {detailModal.modalData.leadTeacher || "Department Faculty"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                <span className="text-slate-400 block font-semibold mb-1">Applicable Classes</span>
                <div className="flex flex-wrap gap-1">
                  {detailModal.modalData.applicableClasses.map((cls) => (
                    <Badge key={cls} variant="indigo" size="sm">
                      {cls}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmModal.modalData && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.close}
          title={confirmModal.modalData.title}
          description={confirmModal.modalData.message}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={confirmModal.close}>
                Cancel
              </Button>
              <Button
                variant={confirmModal.modalData.variant || "primary"}
                size="sm"
                onClick={confirmModal.modalData.action}
              >
                {confirmModal.modalData.confirmText || "Confirm"}
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>This action modifies course offerings in local state.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
