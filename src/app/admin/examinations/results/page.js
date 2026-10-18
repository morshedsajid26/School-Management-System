"use client";

import React, { useState, useMemo, useRef } from "react";
import PageHeader from "@/components/shared/PageHeader";
import ExamNavTabs from "@/components/shared/ExamNavTabs";
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
import {
  mockExamCycles,
  mockMarksRecords,
  mockGradingScale,
  getGradeFromScore,
} from "@/data/mock/examinations";
import { mockClassesList, mockSectionsList, mockSubjectsList } from "@/data/mock/academicStructure";
import { mockStudents } from "@/data/mock/students";
import { useModal } from "@/hooks/useModal";
import {
  Award,
  Search,
  Filter,
  FileCheck2,
  Printer,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  School,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Check,
  X,
  FileText,
  Clock,
  Layers,
} from "lucide-react";

export default function ExaminationResultsPage() {
  const [records, setRecords] = useState(mockMarksRecords);

  // Filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const reportCardModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Selected Student for Report Card
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);

  // Selected Record for Edit / Delete
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Quick Edit Form State
  const [editFormData, setEditFormData] = useState({
    obtainedMarks: 90,
    maxMarks: 100,
    remarks: "",
  });
  const [editErrors, setEditErrors] = useState({});

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Report Card print reference
  const reportCardRef = useRef(null);

  // Filtered Results
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        r.studentName.toLowerCase().includes(query) ||
        r.rollNumber.toLowerCase().includes(query) ||
        r.admissionNumber.toLowerCase().includes(query) ||
        r.subjectName.toLowerCase().includes(query) ||
        r.subjectCode.toLowerCase().includes(query);

      const matchesExam = examFilter === "all" || r.examName === examFilter;
      const matchesClass = classFilter === "all" || r.className === classFilter;
      const matchesSubject = subjectFilter === "all" || r.subjectCode === subjectFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Passed" && r.status === "Passed") ||
        (statusFilter === "Failed" && r.status === "Failed") ||
        (statusFilter === "A+" && r.grade === "A+");

      return matchesSearch && matchesExam && matchesClass && matchesSubject && matchesStatus;
    });
  }, [records, search, examFilter, classFilter, subjectFilter, statusFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = records.length;
    if (total === 0) {
      return { total: 0, passRate: "0%", topScores: 0, avgPercentage: "0%" };
    }

    const passedCount = records.filter((r) => r.status === "Passed").length;
    const passRate = `${Math.round((passedCount / total) * 100)}%`;
    const topScores = records.filter((r) => r.grade === "A+").length;

    const totalPct = records.reduce((acc, curr) => {
      const max = Number(curr.maxMarks) || 100;
      const obt = Number(curr.obtainedMarks) || 0;
      return acc + (obt / max) * 100;
    }, 0);
    const avgPercentage = `${(totalPct / total).toFixed(1)}%`;

    return { total, passRate, topScores, avgPercentage };
  }, [records]);

  // Handle open report card preview
  const handleOpenReportCard = (record) => {
    // Find full student details if available
    const fullStudent =
      mockStudents.find(
        (s) => s.id === record.studentId || s.admissionNumber === record.admissionNumber
      ) || {
        id: record.studentId,
        name: record.studentName,
        rollNumber: record.rollNumber,
        admissionNumber: record.admissionNumber,
        grade: record.className,
        section: record.sectionName?.replace("Section ", "") || "A",
        attendanceRate: 97.4,
        dob: "2010-04-12",
      };

    // Gather all subjects for this student and this exam
    const studentSubjects = records.filter(
      (r) =>
        (r.studentId === record.studentId || r.admissionNumber === record.admissionNumber) &&
        r.examName === record.examName
    );

    setSelectedStudentForReport({
      student: fullStudent,
      examName: record.examName,
      className: record.className,
      sectionName: record.sectionName,
      subjects: studentSubjects,
    });

    reportCardModal.openModal();
  };

  // Compute student transcript stats
  const transcriptStats = useMemo(() => {
    if (!selectedStudentForReport || !selectedStudentForReport.subjects.length) {
      return { totalMax: 0, totalObtained: 0, percentage: 0, gpa: 0, grade: "N/A", status: "N/A" };
    }

    const subs = selectedStudentForReport.subjects;
    const totalMax = subs.reduce((sum, s) => sum + (Number(s.maxMarks) || 100), 0);
    const totalObtained = subs.reduce((sum, s) => sum + (Number(s.obtainedMarks) || 0), 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

    const totalGpa = subs.reduce((sum, s) => sum + (Number(s.gpa) || 0), 0);
    const avgGpa = (totalGpa / subs.length).toFixed(2);

    const overallGrading = getGradeFromScore(totalObtained, totalMax);

    return {
      totalMax,
      totalObtained,
      percentage,
      gpa: avgGpa,
      grade: overallGrading.grade,
      status: subs.some((s) => s.status === "Failed") ? "Passed with Conditions" : "PASSED",
      distinction:
        percentage >= 90
          ? "First Class with Academic Distinction (Dean's List)"
          : percentage >= 80
          ? "First Class Honors"
          : percentage >= 60
          ? "Second Class Standing"
          : "Standard Pass",
    };
  }, [selectedStudentForReport]);

  // Handle open edit
  const handleOpenEdit = (record) => {
    setSelectedRecord(record);
    setEditFormData({
      obtainedMarks: record.obtainedMarks,
      maxMarks: record.maxMarks,
      remarks: record.remarks || "",
    });
    setEditErrors({});
    editModal.openModal();
  };

  // Validate and submit edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const errors = {};
    const obt = Number(editFormData.obtainedMarks);
    const max = Number(editFormData.maxMarks);

    if (isNaN(obt) || obt < 0) {
      errors.obtainedMarks = "Obtained marks must be a positive number.";
    } else if (obt > max) {
      errors.obtainedMarks = `Obtained marks cannot exceed maximum paper marks (${max}).`;
    }

    if (isNaN(max) || max <= 0) {
      errors.maxMarks = "Maximum marks must be greater than zero.";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    const evaluation = getGradeFromScore(obt, max);

    setRecords((prev) =>
      prev.map((r) =>
        r.id === selectedRecord.id
          ? {
              ...r,
              obtainedMarks: obt,
              maxMarks: max,
              grade: evaluation.grade,
              gpa: evaluation.gpa,
              status: evaluation.status,
              remarks: editFormData.remarks.trim() || evaluation.remarks,
            }
          : r
      )
    );

    showToast(`Marks updated for ${selectedRecord.studentName} in ${selectedRecord.subjectName}.`);
    editModal.closeModal();
  };

  // Handle open delete
  const handleOpenDelete = (record) => {
    setSelectedRecord(record);
    deleteModal.openModal();
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedRecord) return;
    setRecords((prev) => prev.filter((r) => r.id !== selectedRecord.id));
    showToast(`Evaluation record for ${selectedRecord.studentName} removed.`, "info");
    deleteModal.closeModal();
  };

  // Print Report Card
  const handlePrint = () => {
    window.print();
  };

  // Grade color style helper
  const getGradeBadge = (grade) => {
    switch (grade) {
      case "A+":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold";
      case "A":
        return "bg-blue-100 text-blue-800 border-blue-300 font-bold";
      case "B":
        return "bg-indigo-100 text-indigo-800 border-indigo-300 font-bold";
      case "C":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "D":
        return "bg-orange-100 text-orange-800 border-orange-300 font-semibold";
      case "F":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
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
              : toast.type === "info"
              ? "bg-blue-50 border-blue-200 text-blue-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
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
        title="Examination Results & Report Cards"
        description="Comprehensive examination records, validated student marks, institutional grading metrics, and printable academic transcripts."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Table</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (records.length > 0) handleOpenReportCard(records[0]);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Preview Sample Report Card</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <ExamNavTabs />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Evaluated Papers"
          value={stats.total}
          icon={BookOpen}
          trend={{ value: "Term 2 Midterm", isPositive: true }}
        />
        <StatsCard
          title="Overall Pass Rate"
          value={stats.passRate}
          icon={TrendingUp}
          trend={{ value: "Grade D or higher", isPositive: true }}
        />
        <StatsCard
          title="Dean's Honor (A+)"
          value={stats.topScores}
          icon={Sparkles}
          trend={{ value: "≥ 90% Distinction", isPositive: true }}
        />
        <StatsCard
          title="Mean Examination Score"
          value={stats.avgPercentage}
          icon={Award}
          trend={{ value: "Across all subjects", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by student name, roll number, admission number, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Selects */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select
                value={examFilter}
                onChange={(e) => setExamFilter(e.target.value)}
              >
                <option value="all">All Examinations</option>
                {mockExamCycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.name}>
                    {cycle.name}
                  </option>
                ))}
              </Select>

              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="all">All Classes</option>
                {mockClassesList.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </Select>

              <Select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {mockSubjectsList.map((sub) => (
                  <option key={sub.id} value={sub.code}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Standings</option>
                <option value="Passed">Passed</option>
                <option value="A+">Distinction (A+)</option>
                <option value="Failed">Remedial (F)</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Results Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Examination Evaluation Register
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {filteredRecords.length} student subject marks records. Click &quot;Report Card&quot; to generate an official institutional transcript.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Full Validation Enforced: Obtained ≤ Maximum Marks</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No examination results matched"
              description="Try adjusting your search criteria, examination cycle, class, or subject filters."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearch("");
                setExamFilter("all");
                setClassFilter("all");
                setSubjectFilter("all");
                setStatusFilter("all");
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Candidate</TableHead>
                  <TableHead>Exam & Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-36">Marks (Obt / Max)</TableHead>
                  <TableHead className="w-20 text-center">Grade</TableHead>
                  <TableHead className="w-20 text-center">GPA</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const percentage = Math.round(
                    ((Number(record.obtainedMarks) || 0) / (Number(record.maxMarks) || 100)) * 100
                  );
                  const isDistinction = percentage >= 90;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={record.studentName}
                            size="sm"
                            className="bg-indigo-100 text-indigo-700 font-bold"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{record.studentName}</span>
                              {isDistinction && (
                                <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              Roll: <strong className="text-slate-700">{record.rollNumber}</strong> • {record.admissionNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-800 text-xs">
                          {record.examName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold">
                          {record.className} ({record.sectionName})
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 text-xs">
                          {record.subjectName}
                        </div>
                        <div className="text-[11px] font-mono text-indigo-600 font-bold">
                          {record.subjectCode}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 font-mono">
                              {record.obtainedMarks}{" "}
                              <span className="text-slate-400 font-normal">/ {record.maxMarks}</span>
                            </span>
                            <span className="font-mono text-xs font-bold text-indigo-600">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                              className={`h-full rounded-full transition-all ${
                                percentage >= 90
                                  ? "bg-emerald-500"
                                  : percentage >= 75
                                  ? "bg-blue-500"
                                  : percentage >= 60
                                  ? "bg-indigo-500"
                                  : percentage >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs border ${getGradeBadge(
                            record.grade
                          )}`}
                        >
                          {record.grade}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                          {Number(record.gpa).toFixed(1)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-slate-600 max-w-xs truncate" title={record.remarks}>
                          {record.remarks || "—"}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenReportCard(record)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            title="Generate Report Card Transcript"
                          >
                            <FileCheck2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(record)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Marks"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
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
          )}
        </CardContent>
      </Card>

      {/* QUICK EDIT MARKS MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        title={`Edit Marks: ${selectedRecord?.studentName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">{selectedRecord?.subjectName} ({selectedRecord?.subjectCode})</div>
            <div className="text-slate-500">{selectedRecord?.examName} • {selectedRecord?.className}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Obtained Marks *
              </label>
              <Input
                type="number"
                min="0"
                max={editFormData.maxMarks}
                value={editFormData.obtainedMarks}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, obtainedMarks: e.target.value })
                }
                error={editErrors.obtainedMarks}
                className="font-mono text-base font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Marks *
              </label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={editFormData.maxMarks}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, maxMarks: e.target.value })
                }
                error={editErrors.maxMarks}
                className="font-mono text-base font-bold"
              />
            </div>
          </div>

          {/* Dynamic computed preview */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Calculated Evaluation:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-700">
                {Math.round(
                  ((Number(editFormData.obtainedMarks) || 0) /
                    (Number(editFormData.maxMarks) || 100)) *
                    100
                )}
                %
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs border ${getGradeBadge(
                  getGradeFromScore(
                    Number(editFormData.obtainedMarks) || 0,
                    Number(editFormData.maxMarks) || 100
                  ).grade
                )}`}
              >
                {
                  getGradeFromScore(
                    Number(editFormData.obtainedMarks) || 0,
                    Number(editFormData.maxMarks) || 100
                  ).grade
                }
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teacher Remarks / Notes
            </label>
            <Input
              placeholder="e.g. Flawless calculations, good analytical reasoning"
              value={editFormData.remarks}
              onChange={(e) =>
                setEditFormData({ ...editFormData, remarks: e.target.value })
              }
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
              Save Marks
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Remove Evaluation Record"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span>
              Are you sure you want to remove the evaluation for{" "}
              <strong>{selectedRecord?.studentName}</strong> in{" "}
              <strong>{selectedRecord?.subjectName}</strong>?
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

      {/* INSTITUTIONAL REPORT CARD PREVIEW MODAL */}
      <Modal
        isOpen={reportCardModal.isOpen}
        onClose={reportCardModal.closeModal}
        title="Official Academic Transcript & Report Card"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Action bar inside modal */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-600">
              Select another student to inspect report card:
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedStudentForReport?.student?.id || ""}
                onChange={(e) => {
                  const targetId = e.target.value;
                  const rec = records.find((r) => r.studentId === targetId);
                  if (rec) handleOpenReportCard(rec);
                }}
                className="text-xs py-1.5"
              >
                {Array.from(new Set(records.map((r) => r.studentId))).map((sId) => {
                  const rec = records.find((r) => r.studentId === sId);
                  return (
                    <option key={sId} value={sId}>
                      {rec.studentName} ({rec.rollNumber})
                    </option>
                  );
                })}
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </Button>
            </div>
          </div>

          {/* Printable Report Card Sheet */}
          <div
            ref={reportCardRef}
            className="p-8 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-800 space-y-6 relative overflow-hidden"
          >
            {/* Top Ornamental Watermark Header */}
            <div className="border-b-2 border-indigo-900 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-800 to-indigo-950 text-white flex items-center justify-center shadow-md">
                    <School className="h-9 w-9 text-indigo-200" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-indigo-950 uppercase tracking-tight">
                      Oakridge International Academy
                    </h2>
                    <p className="text-xs text-slate-600">
                      Excellence in Academic Discovery & Character Formation
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      1000 Academy Boulevard, Oakridge, CA 94025 • Affiliation Code: OIA-2026-US
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 font-extrabold text-xs rounded-lg uppercase tracking-wider">
                    Official Transcript
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Issue Date: 2026-03-31
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest bg-slate-100 py-1.5 rounded-lg border border-slate-200">
                  {selectedStudentForReport?.examName} • Academic Year 2025-2026
                </h3>
              </div>
            </div>

            {/* Student Profile Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Candidate Name
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedStudentForReport?.student?.name}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Roll / Admission No
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {selectedStudentForReport?.student?.rollNumber} • {selectedStudentForReport?.student?.admissionNumber}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Class & Section
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedStudentForReport?.className} ({selectedStudentForReport?.sectionName})
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Attendance Rate
                </span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedStudentForReport?.student?.attendanceRate || 97.5}% (Present)
                </span>
              </div>
            </div>

            {/* Subject-Wise Marks Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Subject Evaluation Breakdown</span>
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Subject & Code</th>
                      <th className="py-2.5 px-3 text-center">Max Marks</th>
                      <th className="py-2.5 px-3 text-center">Passing Marks</th>
                      <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                      <th className="py-2.5 px-3 text-center">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-center">GPA</th>
                      <th className="py-2.5 px-3">Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedStudentForReport?.subjects.map((sub) => {
                      const pct = Math.round(
                        ((Number(sub.obtainedMarks) || 0) / (Number(sub.maxMarks) || 100)) * 100
                      );
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{sub.subjectName}</div>
                            <div className="text-[10px] font-mono text-indigo-600 font-semibold">{sub.subjectCode}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-600">
                            {sub.maxMarks}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-500">
                            40
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                            {sub.obtainedMarks}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-700">
                            {pct}%
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getGradeBadge(
                                sub.grade
                              )}`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                            {Number(sub.gpa).toFixed(1)}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600 italic">
                            &quot;{sub.remarks}&quot;
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consolidated Academic Performance Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-xl text-white shadow-md">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-indigo-800/60">
                <div>
                  <span className="block text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                    Total Marks
                  </span>
                  <span className="text-xl font-extrabold font-mono text-white">
                    {transcriptStats.totalObtained}{" "}
                    <span className="text-xs text-indigo-300 font-normal">/ {transcriptStats.totalMax}</span>
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                    Cumulative %
                  </span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400">
                    {transcriptStats.percentage}%
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                    Cumulative GPA
                  </span>
                  <span className="text-xl font-extrabold font-mono text-amber-300">
                    {transcriptStats.gpa} / 4.00
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-indigo-300 uppercase tracking-widest font-bold">
                    Overall Grade
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {transcriptStats.grade}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="font-semibold text-indigo-200">
                    Standing: <strong className="text-white">{transcriptStats.distinction}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30">
                    RESULT: {transcriptStats.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures & Seal Section */}
            <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-slate-500">
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-slate-700">Eleanor Vance, M.Ed.</span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">
                  Class Teacher
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-900/30 flex items-center justify-center text-[9px] uppercase font-bold text-indigo-900 text-center tracking-tighter">
                  Oakridge Seal
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center">
                  <span className="font-serif italic text-sm text-slate-700">Dr. Arthur Pendelton</span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-semibold text-slate-700">
                  Dean / Head of Examinations
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reportCardModal.closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Transcript</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
