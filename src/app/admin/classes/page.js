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
import { mockClassesList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  School,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  DoorOpen,
  Users,
  AlertTriangle,
} from "lucide-react";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState(mockClassesList);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc"); // "name-asc" | "name-desc" | "students-desc" | "students-asc"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const createEditModal = useModal();
  const detailModal = useModal();
  const confirmModal = useModal();

  // Form State
  const [editingClassId, setEditingClassId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    academicYear: "2025-2026",
    sectionsString: "Section A, Section B",
    classTeacher: "Prof. Marcus Aurel",
    maxCapacity: 70,
    stream: "Science & Engineering",
    status: "active",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Filtered and Sorted batches
  const processedClasses = useMemo(() => {
    let result = classes.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        item.classTeacher.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "students-desc") return b.studentCount - a.studentCount;
      if (sortBy === "students-asc") return a.studentCount - b.studentCount;
      return 0;
    });

    return result;
  }, [classes, search, statusFilter, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(processedClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedClasses.slice(start, start + pageSize);
  }, [processedClasses, currentPage, pageSize]);

  // Total student counts across batches
  const totalEnrolled = useMemo(
    () => classes.reduce((acc, curr) => acc + (curr.studentCount || 0), 0),
    [classes]
  );

  const totalSectionsCount = useMemo(
    () => classes.reduce((acc, curr) => acc + (curr.totalSections || curr.sections?.length || 0), 0),
    [classes]
  );

  // Open Create
  const handleOpenCreate = () => {
    setEditingClassId(null);
    setFormData({
      name: "",
      code: "",
      academicYear: "2025-2026",
      sectionsString: "Section A, Section B",
      classTeacher: "Prof. Marcus Aurel",
      maxCapacity: 70,
      stream: "Science & Engineering",
      status: "active",
      description: "",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit
  const handleOpenEdit = (cls) => {
    setEditingClassId(cls.id);
    setFormData({
      name: cls.name,
      code: cls.code,
      academicYear: cls.academicYear || "2025-2026",
      sectionsString: cls.sections ? cls.sections.join(", ") : "Section A",
      classTeacher: cls.classTeacher,
      maxCapacity: cls.maxCapacity,
      stream: cls.stream,
      status: cls.status,
      description: cls.description || "",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Batch name is required (e.g. Batch 2025).";
    if (!formData.code.trim()) errors.code = "Batch code is required (e.g. B-2025).";
    if (!formData.classTeacher.trim()) errors.classTeacher = "Batch advisor assignment is required.";
    const cap = Number(formData.maxCapacity);
    if (!cap || cap <= 0) errors.maxCapacity = "Capacity must be greater than zero.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const sectionsArray = formData.sectionsString
      ? formData.sectionsString.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Section A"];

    if (editingClassId) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === editingClassId
            ? {
                ...c,
                ...formData,
                sections: sectionsArray,
                totalSections: sectionsArray.length,
                maxCapacity: Number(formData.maxCapacity),
              }
            : c
        )
      );
    } else {
      const newBatch = {
        id: `BATCH-${Date.now().toString().slice(-4)}`,
        ...formData,
        maxCapacity: Number(formData.maxCapacity),
        sections: sectionsArray,
        totalSections: sectionsArray.length,
        studentCount: 0,
      };
      setClasses([newBatch, ...classes]);
    }
    createEditModal.close();
  };

  // Delete Confirmation
  const promptDelete = (cls) => {
    confirmModal.open({
      title: `Delete ${cls.name}?`,
      message:
        cls.studentCount > 0
          ? `Warning: ${cls.name} has ${cls.studentCount} enrolled students. Deleting this batch will leave students and sections unassigned.`
          : `Are you sure you want to remove ${cls.name}? This action cannot be undone.`,
      confirmText: "Delete Batch",
      variant: "danger",
      action: () => {
        setClasses((prev) => prev.filter((item) => item.id !== cls.id));
        confirmModal.close();
        detailModal.close();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Batch Management"
        subtitle="Create academic batches, divide batches into sections, assign batch advisors, and manage student capacity."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Batch
          </Button>
        }
      />

      {/* Nav Tabs between Batches, Sections, Courses, and Teacher Assignments */}
      <AcademicNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Batches"
          value={`${classes.length} Batches`}
          description="Active and configured student cohorts"
          icon={School}
          variant="indigo"
        />
        <StatsCard
          title="Total Sections Divided"
          value={`${totalSectionsCount} Sections`}
          description="Section-wise allocations across batches"
          icon={DoorOpen}
          variant="purple"
        />
        <StatsCard
          title="Total Enrolled Students"
          value={`${totalEnrolled} Students`}
          description="Roster distribution across active batches"
          icon={Users}
          variant="emerald"
        />
      </div>

      {/* Search, Filter, and Sort Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search class name, code, or class teacher..."
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

              <div className="w-full sm:w-48">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: "Name (A to Z)", value: "name-asc" },
                    { label: "Name (Z to A)", value: "name-desc" },
                    { label: "Students (Highest)", value: "students-desc" },
                    { label: "Students (Lowest)", value: "students-asc" },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch List Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Academic Batches Directory</CardTitle>
              <CardDescription>
                Showing {processedClasses.length} batch records with section-wise divisions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedClasses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Batch Name & Code</TableHead>
                  <TableHead>Batch Advisor</TableHead>
                  <TableHead>Divided Sections</TableHead>
                  <TableHead>Student Enrollment</TableHead>
                  <TableHead>Session & Stream</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClasses.map((cls) => {
                  const occupancy = Math.round((cls.studentCount / cls.maxCapacity) * 100) || 0;
                  return (
                    <TableRow key={cls.id}>
                      <TableCell>
                        <div
                          onClick={() => detailModal.open(cls)}
                          className="cursor-pointer group"
                        >
                          <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                            {cls.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            Code: {cls.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800">
                            {cls.classTeacher}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {cls.sections && cls.sections.length > 0 ? (
                            cls.sections.map((sec, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                {sec}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Section A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-900">
                              {cls.studentCount} / {cls.maxCapacity}
                            </span>
                            <span className="text-slate-500 font-mono">{occupancy}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occupancy > 90 ? "bg-amber-500" : "bg-indigo-600"
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800">{cls.academicYear || "2025-2026"}</p>
                          <span className="text-[11px] text-slate-500">{cls.stream}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={cls.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => detailModal.open(cls)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View Batch Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cls)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Batch"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete(cls)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Batch"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No batches match search criteria"
              description="Adjust your search query or reset the active status filters."
              actionLabel="Reset Search"
              onAction={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            />
          )}

          {/* Pagination Controls */}
          {processedClasses.length > 0 && (
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
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                </select>
                <span>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, processedClasses.length)} of{" "}
                  {processedClasses.length} entries
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

      {/* Create / Edit Batch Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={editingClassId ? "Modify Batch Record" : "Create New Academic Batch"}
        description="Configure batch name, academic session, divide sections, and designate advisor."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingClassId ? "Save Batch" : "Create Batch"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Batch Name *"
              placeholder="e.g. Batch 2025"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="Batch Code *"
              placeholder="e.g. B-2025"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              error={formErrors.code}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Academic Session / Year"
              placeholder="e.g. 2025-2026"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
            <Input
              label="Divide into Sections (comma separated) *"
              placeholder="e.g. Section A, Section B, Section C"
              value={formData.sectionsString}
              onChange={(e) => setFormData({ ...formData, sectionsString: e.target.value })}
              helperText="Sections divided inside this batch"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Assigned Batch Advisor *"
              placeholder="e.g. Prof. Marcus Aurel"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
              error={formErrors.classTeacher}
            />
            <Input
              label="Max Batch Capacity *"
              type="number"
              placeholder="70"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
              error={formErrors.maxCapacity}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Department / Stream"
              value={formData.stream}
              onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
              options={["Science & Engineering", "General Science", "Technology", "Business & Commerce", "Humanities"]}
            />
            <Select
              label="Batch Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </div>

          <Input
            label="Batch Overview / Notes"
            placeholder="Curriculum focus, program specializations..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* View Batch Details Modal */}
      {detailModal.modalData && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title={`${detailModal.modalData.name} Overview`}
          description="Detailed batch metrics and divided section allocations."
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
                  Edit Batch
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
                <span className="font-mono text-xs font-bold text-slate-500">
                  Code: {detailModal.modalData.code}
                </span>
                <StatusBadge status={detailModal.modalData.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {detailModal.modalData.name} ({detailModal.modalData.stream || "General"})
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {detailModal.modalData.description || "Active academic batch cohort."}
              </p>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <span className="text-xs font-bold text-indigo-900 block mb-1.5">Divided Sections:</span>
              <div className="flex flex-wrap gap-1.5">
                {detailModal.modalData.sections && detailModal.modalData.sections.length > 0 ? (
                  detailModal.modalData.sections.map((sec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white text-indigo-700 font-bold text-xs rounded-lg shadow-xs border border-indigo-200">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Section A</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Batch Advisor</span>
                <span className="text-slate-800 font-bold">{detailModal.modalData.classTeacher}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Academic Session</span>
                <span className="text-slate-800 font-bold">{detailModal.modalData.academicYear || "2025-2026"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Student Enrollment</span>
                <span className="text-slate-800 font-bold">
                  {detailModal.modalData.studentCount} / {detailModal.modalData.maxCapacity} Seats
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Available Seats</span>
                <span className="text-emerald-600 font-bold">
                  {detailModal.modalData.maxCapacity - detailModal.modalData.studentCount} Free
                </span>
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
            <span>This action modifies class rosters in local state.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
