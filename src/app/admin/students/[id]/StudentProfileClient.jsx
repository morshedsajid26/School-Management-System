"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import PeopleNavTabs from "@/components/shared/PeopleNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/shared/EmptyState";
import { mockStudents } from "@/data/mock/students";
import { useModal } from "@/hooks/useModal";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Archive,
  Download,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  ShieldAlert,
  Award,
  BookOpen,
  MapPin,
  HeartPulse,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

const GRADES = ["Grade 10", "Grade 9", "Grade 8", "Grade 7", "Grade 6"];
const SECTIONS = ["A", "B", "C"];

export default function StudentProfileClient({ studentId }) {
  const router = useRouter();

  // Find initial student
  const initialStudent = useMemo(() => {
    return (
      mockStudents.find(
        (s) => s.id === studentId || s.admissionNumber?.toLowerCase() === studentId?.toLowerCase()
      ) || mockStudents[0]
    );
  }, [studentId]);

  const [student, setStudent] = useState(initialStudent);

  // Modals
  const editModal = useModal();
  const archiveDeleteModal = useModal();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Edit Form State
  const [formData, setFormData] = useState({
    name: student?.name || "",
    admissionNumber: student?.admissionNumber || student?.id || "",
    rollNumber: student?.rollNumber || "",
    grade: student?.grade || "Grade 10",
    section: student?.section || "A",
    gender: student?.gender || "Male",
    dob: student?.dob || "2010-04-12",
    bloodGroup: student?.bloodGroup || "O+",
    email: student?.email || "",
    phone: student?.phone || "",
    address: student?.address || "",
    emergencyContactName: student?.emergencyContactName || student?.guardianName || "",
    emergencyContactPhone: student?.emergencyContactPhone || student?.guardianPhone || "",
    admissionDate: student?.admissionDate || "2024-08-15",
    status: student?.status || "active",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenEdit = () => {
    setFormData({
      name: student.name,
      admissionNumber: student.admissionNumber || student.id,
      rollNumber: student.rollNumber,
      grade: student.grade,
      section: student.section,
      gender: student.gender,
      dob: student.dob || "2010-04-12",
      bloodGroup: student.bloodGroup || "O+",
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      emergencyContactName: student.emergencyContactName || student.guardianName || "",
      emergencyContactPhone: student.emergencyContactPhone || student.guardianPhone || "",
      admissionDate: student.admissionDate || "2024-08-15",
      status: student.status || "active",
    });
    setFormErrors({});
    editModal.open();
  };

  const validateEditForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Student name is required";
    if (!formData.rollNumber.trim()) errors.rollNumber = "Roll number is required";
    if (!formData.dob) errors.dob = "Date of birth is required";
    if (!formData.admissionDate) errors.admissionDate = "Admission date is required";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setStudent((prev) => ({
      ...prev,
      ...formData,
    }));
    showToast("Student profile updated successfully!");
    editModal.close();
  };

  const handleArchive = () => {
    setStudent((prev) => ({ ...prev, status: "archived" }));
    archiveDeleteModal.close();
    showToast(`Student ${student.name} status updated to Archived.`, "info");
  };

  const handleDelete = () => {
    archiveDeleteModal.close();
    showToast(`Student ${student.name} removed from active database.`, "info");
    setTimeout(() => {
      router.push("/admin/students");
    }, 1200);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="space-y-6">
        <PageHeader title="Student Profile" />
        <PeopleNavTabs />
        <Card className="p-12 text-center">
          <EmptyState
            title="Student Not Found"
            description="The requested student identifier does not match any enrolled records."
            action={
              <Link href="/admin/students">
                <Button variant="primary" size="md">
                  Return to Student Directory
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
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
        title="Student Permanent Record"
        subtitle="Official academic profile, cohort allocations, emergency contacts, and admission credentials."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/students">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Directory
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={handlePrintSlip}
            >
              Print ID Slip
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={handleOpenEdit}
            >
              Edit Profile
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={archiveDeleteModal.open}
            >
              Archive / Delete
            </Button>
          </div>
        }
      />

      {/* Sub Navigation */}
      <PeopleNavTabs />

      {/* Hero Badge Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar
              src={student.avatar}
              name={student.name}
              size="xl"
              className="w-20 h-20 ring-4 ring-white/20 shrink-0"
            />
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{student.name}</h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    student.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {student.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-bold text-white">
                  {student.admissionNumber || student.id}
                </span>
                <span>•</span>
                <span className="font-semibold">{student.grade} (Section {student.section})</span>
                <span>•</span>
                <span className="font-mono">Roll: {student.rollNumber}</span>
                <span>•</span>
                <span>Academic Year {student.academicYear || "2025-2026"}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 self-start md:self-center shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Attendance</span>
              <span className="text-xl font-black text-white">{student.attendanceRate || 95}%</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Fee Status</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {student.feeStatus || "Settled"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 & 2: Academic & Personal */}
        <div className="md:col-span-2 space-y-6">
          {/* Academic Profile Card */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Academic Enrollment & Placement</CardTitle>
                    <CardDescription>Cohort structure and enrollment history</CardDescription>
                  </div>
                </div>
                <Badge variant="indigo" size="sm">
                  Active Enrollment
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Official Admission #</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {student.admissionNumber || student.id}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Class / Grade</span>
                  <span className="font-bold text-slate-900 text-sm">{student.grade}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Section Assigned</span>
                  <span className="font-bold text-slate-900 text-sm">Section {student.section}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Roll Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {student.rollNumber}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Admission Date</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {student.admissionDate || "2024-08-15"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Academic Year</span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {student.academicYear || "2025-2026"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Demographics */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Personal Demographics</CardTitle>
                  <CardDescription>Identity and personal records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Date of Birth</span>
                  <span className="font-bold text-slate-900 text-sm">{student.dob || "2010-04-12"}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="font-bold text-slate-900 text-sm">{student.gender || "Male"}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Blood Group</span>
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {student.bloodGroup || "O+"}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Nationality</span>
                  <span className="font-semibold text-slate-900 text-sm">American</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Primary Language</span>
                  <span className="font-semibold text-slate-900 text-sm">English</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-medium">Enrollment Status</span>
                  <span className="font-semibold text-slate-900 text-sm capitalize">
                    {student.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Contact & Emergency */}
        <div className="space-y-6">
          {/* Emergency Line Card */}
          <Card className="border-rose-200 bg-rose-50/20">
            <CardHeader className="pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base text-rose-950">Emergency Contact</CardTitle>
                  <CardDescription className="text-rose-700/80">Campus safety response line</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">
                  Contact Person
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {student.emergencyContactName || student.guardianName || "Family Emergency Contact"}
                </p>
                <span className="text-[11px] text-slate-500">Designated Emergency Contact</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">
                  Emergency Phone
                </span>
                <a
                  href={`tel:${student.emergencyContactPhone || student.guardianPhone || "+1 (555) 987-6543"}`}
                  className="font-mono text-sm font-black text-rose-700 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{student.emergencyContactPhone || student.guardianPhone || "+1 (555) 987-6543"}</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Student Direct Contact */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Contact & Address</CardTitle>
                  <CardDescription>Student communication info</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">
                  Student Email
                </span>
                <a
                  href={`mailto:${student.email}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline truncate block"
                >
                  {student.email || "student@oakridgeacademy.edu"}
                </a>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">
                  Student Phone
                </span>
                <span className="text-xs font-mono font-medium text-slate-800">
                  {student.phone || "+1 (555) 123-4567"}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  Residential Address
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {student.address || "422 Willow Creek Way, Oakridge, OR 97034"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Medical Notes */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Medical & Dietary</CardTitle>
                  <CardDescription>Health center flags</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dietary Plan:</span>
                <Badge variant="emerald" size="sm">Standard Cafeteria</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">P.E. Clearance:</span>
                <span className="font-semibold text-slate-800">Full Physical Clearance</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Allergies:</span>
                <span className="font-semibold text-slate-800">None on record</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Student Information"
        description="Update student demographic and academic records."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="md" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Student Name *"
              value={formData.name}
              error={formErrors.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Admission Number"
              disabled
              value={formData.admissionNumber}
              helperText="Permanent identifier (read-only)"
            />

            <Select
              label="Class / Grade Level"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              options={GRADES.map((g) => ({ label: g, value: g }))}
            />

            <Select
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              options={SECTIONS.map((sec) => ({ label: `Section ${sec}`, value: sec }))}
            />

            <Input
              label="Roll Number *"
              value={formData.rollNumber}
              error={formErrors.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            />

            <Input
              label="Date of Birth *"
              type="date"
              value={formData.dob}
              error={formErrors.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />

            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { label: "Male", value: "Male" },
                { label: "Female", value: "Female" },
                { label: "Other", value: "Other" },
              ]}
            />

            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => ({
                label: b,
                value: b,
              }))}
            />

            <Input
              label="Student Email"
              type="email"
              value={formData.email}
              error={formErrors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Student Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="Emergency Contact Name"
              value={formData.emergencyContactName}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContactName: e.target.value })
              }
            />

            <Input
              label="Emergency Contact Phone"
              value={formData.emergencyContactPhone}
              onChange={(e) =>
                setFormData({ ...formData, emergencyContactPhone: e.target.value })
              }
            />

            <div className="md:col-span-2">
              <Input
                label="Home Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <Select
              label="Enrollment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
      <Modal
        isOpen={archiveDeleteModal.isOpen}
        onClose={archiveDeleteModal.close}
        title="Archive or Delete Student Record"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="md" onClick={archiveDeleteModal.close}>
              Cancel
            </Button>
            <Button variant="outline" size="md" icon={Archive} onClick={handleArchive}>
              Archive Student
            </Button>
            <Button variant="danger" size="md" icon={Trash2} onClick={handleDelete}>
              Delete Record
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Permanent removal warning:</p>
              <p className="text-rose-700 leading-relaxed">
                You are managing the permanent record for{" "}
                <strong>{student.name}</strong> ({student.admissionNumber || student.id}).
              </p>
              <p className="text-rose-700 leading-relaxed pt-1">
                Choose <strong>Archive</strong> to retain academic transcripts and attendance while disabling active status.
                Choose <strong>Delete</strong> only if this record was entered mistakenly.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
