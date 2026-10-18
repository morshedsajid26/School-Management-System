"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import Avatar from "@/components/ui/Avatar";
import { mockHomeworkList } from "@/data/mock/homework";
import { mockTeachers } from "@/data/mock/teachers";
import { useModal } from "@/hooks/useModal";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Award,
  Sparkles,
  Edit,
  Trash2,
  FileCheck,
  FileText,
  X,
  FileCode,
  Send,
  Eye,
  Check,
} from "lucide-react";

export default function HomeworkDetailClient({ homeworkId }) {
  // Find initial homework
  const initialHw = useMemo(() => {
    return (
      mockHomeworkList.find((h) => h.id === homeworkId) || mockHomeworkList[0]
    );
  }, [homeworkId]);

  const [homework, setHomework] = useState(initialHw);
  const [submissions, setSubmissions] = useState(initialHw.submissions || []);
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");

  // Modals
  const gradeModal = useModal();
  const editModal = useModal();
  const attachmentModal = useModal();

  // Active targets
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState(45);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Edit Assignment Form State
  const [editFormData, setEditFormData] = useState({
    title: homework.title,
    description: homework.description,
    dueDate: homework.dueDate,
    maxPoints: homework.maxPoints,
    status: homework.status,
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const query = studentSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        sub.studentName.toLowerCase().includes(query) ||
        sub.rollNumber.toLowerCase().includes(query) ||
        sub.admissionNumber.toLowerCase().includes(query);

      const matchesStatus = submissionFilter === "all" || sub.status === submissionFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, studentSearch, submissionFilter]);

  // Submission Analytics
  const analytics = useMemo(() => {
    const total = homework.submissionSummary?.totalStudents || 28;
    const submittedCount = submissions.filter((s) => s.status === "Submitted" || s.status === "Graded").length;
    const pendingCount = total - submittedCount;
    const gradedCount = submissions.filter((s) => s.status === "Graded").length;
    const scores = submissions.filter((s) => s.score !== null).map((s) => Number(s.score));
    const avgScore =
      scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";
    const rate = Math.round((submittedCount / total) * 100);

    return { total, submittedCount, pendingCount, gradedCount, avgScore, rate };
  }, [homework, submissions]);

  // Open Grade Modal
  const handleOpenGrade = (sub) => {
    setSelectedSubmission(sub);
    setGradeInput(sub.score !== null ? sub.score : homework.maxPoints - 2);
    setFeedbackInput(sub.feedback || "Good conceptual demonstration.");
    setGradeError("");
    gradeModal.openModal();
  };

  // Submit Grade
  const handleSaveGrade = (e) => {
    e.preventDefault();
    const scoreVal = Number(gradeInput);
    if (isNaN(scoreVal) || scoreVal < 0) {
      setGradeError("Score must be a positive number.");
      return;
    }
    if (scoreVal > homework.maxPoints) {
      setGradeError(`Score cannot exceed maximum points (${homework.maxPoints}).`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSubmission.id
          ? {
              ...s,
              score: scoreVal,
              status: "Graded",
              feedback: feedbackInput.trim() || "Evaluated by instructor.",
            }
          : s
      )
    );

    showToast(`Graded submission for ${selectedSubmission.studentName}: ${scoreVal}/${homework.maxPoints}`);
    gradeModal.closeModal();
  };

  // Submit Edit Assignment
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setHomework((prev) => ({
      ...prev,
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
      dueDate: editFormData.dueDate,
      maxPoints: Number(editFormData.maxPoints),
      status: editFormData.status,
    }));
    showToast("Assignment details updated successfully.");
    editModal.closeModal();
  };

  // Open Attachment Preview
  const handleOpenAttachment = (att) => {
    setSelectedAttachment(att);
    attachmentModal.openModal();
  };

  // Status Badge styling helper
  const getSubStatusBadge = (status) => {
    switch (status) {
      case "Graded":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Submitted":
        return "bg-blue-100 text-blue-800 border-blue-300 font-semibold";
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      case "Late":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
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

      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs">
        <Link
          href="/admin/homework"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 font-bold shadow-sm transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Assignments</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 font-medium">Academics</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-bold truncate max-w-sm">
          {homework.title}
        </span>
      </div>

      {/* Hero Header Card */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-md">
                  {homework.subjectCode} • {homework.subject}
                </span>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                  {homework.className} ({homework.sectionName})
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-md">
                  {homework.status}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-md">
                  Maximum: {homework.maxPoints} Points
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {homework.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditFormData({
                    title: homework.title,
                    description: homework.description,
                    dueDate: homework.dueDate,
                    maxPoints: homework.maxPoints,
                    status: homework.status,
                  });
                  editModal.openModal();
                }}
                className="flex items-center gap-1.5"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Task</span>
              </Button>
            </div>
          </div>

          {/* Instructor & Timeline Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/80 text-xs">
            <div className="flex items-center gap-3">
              <Avatar
                name={homework.assignedTeacher}
                src={homework.teacherAvatar}
                size="md"
                className="bg-indigo-100 text-indigo-700 font-bold"
              />
              <div>
                <span className="font-bold text-slate-900 block text-sm">
                  {homework.assignedTeacher}
                </span>
                <span className="text-slate-500 text-xs">Assigned Course Instructor</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Assigned Date
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {homework.assignedDate}
              </span>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Final Due Date</span>
              </span>
              <span className="font-mono font-extrabold text-indigo-950 text-xs">
                {homework.dueDate} (23:59 EST)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Instructions & Attachments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description & Guidelines */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Assignment Description & Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                {homework.description}
              </p>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Evaluation & Submission Guidelines:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                  <li>Show all mathematical proofs and intermediate integration steps clearly.</li>
                  <li>Submit assignments in PDF or clean source code format before the deadline.</li>
                  <li>Late submissions will incur a 10% daily point deduction past the grace window.</li>
                  <li>Academic integrity guidelines apply; citations must follow institutional standard.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Instructor Attached Worksheets */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-indigo-600" />
                <span>Reference Materials</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Instructional worksheets and formula guides for students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {homework.attachments && homework.attachments.length > 0 ? (
                homework.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-xl transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-slate-900 text-xs block truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {att.size} • Verified Material
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenAttachment(att)}
                      className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-white rounded-lg transition flex-shrink-0"
                      title="Download or Preview File"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No attachments provided.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Class Cohort"
          value={`${analytics.total} Students`}
          icon={Users}
          trend={{ value: `${homework.className}`, isPositive: true }}
        />
        <StatsCard
          title="Turned In"
          value={analytics.submittedCount}
          icon={FileCheck}
          trend={{ value: `${analytics.rate}% Completion`, isPositive: true }}
        />
        <StatsCard
          title="Pending Submissions"
          value={analytics.pendingCount}
          icon={Clock}
          trend={{ value: "Awaiting turn-in", isPositive: false }}
        />
        <StatsCard
          title="Graded & Evaluated"
          value={analytics.gradedCount}
          icon={Sparkles}
          trend={{ value: "Instructor reviewed", isPositive: true }}
        />
        <StatsCard
          title="Cohort Mean Score"
          value={`${analytics.avgScore} / ${homework.maxPoints}`}
          icon={Award}
          trend={{ value: "Class performance", isPositive: true }}
        />
      </div>

      {/* Student Submissions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Student Turn-in & Evaluation Register
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Inspect uploaded student deliverables, grade individual submissions, and issue instructor feedback.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Filter by student name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="text-xs py-1.5 pl-3 w-48"
                />
              </div>

              <Select
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
                className="text-xs py-1.5"
              >
                <option value="all">All Submissions</option>
                <option value="Graded">Graded Only</option>
                <option value="Submitted">Submitted (Ungraded)</option>
                <option value="Pending">Pending Turn-in</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No student submissions matched"
              description="Adjust your search or status filter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Candidate</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-36">Turned In Date</TableHead>
                  <TableHead>Delivered File</TableHead>
                  <TableHead className="w-28 text-center">Score</TableHead>
                  <TableHead>Instructor Feedback</TableHead>
                  <TableHead className="text-right w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={sub.studentName}
                          size="sm"
                          className="bg-indigo-100 text-indigo-700 font-bold"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Roll: {sub.rollNumber} • {sub.admissionNumber}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border ${getSubStatusBadge(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">
                        {sub.submittedDate || "— Not submitted"}
                      </span>
                    </TableCell>

                    <TableCell>
                      {sub.fileName ? (
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Downloading student submission "${sub.fileName}"...`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:underline max-w-[200px] truncate"
                          title="Download Student Work"
                        >
                          <Paperclip className="h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />
                          <span className="truncate">{sub.fileName}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No file attached</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center font-mono">
                      {sub.score !== null ? (
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sub.score} / {homework.maxPoints}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">— / {homework.maxPoints}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-600 max-w-xs truncate" title={sub.feedback}>
                        {sub.feedback ? `"${sub.feedback}"` : "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenGrade(sub)}
                        className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                      >
                        {sub.status === "Graded" ? "Re-grade" : "Grade"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* GRADE & FEEDBACK MODAL */}
      <Modal
        isOpen={gradeModal.isOpen}
        onClose={gradeModal.closeModal}
        title={`Evaluate Submission: ${selectedSubmission?.studentName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">{selectedSubmission?.studentName}</div>
            <div className="text-slate-500 font-mono">
              Roll: {selectedSubmission?.rollNumber} • Submitted: {selectedSubmission?.submittedDate || "Pending"}
            </div>
            {selectedSubmission?.fileName && (
              <div className="text-indigo-700 font-semibold pt-1">
                File: {selectedSubmission?.fileName}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Awarded Points (Max: {homework.maxPoints}) *
              </label>
              <span className="text-xs font-mono font-bold text-indigo-700">
                {Math.round(((Number(gradeInput) || 0) / homework.maxPoints) * 100)}%
              </span>
            </div>
            <Input
              type="number"
              min="0"
              max={homework.maxPoints}
              value={gradeInput}
              onChange={(e) => {
                setGradeInput(e.target.value);
                setGradeError("");
              }}
              error={gradeError}
              className="font-mono text-base font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Instructor Feedback & Recommendations
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Excellent calculus derivations and thorough discussion..."
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={gradeModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Commit Grade & Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT ASSIGNMENT MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        title="Edit Task Settings"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title *
            </label>
            <Input
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date *
              </label>
              <Input
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Points *
              </label>
              <Input
                type="number"
                value={editFormData.maxPoints}
                onChange={(e) => setEditFormData({ ...editFormData, maxPoints: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Instructions
            </label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={editModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ATTACHMENT MODAL */}
      <Modal
        isOpen={attachmentModal.isOpen}
        onClose={attachmentModal.closeModal}
        title="Download Reference Attachment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{selectedAttachment?.name}</h4>
            <p className="text-xs text-slate-500 font-mono">{selectedAttachment?.size} • Verified Material</p>
          </div>
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
                showToast(`Downloaded "${selectedAttachment?.name}".`);
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
    </div>
  );
}
