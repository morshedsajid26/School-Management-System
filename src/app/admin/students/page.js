"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import { mockStudents } from "@/data/mock/students";
import { useModal } from "@/hooks/useModal";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  Download,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  BookOpen,
  MapPin,
  ExternalLink,
  X,
} from "lucide-react";

const GRADES = ["Grade 10", "Grade 9", "Grade 8", "Grade 7", "Grade 6"];
const SECTIONS = ["A", "B", "C"];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modals
  const editModal = useModal();
  const detailModal = useModal();
  const archiveDeleteModal = useModal();

  // Active target student
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    admissionNumber: "",
    rollNumber: "",
    grade: "Grade 10",
    section: "A",
    gender: "Male",
    dob: "2010-01-01",
    bloodGroup: "O+",
    email: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    admissionDate: "2024-08-15",
    status: "active",
  });
  const [editErrors, setEditErrors] = useState({});

  // Summary Stats
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => s.status === "active").length;
    const distinctGrades = new Set(students.map((s) => s.grade)).size;
    const avgAttendance =
      total > 0
        ? (students.reduce((acc, curr) => acc + (Number(curr.attendanceRate) || 0), 0) / total).toFixed(1)
        : 0;

    return { total, active, distinctGrades, avgAttendance };
  }, [students]);

  // Filtered and Sorted Students
  const processedStudents = useMemo(() => {
    let result = students.filter((s) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query)) ||
        s.rollNumber.toLowerCase().includes(query) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        (s.phone && s.phone.toLowerCase().includes(query)) ||
        (s.address && s.address.toLowerCase().includes(query));

      const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
      const matchesSection = sectionFilter === "all" || s.section === sectionFilter;
      const matchesGender = genderFilter === "all" || s.gender?.toLowerCase() === genderFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesGrade && matchesSection && matchesGender && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "adm-asc") return (a.admissionNumber || "").localeCompare(b.admissionNumber || "");
      if (sortBy === "roll-asc") return (a.rollNumber || "").localeCompare(b.rollNumber || "");
      if (sortBy === "admDate-desc") return new Date(b.admissionDate) - new Date(a.admissionDate);
      return 0;
    });

    return result;
  }, [students, search, gradeFilter, sectionFilter, genderFilter, statusFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(processedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedStudents.slice(start, start + pageSize);
  }, [processedStudents, currentPage, pageSize]);

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setEditFormData({
      name: student.name,
      admissionNumber: student.admissionNumber || "",
      rollNumber: student.rollNumber || "",
      grade: student.grade || "Grade 10",
      section: student.section || "A",
      gender: student.gender || "Male",
      dob: student.dob || "2010-01-01",
      bloodGroup: student.bloodGroup || "O+",
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      emergencyContactName: student.emergencyContactName || "",
      emergencyContactPhone: student.emergencyContactPhone || "",
      admissionDate: student.admissionDate || "2024-08-15",
      status: student.status || "active",
    });
    setEditErrors({});
    editModal.open();
  };

  // Open Quick View Modal
  const handleOpenDetail = (student) => {
    setSelectedStudent(student);
    detailModal.open();
  };

  // Open Archive / Delete Modal
  const handleOpenArchiveDelete = (student) => {
    setSelectedStudent(student);
    archiveDeleteModal.open();
  };

  // Validate Edit Form
  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.name.trim()) errors.name = "Student name is required";
    if (!editFormData.admissionNumber.trim()) errors.admissionNumber = "Admission number is required";
    if (!editFormData.rollNumber.trim()) errors.rollNumber = "Roll number is required";
    if (!editFormData.dob) errors.dob = "Date of birth is required";
    if (!editFormData.admissionDate) errors.admissionDate = "Admission date is required";

    if (editFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Edit Student
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              ...editFormData,
            }
          : s
      )
    );
    showToast(`Updated profile for ${editFormData.name} successfully!`);
    editModal.close();
  };

  // Archive Student Action
  const handleArchiveStudent = () => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((s) => (s.id === selectedStudent.id ? { ...s, status: "archived" } : s))
    );
    archiveDeleteModal.close();
    showToast(`Student ${selectedStudent.name} archived successfully.`, "info");
  };

  // Delete Student Action
  const handleDeleteStudent = () => {
    if (!selectedStudent) return;
    setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
    archiveDeleteModal.close();
    showToast(`Student record for ${selectedStudent.name} permanently removed.`, "info");
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Admission No,Student Name,Class,Section,Roll No,Gender,DOB,Email,Phone,Emergency Contact,Status,Admission Date"]
        .concat(
          students.map(
            (s) =>
              `"${s.admissionNumber || s.id}","${s.name}","${s.grade}","${s.section}","${s.rollNumber}","${s.gender}","${s.dob}","${s.email}","${s.phone}","${s.emergencyContactPhone || s.guardianPhone || ""}","${s.status}","${s.admissionDate}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Oakridge_Student_Directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Student roster exported to CSV successfully!");
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
        title="Student Management & Directory"
        subtitle="Manage enrolled students, admission records, class allocations, attendance status, and student credentials."
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
            <Link href="/admin/students/admission">
              <Button variant="primary" size="md" icon={UserPlus}>
                New Student Admission
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sub Navigation */}
      <PeopleNavTabs />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.total}
          icon={Users}
          variant="indigo"
          description="Cumulative student roster"
        />
        <StatsCard
          title="Active Cohort"
          value={stats.active}
          icon={UserCheck}
          variant="emerald"
          description={`${((stats.active / (stats.total || 1)) * 100).toFixed(0)}% actively enrolled`}
        />
        <StatsCard
          title="Class Cohorts"
          value={stats.distinctGrades}
          icon={Building}
          variant="purple"
          description="Grade divisions represented"
        />
        <StatsCard
          title="Avg. Attendance"
          value={`${stats.avgAttendance}%`}
          icon={BookOpen}
          variant="amber"
          description="Academic participation rate"
        />
      </div>

      {/* Main Student Directory Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                Showing {processedStudents.length} student{processedStudents.length !== 1 ? "s" : ""} matching current filters
              </CardDescription>
            </div>

            {/* Quick Filters / Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-full sm:w-60">
                <Input
                  placeholder="Search name, admission #, roll..."
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
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Grades", value: "all" },
                    ...GRADES.map((g) => ({ label: g, value: g })),
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
                    ...SECTIONS.map((sec) => ({ label: `Sec ${sec}`, value: sec })),
                  ]}
                />
              </div>

              <div className="w-32">
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Archived", value: "archived" },
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
                    { label: "Admission No.", value: "adm-asc" },
                    { label: "Roll Number", value: "roll-asc" },
                    { label: "Recently Admitted", value: "admDate-desc" },
                  ]}
                />
              </div>

              {(search || gradeFilter !== "all" || sectionFilter !== "all" || genderFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setGradeFilter("all");
                    setSectionFilter("all");
                    setGenderFilter("all");
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
          {paginatedStudents.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Users}
                title="No students match criteria"
                description={
                  search || gradeFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting search terms, clearing active filters, or check spelling."
                    : "Get started by admitting your first student into Oakridge Academy."
                }
                action={
                  <Link href="/admin/students/admission">
                    <Button variant="primary" size="sm" icon={UserPlus}>
                      New Student Admission
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Student Profile</TableHead>
                    <TableHead>Class & Roll No.</TableHead>
                    <TableHead>Demographics</TableHead>
                    <TableHead>Contact & Address</TableHead>
                    <TableHead>Emergency Line</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student) => (
                    <TableRow key={student.id}>
                      {/* Student Profile Column */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={student.avatar}
                            name={student.name}
                            size="md"
                            className="ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/admin/students/${student.id}`}
                              className="font-bold text-slate-900 text-sm truncate hover:text-indigo-600 transition flex items-center gap-1.5 group"
                            >
                              <span>{student.name}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition text-indigo-500" />
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {student.admissionNumber || student.id}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Roll: {student.rollNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Class & Roll */}
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {student.grade}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            Section {student.section}
                          </span>
                        </div>
                      </TableCell>

                      {/* Demographics */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-800">{student.gender || "N/A"}</span>
                            {student.bloodGroup && (
                              <span className="text-[10px] px-1 bg-rose-50 text-rose-700 rounded font-mono font-bold">
                                {student.bloodGroup}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            DOB: {student.dob || "2010-04-12"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Contact & Address */}
                      <TableCell>
                        <div className="space-y-1 text-xs text-slate-600 max-w-[190px]">
                          {student.email && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${student.email}`}
                                className="hover:text-indigo-600 truncate text-[11px]"
                              >
                                {student.email}
                              </a>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                          {student.address && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{student.address}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Emergency Line */}
                      <TableCell>
                        {student.emergencyContactPhone || student.guardianPhone ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                              <ShieldAlert className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              <span>{student.emergencyContactPhone || student.guardianPhone}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                              {student.emergencyContactName || student.guardianName || "Contact"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">Not set</span>
                        )}
                      </TableCell>

                      {/* Admission Date */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-700">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{student.admissionDate || "2024-08-15"}</span>
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">
                            AY {student.academicYear || "2025-2026"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/students/${student.id}`}
                            title="View Full Profile Page"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Student Record"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenArchiveDelete(student)}
                            title="Archive or Remove"
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
                  {processedStudents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(currentPage * pageSize, processedStudents.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{processedStudents.length}</strong> students
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

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Student Information"
        description="Modify student profile details, class allocation, and contact records."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveEdit}>
              Save Student Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Student Name *"
              value={editFormData.name}
              error={editErrors.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />

            <Input
              label="Admission Number *"
              value={editFormData.admissionNumber}
              error={editErrors.admissionNumber}
              onChange={(e) => setEditFormData({ ...editFormData, admissionNumber: e.target.value })}
            />

            <Select
              label="Class / Grade *"
              value={editFormData.grade}
              onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
              options={GRADES.map((g) => ({ label: g, value: g }))}
            />

            <Select
              label="Section *"
              value={editFormData.section}
              onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
              options={SECTIONS.map((sec) => ({ label: `Section ${sec}`, value: sec }))}
            />

            <Input
              label="Roll Number *"
              placeholder="e.g. 10-A-01"
              value={editFormData.rollNumber}
              error={editErrors.rollNumber}
              onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
            />

            <Input
              label="Date of Birth *"
              type="date"
              value={editFormData.dob}
              error={editErrors.dob}
              onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
            />

            <Select
              label="Gender"
              value={editFormData.gender}
              onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />

            <Select
              label="Blood Group"
              value={editFormData.bloodGroup}
              onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({
                label: b,
                value: b,
              }))}
            />

            <Input
              label="Student Email"
              type="email"
              value={editFormData.email}
              error={editErrors.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            />

            <Input
              label="Student Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />

            <Input
              label="Emergency Contact Name"
              value={editFormData.emergencyContactName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, emergencyContactName: e.target.value })
              }
            />

            <Input
              label="Emergency Contact Phone"
              value={editFormData.emergencyContactPhone}
              onChange={(e) =>
                setEditFormData({ ...editFormData, emergencyContactPhone: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <Input
                label="Home Address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>

            <Input
              label="Admission Date *"
              type="date"
              value={editFormData.admissionDate}
              error={editErrors.admissionDate}
              onChange={(e) => setEditFormData({ ...editFormData, admissionDate: e.target.value })}
            />

            <Select
              label="Enrollment Status"
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              options={[
                { label: "Active Student", value: "active" },
                { label: "Inactive / Suspended", value: "inactive" },
                { label: "Archived / Transferred", value: "archived" },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* ARCHIVE / DELETE CONFIRMATION MODAL */}
      {selectedStudent && (
        <Modal
          isOpen={archiveDeleteModal.isOpen}
          onClose={archiveDeleteModal.close}
          title="Student Record Action"
          description={`Selected: ${selectedStudent.name} (${selectedStudent.admissionNumber || selectedStudent.id})`}
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="md" onClick={archiveDeleteModal.close}>
                Cancel
              </Button>
              <Button variant="outline" size="md" icon={Archive} onClick={handleArchiveStudent}>
                Archive Record
              </Button>
              <Button variant="danger" size="md" icon={Trash2} onClick={handleDeleteStudent}>
                Permanently Delete
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Choose how to handle this student file:</p>
                <p className="text-amber-800 leading-relaxed">
                  <strong>Archive Record:</strong> Keeps the student&apos;s academic history, attendance, and exam
                  records preserved while marking their status as archived (recommended for transferred students or graduates).
                </p>
                <p className="text-amber-800 leading-relaxed pt-1">
                  <strong>Permanently Delete:</strong> Completely purges the student from the database. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
