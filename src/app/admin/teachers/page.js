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
import { mockTeachers } from "@/data/mock/teachers";
import { useModal } from "@/hooks/useModal";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  BookOpen,
  Award,
  Calendar,
  Building,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  X,
} from "lucide-react";

const DEPARTMENTS = [
  "Science",
  "Mathematics",
  "Humanities",
  "Technology",
  "Athletics",
  "Languages",
  "Performing Arts",
];

const AVAILABLE_CLASSES = [
  "Batch 2025 - Sec A",
  "Batch 2025 - Sec B",
  "Batch 2024 - Sec A",
  "Batch 2024 - Sec B",
  "Batch 2026 - Sec A",
  "Batch 2026 - Sec B",
  "Batch 2027 - Sec A",
  "Batch 2028 - Sec A",
];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const createEditModal = useModal();
  const detailModal = useModal();
  const deleteModal = useModal();

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    designation: "",
    department: "Science",
    subject: "",
    qualification: "",
    email: "",
    phone: "",
    room: "",
    joinDate: "2025-09-01",
    experienceYears: 5,
    status: "active",
    classesAssigned: [],
  });
  const [formErrors, setFormErrors] = useState({});

  // Detail & Delete Target
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter((t) => t.status === "active").length;
    const depts = new Set(teachers.map((t) => t.department)).size;
    const avgExp =
      total > 0
        ? (teachers.reduce((acc, curr) => acc + (Number(curr.experienceYears) || 0), 0) / total).toFixed(1)
        : 0;

    return { total, active, depts, avgExp };
  }, [teachers]);

  // Filtered & Sorted Teachers
  const processedTeachers = useMemo(() => {
    let result = teachers.filter((teacher) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.employeeId.toLowerCase().includes(query) ||
        teacher.subject.toLowerCase().includes(query) ||
        teacher.department.toLowerCase().includes(query) ||
        (teacher.qualification && teacher.qualification.toLowerCase().includes(query)) ||
        (teacher.room && teacher.room.toLowerCase().includes(query));

      const matchesDept = deptFilter === "all" || teacher.department === deptFilter;
      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "empId-asc") return a.employeeId.localeCompare(b.employeeId);
      if (sortBy === "joinDate-desc") return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === "experience-desc") return (b.experienceYears || 0) - (a.experienceYears || 0);
      return 0;
    });

    return result;
  }, [teachers, search, deptFilter, statusFilter, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(processedTeachers.length / pageSize) || 1;
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTeachers.slice(start, start + pageSize);
  }, [processedTeachers, currentPage, pageSize]);

  // Helper to generate next Employee ID
  const generateNextEmployeeId = () => {
    const maxNum = teachers.reduce((max, t) => {
      const match = t.employeeId.match(/\d+$/);
      if (match) {
        const val = parseInt(match[0], 10);
        return val > max ? val : max;
      }
      return max;
    }, 100);
    return `EMP-T-${maxNum + 1}`;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      employeeId: generateNextEmployeeId(),
      designation: "Senior Faculty Specialist",
      department: "Science",
      subject: "",
      qualification: "M.Sc. Education, B.Ed.",
      email: "",
      phone: "+1 (555) 019-",
      room: "Academic Block 101",
      joinDate: "2025-09-01",
      experienceYears: 5,
      status: "active",
      classesAssigned: ["Grade 10-A", "Grade 9-A"],
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (teacher) => {
    setIsEditing(true);
    setEditingId(teacher.id);
    setFormData({
      name: teacher.name,
      employeeId: teacher.employeeId,
      designation: teacher.designation,
      department: teacher.department,
      subject: teacher.subject,
      qualification: teacher.qualification,
      email: teacher.email,
      phone: teacher.phone,
      room: teacher.room || "",
      joinDate: teacher.joinDate || "",
      experienceYears: teacher.experienceYears || 1,
      status: teacher.status,
      classesAssigned: [...(teacher.classesAssigned || [])],
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Details Modal
  const handleOpenDetail = (teacher) => {
    setSelectedTeacher(teacher);
    detailModal.open();
  };

  // Open Delete Modal
  const handleOpenDelete = (teacher) => {
    setSelectedTeacher(teacher);
    deleteModal.open();
  };

  // Toggle Status
  const handleToggleStatus = (teacher) => {
    const newStatus = teacher.status === "active" ? "inactive" : "active";
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacher.id ? { ...t, status: newStatus } : t))
    );
    showToast(
      `${teacher.name} status updated to ${newStatus === "active" ? "Active" : "Inactive"}.`,
      "info"
    );
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!formData.designation.trim()) errors.designation = "Designation is required";
    if (!formData.subject.trim()) errors.subject = "Primary subject specialization is required";
    if (!formData.qualification.trim()) errors.qualification = "Qualification is required";
    if (!formData.joinDate) errors.joinDate = "Joining date is required";

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (formData.classesAssigned.length === 0) {
      errors.classesAssigned = "Select at least one assigned class";
    }

    // Check duplicate employee ID if creating
    if (!isEditing) {
      const duplicate = teachers.some(
        (t) => t.employeeId.toLowerCase() === formData.employeeId.toLowerCase().trim()
      );
      if (duplicate) errors.employeeId = "Employee ID already assigned to another teacher";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Teacher
  const handleSaveTeacher = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...formData,
                experienceYears: Number(formData.experienceYears) || 0,
              }
            : t
        )
      );
      showToast(`Faculty profile for ${formData.name} updated successfully!`);
    } else {
      const newTeacher = {
        id: `TCH-${String(teachers.length + 1).padStart(3, "0")}`,
        ...formData,
        experienceYears: Number(formData.experienceYears) || 0,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + teachers.length}?w=150&auto=format&fit=crop&q=80`,
      };
      setTeachers((prev) => [newTeacher, ...prev]);
      showToast(`Faculty member ${formData.name} enrolled successfully!`);
    }

    createEditModal.close();
  };

  // Delete Teacher
  const handleConfirmDelete = () => {
    if (!selectedTeacher) return;
    setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
    deleteModal.close();
    showToast(`Removed ${selectedTeacher.name} from faculty directory.`, "info");
  };

  // Toggle Class Assignment in form
  const toggleClassAssignment = (className) => {
    setFormData((prev) => {
      const exists = prev.classesAssigned.includes(className);
      return {
        ...prev,
        classesAssigned: exists
          ? prev.classesAssigned.filter((c) => c !== className)
          : [...prev.classesAssigned, className],
      };
    });
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Employee ID,Name,Designation,Department,Subject,Email,Phone,Status,Joining Date"]
        .concat(
          teachers.map(
            (t) =>
              `"${t.employeeId}","${t.name}","${t.designation}","${t.department}","${t.subject}","${t.email}","${t.phone}","${t.status}","${t.joinDate}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oakridge_Faculty_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Faculty roster exported to CSV successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all transform translate-y-0 ${
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
        title="Faculty & Teacher Management"
        subtitle="Manage educator profiles, department allocations, subject specializations, class assignments, and active rosters."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Roster
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Add Faculty Member
            </Button>
          </div>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Faculty"
          value={stats.total}
          icon={GraduationCap}
          variant="indigo"
          description="Enrolled teaching staff"
        />
        <StatsCard
          title="Active Educators"
          value={stats.active}
          icon={UserCheck}
          variant="emerald"
          description={`${((stats.active / (stats.total || 1)) * 100).toFixed(0)}% actively lecturing`}
        />
        <StatsCard
          title="Academic Depts"
          value={stats.depts}
          icon={Building}
          variant="purple"
          description="Disciplines covered"
        />
        <StatsCard
          title="Avg. Experience"
          value={`${stats.avgExp} yrs`}
          icon={Award}
          variant="amber"
          description="Pedagogical tenure"
        />
      </div>

      {/* Main Roster Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Faculty Directory</CardTitle>
              <CardDescription>
                Showing {processedTeachers.length} educator{processedTeachers.length !== 1 ? "s" : ""} across all departments
              </CardDescription>
            </div>

            {/* Top Quick Filters / Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search by name, ID, subject..."
                  icon={Search}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="w-40">
                <Select
                  value={deptFilter}
                  onChange={(e) => {
                    setDeptFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Departments", value: "all" },
                    ...DEPARTMENTS.map((d) => ({ label: d, value: d })),
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Statuses", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                  ]}
                />
              </div>

              <div className="w-44">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: "Name: A to Z", value: "name-asc" },
                    { label: "Name: Z to A", value: "name-desc" },
                    { label: "Employee ID", value: "empId-asc" },
                    { label: "Recently Joined", value: "joinDate-desc" },
                    { label: "Most Experienced", value: "experience-desc" },
                  ]}
                />
              </div>

              {(search || deptFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setDeptFilter("all");
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
          {paginatedTeachers.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={GraduationCap}
                title="No faculty members found"
                description={
                  search || deptFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria, clearing active filters, or check spelling."
                    : "Get started by adding your first teacher or department faculty member."
                }
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenCreate}
                  >
                    Add Faculty Member
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
                    <TableHead>Designation & Dept</TableHead>
                    <TableHead>Subject & Assigned Classes</TableHead>
                    <TableHead>Contact & Room</TableHead>
                    <TableHead>Joining & Exp.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      {/* Profile Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={teacher.avatar}
                            name={teacher.name}
                            size="md"
                            className="ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm truncate hover:text-indigo-600 transition cursor-pointer" onClick={() => handleOpenDetail(teacher)}>
                                {teacher.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                                {teacher.employeeId}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {teacher.qualification}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Designation & Department */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
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
                                ? "emerald"
                                : "purple"
                            }
                            size="sm"
                          >
                            Dept. of {teacher.department}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Subject & Assigned Classes */}
                      <TableCell>
                        <div className="space-y-1.5 max-w-xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{teacher.subject}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(teacher.classesAssigned || []).map((cls) => (
                              <span
                                key={cls}
                                className="inline-block px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded transition"
                              >
                                {cls}
                              </span>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact & Room */}
                      <TableCell>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${teacher.email}`}
                              className="hover:text-indigo-600 truncate"
                            >
                              {teacher.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{teacher.phone}</span>
                          </div>
                          {teacher.room && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{teacher.room}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Joining & Experience */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{teacher.joinDate || "N/A"}</span>
                          </div>
                          <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {teacher.experienceYears || 0} yrs experience
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={teacher.status} />
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(teacher)}
                            title="View Faculty Profile"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            title="Edit Profile"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(teacher)}
                            title={teacher.status === "active" ? "Set to Inactive" : "Set to Active"}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          >
                            {teacher.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenDelete(teacher)}
                            title="Delete Record"
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
                  {processedTeachers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(currentPage * pageSize, processedTeachers.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{processedTeachers.length}</strong> teachers
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
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
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

      {/* CREATE / EDIT TEACHER MODAL */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={isEditing ? "Edit Faculty Profile" : "Onboard New Faculty Member"}
        description={
          isEditing
            ? "Modify faculty information, departmental designation, and teaching loads."
            : "Enroll a new teaching faculty member into Oakridge Academy academic records."
        }
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveTeacher}>
              {isEditing ? "Save Changes" : "Create Faculty Profile"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Dr. Catherine Bennett"
              value={formData.name}
              error={formErrors.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Employee ID *"
              placeholder="e.g. EMP-T-109"
              value={formData.employeeId}
              error={formErrors.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />

            <Input
              label="Designation / Role *"
              placeholder="e.g. Lead Mathematics Faculty"
              value={formData.designation}
              error={formErrors.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <Select
              label="Department *"
              value={formData.department}
              error={formErrors.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={DEPARTMENTS.map((d) => ({ label: `Dept. of ${d}`, value: d }))}
            />

            <Input
              label="Primary Subject Specialization *"
              placeholder="e.g. Pure Mathematics & Calculus"
              value={formData.subject}
              error={formErrors.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <Input
              label="Academic Qualification *"
              placeholder="e.g. Ph.D. in Mathematics, B.Ed."
              value={formData.qualification}
              error={formErrors.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />

            <Input
              label="Official Email *"
              type="email"
              placeholder="faculty.name@oakridgeacademy.edu"
              value={formData.email}
              error={formErrors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Contact Phone *"
              placeholder="+1 (555) 019-XXXX"
              value={formData.phone}
              error={formErrors.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Office / Room"
              placeholder="e.g. Science Hall 202"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />

            <Input
              label="Joining Date *"
              type="date"
              value={formData.joinDate}
              error={formErrors.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />

            <Input
              label="Years of Experience"
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active Faculty", value: "active" },
                { label: "Inactive / On Leave", value: "inactive" },
              ]}
            />
          </div>

          {/* Assigned Classes Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Assigned Classes / Cohorts *
              </label>
              <span className="text-[11px] text-slate-400">Click to assign or remove</span>
            </div>
            {formErrors.classesAssigned && (
              <p className="text-xs text-rose-600 font-medium">{formErrors.classesAssigned}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CLASSES.map((cls) => {
                const isSelected = formData.classesAssigned.includes(cls);
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => toggleClassAssignment(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {cls}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* VIEW FACULTY DETAIL MODAL */}
      {selectedTeacher && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title="Faculty Profile & Credentials"
          description={`Employee ID: ${selectedTeacher.employeeId}`}
          maxWidth="max-w-xl"
          footer={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  detailModal.close();
                  handleOpenEdit(selectedTeacher);
                }}
                icon={Edit}
              >
                Edit Profile
              </Button>
              <Button variant="primary" size="md" onClick={detailModal.close}>
                Done
              </Button>
            </>
          }
        >
          <div className="space-y-6">
            {/* Header Badge Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 p-5 text-white">
              <div className="relative z-10 flex items-start gap-4">
                <Avatar
                  src={selectedTeacher.avatar}
                  name={selectedTeacher.name}
                  size="xl"
                  className="ring-4 ring-white/20 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold truncate">{selectedTeacher.name}</h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedTeacher.status === "active"
                          ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-slate-500/30 text-slate-300 border border-slate-400/30"
                      }`}
                    >
                      {selectedTeacher.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 font-medium">{selectedTeacher.designation}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-indigo-300">
                    <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-semibold">
                      {selectedTeacher.employeeId}
                    </span>
                    <span>•</span>
                    <span>Dept. of {selectedTeacher.department}</span>
                    <span>•</span>
                    <span>{selectedTeacher.experienceYears || 0} yrs exp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Primary Subject</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{selectedTeacher.subject}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Award className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Qualification</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selectedTeacher.qualification || "Accredited Educator"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Joining Date</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{selectedTeacher.joinDate || "N/A"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Building className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Office / Room</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{selectedTeacher.room || "Faculty Lounge"}</p>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Cohort Allocations
              </h5>
              <div className="flex flex-wrap gap-2">
                {(selectedTeacher.classesAssigned || []).map((cls) => (
                  <Badge key={cls} variant="indigo" size="md">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Direct Contact Information */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Direct Contact Channels
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedTeacher.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <Mail className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                    <p className="text-xs font-semibold text-slate-800 truncate">{selectedTeacher.email}</p>
                  </div>
                </a>

                <a
                  href={`tel:${selectedTeacher.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <Phone className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Direct Phone</p>
                    <p className="text-xs font-mono font-semibold text-slate-800 truncate">
                      {selectedTeacher.phone}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {selectedTeacher && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Confirm Faculty Removal"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Delete Faculty Record
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Caution: You are about to remove an educator record.</p>
                <p className="text-rose-700 leading-relaxed">
                  Removing <strong className="font-semibold text-rose-900">{selectedTeacher.name}</strong> (
                  <span className="font-mono">{selectedTeacher.employeeId}</span>) will disassociate them from their
                  assigned classes ({selectedTeacher.classesAssigned?.join(", ")}) and archive their faculty file.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              If this educator is simply taking temporary leave or sabbatical, consider changing their status to{" "}
              <strong>Inactive</strong> instead of permanently deleting their record.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
