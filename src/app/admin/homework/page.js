"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import Avatar from "@/components/ui/Avatar";
import { mockHomeworkList } from "@/data/mock/homework";
import { mockClassesList, mockSectionsList, mockSubjectsList } from "@/data/mock/academicStructure";
import { mockTeachers } from "@/data/mock/teachers";
import { useModal } from "@/hooks/useModal";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download,
  Users,
  Award,
  Sparkles,
  LayoutGrid,
  List,
  X,
  FileCode,
  FileCheck,
  File,
} from "lucide-react";

export default function HomeworkManagementPage() {
  const [homeworkList, setHomeworkList] = useState(mockHomeworkList);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Modals
  const createModal = useModal();
  const deleteModal = useModal();
  const attachmentModal = useModal();

  // Active targets
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const initialForm = {
    title: "",
    subjectCode: "PHY-101",
    className: "Grade 10",
    sectionName: "Section A",
    teacherId: "TCH-001",
    description: "",
    assignedDate: "2026-03-24",
    dueDate: "2026-03-31",
    maxPoints: 50,
    status: "Published",
    attachmentsText: "Worksheet_Problem_Set.pdf, Formula_Guide.pdf",
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const stats = useMemo(() => {
    const total = homeworkList.length;
    const activePublished = homeworkList.filter((h) => h.status === "Published").length;
    const totalSubmissions = homeworkList.reduce(
      (acc, h) => acc + (h.submissionSummary?.submitted || 0),
      0
    );
    const totalExpected = homeworkList.reduce(
      (acc, h) => acc + (h.submissionSummary?.totalStudents || 0),
      0
    );
    const avgRate = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;

    return { total, activePublished, totalSubmissions, avgRate };
  }, [homeworkList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return homeworkList.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.subjectCode.toLowerCase().includes(query) ||
        item.assignedTeacher.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesClass = classFilter === "all" || item.className === classFilter;
      const matchesSection = sectionFilter === "all" || item.sectionName === sectionFilter;
      const matchesSubject = subjectFilter === "all" || item.subjectCode === subjectFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesClass && matchesSection && matchesSubject && matchesStatus;
    });
  }, [homeworkList, search, classFilter, sectionFilter, subjectFilter, statusFilter]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    createModal.openModal();
  };

  // Handle open edit modal
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      subjectCode: item.subjectCode,
      className: item.className,
      sectionName: item.sectionName,
      teacherId: item.teacherId,
      description: item.description,
      assignedDate: item.assignedDate,
      dueDate: item.dueDate,
      maxPoints: item.maxPoints,
      status: item.status,
      attachmentsText: item.attachments?.map((a) => a.name).join(", ") || "",
    });
    setFormErrors({});
    createModal.openModal();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Assignment title is required.";
    }
    if (!formData.description.trim()) {
      errors.description = "Assignment instructions/description is required.";
    }
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required.";
    } else if (formData.assignedDate && formData.dueDate < formData.assignedDate) {
      errors.dueDate = "Due date cannot be earlier than assigned date.";
    }
    const pts = Number(formData.maxPoints);
    if (isNaN(pts) || pts <= 0) {
      errors.maxPoints = "Maximum points must be greater than zero.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit form
  const handleSaveHomework = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const teacherObj =
      mockTeachers.find((t) => t.id === formData.teacherId) || mockTeachers[0];
    const subjectObj =
      mockSubjectsList.find((s) => s.code === formData.subjectCode) || mockSubjectsList[0];

    // Build attachments array
    const parsedAttachments = formData.attachmentsText
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name, idx) => ({
        id: `ATT-${idx + 1}`,
        name,
        size: "1.4 MB",
        type: name.endsWith(".docx") ? "docx" : name.endsWith(".py") ? "py" : "pdf",
        url: "#",
      }));

    if (isEditing) {
      setHomeworkList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title.trim(),
                subject: subjectObj.name,
                subjectCode: subjectObj.code,
                className: formData.className,
                sectionName: formData.sectionName,
                teacherId: teacherObj.id,
                assignedTeacher: teacherObj.name,
                teacherAvatar: teacherObj.avatar,
                description: formData.description.trim(),
                assignedDate: formData.assignedDate,
                dueDate: formData.dueDate,
                maxPoints: Number(formData.maxPoints),
                status: formData.status,
                attachments: parsedAttachments.length > 0 ? parsedAttachments : item.attachments,
              }
            : item
        )
      );
      showToast(`Assignment "${formData.title}" updated successfully.`);
    } else {
      const newHomework = {
        id: `HW-2026-${(homeworkList.length + 1).toString().padStart(3, "0")}`,
        title: formData.title.trim(),
        subject: subjectObj.name,
        subjectCode: subjectObj.code,
        className: formData.className,
        sectionName: formData.sectionName,
        teacherId: teacherObj.id,
        assignedTeacher: teacherObj.name,
        teacherAvatar: teacherObj.avatar,
        description: formData.description.trim(),
        assignedDate: formData.assignedDate,
        dueDate: formData.dueDate,
        maxPoints: Number(formData.maxPoints),
        status: formData.status,
        attachments: parsedAttachments,
        submissionSummary: {
          totalStudents: 28,
          submitted: 0,
          pending: 28,
          graded: 0,
          avgScore: null,
        },
        submissions: [],
      };

      setHomeworkList((prev) => [newHomework, ...prev]);
      showToast(`Assignment "${newHomework.title}" created and published.`);
    }

    createModal.closeModal();
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    setSelectedHomework(item);
    deleteModal.openModal();
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedHomework) return;
    setHomeworkList((prev) => prev.filter((h) => h.id !== selectedHomework.id));
    showToast(`Assignment "${selectedHomework.title}" removed.`, "info");
    deleteModal.closeModal();
  };

  // Open attachment preview
  const handleOpenAttachment = (att) => {
    setSelectedAttachment(att);
    attachmentModal.openModal();
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Published":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Closed":
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
      case "Draft":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      default:
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Homework & Assignment Management"
        description="Publish course tasks, upload reference attachments, review student completion rates, and evaluate submissions."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assignment</span>
            </Button>
          </div>
        }
      />

      {/* Shared Academics Navigation Tabs */}
      <AcademicNavTabs />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Assignments"
          value={stats.total}
          icon={BookOpen}
          trend={{ value: `${stats.activePublished} Active Published`, isPositive: true }}
        />
        <StatsCard
          title="Submissions Received"
          value={stats.totalSubmissions}
          icon={FileCheck}
          trend={{ value: "Student turn-ins", isPositive: true }}
        />
        <StatsCard
          title="Cohort Completion Rate"
          value={`${stats.avgRate}%`}
          icon={Sparkles}
          trend={{ value: "Overall compliance", isPositive: true }}
        />
        <StatsCard
          title="Curriculum Alignment"
          value="100%"
          icon={Award}
          trend={{ value: "Syllabus on track", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by assignment title, subject, teacher name, or instructions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {mockClassesList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>

              <Select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="all">All Sections</option>
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </Select>

              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {mockSubjectsList.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
                <option value="Draft">Draft</option>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: Cards Grid or Table View */}
      {filteredList.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={BookOpen}
              title="No homework assignments found"
              description="Adjust your search criteria or create a new assignment task."
              actionLabel="Create Assignment"
              onAction={handleOpenAdd}
            />
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => {
            const completionPct = Math.round(
              ((item.submissionSummary?.submitted || 0) /
                (item.submissionSummary?.totalStudents || 1)) *
                100
            );

            return (
              <Card
                key={item.id}
                className="hover:shadow-md transition border-slate-200/90 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                        {item.subjectCode}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <CardTitle className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                      <Link
                        href={`/admin/homework/${item.id}`}
                        className="hover:text-indigo-600 transition"
                      >
                        {item.title}
                      </Link>
                    </CardTitle>

                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3.5 pt-0">
                    {/* Class & Teacher */}
                    <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={item.assignedTeacher}
                          src={item.teacherAvatar}
                          size="sm"
                          className="bg-indigo-100 text-indigo-700 font-bold"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block text-[11px]">
                            {item.assignedTeacher}
                          </span>
                          <span className="text-[10px] text-slate-400">Instructor</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 text-[11px] block">
                          {item.className}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {item.sectionName}
                        </span>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">
                          Assigned
                        </span>
                        <span className="text-slate-700 font-semibold">{item.assignedDate}</span>
                      </div>
                      <div className="p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                        <span className="text-[10px] text-indigo-600 uppercase font-sans font-bold block flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Due Date</span>
                        </span>
                        <span className="text-indigo-950 font-bold">{item.dueDate}</span>
                      </div>
                    </div>

                    {/* Submission Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold">
                          Turn-in:{" "}
                          <strong className="text-slate-800 font-mono">
                            {item.submissionSummary?.submitted}/{item.submissionSummary?.totalStudents}
                          </strong>
                        </span>
                        <span className="font-bold text-indigo-700 font-mono">
                          {completionPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(completionPct, 100)}%` }}
                          className={`h-full rounded-full transition-all ${
                            completionPct >= 90
                              ? "bg-emerald-500"
                              : completionPct >= 60
                              ? "bg-indigo-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Attachment Pills */}
                    {item.attachments && item.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.attachments.map((att) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => handleOpenAttachment(att)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 transition"
                            title="Preview Attachment"
                          >
                            <Paperclip className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[130px]">{att.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Max: {item.maxPoints} Pts
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/homework/${item.id}`}>
                      <button
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg transition flex items-center gap-1"
                        title="View Full Details & Submissions"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Submissions</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="Edit Assignment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                      title="Delete Assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assignment Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class & Section</TableHead>
                  <TableHead>Assigned Instructor</TableHead>
                  <TableHead className="w-24">Due Date</TableHead>
                  <TableHead className="w-32">Submissions</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                  <TableHead className="text-right w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList.map((item) => {
                  const completionPct = Math.round(
                    ((item.submissionSummary?.submitted || 0) /
                      (item.submissionSummary?.totalStudents || 1)) *
                      100
                  );

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/homework/${item.id}`}
                          className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition block max-w-xs truncate"
                        >
                          {item.title}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.id} • {item.maxPoints} Points
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-800 text-xs">{item.subject}</div>
                        <div className="text-[10px] font-mono text-indigo-600">{item.subjectCode}</div>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-xs text-slate-700">
                          {item.className} ({item.sectionName})
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={item.assignedTeacher}
                            src={item.teacherAvatar}
                            size="sm"
                            className="bg-indigo-100 text-indigo-700 font-bold"
                          />
                          <span className="font-medium text-xs text-slate-800">
                            {item.assignedTeacher}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {item.dueDate}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-slate-600 font-bold">
                              {item.submissionSummary?.submitted}/{item.submissionSummary?.totalStudents}
                            </span>
                            <span className="text-indigo-600 font-bold">{completionPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(completionPct, 100)}%` }}
                              className={`h-full rounded-full ${
                                completionPct >= 80 ? "bg-emerald-500" : "bg-indigo-500"
                              }`}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/homework/${item.id}`}>
                            <button
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                              title="View Details & Submissions"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Assignment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Assignment"
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
          </CardContent>
        </Card>
      )}

      {/* CREATE / EDIT HOMEWORK MODAL */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title={isEditing ? `Edit Assignment "${formData.title}"` : "Create & Publish Assignment"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveHomework} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assignment Title *
            </label>
            <Input
              placeholder="e.g. Thermodynamics & Heat Engine Problem Set"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={formErrors.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject & Code *
              </label>
              <Select
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
              >
                {mockSubjectsList.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Instructor *
              </label>
              <Select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              >
                {mockTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.designation})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Class *
              </label>
              <Select
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                {mockClassesList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Section *
              </label>
              <Select
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Points *
              </label>
              <Input
                type="number"
                min="1"
                placeholder="50"
                value={formData.maxPoints}
                onChange={(e) => setFormData({ ...formData, maxPoints: e.target.value })}
                error={formErrors.maxPoints}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Date *
              </label>
              <Input
                type="date"
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Submission Due Date *
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                error={formErrors.dueDate}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publish Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Published (Active)</option>
                <option value="Draft">Draft (Hidden)</option>
                <option value="Closed">Closed</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Instructions & Description *
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Outline problems to solve, chapter references, formatting rules, and evaluation criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {formErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Worksheets / Mock Attachments (Comma separated file names)
            </label>
            <Input
              placeholder="e.g. Thermodynamics_PS4.pdf, Derivation_Formula_Sheet.pdf"
              value={formData.attachmentsText}
              onChange={(e) =>
                setFormData({ ...formData, attachmentsText: e.target.value })
              }
              className="text-xs font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Simulates document attachments (PDF, DOCX, Code) available for student download.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={createModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isEditing ? "Save Assignment" : "Publish Assignment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ATTACHMENT PREVIEW MODAL */}
      <Modal
        isOpen={attachmentModal.isOpen}
        onClose={attachmentModal.closeModal}
        title="Resource Attachment Preview"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
            <FileText className="h-8 w-8" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {selectedAttachment?.name}
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              File Size: {selectedAttachment?.size} • Verified Institutional Worksheet
            </p>
          </div>

          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            This instructional resource document is distributed to all enrolled students for homework completion.
          </p>

          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={attachmentModal.closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast(`Downloading "${selectedAttachment?.name}"...`);
                attachmentModal.closeModal();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Remove Homework Assignment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span>
              Are you sure you want to remove <strong>&quot;{selectedHomework?.title}&quot;</strong>? All associated student submission records will be archived.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={deleteModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
