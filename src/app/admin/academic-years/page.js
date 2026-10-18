"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/shared/EmptyState";
import { mockAcademicYears } from "@/data/mock/academicYears";
import { formatDate } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  Calendar,
  CheckCircle,
  Archive,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  AlertTriangle,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminAcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState(mockAcademicYears);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedYearId, setExpandedYearId] = useState("AY-2025-26");

  // Modals
  const createEditModal = useModal();
  const confirmModal = useModal();

  // Form State for Create / Edit
  const [editingYearId, setEditingYearId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    terms: [
      { name: "Term 1 (Fall)", startDate: "", endDate: "", status: "upcoming" },
      { name: "Term 2 (Spring)", startDate: "", endDate: "", status: "upcoming" },
      { name: "Term 3 (Summer)", startDate: "", endDate: "", status: "upcoming" },
    ],
  });

  const [formErrors, setFormErrors] = useState({});

  // Filtered Years
  const filteredYears = academicYears.filter((item) => {
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeYear = academicYears.find((y) => y.status === "active");

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingYearId(null);
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      terms: [
        { name: "Term 1 (Fall)", startDate: "", endDate: "", status: "upcoming" },
        { name: "Term 2 (Spring)", startDate: "", endDate: "", status: "upcoming" },
        { name: "Term 3 (Summer)", startDate: "", endDate: "", status: "upcoming" },
      ],
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (year) => {
    setEditingYearId(year.id);
    setFormData({
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      description: year.description || "",
      terms: year.terms.map((t) => ({ ...t })),
    });
    setFormErrors({});
    createEditModal.open();
  };

  // Add a Term field
  const handleAddTerm = () => {
    setFormData({
      ...formData,
      terms: [
        ...formData.terms,
        {
          name: `Term ${formData.terms.length + 1}`,
          startDate: "",
          endDate: "",
          status: "upcoming",
        },
      ],
    });
  };

  // Remove a Term field
  const handleRemoveTerm = (index) => {
    if (formData.terms.length <= 1) return;
    setFormData({
      ...formData,
      terms: formData.terms.filter((_, i) => i !== index),
    });
  };

  // Update specific term
  const handleTermChange = (index, field, value) => {
    const updated = [...formData.terms];
    updated[index][field] = value;
    setFormData({ ...formData, terms: updated });
  };

  // Validate form dates
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Academic year designation is required (e.g. 2026 - 2027).";
    }

    if (!formData.startDate) {
      errors.startDate = "Session start date is required.";
    }

    if (!formData.endDate) {
      errors.endDate = "Session end date is required.";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "Session end date must be strictly after the start date.";
      }
    }

    // Validate terms
    formData.terms.forEach((term, idx) => {
      if (!term.name.trim()) {
        errors[`term_${idx}_name`] = `Term ${idx + 1} name cannot be blank.`;
      }
      if (term.startDate && term.endDate) {
        if (new Date(term.endDate) <= new Date(term.startDate)) {
          errors[`term_${idx}_dates`] = `${term.name} end date must be after its start date.`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Year
  const handleSaveYear = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingYearId) {
      // Edit existing
      setAcademicYears((prev) =>
        prev.map((item) =>
          item.id === editingYearId
            ? {
                ...item,
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description,
                terms: formData.terms,
              }
            : item
        )
      );
    } else {
      // Create new
      const newYear = {
        id: `AY-${Date.now().toString().slice(-4)}`,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        status: "upcoming",
        totalStudents: 0,
        totalClasses: 36,
        terms: formData.terms.map((t, idx) => ({
          id: `TRM-${Date.now().toString().slice(-3)}-${idx}`,
          ...t,
          assessmentCount: 0,
        })),
      };
      setAcademicYears([newYear, ...academicYears]);
    }

    createEditModal.close();
  };

  // Activation Confirmation
  const promptActivate = (year) => {
    confirmModal.open({
      title: `Activate ${year.name} Session?`,
      message: `Setting ${year.name} as the active academic year will switch the live school term across the institution. The previous active session (${activeYear?.name}) will remain accessible in history.`,
      confirmText: "Activate Session",
      variant: "primary",
      action: () => {
        setAcademicYears((prev) =>
          prev.map((item) => {
            if (item.id === year.id) {
              return { ...item, status: "active" };
            }
            if (item.status === "active") {
              return { ...item, status: "archived" };
            }
            return item;
          })
        );
        confirmModal.close();
      },
    });
  };

  // Archive / Restore
  const toggleArchive = (year) => {
    const isArchived = year.status === "archived";
    confirmModal.open({
      title: isArchived ? `Restore ${year.name}?` : `Archive ${year.name}?`,
      message: isArchived
        ? `Restoring will make this academic cycle active as an upcoming planning year.`
        : `Archiving locks student enrollments and records for ${year.name}. Historical reports and transcripts remain available.`,
      confirmText: isArchived ? "Restore Year" : "Archive Year",
      variant: isArchived ? "primary" : "danger",
      action: () => {
        setAcademicYears((prev) =>
          prev.map((item) =>
            item.id === year.id
              ? { ...item, status: isArchived ? "upcoming" : "archived" }
              : item
          )
        );
        confirmModal.close();
      },
    });
  };

  // Delete Year
  const promptDelete = (year) => {
    if (year.status === "active") {
      alert("Cannot delete the currently active academic session. Please activate another session first.");
      return;
    }

    confirmModal.open({
      title: `Permanently Remove ${year.name}?`,
      message: `Are you sure you want to delete ${year.name} and all its configured term schedules? This cannot be undone.`,
      confirmText: "Delete Permanently",
      variant: "danger",
      action: () => {
        setAcademicYears((prev) => prev.filter((item) => item.id !== year.id));
        confirmModal.close();
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Academic Years & Term Schedules"
        subtitle="Configure official academic calendars, session periods, and semester milestones."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Create Academic Year
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Academic Year"
          value={activeYear?.name || "2025 - 2026"}
          description={`${formatDate(activeYear?.startDate)} – ${formatDate(activeYear?.endDate)}`}
          icon={Calendar}
          variant="emerald"
        />
        <StatsCard
          title="Configured Sessions"
          value={`${academicYears.length} Academic Years`}
          description="1 Active • 1 Upcoming • 1 Archived"
          icon={Layers}
          variant="indigo"
        />
        <StatsCard
          title="Total Active Terms"
          value="3 Terms per Session"
          description="Fall, Spring, and Summer"
          icon={Clock}
          variant="blue"
        />
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search academic years by designation or notes..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="Status (All)"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "Active Session", value: "active" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Archived", value: "archived" },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Years List */}
      <div className="space-y-5">
        {filteredYears.map((year) => {
          const isActive = year.status === "active";
          const isArchived = year.status === "archived";
          const isExpanded = expandedYearId === year.id;

          return (
            <Card
              key={year.id}
              className={isActive ? "border-indigo-300 ring-1 ring-indigo-200" : ""}
            >
              <CardHeader className="py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isActive
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : isArchived
                          ? "bg-slate-100 text-slate-500"
                          : "bg-indigo-50 text-indigo-600 border border-indigo-200"
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <CardTitle className="text-base">{year.name}</CardTitle>
                        <Badge
                          variant={isActive ? "emerald" : isArchived ? "slate" : "indigo"}
                          dot
                          size="sm"
                        >
                          {isActive ? "Active Session" : isArchived ? "Archived" : "Upcoming"}
                        </Badge>
                      </div>
                      <CardDescription className="font-mono mt-0.5">
                        {formatDate(year.startDate)} – {formatDate(year.endDate)}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isActive && !isArchived && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={Check}
                        onClick={() => promptActivate(year)}
                      >
                        Set as Active
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleOpenEdit(year)}
                    >
                      Edit
                    </Button>

                    {!isActive && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Archive}
                        onClick={() => toggleArchive(year)}
                      >
                        {isArchived ? "Restore" : "Archive"}
                      </Button>
                    )}

                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => promptDelete(year)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete academic year"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedYearId(isExpanded ? null : year.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-1"
                      title={isExpanded ? "Collapse terms" : "Expand terms"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardHeader>

              {/* Terms Section (Collapsible) */}
              {isExpanded && (
                <CardContent className="pt-2 border-t border-slate-100 bg-slate-50/40">
                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-slate-600 font-medium">
                      {year.description}
                    </p>
                  </div>

                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Configured Academic Terms ({year.terms?.length || 0})
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {year.terms?.map((term, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">
                            {term.name}
                          </span>
                          <Badge
                            variant={
                              term.status === "active"
                                ? "emerald"
                                : term.status === "completed"
                                ? "slate"
                                : "indigo"
                            }
                            size="sm"
                          >
                            {term.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">
                          {formatDate(term.startDate)} – {formatDate(term.endDate)}
                        </p>
                        {term.assessmentCount !== undefined && (
                          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            {term.assessmentCount} graded assessments linked
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {filteredYears.length === 0 && (
          <EmptyState
            title="No academic years match query"
            description="Adjust your search criteria or reset the status filter."
            actionLabel="Reset Search"
            onAction={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        )}
      </div>

      {/* Create / Edit Academic Year Modal */}
      <Modal
        isOpen={createEditModal.isOpen}
        onClose={createEditModal.close}
        title={editingYearId ? "Edit Academic Session" : "Create New Academic Year"}
        description="Define session duration and term boundaries. Client-side date validation prevents inverted ranges."
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={createEditModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveYear}>
              {editingYearId ? "Save Session Changes" : "Create Academic Year"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveYear} className="space-y-4">
          <Input
            label="Academic Year Designation *"
            placeholder="e.g. 2026 - 2027"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Session Start Date *"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              error={formErrors.startDate}
            />
            <Input
              label="Session End Date *"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={formErrors.endDate}
            />
          </div>

          <Input
            label="Session Description / Notes"
            placeholder="e.g. Planning cycle for upcoming cohort admissions."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Dynamic Terms Setup */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configured Terms / Semesters
                </h4>
                <p className="text-[11px] text-slate-500">
                  Each term must fit cleanly within the overall academic session.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={handleAddTerm}
              >
                Add Term
              </Button>
            </div>

            <div className="space-y-3">
              {formData.terms.map((term, tIdx) => (
                <div
                  key={tIdx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      className="font-semibold text-xs text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Term Name (e.g. Term 1)"
                      value={term.name}
                      onChange={(e) => handleTermChange(tIdx, "name", e.target.value)}
                    />
                    {formData.terms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(tIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove term"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                      value={term.startDate}
                      onChange={(e) => handleTermChange(tIdx, "startDate", e.target.value)}
                    />
                    <input
                      type="date"
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                      value={term.endDate}
                      onChange={(e) => handleTermChange(tIdx, "endDate", e.target.value)}
                    />
                  </div>

                  {formErrors[`term_${tIdx}_dates`] && (
                    <p className="text-[11px] text-rose-600 font-medium">
                      {formErrors[`term_${tIdx}_dates`]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      {confirmModal.modalData && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.close}
          title={confirmModal.modalData.title}
          description={confirmModal.modalData.message}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={confirmModal.close}>
                Cancel
              </Button>
              <Button
                variant={confirmModal.modalData.variant || "primary"}
                size="sm"
                onClick={confirmModal.modalData.action}
              >
                {confirmModal.modalData.confirmText || "Confirm"}
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <span>This action will update the active school configuration in local mock state.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
