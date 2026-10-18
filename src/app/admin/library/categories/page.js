"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import LibraryNavTabs from "@/components/shared/LibraryNavTabs";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import useLibrary from "@/hooks/useLibrary";
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Edit2,
  Trash2,
  FolderOpen,
  Hash,
  Sparkles,
} from "lucide-react";

export default function LibraryCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useLibrary();

  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const addModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const initialCategoryForm = {
    name: "",
    code: "",
    description: "",
    totalTitles: 0,
    totalCopies: 0,
    color: "indigo",
  };
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryForm);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [categories, searchTerm]);

  // Statistics
  const totalTitlesSum = categories.reduce((acc, c) => acc + (c.totalTitles || 0), 0);
  const totalCopiesSum = categories.reduce((acc, c) => acc + (c.totalCopies || 0), 0);

  const handleOpenAdd = () => {
    setCategoryFormData(initialCategoryForm);
    addModal.open();
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      alert("Please enter a category name.");
      return;
    }
    const created = addCategory(categoryFormData);
    addModal.close();
    showToast(`Category "${created.name}" created successfully.`);
  };

  const handleOpenEdit = (category) => {
    setCategoryFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      totalTitles: category.totalTitles || 0,
      totalCopies: category.totalCopies || 0,
      color: category.color || "indigo",
    });
    editModal.open(category);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.modalData) return;
    updateCategory(editModal.modalData.id, categoryFormData);
    editModal.close();
    showToast(`Category "${categoryFormData.name}" updated successfully.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deleteCategory(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Category "${deleteModal.modalData.name}" deleted.`);
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
        title="Book Categories"
        description="Dewey-aligned subject classifications, curriculum domains, and volume capacity quotas"
      >
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Category
        </Button>
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LibraryNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Categories"
          value={categories.length}
          icon={Layers}
          description="Subject departments"
        />
        <StatsCard
          title="Classified Titles"
          value={totalTitlesSum}
          icon={BookOpen}
          description="Distinct curriculum works"
        />
        <StatsCard
          title="Total Bound Volumes"
          value={totalCopiesSum}
          icon={FolderOpen}
          description="Distributed stack holdings"
        />
        <StatsCard
          title="Classification Scheme"
          value="DDC / LoC"
          icon={Hash}
          description="Standard academic indexing"
        />
      </div>

      {/* Search and Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories by name, code or description..."
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
            <div className="text-xs font-semibold text-slate-500 text-right">
              Showing {filteredCategories.length} classification groups
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6">
          <CardTitle className="text-sm font-bold text-slate-800">
            Subject Classification Register
          </CardTitle>
          <CardDescription className="text-xs">
            Manage curricular groupings, shelf color accents, and inventory quotas
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Subject Code</TableHead>
                <TableHead className="text-xs">Category Name</TableHead>
                <TableHead className="text-xs">Scope / Description</TableHead>
                <TableHead className="text-xs text-center">Cataloged Titles</TableHead>
                <TableHead className="text-xs text-center">Total Volumes</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No categories found matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <TableRow key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {cat.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500 shrink-0" />
                        <span className="font-bold text-sm text-slate-900">
                          {cat.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {cat.description || "General academic repository"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                        {cat.totalTitles} titles
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-semibold text-slate-700">
                        {cat.totalCopies} copies
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModal.open(cat)}
                          title="Delete Category"
                          className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: ADD CATEGORY */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Add Subject Category"
        description="Define a new curriculum or departmental classification tier."
        size="md"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Languages & Linguistics"
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Classification Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LNG-MOD"
                value={categoryFormData.code}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Badge Color
              </label>
              <select
                value={categoryFormData.color}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, color: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="indigo">Indigo Accent</option>
                <option value="blue">Blue Accent</option>
                <option value="emerald">Emerald Accent</option>
                <option value="amber">Amber Accent</option>
                <option value="purple">Purple Accent</option>
                <option value="rose">Rose Accent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Estimated Titles
              </label>
              <input
                type="number"
                min="0"
                value={categoryFormData.totalTitles}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    totalTitles: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Estimated Copies
              </label>
              <input
                type="number"
                min="0"
                value={categoryFormData.totalCopies}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    totalCopies: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Curricular Scope / Description
            </label>
            <textarea
              rows="3"
              placeholder="Scope of literature, grade relevancy, or special shelf guidelines..."
              value={categoryFormData.description}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={addModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT CATEGORY */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Subject Category"
        description={`Modify properties for ${editModal.modalData?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryFormData.name}
              onChange={(e) =>
                setCategoryFormData({ ...categoryFormData, name: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Classification Code *
              </label>
              <input
                type="text"
                required
                value={categoryFormData.code}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Badge Color
              </label>
              <select
                value={categoryFormData.color}
                onChange={(e) =>
                  setCategoryFormData({ ...categoryFormData, color: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="indigo">Indigo Accent</option>
                <option value="blue">Blue Accent</option>
                <option value="emerald">Emerald Accent</option>
                <option value="amber">Amber Accent</option>
                <option value="purple">Purple Accent</option>
                <option value="rose">Rose Accent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Estimated Titles
              </label>
              <input
                type="number"
                min="0"
                value={categoryFormData.totalTitles}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    totalTitles: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Estimated Copies
              </label>
              <input
                type="number"
                min="0"
                value={categoryFormData.totalCopies}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    totalCopies: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Curricular Scope / Description
            </label>
            <textarea
              rows="3"
              value={categoryFormData.description}
              onChange={(e) =>
                setCategoryFormData({
                  ...categoryFormData,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Classification Category"
        description="Are you certain you wish to remove this category? Existing books in this category will become unassigned."
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete &quot;{deleteModal.modalData.name}&quot;?
                </p>
                <p className="mt-0.5">Code: {deleteModal.modalData.code}</p>
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
