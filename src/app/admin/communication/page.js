"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import CommunicationNavTabs from "@/components/shared/CommunicationNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import {
  mockNoticesList,
  mockNoticeAudiences,
  mockNoticeCategories,
} from "@/data/mock/notices";
import { useModal } from "@/hooks/useModal";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Archive,
  Send,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  School,
  Clock,
  Sparkles,
  FileText,
  X,
  Share2,
  Check,
} from "lucide-react";

export default function NoticeManagementPage() {
  const [notices, setNotices] = useState(mockNoticesList);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const createModal = useModal();
  const previewModal = useModal();
  const deleteModal = useModal();

  // Active targets
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form State
  const initialForm = {
    title: "",
    content: "",
    targetAudience: "All School (Everyone)",
    category: "Academic & Curriculum",
    priority: "Normal",
    publishedDate: "2026-03-24",
    expiryDate: "2026-04-30",
    author: "Administration Office",
    status: "Published",
  };
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Summary Metrics
  const stats = useMemo(() => {
    const total = notices.length;
    const published = notices.filter((n) => n.status === "Published").length;
    const archived = notices.filter((n) => n.status === "Archived").length;
    const drafts = notices.filter((n) => n.status === "Draft").length;

    return { total, published, archived, drafts };
  }, [notices]);

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesAudience = audienceFilter === "all" || item.targetAudience === audienceFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesAudience && matchesCategory;
    });
  }, [notices, search, statusFilter, audienceFilter, categoryFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    createModal.openModal();
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      targetAudience: item.targetAudience,
      category: item.category,
      priority: item.priority,
      publishedDate: item.publishedDate,
      expiryDate: item.expiryDate,
      author: item.author,
      status: item.status,
    });
    setFormErrors({});
    createModal.openModal();
  };

  // Open Preview Modal
  const handleOpenPreview = (item) => {
    setSelectedNotice(item);
    previewModal.openModal();
  };

  // Validate Form
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Notice title is required.";
    }
    if (!formData.content.trim()) {
      errors.content = "Notice announcement content is required.";
    }
    if (!formData.publishedDate) {
      errors.publishedDate = "Publication date is required.";
    }
    if (!formData.expiryDate) {
      errors.expiryDate = "Expiry date is required.";
    } else if (formData.publishedDate && formData.expiryDate < formData.publishedDate) {
      errors.expiryDate = "Expiry date cannot be earlier than publication date.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Notice Form
  const handleSaveNotice = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      setNotices((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title.trim(),
                content: formData.content.trim(),
                targetAudience: formData.targetAudience,
                category: formData.category,
                priority: formData.priority,
                publishedDate: formData.publishedDate,
                expiryDate: formData.expiryDate,
                author: formData.author.trim(),
                status: formData.status,
              }
            : item
        )
      );
      showToast(`Notice "${formData.title}" updated successfully.`);
    } else {
      const newNotice = {
        id: `NTC-2026-${(notices.length + 1).toString().padStart(3, "0")}`,
        title: formData.title.trim(),
        content: formData.content.trim(),
        targetAudience: formData.targetAudience,
        category: formData.category,
        priority: formData.priority,
        publishedDate: formData.publishedDate,
        expiryDate: formData.expiryDate,
        author: formData.author.trim() || "Principal's Office",
        status: formData.status,
        viewsCount: 0,
      };

      setNotices((prev) => [newNotice, ...prev]);
      showToast(
        formData.status === "Published"
          ? `Notice "${newNotice.title}" published to campus board.`
          : `Notice "${newNotice.title}" saved as draft.`
      );
    }

    createModal.closeModal();
  };

  // Action: Publish draft notice
  const handlePublishNotice = (id) => {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "Published", publishedDate: "2026-03-24" } : n
      )
    );
    showToast("Notice status changed to Published.");
  };

  // Action: Archive notice
  const handleArchiveNotice = (id) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "Archived" } : n))
    );
    showToast("Notice has been archived from active boards.", "info");
  };

  // Action: Open Delete
  const handleOpenDelete = (item) => {
    setSelectedNotice(item);
    deleteModal.openModal();
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedNotice) return;
    setNotices((prev) => prev.filter((n) => n.id !== selectedNotice.id));
    showToast(`Notice "${selectedNotice.title}" permanently deleted.`, "info");
    deleteModal.closeModal();
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Published":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Draft":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      case "Archived":
        return "bg-slate-100 text-slate-700 border-slate-300 font-medium";
      case "Expired":
        return "bg-rose-100 text-rose-800 border-rose-300 font-semibold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  // Priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
      case "Urgent":
        return "bg-rose-50 text-rose-700 border-rose-200 font-bold";
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
              : "bg-rose-50 border-rose-200 text-rose-800"
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
        title="Notice Board & Bulletin Management"
        description="Publish official campus circulars, target designated cohorts, manage expiration dates, and archive institutional announcements."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Create Notice</span>
            </Button>
          </div>
        }
      />

      {/* Shared Tabs */}
      <CommunicationNavTabs />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Bulletins"
          value={stats.published}
          icon={Megaphone}
          trend={{ value: "Live on Portals", isPositive: true }}
        />
        <StatsCard
          title="Total Notices"
          value={stats.total}
          icon={FileText}
          trend={{ value: "All Recorded", isPositive: true }}
        />
        <StatsCard
          title="Archived Bulletins"
          value={stats.archived}
          icon={Archive}
          trend={{ value: "Historical Records", isPositive: true }}
        />
        <StatsCard
          title="Pending Drafts"
          value={stats.drafts}
          icon={Clock}
          trend={{ value: "Awaiting review", isPositive: false }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notices by title, content, or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Published">Published (Active)</option>
                <option value="Draft">Drafts</option>
                <option value="Archived">Archived</option>
              </Select>

              <Select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
              >
                <option value="all">All Target Audiences</option>
                {mockNoticeAudiences.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </Select>

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {mockNoticeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Institutional Circulars & Bulletins
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {filteredNotices.length} notices. Click &quot;Preview&quot; to inspect full letterhead circular.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {filteredNotices.length} Notices
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotices.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No circular notices matched"
              description="Adjust your search criteria or create a new campus circular."
              actionLabel="Create Notice"
              onAction={handleOpenCreate}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notice Title</TableHead>
                  <TableHead>Target Cohort</TableHead>
                  <TableHead>Category & Priority</TableHead>
                  <TableHead className="w-28">Published</TableHead>
                  <TableHead className="w-28">Expires</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="text-right w-44">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item)}
                          className="font-bold text-slate-900 text-xs hover:text-indigo-600 transition text-left block max-w-sm truncate"
                        >
                          {item.title}
                        </button>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>By {item.author}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{item.targetAudience}</span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-800 font-medium">{item.category}</div>
                      <span
                        className={`inline-block px-2 py-0.2 rounded text-[10px] border mt-0.5 ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority} Priority
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-700 font-medium">
                        {item.publishedDate}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">
                        {item.expiryDate}
                      </span>
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
                        <button
                          onClick={() => handleOpenPreview(item)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          title="Preview Notice Bulletin"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {item.status === "Draft" && (
                          <button
                            onClick={() => handlePublishNotice(item.id)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition"
                            title="Publish Notice Now"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}

                        {item.status === "Published" && (
                          <button
                            onClick={() => handleArchiveNotice(item.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Archive Notice"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Notice"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Notice"
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

      {/* CREATE / EDIT NOTICE MODAL */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title={isEditing ? `Edit Circular: "${formData.title}"` : "Compose Campus Notice Bulletin"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Title *
            </label>
            <Input
              placeholder="e.g. Parent-Teacher Academic Consultation Day (Term 2)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={formErrors.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience Cohort *
              </label>
              <Select
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
              >
                {mockNoticeAudiences.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {mockNoticeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publication Date *
              </label>
              <Input
                type="date"
                value={formData.publishedDate}
                onChange={(e) =>
                  setFormData({ ...formData, publishedDate: e.target.value })
                }
                error={formErrors.publishedDate}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Expiry Date *
              </label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                error={formErrors.expiryDate}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Tier
              </label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent Alert</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Author / Issuing Office
              </label>
              <Input
                placeholder="e.g. Principal's Office or Academic Dean"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publication Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Publish Immediately</option>
                <option value="Draft">Save as Draft</option>
                <option value="Archived">Archived</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Circular Content / Announcement Text *
            </label>
            <textarea
              rows={5}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write the full announcement text, schedule timings, instructions, and location details..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            {formErrors.content && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.content}</p>
            )}
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
              {isEditing ? "Save Notice Changes" : "Post Campus Notice"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL NOTICE PREVIEW MODAL */}
      <Modal
        isOpen={previewModal.isOpen}
        onClose={previewModal.closeModal}
        title="Official Circular Notice Preview"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Institutional Letterhead Sheet */}
          <div className="p-8 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-800 space-y-6">
            {/* Header */}
            <div className="border-b-2 border-indigo-900 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-indigo-950 text-white flex items-center justify-center">
                  <School className="h-8 w-8 text-indigo-200" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-indigo-950 uppercase tracking-tight">
                    Oakridge International Academy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Administrative Circular & Campus Bulletin
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Ref Code: {selectedNotice?.id} • 1000 Academy Blvd, CA 94025
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${getStatusBadge(
                    selectedNotice?.status
                  )}`}
                >
                  {selectedNotice?.status}
                </span>
                <div className="text-[11px] text-slate-500 font-mono mt-1">
                  Issued: {selectedNotice?.publishedDate}
                </div>
              </div>
            </div>

            {/* Notice Title Banner */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                  Target: {selectedNotice?.targetAudience}
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  Category: {selectedNotice?.category}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  Valid Until: {selectedNotice?.expiryDate}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedNotice?.title}
              </h3>
            </div>

            {/* Circular Body */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
              {selectedNotice?.content}
            </div>

            {/* Verification Signoff */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Authorized By
                </span>
                <span className="font-bold text-slate-900">{selectedNotice?.author}</span>
                <div className="text-[11px] text-slate-500">Institutional Governance Directorate</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-indigo-900/40 flex items-center justify-center text-[8px] uppercase font-bold text-indigo-900 text-center tracking-tighter">
                  Official Seal
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previewModal.closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast(`Notice link copied for distribution.`);
                previewModal.closeModal();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Circular</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        title="Remove Notice Circular"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span>
              Are you sure you want to permanently remove <strong>&quot;{selectedNotice?.title}&quot;</strong>? It will be taken down from all active portals immediately.
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
