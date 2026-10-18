"use client";

import React, { useState, useMemo } from "react";
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
  getGradeFromScore,
} from "@/data/mock/examinations";
import { mockClassesList, mockSectionsList, mockSubjectsList } from "@/data/mock/academicStructure";
import { useModal } from "@/hooks/useModal";
import {
  PenTool,
  Save,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  Check,
  TrendingUp,
  FileCheck2,
  Sparkles,
  X,
} from "lucide-react";

export default function MarksEntryPage() {
  const [selectedExam, setSelectedExam] = useState("Term 2 Midterm Examination");
  const [selectedClass, setSelectedClass] = useState("Grade 10");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("PHY-101");

  // Maximum Marks for current paper
  const [maxMarks, setMaxMarks] = useState(100);

  // Local state for all marks records
  const [records, setRecords] = useState(mockMarksRecords);

  // Search in sheet
  const [search, setSearch] = useState("");

  // Modals
  const confirmSaveModal = useModal();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Find active subject
  const currentSubject = useMemo(() => {
    return mockSubjectsList.find((s) => s.code === selectedSubjectCode) || mockSubjectsList[0];
  }, [selectedSubjectCode]);

  // Current cohort marks records
  const currentMarksSheet = useMemo(() => {
    return records.filter(
      (r) =>
        r.examName === selectedExam &&
        r.className === selectedClass &&
        r.subjectCode === selectedSubjectCode
    );
  }, [records, selectedExam, selectedClass, selectedSubjectCode]);

  // Displayed records after text search
  const displayedSheet = useMemo(() => {
    return currentMarksSheet.filter((item) => {
      const query = search.toLowerCase().trim();
      return (
        !query ||
        item.studentName.toLowerCase().includes(query) ||
        item.rollNumber.toLowerCase().includes(query) ||
        item.admissionNumber.toLowerCase().includes(query)
      );
    });
  }, [currentMarksSheet, search]);

  // Summary Metrics
  const sheetStats = useMemo(() => {
    const total = currentMarksSheet.length;
    if (total === 0) return { total: 0, avg: 0, highest: 0, passRate: 0 };

    const scores = currentMarksSheet.map((r) => Number(r.obtainedMarks) || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / total).toFixed(1);
    const highest = Math.max(...scores);
    const passed = currentMarksSheet.filter((r) => r.status === "Passed").length;
    const passRate = ((passed / total) * 100).toFixed(0);

    return { total, avg, highest, passRate };
  }, [currentMarksSheet]);

  // Handle individual student mark change with instant validation
  const handleMarkChange = (recordId, rawValue) => {
    const val = rawValue === "" ? "" : Number(rawValue);

    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const numVal = Number(val) || 0;
          const evaluation = getGradeFromScore(numVal, r.maxMarks || maxMarks);

          return {
            ...r,
            obtainedMarks: val,
            grade: evaluation.grade,
            gpa: evaluation.gpa,
            status: evaluation.status,
            color: evaluation.color,
          };
        }
        return r;
      })
    );
  };

  // Handle remarks change
  const handleRemarkChange = (recordId, remarks) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, remarks } : r))
    );
  };

  // Check if any mark in current sheet exceeds maximum
  const hasInvalidMarks = useMemo(() => {
    return currentMarksSheet.some(
      (r) => Number(r.obtainedMarks) > (r.maxMarks || maxMarks) || Number(r.obtainedMarks) < 0
    );
  }, [currentMarksSheet, maxMarks]);

  // Save Confirmation
  const handleConfirmSave = () => {
    confirmSaveModal.close();
    showToast(
      `Marks for ${currentSubject?.name} (${selectedClass}) committed successfully! Class average: ${sheetStats.avg}%`
    );
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
        title="Marks Entry & Paper Evaluation"
        subtitle="Record individual candidate marks, calculate GPA standards, and validate scores against maximum limits."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Save}
            disabled={hasInvalidMarks || currentMarksSheet.length === 0}
            onClick={confirmSaveModal.open}
          >
            Save Evaluated Marks
          </Button>
        }
      />

      {/* Sub Navigation */}
      <ExamNavTabs />

      {/* Selector Control Card */}
      <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Exam Cycle */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Examination Cycle:
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mockExamCycles.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Class Level:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mockClassesList.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Section:
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Section A">Section A</option>
                <option value="Section B">Section B</option>
              </select>
            </div>

            {/* Subject Paper */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Curriculum Subject:
              </label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mockSubjectsList.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Candidates Assessed"
          value={sheetStats.total}
          icon={Users}
          variant="indigo"
          description="In this examination paper"
        />
        <StatsCard
          title="Class Average"
          value={`${sheetStats.avg}%`}
          icon={TrendingUp}
          variant="emerald"
          description="Mean academic achievement"
        />
        <StatsCard
          title="Highest Score"
          value={`${sheetStats.highest} / ${maxMarks}`}
          icon={Award}
          variant="amber"
          description="Top performer mark"
        />
        <StatsCard
          title="Pass Percentage"
          value={`${sheetStats.passRate}%`}
          icon={CheckCircle2}
          variant="purple"
          description="Scoring above 40%"
        />
      </div>

      {/* Main Marks Evaluation Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                {currentSubject?.name} — {selectedClass} ({selectedSection})
              </CardTitle>
              <CardDescription>
                Maximum Score Standard: <strong className="text-slate-800">{maxMarks} Marks</strong>
              </CardDescription>
            </div>

            <div className="w-full sm:w-64">
              <Input
                placeholder="Search candidate name or roll #..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {displayedSheet.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={PenTool}
                title="No candidates found for this subject"
                description={`No marks records initialized for ${selectedClass} in ${currentSubject?.name}. Try switching subjects or classes above.`}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClass("Grade 10");
                      setSelectedSubjectCode("PHY-101");
                      setSearch("");
                    }}
                  >
                    Load Grade 10 Physics Sheet
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead className="w-16">Roll No</TableHead>
                    <TableHead>Candidate Profile</TableHead>
                    <TableHead className="w-24">Max Marks</TableHead>
                    <TableHead className="w-36">Obtained Marks</TableHead>
                    <TableHead className="w-28 text-center">Grade & GPA</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead>Evaluator Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedSheet.map((student) => {
                    const isOverMax = Number(student.obtainedMarks) > (student.maxMarks || maxMarks);
                    const isNegative = Number(student.obtainedMarks) < 0;

                    return (
                      <TableRow key={student.id}>
                        {/* Roll Number */}
                        <TableCell className="font-mono text-xs font-bold text-slate-800">
                          {student.rollNumber}
                        </TableCell>

                        {/* Candidate */}
                        <TableCell>
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {student.studentName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {student.admissionNumber}
                          </span>
                        </TableCell>

                        {/* Max Marks */}
                        <TableCell className="font-mono text-xs font-bold text-slate-500">
                          {student.maxMarks || maxMarks}
                        </TableCell>

                        {/* Obtained Marks Input */}
                        <TableCell>
                          <div className="space-y-1">
                            <input
                              type="number"
                              min="0"
                              max={student.maxMarks || maxMarks}
                              value={student.obtainedMarks}
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              className={`w-28 font-mono font-black text-sm px-3 py-1.5 rounded-xl border focus:outline-none transition ${
                                isOverMax || isNegative
                                  ? "border-rose-400 bg-rose-50 text-rose-900 focus:ring-2 focus:ring-rose-500/20"
                                  : "border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                              }`}
                            />
                            {isOverMax && (
                              <p className="text-[10px] text-rose-600 font-bold">
                                Exceeds max {student.maxMarks || maxMarks}!
                              </p>
                            )}
                            {isNegative && (
                              <p className="text-[10px] text-rose-600 font-bold">
                                Cannot be negative
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Grade & GPA */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-black ${
                                student.grade === "A+"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : student.grade === "A"
                                  ? "bg-blue-100 text-blue-800"
                                  : student.grade === "B"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : student.grade === "C"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {student.grade}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-bold">
                              {student.gpa?.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Pass/Fail Status */}
                        <TableCell>
                          <Badge
                            variant={student.status === "Passed" ? "emerald" : "rose"}
                            size="sm"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>

                        {/* Remarks Input */}
                        <TableCell>
                          <input
                            type="text"
                            value={student.remarks || ""}
                            placeholder="Add evaluation note..."
                            onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONFIRM SAVE MARKS MODAL */}
      <Modal
        isOpen={confirmSaveModal.isOpen}
        onClose={confirmSaveModal.close}
        title="Commit Evaluated Marks Sheet"
        description={`${currentSubject?.name} • ${selectedClass} (${selectedSection})`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="md" onClick={confirmSaveModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="md" icon={Save} onClick={handleConfirmSave}>
              Save and Commit Marks
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600">Evaluated Candidates:</span>
              <strong className="text-slate-900">{sheetStats.total} Students</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-emerald-700">Class Average Score:</span>
              <strong className="text-emerald-700">{sheetStats.avg}%</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-indigo-700">Highest Score:</span>
              <strong className="text-indigo-700">{sheetStats.highest} Marks</strong>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-purple-700">Pass Rate:</span>
              <strong className="text-purple-700">{sheetStats.passRate}%</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Committed scores will be locked into academic transcripts and available in official report cards.
          </p>
        </div>
      </Modal>
    </div>
  );
}
