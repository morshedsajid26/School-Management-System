"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import PeopleNavTabs from "@/components/shared/PeopleNavTabs";
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
import { mockStaffList } from "@/data/mock/staff";
import { useModal } from "@/hooks/useModal";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  ShieldAlert,
  Clock,
  Building,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Award,
  Users,
  X,
} from "lucide-react";

const STAFF_DEPARTMENTS = [
  "Library & Archives",
  "Health & Infirmary",
  "Science Laboratories",
  "Registrar & Admissions",
  "Facilities & Maintenance",
  "Information Technology",
  "Campus Security & Safety",
  "Student Transport",
];

const SHIFT_OPTIONS = [
  "Day Shift (08:00 - 16:30)",
  "Full Day (07:30 - 15:30)",
  "Morning (08:00 - 16:00)",
  "Office Hours (08:30 - 17:00)",
  "Early Shift (06:30 - 14:30)",
  "Afternoon (11:00 - 19:00)",
  "Night Watch (20:00 - 06:00)",
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState(mockStaffList);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const createEditModal = useModal();
  const detailModal = useModal();
  const deleteModal = useModal();

  // Toast message
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "",
    designation: "",
    department: "Library & Archives",
    shift: "Day Shift (08:00 - 16:30)",
    email: "",
    phone: "",
    emergencyContact: "",
    qualification: "",
    room: "",
    joinDate: "2025-09-01",
    status: "active",
  });
  const [formErrors, setFormErrors] = useState({});

  // Active target
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter((s) => s.status === "active").length;
    const depts = new Set(staff.map((s) => s.department)).size;
    const healthSafety = staff.filter(
      (s) =>
        s.department === "Health & Infirmary" ||
        s.department === "Facilities & Maintenance" ||
        s.department === "Campus Security & Safety"
    ).length;

    return { total, active, depts, healthSafety };
  }, [staff]);

  // Filtered & Sorted Staff
  const processedStaff = useMemo(() => {
    let result = staff.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.employeeId.toLowerCase().includes(query) ||
        item.designation.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query) ||
        (item.room && item.room.toLowerCase().includes(query)) ||
        (item.shift && item.shift.toLowerCase().includes(query));

      const matchesDept = deptFilter === "all" || item.department === deptFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesShift = shiftFilter === "all" || item.shift === shiftFilter;

      return matchesSearch && matchesDept && matchesStatus && matchesShift;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "empId-asc") return a.employeeId.localeCompare(b.employeeId);
      if (sortBy === "joinDate-desc") return new Date(b.joinDate) - new Date(a.joinDate);
      return 0;
    });

    return result;
  }, [staff, search, deptFilter, statusFilter, shiftFilter, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(processedStaff.length / pageSize) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedStaff.slice(start, start + pageSize);
  }, [processedStaff, currentPage, pageSize]);

  // Generate next Employee ID
  const generateNextEmployeeId = () => {
    const maxNum = staff.reduce((max, s) => {
      const match = s.employeeId.match(/\d+$/);
      if (match) {
        const val = parseInt(match[0], 10);
        return val > max ? val : max;
      }
      return max;
    }, 200);
    return `EMP-S-${maxNum + 1}`;
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: "",
      employeeId: generateNextEmployeeId(),
      designation: "Operations & Facility Coordinator",
      department: "Facilities & Maintenance",
      shift: "Day Shift (08:00 - 16:30)",
      email: "",
      phone: "+1 (555) 321-",
      emergencyContact: "+1 (555) 901-",
      qualification: "Certified Facilities Supervisor",
      room: "Administration Annex Suite 10",
      joinDate: "2025-09-01",
      status: "active",
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    setIsEditing(true);
    setEditingId(member.id);
    setFormData({
      name: member.name,
      employeeId: member.employeeId,
      designation: member.designation,
      department: member.department,
      shift: member.shift || "Day Shift (08:00 - 16:30)",
      email: member.email,
      phone: member.phone,
      emergencyContact: member.emergencyContact || "",
      qualification: member.qualification || "",
      room: member.room || "",
      joinDate: member.joinDate || "",
      status: member.status,
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Details Modal
  const handleOpenDetail = (member) => {
    setSelectedStaff(member);
    detailModal.open();
  };

  // Open Delete Modal
  const handleOpenDelete = (member) => {
    setSelectedStaff(member);
    deleteModal.open();
  };

  // Toggle Status
  const handleToggleStatus = (member) => {
    const newStatus = member.status === "active" ? "inactive" : "active";
    setStaff((prev) =>
      prev.map((s) => (s.id === member.id ? { ...s, status: newStatus } : s))
    );
    showToast(
      `${member.name} status updated to ${newStatus === "active" ? "Active" : "Inactive"}.`,
      "info"
    );
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.employeeId.trim()) errors.employeeId = "Employee ID is required";
    if (!formData.designation.trim()) errors.designation = "Designation/Role is required";
    if (!formData.department.trim()) errors.department = "Department is required";
    if (!formData.shift.trim()) errors.shift = "Work shift is required";
    if (!formData.joinDate) errors.joinDate = "Joining date is required";

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!isEditing) {
      const duplicate = staff.some(
        (s) => s.employeeId.toLowerCase() === formData.employeeId.toLowerCase().trim()
      );
      if (duplicate) errors.employeeId = "Employee ID already exists in records";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Staff
  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setStaff((prev) =>
        prev.map((s) => (s.id === editingId ? { ...s, ...formData } : s))
      );
      showToast(`Staff record for ${formData.name} updated successfully!`);
    } else {
      const newStaff = {
        id: `STF-${String(staff.length + 1).padStart(3, "0")}`,
        ...formData,
        avatar: `https://images.unsplash.com/photo-${1500648767791 + staff.length}?w=150&auto=format&fit=crop&q=80`,
      };
      setStaff((prev) => [newStaff, ...prev]);
      showToast(`Staff member ${formData.name} registered successfully!`);
    }

    createEditModal.close();
  };

  // Delete Staff
  const handleConfirmDelete = () => {
    if (!selectedStaff) return;
    setStaff((prev) => prev.filter((s) => s.id !== selectedStaff.id));
    deleteModal.close();
    showToast(`Removed ${selectedStaff.name} from staff directory.`, "info");
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Employee ID,Name,Designation,Department,Shift,Room,Email,Phone,Emergency Contact,Status,Joining Date"]
        .concat(
          staff.map(
            (s) =>
              `"${s.employeeId}","${s.name}","${s.designation}","${s.department}","${s.shift}","${s.room}","${s.email}","${s.phone}","${s.emergencyContact}","${s.status}","${s.joinDate}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oakridge_Staff_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Staff directory exported to CSV successfully!");
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
        title="Administrative & Support Staff"
        subtitle="Manage campus medical officers, librarians, laboratory coordinators, administrative officers, and facility crew."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
            >
              Export Directory
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Add Staff Member
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <PeopleNavTabs />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Staff"
          value={stats.total}
          icon={Briefcase}
          variant="indigo"
          description="Support & administrative roster"
        />
        <StatsCard
          title="Active On-Duty"
          value={stats.active}
          icon={UserCheck}
          variant="emerald"
          description={`${((stats.active / (stats.total || 1)) * 100).toFixed(0)}% reporting for duty`}
        />
        <StatsCard
          title="Departments"
          value={stats.depts}
          icon={Building}
          variant="purple"
          description="Operational wings"
        />
        <StatsCard
          title="Safety & Medical"
          value={stats.healthSafety}
          icon={ShieldAlert}
          variant="rose"
          description="First response & facility staff"
        />
      </div>

      {/* Main Staff Roster Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                Showing {processedStaff.length} member{processedStaff.length !== 1 ? "s" : ""} across all operational units
              </CardDescription>
            </div>

            {/* Quick Filters / Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search name, ID, title, room..."
                  icon={Search}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="w-44">
                <Select
                  value={deptFilter}
                  onChange={(e) => {
                    setDeptFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Departments", value: "all" },
                    ...STAFF_DEPARTMENTS.map((d) => ({ label: d, value: d })),
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
                  ]}
                />
              </div>

              {(search || deptFilter !== "all" || statusFilter !== "all" || shiftFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setDeptFilter("all");
                    setStatusFilter("all");
                    setShiftFilter("all");
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
          {paginatedStaff.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Briefcase}
                title="No staff members found"
                description={
                  search || deptFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria, clearing active filters, or check spelling."
                    : "Get started by adding your first administrative or support staff member."
                }
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleOpenCreate}
                  >
                    Add Staff Member
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Designation & Unit</TableHead>
                    <TableHead>Shift & Workstation</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Emergency Line</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStaff.map((person) => (
                    <TableRow key={person.id}>
                      {/* Member Profile */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={person.avatar}
                            name={person.name}
                            size="md"
                            className="ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <span
                              className="font-bold text-slate-900 text-sm truncate hover:text-indigo-600 transition cursor-pointer"
                              onClick={() => handleOpenDetail(person)}
                            >
                              {person.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                                {person.employeeId}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                Joined {person.joinDate || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Designation & Unit */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {person.designation}
                          </p>
                          <Badge
                            variant={
                              person.department.includes("Health")
                                ? "rose"
                                : person.department.includes("Library")
                                ? "blue"
                                : person.department.includes("Laboratories")
                                ? "purple"
                                : person.department.includes("Facilities")
                                ? "amber"
                                : "indigo"
                            }
                            size="sm"
                          >
                            {person.department}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Shift & Workstation */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{person.shift}</span>
                          </div>
                          {person.room && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{person.room}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${person.email}`}
                              className="hover:text-indigo-600 truncate"
                            >
                              {person.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{person.phone}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Emergency Line */}
                      <TableCell>
                        {person.emergencyContact ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 max-w-fit">
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                            <span>{person.emergencyContact}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not recorded</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={person.status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(person)}
                            title="View Staff Profile"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(person)}
                            title="Edit Record"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(person)}
                            title={person.status === "active" ? "Mark Inactive" : "Mark Active"}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          >
                            {person.status === "active" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenDelete(person)}
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
                  {processedStaff.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(currentPage * pageSize, processedStaff.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{processedStaff.length}</strong> staff
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

      {/* CREATE / EDIT STAFF MODAL */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={isEditing ? "Edit Staff Profile" : "Register New Staff Member"}
        description={
          isEditing
            ? "Update duties, schedule shifts, or contact details."
            : "Enroll a new administrative, medical, or support staff member."
        }
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveStaff}>
              {isEditing ? "Save Changes" : "Register Staff Member"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveStaff} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Derrick Vance"
              value={formData.name}
              error={formErrors.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Employee ID *"
              placeholder="e.g. EMP-S-208"
              value={formData.employeeId}
              error={formErrors.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />

            <Input
              label="Designation / Title *"
              placeholder="e.g. Senior Science Lab Coordinator"
              value={formData.designation}
              error={formErrors.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />

            <Select
              label="Department *"
              value={formData.department}
              error={formErrors.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={STAFF_DEPARTMENTS.map((d) => ({ label: d, value: d }))}
            />

            <Select
              label="Work Shift / Schedule *"
              value={formData.shift}
              error={formErrors.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              options={SHIFT_OPTIONS.map((s) => ({ label: s, value: s }))}
            />

            <Input
              label="Duty Station / Room"
              placeholder="e.g. Science Complex Prep Lab"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />

            <Input
              label="Official Email *"
              type="email"
              placeholder="staff.name@oakridgeacademy.edu"
              value={formData.email}
              error={formErrors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Contact Phone *"
              placeholder="+1 (555) 321-XXXX"
              value={formData.phone}
              error={formErrors.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="+1 (555) 901-XXXX"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />

            <Input
              label="Qualifications / Certifications"
              placeholder="e.g. B.Sc. Chemistry & Lab Safety Cert."
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />

            <Input
              label="Joining Date *"
              type="date"
              value={formData.joinDate}
              error={formErrors.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active Staff", value: "active" },
                { label: "Inactive / On Leave", value: "inactive" },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* VIEW STAFF DETAIL MODAL */}
      {selectedStaff && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title="Staff Member Profile"
          description={`Employee ID: ${selectedStaff.employeeId}`}
          maxWidth="max-w-xl"
          footer={
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  detailModal.close();
                  handleOpenEdit(selectedStaff);
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-5 text-white">
              <div className="relative z-10 flex items-start gap-4">
                <Avatar
                  src={selectedStaff.avatar}
                  name={selectedStaff.name}
                  size="xl"
                  className="ring-4 ring-white/20 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-bold truncate">{selectedStaff.name}</h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedStaff.status === "active"
                          ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                          : "bg-slate-500/30 text-slate-300 border border-slate-400/30"
                      }`}
                    >
                      {selectedStaff.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 font-medium">{selectedStaff.designation}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
                    <span className="bg-white/10 px-2 py-0.5 rounded font-mono font-semibold">
                      {selectedStaff.employeeId}
                    </span>
                    <span>•</span>
                    <span>{selectedStaff.department}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Work Shift</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{selectedStaff.shift}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Building className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Workstation / Room</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedStaff.room || "Administration Wing"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Joining Date</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{selectedStaff.joinDate || "N/A"}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Award className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Qualification</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedStaff.qualification || "Certified Staff"}
                </p>
              </div>
            </div>

            {/* Emergency Contact Highlight */}
            {selectedStaff.emergencyContact && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold uppercase text-rose-900">
                      Designated Emergency Contact
                    </p>
                    <p className="text-xs font-mono font-bold text-rose-800">
                      {selectedStaff.emergencyContact}
                    </p>
                  </div>
                </div>
                <a
                  href={`tel:${selectedStaff.emergencyContact}`}
                  className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 transition"
                >
                  Call Line
                </a>
              </div>
            )}

            {/* Direct Contact Channels */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Direct Contact Information
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedStaff.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <Mail className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                    <p className="text-xs font-semibold text-slate-800 truncate">{selectedStaff.email}</p>
                  </div>
                </a>

                <a
                  href={`tel:${selectedStaff.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
                >
                  <Phone className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Direct Phone</p>
                    <p className="text-xs font-mono font-semibold text-slate-800 truncate">
                      {selectedStaff.phone}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {selectedStaff && (
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Confirm Staff Record Removal"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Delete Staff Record
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Caution: Removing staff member record.</p>
                <p className="text-rose-700 leading-relaxed">
                  Removing <strong className="font-semibold text-rose-900">{selectedStaff.name}</strong> (
                  <span className="font-mono">{selectedStaff.employeeId}</span>) will revoke duty assignments in{" "}
                  <strong>{selectedStaff.department}</strong> and archive their campus profile.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              If this member is on extended leave or vacation, you can switch their status to <strong>Inactive</strong>{" "}
              instead of permanently deleting their record.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
