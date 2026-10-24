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
import { mockSectionsList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  DoorOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  School,
  Users,
  AlertTriangle,
} from "lucide-react";

const BATCH_OPTIONS = ["Batch 2025", "Batch 2024", "Batch 2026", "Batch 2027", "Batch 2028"];

export default function AdminSectionsPage() {
  const [sections, setSections] = useState(mockSectionsList);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("class-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const createEditModal = useModal();
  const detailModal = useModal();
  const confirmModal = useModal();

  // Form State
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [formData, setFormData] = useState({
    name: "Section A",
    className: "Batch 2025",
    room: "Science Hall 201",
    capacity: 35,
    classTeacher: "Prof. Marcus Aurel",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter & Sort
  const processedSections = useMemo(() => {
    let result = sections.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.className.toLowerCase().includes(search.toLowerCase()) ||
        (item.batchName && item.batchName.toLowerCase().includes(search.toLowerCase())) ||
        item.room.toLowerCase().includes(search.toLowerCase()) ||
        item.classTeacher.toLowerCase().includes(search.toLowerCase());

      const matchesClass =
        classFilter === "all" || item.className === classFilter || item.batchName === classFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "class-asc") return (a.batchName || a.className).localeCompare(b.batchName || b.className);
      if (sortBy === "students-desc") return b.studentCount - a.studentCount;
      if (sortBy === "students-asc") return a.studentCount - b.studentCount;
      return 0;
    });

    return result;
  }, [sections, search, classFilter, statusFilter, sortBy]);

  // Paginated records
  const totalPages = Math.ceil(processedSections.length / pageSize) || 1;
  const paginatedSections = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedSections.slice(start, start + pageSize);
  }, [processedSections, currentPage, pageSize]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSectionId(null);
    setFormData({
      name: "Section C",
      className: "Batch 2025",
      room: "Science Hall 203",
      capacity: 35,
      classTeacher: "Dr. Catherine Bennett",
      status: "active",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (sec) => {
    setEditingSectionId(sec.id);
    setFormData({
      name: sec.name,
      className: sec.batchName || sec.className,
      room: sec.room,
      capacity: sec.capacity,
      classTeacher: sec.classTeacher,
      status: sec.status,
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Validation
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Section identifier is required (e.g. Section A).";
    if (!formData.className.trim()) errors.className = "Parent batch must be selected.";
    if (!formData.room.trim()) errors.room = "Classroom venue is required.";
    const cap = Number(formData.capacity);
    if (!cap || cap <= 0) errors.capacity = "Room capacity must be greater than zero.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Section
  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingSectionId) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSectionId
            ? { ...s, ...formData, batchName: formData.className, capacity: Number(formData.capacity) }
            : s
        )
      );
    } else {
      const newSec = {
        id: `SEC-${Date.now().toString().slice(-4)}`,
        ...formData,
        batchName: formData.className,
        capacity: Number(formData.capacity),
        studentCount: 0,
      };
      setSections([newSec, ...sections]);
    }
    createEditModal.close();
  };

  // Delete Section
  const promptDelete = (sec) => {
    confirmModal.open({
      title: `Delete ${sec.batchName || sec.className} - ${sec.name}?`,
      message:
        sec.studentCount > 0
          ? `Warning: ${sec.name} currently contains ${sec.studentCount} assigned students. Deleting this section will require student reassignment.`
          : `Are you sure you want to remove ${sec.batchName || sec.className} - ${sec.name}?`,
      confirmText: "Delete Section",
      variant: "danger",
      action: () => {
        setSections((prev) => prev.filter((item) => item.id !== sec.id));
        confirmModal.close();
        detailModal.close();
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Section Management"
        subtitle="Divide batches into sections, allocate room venues, assign section teachers, and track student quotas."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Section
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Sections"
          value={`${sections.length} Sections`}
          description="Average 31 students per section"
          icon={DoorOpen}
          variant="indigo"
        />
        <StatsCard
          title="Classroom Facilities"
          value="10 Assigned Venues"
          description="Science Hall, Academic & Junior Wings"
          icon={School}
          variant="emerald"
        />
        <StatsCard
          title="Available Desk Capacity"
          value="29 Free Desks"
          description="Across all configured rooms"
          icon={Users}
          variant="blue"
        />
      </div>

      {/* Search & Filter Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search by section, room, batch, or teacher..."
                icon={Search}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="w-full sm:w-44">
                <Select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "Batch (All)", value: "all" },
                    ...BATCH_OPTIONS.map((b) => ({ label: b, value: b })),
                  ]}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: "Batch Name", value: "class-asc" },
                    { label: "Students (Highest)", value: "students-desc" },
                    { label: "Students (Lowest)", value: "students-asc" },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Configured Batch Sections</CardTitle>
            <CardDescription>
              Showing {processedSections.length} section divisions across batches.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedSections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Section Name</TableHead>
                  <TableHead>Assigned Batch</TableHead>
                  <TableHead>Room / Venue</TableHead>
                  <TableHead>Section Teacher</TableHead>
                  <TableHead>Desk Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSections.map((sec) => {
                  const occupancy = Math.round((sec.studentCount / sec.capacity) * 100) || 0;
                  return (
                    <TableRow key={sec.id}>
                      <TableCell>
                        <div
                          onClick={() => detailModal.open(sec)}
                          className="cursor-pointer group"
                        >
                          <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                            {sec.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">
                            {sec.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-800">
                          {sec.className}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <DoorOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono">{sec.room}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-800">
                          <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          <span>{sec.classTeacher}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-900">
                              {sec.studentCount} / {sec.capacity}
                            </span>
                            <span className="text-slate-500 font-mono">{occupancy}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                occupancy > 90 ? "bg-amber-500" : "bg-emerald-600"
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={sec.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => detailModal.open(sec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Edit Section"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDelete(sec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Section"
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
              title="No sections found"
              description="Adjust your search criteria or reset class filters."
              actionLabel="Reset Search"
              onAction={() => {
                setSearch("");
                setClassFilter("all");
              }}
            />
          )}

          {/* Pagination Controls */}
          {processedSections.length > 0 && (
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
                  {Math.min(currentPage * pageSize, processedSections.length)} of{" "}
                  {processedSections.length} entries
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

      {/* Create / Edit Section Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={editingSectionId ? "Edit Section Details" : "Create New Class Section"}
        description="Allocate room numbers, desk capacities, and designated section tutors."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingSectionId ? "Save Changes" : "Create Section"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Section Name *"
              placeholder="e.g. Section C"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Select
              label="Enrolled Batch *"
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              options={BATCH_OPTIONS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Assigned Room / Venue *"
              placeholder="e.g. Science Hall 203"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              error={formErrors.room}
            />
            <Input
              label="Max Desk Capacity *"
              type="number"
              placeholder="35"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              error={formErrors.capacity}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Designated Section Tutor"
              placeholder="e.g. Prof. Marcus Aurel"
              value={formData.classTeacher}
              onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
            />
            <Select
              label="Section Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* View Section Details Modal */}
      {detailModal.modalData && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title={`${detailModal.modalData.className} — ${detailModal.modalData.name}`}
          description="Detailed room allocation and capacity audit."
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
                  Edit Section
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
                  Venue: {detailModal.modalData.room}
                </span>
                <StatusBadge status={detailModal.modalData.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {detailModal.modalData.className} • {detailModal.modalData.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tutor in Charge: <strong className="text-slate-900">{detailModal.modalData.classTeacher}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Enrolled Students</span>
                <span className="text-slate-900 font-bold text-sm">{detailModal.modalData.studentCount} Students</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Max Desk Capacity</span>
                <span className="text-slate-900 font-bold text-sm">{detailModal.modalData.capacity} Desks</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                <span className="text-slate-400 block font-semibold mb-0.5">Occupancy Load</span>
                <span className="text-emerald-600 font-bold text-sm">
                  {Math.round((detailModal.modalData.studentCount / detailModal.modalData.capacity) * 100)}% Capacity Utilized
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
            <span>This action modifies section allocations in local state.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
