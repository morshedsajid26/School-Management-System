"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import FinanceNavTabs from "@/components/shared/FinanceNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import { mockFeeStructures, mockFeeCategories } from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  Calendar,
  Building,
  School,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function FeeStructurePage() {
  const [structures, setStructures] = useState(mockFeeStructures);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");

  // Modals
  const structureModal = useModal();
  const deleteModal = useModal();

  // Active edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const initialForm = {
    name: "",
    category: "Tuition Fee",
    amount: 1200,
    frequency: "Per Term",
    applicableClasses: "All Grades",
    lateFeePolicy: "$50 flat fee after 15 days grace period",
    description: "",
    status: "Active",
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const stats = useMemo(() => {
    const total = structures.length;
    const active = structures.filter((s) => s.status === "Active").length;
    const distinctCategories = new Set(structures.map((s) => s.category)).size;
    const highestTier = structures.reduce(
      (max, s) => (Number(s.amount) > max ? Number(s.amount) : max),
      0
    );

    return { total, active, distinctCategories, highestTier };
  }, [structures]);

  // Filtered Structures
  const filteredStructures = useMemo(() => {
    return structures.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.applicableClasses.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesFrequency = frequencyFilter === "all" || item.frequency === frequencyFilter;

      return matchesSearch && matchesCategory && matchesFrequency;
    });
  }, [structures, search, categoryFilter, frequencyFilter]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    structureModal.openModal();
  };

  // Handle open edit modal
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      amount: item.amount,
      frequency: item.frequency,
      applicableClasses: item.applicableClasses,
      lateFeePolicy: item.lateFeePolicy,
      description: item.description || "",
      status: item.status || "Active",
    });
    setFormErrors({});
    structureModal.openModal();
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Fee structure title is required.";
    }
    const amt = Number(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = "Base amount must be greater than zero.";
    }
    if (!formData.applicableClasses.trim()) {
      errors.applicableClasses = "Please specify applicable classes or 'All Grades'.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save form
  const handleSaveStructure = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setStructures((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name.trim(),
                category: formData.category,
                amount: Number(formData.amount),
                frequency: formData.frequency,
                applicableClasses: formData.applicableClasses.trim(),
                lateFeePolicy: formData.lateFeePolicy.trim(),
                description: formData.description.trim(),
                status: formData.status,
              }
            : item
        )
      );
      showToast(`Fee structure "${formData.name}" updated successfully.`);
    } else {
      const newStructure = {
        id: `FEE-STR-${(structures.length + 1).toString().padStart(2, "0")}`,
        name: formData.name.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        applicableClasses: formData.applicableClasses.trim(),
        lateFeePolicy: formData.lateFeePolicy.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };
      setStructures((prev) => [newStructure, ...prev]);
      showToast(`Fee structure "${newStructure.name}" created successfully.`);
    }

    structureModal.closeModal();
  };

  // Open delete
  const handleOpenDelete = (item) => {
    setSelectedStructure(item);
    deleteModal.openModal();
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedStructure) return;
    setStructures((prev) => prev.filter((item) => item.id !== selectedStructure.id));
    showToast(`Fee structure "${selectedStructure.name}" removed.`, "info");
    deleteModal.closeModal();
  };

  // Category color helper
  const getCategoryColor = (catName) => {
    const matched = mockFeeCategories.find((c) => c.name === catName);
    switch (matched?.color) {
      case "indigo":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "purple":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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
        title="Fee Structure & Tuition Plans"
        description="Establish institutional billing categories, grade applicability, payment frequencies, and penalty policies."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add Fee Structure</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Fee Plans"
          value={stats.total}
          icon={Layers}
          trend={{ value: `${stats.active} Active`, isPositive: true }}
        />
        <StatsCard
          title="Fee Categories"
          value={stats.distinctCategories}
          icon={Building}
          trend={{ value: "Configured", isPositive: true }}
        />
        <StatsCard
          title="Max Single Plan Amount"
          value={formatCurrency(stats.highestTier)}
          icon={BadgeDollarSign}
          trend={{ value: "Per Term High Tier", isPositive: true }}
        />
        <StatsCard
          title="Grace Period Standard"
          value="15 Days"
          icon={Calendar}
          trend={{ value: "Standard Policy", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by fee title, category, or applicable grades..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {mockFeeCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
              >
                <option value="all">All Frequencies</option>
                <option value="Per Term">Per Term</option>
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
                <option value="One-time">One-time</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Active Fee Schedules
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Institutional tuition and ancillary fee schedules applied during invoice generation.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredStructures.length} Structures
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStructures.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No fee structures matched"
              description="Adjust your search criteria or create a new institutional fee tier."
              actionLabel="Add Fee Structure"
              onAction={handleOpenAdd}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Structure Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Applicable Cohort</TableHead>
                  <TableHead>Base Amount</TableHead>
                  <TableHead>Late Policy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStructures.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500 max-w-xs truncate" title={item.description}>
                          {item.description || "—"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {item.frequency}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-800 font-medium">
                        {item.applicableClasses}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-bold text-sm text-indigo-700">
                        {formatCurrency(item.amount)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-500 max-w-[180px] truncate" title={item.lateFeePolicy}>
                        {item.lateFeePolicy}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {item.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Fee Structure"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Fee Structure"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Structure Modal */}
      <Modal
        isOpen={structureModal.isOpen}
        onClose={structureModal.closeModal}
        title={isEditing ? `Edit Fee Plan: ${formData.name}` : "Create Institutional Fee Structure"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveStructure} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Structure Title *
            </label>
            <Input
              placeholder="e.g. Senior Secondary Tuition (Grades 10-12)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fee Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {mockFeeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Base Amount ($) *
              </label>
              <Input
                type="number"
                min="1"
                step="5"
                placeholder="1200"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                error={formErrors.amount}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Billing Frequency *
              </label>
              <Select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="Per Term">Per Term</option>
                <option value="Monthly">Monthly</option>
                <option value="Annual">Annual</option>
                <option value="One-time">One-time</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Applicable Cohort *
              </label>
              <Input
                placeholder="e.g. All Grades or Grade 10, Grade 11"
                value={formData.applicableClasses}
                onChange={(e) => setFormData({ ...formData, applicableClasses: e.target.value })}
                error={formErrors.applicableClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Late Fee Policy & Grace Period
            </label>
            <Input
              placeholder="e.g. $50 flat fee after 15 days grace period"
              value={formData.lateFeePolicy}
              onChange={(e) => setFormData({ ...formData, lateFeePolicy: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Plan Description & Inclusions
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of what this tuition or fee package covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={structureModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isEditing ? "Save Plan Changes" : "Create Fee Plan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Remove Fee Structure"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span>
              Are you sure you want to remove <strong>&quot;{selectedStructure?.name}&quot;</strong>? This fee tier will no longer be available for new student invoices.
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
