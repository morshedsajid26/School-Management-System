"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import useLeave from "@/hooks/useLeave";
import { mockTeachers } from "@/data/mock/teachers";
import { mockStaffList } from "@/data/mock/staff";
import { mockStudents } from "@/data/mock/students";
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  User,
  RotateCcw,
  Send,
  Check,
  X,
  FileText,
} from "lucide-react";

export default function LeaveManagementPage() {
  const {
    applications,
    leaveTypes,
    stats,
    applyLeave,
    approveLeave,
    rejectLeave,
    deleteLeave,
    resetLeaveData,
  } = useLeave();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const applyModal = useModal();
  const rejectModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // Rejection modal feedback
  const [rejectFeedback, setRejectFeedback] = useState("");

  // All applicants pool
  const allApplicants = useMemo(() => {
    const list = [];
    mockTeachers.forEach((t) =>
      list.push({
        id: t.employeeId || t.id,
        name: t.name,
        role: "Teacher",
        dept: t.department,
        email: t.email,
        phone: t.phone,
      })
    );
    mockStaffList.forEach((s) =>
      list.push({
        id: s.employeeId || s.id,
        name: s.name,
        role: "Staff",
        dept: s.department,
        email: s.email,
        phone: s.phone,
      })
    );
    mockStudents.slice(0, 10).forEach((st) =>
      list.push({
        id: st.id,
        name: st.name,
        role: "Student",
        dept: `${st.grade} (${st.section})`,
        email: st.email,
        phone: st.phone,
      })
    );
    return list;
  }, []);

  // Form State
  const initialLeaveForm = {
    applicantName: allApplicants[0]?.name || "Prof. Marcus Aurel",
    applicantId: allApplicants[0]?.id || "EMP-T-101",
    applicantEmail: allApplicants[0]?.email || "",
    role: allApplicants[0]?.role || "Teacher",
    department: allApplicants[0]?.dept || "Science",
    leaveType: "Casual Leave",
    startDate: "2026-03-26",
    endDate: "2026-03-27",
    totalDays: 2,
    reason: "",
    emergencyContact: allApplicants[0]?.phone || "+1 (555) 019-4821",
  };
  const [formData, setFormData] = useState(initialLeaveForm);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        selectedRole === "all" || app.role === selectedRole;

      const matchStatus =
        selectedStatus === "all" || app.status === selectedStatus;

      const matchType =
        selectedType === "all" || app.leaveType === selectedType;

      return matchSearch && matchRole && matchStatus && matchType;
    });
  }, [applications, searchTerm, selectedRole, selectedStatus, selectedType]);

  // Handlers
  const handleOpenApply = () => {
    setFormData(initialLeaveForm);
    applyModal.open();
  };

  const handleApplicantSelect = (name) => {
    const found = allApplicants.find((a) => a.name === name);
    if (found) {
      setFormData({
        ...formData,
        applicantName: found.name,
        applicantId: found.id,
        applicantEmail: found.email,
        role: found.role,
        department: found.dept,
        emergencyContact: found.phone,
      });
    }
  };

  const handleSaveApply = (e) => {
    e.preventDefault();
    if (!formData.applicantName || !formData.reason) {
      alert("Please provide the applicant name and a reason for the leave.");
      return;
    }
    const created = applyLeave(formData);
    applyModal.close();
    showToast(`Leave application submitted for ${created.applicantName}.`);
  };

  const handleQuickApprove = (app) => {
    approveLeave(app.id, "Approved by administration upon institutional review.");
    showToast(`Leave request for ${app.applicantName} approved.`);
  };

  const handleOpenReject = (app) => {
    setRejectFeedback(
      "Regretfully declined due to scheduled term commitments and staffing quotas."
    );
    rejectModal.open(app);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectModal.modalData) return;
    rejectLeave(rejectModal.modalData.id, rejectFeedback);
    rejectModal.close();
    showToast(`Leave application for ${rejectModal.modalData.applicantName} declined.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deleteLeave(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Leave record removed.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Leave Management"
        description="Faculty, staff, and student absence requests, institutional approval workflows, and leave quotas"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetLeaveData}
            title="Reset to default mock leave applications"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenApply}>
            <Plus className="h-4 w-4 mr-1.5" />
            Apply for Leave
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Review"
          value={stats.pendingCount}
          icon={Clock}
          description="Awaiting administrative sign-off"
        />
        <StatsCard
          title="Approved Absences"
          value={stats.approvedCount}
          icon={CheckCircle2}
          description={`${stats.totalDaysApproved} total duty days cleared`}
        />
        <StatsCard
          title="Declined Requests"
          value={stats.rejectedCount}
          icon={XCircle}
          description="Exceeded quotas or conflicting exams"
        />
        <StatsCard
          title="Total Applications"
          value={stats.totalApps}
          icon={CalendarCheck}
          description="All roles current semester"
        />
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by applicant name, ID, department, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="w-full md:w-40">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Roles</option>
                <option value="Teacher">Teachers</option>
                <option value="Staff">Staff</option>
                <option value="Student">Students</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Leave Type Filter */}
            <div className="w-full md:w-52">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Leave Types</option>
                {leaveTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800">
              Absence & Leave Application Register
            </CardTitle>
            <CardDescription className="text-xs">
              Review applicant details, justifications, and execute administrative decisions
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Applicant</TableHead>
                <TableHead className="text-xs">Role & Dept</TableHead>
                <TableHead className="text-xs">Leave Category</TableHead>
                <TableHead className="text-xs">Duration & Dates</TableHead>
                <TableHead className="text-xs">Reason / Justification</TableHead>
                <TableHead className="text-xs">Decision Status</TableHead>
                <TableHead className="text-right text-xs">Approval Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                    No leave applications matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app, idx) => {
                  const isPending = app.status === "Pending";
                  const isApproved = app.status === "Approved";
                  const isRejected = app.status === "Rejected";

                  return (
                    <TableRow key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <button
                            type="button"
                            onClick={() => viewModal.open(app)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                          >
                            {app.applicantName}
                          </button>
                          <span className="font-mono text-[11px] text-slate-400">
                            {app.applicantId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              app.role === "Teacher"
                                ? "bg-indigo-50 text-indigo-700"
                                : app.role === "Student"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {app.role}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {app.department}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {app.leaveType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {app.totalDays} {app.totalDays === 1 ? "Day" : "Days"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {app.startDate} &rarr; {app.endDate}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {app.reason}
                        </p>
                      </TableCell>
                      <TableCell>
                        {isPending ? (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Pending Review
                          </Badge>
                        ) : isApproved ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleQuickApprove(app)}
                                title="Approve Request"
                                className="text-xs px-2 py-1 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                              >
                                <Check className="h-3.5 w-3.5 mr-0.5" />
                                Approve
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenReject(app)}
                                title="Reject Request"
                                className="text-xs px-2 py-1 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                              >
                                <X className="h-3.5 w-3.5 mr-0.5" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewModal.open(app)}
                            title="View Application Dossier"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModal.open(app)}
                            title="Delete Record"
                            className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: APPLY FOR LEAVE */}
      <Modal
        isOpen={applyModal.isOpen}
        onClose={applyModal.close}
        title="Submit Absence Application"
        description="File an authorized leave request on behalf of a teacher, staff member, or student."
        size="lg"
      >
        <form onSubmit={handleSaveApply} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Applicant *
              </label>
              <select
                value={formData.applicantName}
                onChange={(e) => handleApplicantSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {allApplicants.map((app) => (
                  <option key={app.id} value={app.name}>
                    {app.name} ({app.role} - {app.dept})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Leave Category *
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {leaveTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Absence Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Absence End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Calendar Days
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={formData.totalDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalDays: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Justification & Details *
              </label>
              <textarea
                rows="3"
                required
                placeholder="State medical reason, academic symposium details, or personal circumstances..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={applyModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REJECT APPLICATION WITH FEEDBACK */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.close}
        title="Decline Leave Application"
        description="Provide administrative feedback and reason for rejection."
        size="md"
      >
        {rejectModal.modalData && (
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs">
              <p className="font-bold text-rose-950">
                Applicant: {rejectModal.modalData.applicantName} ({rejectModal.modalData.role})
              </p>
              <p className="text-slate-600 mt-0.5">
                Dates: {rejectModal.modalData.startDate} &rarr; {rejectModal.modalData.endDate} ({rejectModal.modalData.totalDays} Days)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Rejection Remarks / Justification *
              </label>
              <textarea
                rows="4"
                required
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 leading-relaxed font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={rejectModal.close}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: VIEW APPLICATION DOSSIER */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title="Leave Application Dossier"
        description="Applicant information, justifications, and administrative audit notes"
        size="md"
      >
        {viewModal.modalData && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
              <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {viewModal.modalData.applicantName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    {viewModal.modalData.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewModal.modalData.department} &bull; ID: {viewModal.modalData.applicantId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Leave Category</span>
                <span className="font-bold text-slate-800">
                  {viewModal.modalData.leaveType}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Duration</span>
                <span className="font-bold text-indigo-700">
                  {viewModal.modalData.totalDays} Days ({viewModal.modalData.startDate} &rarr; {viewModal.modalData.endDate})
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span
                  className={`font-bold ${
                    viewModal.modalData.status === "Approved"
                      ? "text-emerald-600"
                      : viewModal.modalData.status === "Rejected"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                >
                  {viewModal.modalData.status}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                <span className="font-mono font-medium text-slate-700">
                  {viewModal.modalData.emergencyContact || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Applicant&apos;s Justification:
              </span>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                &quot;{viewModal.modalData.reason}&quot;
              </p>
            </div>

            {viewModal.modalData.remarks && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Administrative Reviewer Remarks:
                </span>
                <p className="text-xs text-slate-800 bg-amber-50/70 p-3 rounded-lg border border-amber-200 leading-relaxed font-medium">
                  {viewModal.modalData.remarks} (Reviewed by: {viewModal.modalData.reviewedBy || "Administration"})
                </p>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={viewModal.close}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Leave Application"
        description="Are you certain you wish to delete this leave application record?"
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete application for {deleteModal.modalData.applicantName}?
                </p>
                <p className="mt-0.5">
                  Category: {deleteModal.modalData.leaveType} ({deleteModal.modalData.totalDays} Days)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
