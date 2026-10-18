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
import { mockGradingScale } from "@/data/mock/examinations";
import { useModal } from "@/hooks/useModal";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Calculator,
  Percent,
  Check,
  TrendingUp,
  X,
  BookOpen,
} from "lucide-react";

export default function GradingScalePage() {
  const [gradingScale, setGradingScale] = useState(mockGradingScale);

  // Modals
  const gradeModal = useModal();
  const deleteModal = useModal();

  // Active edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const initialForm = {
    grade: "A+",
    minScore: 90,
    maxScore: 100,
    gpa: 4.0,
    remarks: "Outstanding Excellence",
    color: "emerald",
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Grade Simulator State
  const [simObtained, setSimObtained] = useState(87);
  const [simMax, setSimMax] = useState(100);

  // Computed simulation result
  const simResult = useMemo(() => {
    const max = Number(simMax) || 100;
    const obtained = Math.min(Math.max(0, Number(simObtained) || 0), max);
    const percentage = max > 0 ? Math.round((obtained / max) * 100 * 10) / 10 : 0;

    const matched = gradingScale.find(
      (b) => percentage >= Number(b.minScore) && percentage <= Number(b.maxScore)
    );

    if (matched) {
      return {
        ...matched,
        percentage,
        status: matched.grade === "F" ? "Remedial Required" : "Passing Standing",
      };
    }

    return {
      grade: "F",
      gpa: 0.0,
      remarks: "Remedial Required",
      color: "rose",
      percentage,
      status: "Remedial Required",
    };
  }, [simObtained, simMax, gradingScale]);

  // Statistics
  const stats = useMemo(() => {
    const totalBands = gradingScale.length;
    const topBand = gradingScale.find((b) => b.gpa === 4.0) || gradingScale[0];
    const passingBands = gradingScale.filter((b) => b.grade !== "F");
    const minPassing = passingBands.reduce(
      (min, b) => (Number(b.minScore) < min ? Number(b.minScore) : min),
      100
    );

    return {
      totalBands,
      highestGpa: "4.00",
      topHonor: topBand ? `${topBand.grade} (≥ ${topBand.minScore}%)` : "A+ (90%)",
      minPassingScore: `${minPassing}%`,
    };
  }, [gradingScale]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      grade: "",
      minScore: 0,
      maxScore: 100,
      gpa: 3.5,
      remarks: "",
      color: "indigo",
    });
    setFormErrors({});
    gradeModal.openModal();
  };

  // Handle open edit modal
  const handleOpenEdit = (gradeBand) => {
    setIsEditing(true);
    setEditingId(gradeBand.id);
    setFormData({
      grade: gradeBand.grade,
      minScore: gradeBand.minScore,
      maxScore: gradeBand.maxScore,
      gpa: gradeBand.gpa,
      remarks: gradeBand.remarks,
      color: gradeBand.color || "blue",
    });
    setFormErrors({});
    gradeModal.openModal();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.grade.trim()) {
      errors.grade = "Grade label is required (e.g. A+, B).";
    }

    const min = Number(formData.minScore);
    const max = Number(formData.maxScore);

    if (isNaN(min) || min < 0 || min > 100) {
      errors.minScore = "Minimum score must be between 0 and 100.";
    }
    if (isNaN(max) || max < 0 || max > 100) {
      errors.maxScore = "Maximum score must be between 0 and 100.";
    }
    if (!isNaN(min) && !isNaN(max) && min >= max) {
      errors.minScore = "Minimum score must be strictly less than maximum score.";
    }

    const gpaVal = Number(formData.gpa);
    if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 4.0) {
      errors.gpa = "GPA weight must be between 0.0 and 4.0.";
    }

    if (!formData.remarks.trim()) {
      errors.remarks = "Standing remarks/description is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSaveGrade = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setGradingScale((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                grade: formData.grade.trim().toUpperCase(),
                minScore: Number(formData.minScore),
                maxScore: Number(formData.maxScore),
                gpa: Number(formData.gpa),
                remarks: formData.remarks.trim(),
                color: formData.color,
              }
            : item
        )
      );
      showToast(`Grading tier "${formData.grade.toUpperCase()}" updated successfully.`);
    } else {
      const newGrade = {
        id: `GRD-${Date.now().toString().slice(-4)}`,
        grade: formData.grade.trim().toUpperCase(),
        minScore: Number(formData.minScore),
        maxScore: Number(formData.maxScore),
        gpa: Number(formData.gpa),
        remarks: formData.remarks.trim(),
        color: formData.color,
      };
      setGradingScale((prev) => [...prev, newGrade].sort((a, b) => b.minScore - a.minScore));
      showToast(`New grade band "${newGrade.grade}" added to evaluation criteria.`);
    }

    gradeModal.closeModal();
  };

  // Handle open delete
  const handleOpenDelete = (gradeBand) => {
    setSelectedGrade(gradeBand);
    deleteModal.openModal();
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (!selectedGrade) return;
    setGradingScale((prev) => prev.filter((item) => item.id !== selectedGrade.id));
    showToast(`Grade band "${selectedGrade.grade}" removed.`, "info");
    deleteModal.closeModal();
  };

  // Reset to default
  const handleResetDefault = () => {
    setGradingScale(mockGradingScale);
    showToast("Grading scale restored to institutional default standard.");
  };

  const getColorClasses = (colorName) => {
    switch (colorName) {
      case "emerald":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", bar: "bg-emerald-500" };
      case "blue":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", bar: "bg-blue-500" };
      case "indigo":
        return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", bar: "bg-indigo-500" };
      case "purple":
        return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", bar: "bg-purple-500" };
      case "amber":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", bar: "bg-amber-500" };
      case "orange":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", bar: "bg-orange-500" };
      case "rose":
      case "red":
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", bar: "bg-rose-500" };
      default:
        return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", bar: "bg-slate-500" };
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
        title="Grading Scale & Evaluation Rules"
        description="Establish letter grade thresholds, grade point average (GPA) weights, and academic honors criteria."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Default</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add Grade Band</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <ExamNavTabs />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Grade Tiers"
          value={stats.totalBands}
          icon={Award}
          trend={{ value: "Configured", isPositive: true }}
        />
        <StatsCard
          title="Dean's List / Highest Honor"
          value={stats.topHonor}
          icon={Sparkles}
          trend={{ value: "Max 4.0 GPA", isPositive: true }}
        />
        <StatsCard
          title="Passing Mark Threshold"
          value={stats.minPassingScore}
          icon={TrendingUp}
          trend={{ value: "Grade D or higher", isPositive: true }}
        />
        <StatsCard
          title="Evaluation System"
          value="4.00 Scale"
          icon={BookOpen}
          trend={{ value: "Weighted GPA", isPositive: true }}
        />
      </div>

      {/* Main Grading Scale Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Institutional Letter Grade Framework
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Current evaluation criteria mapped automatically to marks entry and report cards.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Standard: Cumulative 100-Point System
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {gradingScale.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No grading bands configured"
              description="Define percentage brackets and GPA weights to calculate student exam results."
              actionLabel="Add Grade Band"
              onAction={handleOpenAdd}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Grade</TableHead>
                  <TableHead className="w-48">Percentage Bracket</TableHead>
                  <TableHead className="w-32">GPA Weight</TableHead>
                  <TableHead>Academic Standing & Remarks</TableHead>
                  <TableHead className="w-44">Visual Range</TableHead>
                  <TableHead className="text-right w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradingScale.map((band) => {
                  const style = getColorClasses(band.color);
                  return (
                    <TableRow key={band.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm border shadow-sm ${style.bg} ${style.text} ${style.border}`}
                          >
                            {band.grade}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">
                          {band.minScore}% – {band.maxScore}%
                        </div>
                        <div className="text-xs text-slate-400">
                          {band.maxScore - band.minScore + 1}% range span
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-sm text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {Number(band.gpa).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-800 text-sm">
                          {band.remarks}
                        </div>
                        <div className="text-xs text-slate-500">
                          {band.grade === "F" ? "Remedial / Retake needed" : "Valid academic credit"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ marginLeft: `${band.minScore}%`, width: `${band.maxScore - band.minScore + 1}%` }}
                              className={`h-full ${style.bar} rounded-full`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                            <span>0%</span>
                            <span>{band.minScore}%-{band.maxScore}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(band)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Grade Band"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(band)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Grade Band"
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

      {/* Grade Simulator & Evaluation Tester */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Interactive Grade Evaluation Tester
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Simulate how test scores map to letter grades, GPA weights, and remarks in real time.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Input 1: Obtained Marks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Obtained Marks
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max={simMax}
                  value={simObtained}
                  onChange={(e) => setSimObtained(e.target.value)}
                  className="font-mono text-base font-bold pl-3 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  Pts
                </span>
              </div>
            </div>

            {/* Input 2: Maximum Marks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Paper Marks
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={simMax}
                  onChange={(e) => setSimMax(e.target.value)}
                  className="font-mono text-base font-bold pl-3 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                  Max
                </span>
              </div>
            </div>

            {/* Simulated Live Output Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Evaluated Result:</span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {simResult.percentage}% Score
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-extrabold border shadow-sm ${
                    getColorClasses(simResult.color).bg
                  } ${getColorClasses(simResult.color).text} ${
                    getColorClasses(simResult.color).border
                  }`}
                >
                  {simResult.grade}
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {simResult.remarks}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Grade Point: <strong className="text-slate-800">{Number(simResult.gpa).toFixed(2)}</strong> • {simResult.status}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Grade Band Modal */}
      <Modal
        isOpen={gradeModal.isOpen}
        onClose={gradeModal.closeModal}
        title={isEditing ? `Edit Grade Tier "${formData.grade}"` : "Add Evaluation Grade Tier"}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grade Symbol *
              </label>
              <Input
                placeholder="e.g. A+, A, B, C"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                error={formErrors.grade}
                className="font-bold text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                GPA Weight (0.0 - 4.0) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                placeholder="4.0"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                error={formErrors.gpa}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Score (%) *
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={formData.minScore}
                onChange={(e) => setFormData({ ...formData, minScore: e.target.value })}
                error={formErrors.minScore}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Score (%) *
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                error={formErrors.maxScore}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Standing Description / Remarks *
            </label>
            <Input
              placeholder="e.g. Outstanding Excellence, Good Academic Standing"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              error={formErrors.remarks}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Badge Color Accent
            </label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { name: "emerald", label: "Green" },
                { name: "blue", label: "Blue" },
                { name: "indigo", label: "Indigo" },
                { name: "purple", label: "Purple" },
                { name: "amber", label: "Amber" },
                { name: "rose", label: "Rose" },
              ].map((c) => {
                const style = getColorClasses(c.name);
                const isSelected = formData.color === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.name })}
                    className={`h-9 rounded-xl border flex items-center justify-center font-bold text-xs transition ${
                      style.bg
                    } ${style.text} ${isSelected ? "ring-2 ring-indigo-600 ring-offset-2" : "border-slate-200"}`}
                  >
                    {isSelected ? <Check className="h-4 w-4" /> : c.label}
                  </button>
                );
              })}
            </div>
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
              {isEditing ? "Save Tier Changes" : "Create Grade Tier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Remove Grading Tier"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span>
              Are you sure you want to remove Grade Tier <strong>&quot;{selectedGrade?.grade}&quot;</strong> ({selectedGrade?.minScore}% - {selectedGrade?.maxScore}%)? This will affect automatic evaluation calculations.
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
