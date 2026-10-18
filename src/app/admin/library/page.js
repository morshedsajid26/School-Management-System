"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import LibraryNavTabs from "@/components/shared/LibraryNavTabs";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import useLibrary from "@/hooks/useLibrary";
import { mockStudents } from "@/data/mock/students";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Edit2,
  Trash2,
  Eye,
  BookCheck,
  Bookmark,
  MapPin,
  Barcode,
  LayoutGrid,
  List,
  RotateCcw,
} from "lucide-react";

export default function LibraryCatalogPage() {
  const {
    books,
    categories,
    borrowRecords,
    stats,
    addBook,
    updateBook,
    deleteBook,
    issueBook,
    resetLibraryData,
  } = useLibrary();

  // Filters & layout
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const addModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();
  const issueModal = useModal();

  // Form states
  const initialBookForm = {
    title: "",
    isbn: "",
    author: "",
    category: "Sciences & Mathematics",
    publisher: "",
    edition: "",
    totalCopies: 5,
    shelfLocation: "Stack A, Shelf 01",
    description: "",
  };
  const [bookFormData, setBookFormData] = useState(initialBookForm);

  // Quick Issue form state
  const [issueFormData, setIssueFormData] = useState({
    borrowerType: "Student",
    studentId: "STU-001",
    manualName: "",
    manualClass: "",
    issueDate: "2026-03-24",
    dueDate: "2026-04-07",
    notes: "Coursework reference checkout",
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === "all" || book.category === selectedCategory;

      let matchesAvail = true;
      if (selectedAvailability === "available") {
        matchesAvail = book.availableCopies > 0;
      } else if (selectedAvailability === "low") {
        matchesAvail = book.availableCopies > 0 && book.availableCopies <= 3;
      } else if (selectedAvailability === "out") {
        matchesAvail = book.availableCopies === 0;
      }

      return matchesSearch && matchesCat && matchesAvail;
    });
  }, [books, searchTerm, selectedCategory, selectedAvailability]);

  // Handlers for Book CRUD
  const handleOpenAdd = () => {
    setBookFormData(initialBookForm);
    addModal.open();
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!bookFormData.title || !bookFormData.isbn || !bookFormData.author) {
      alert("Please provide the Book Title, ISBN, and Author.");
      return;
    }
    const created = addBook(bookFormData);
    addModal.close();
    showToast(`"${created.title}" successfully added to the catalog.`);
  };

  const handleOpenEdit = (book) => {
    setBookFormData({
      title: book.title,
      isbn: book.isbn,
      author: book.author,
      category: book.category,
      publisher: book.publisher || "",
      edition: book.edition || "",
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || "",
      description: book.description || "",
    });
    editModal.open(book);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.modalData) return;
    updateBook(editModal.modalData.id, bookFormData);
    editModal.close();
    showToast(`Book "${bookFormData.title}" successfully updated.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deleteBook(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Book "${deleteModal.modalData.title}" removed from catalog.`);
  };

  // Handlers for Book Checkout / Issue
  const handleOpenIssue = (book) => {
    if (book.availableCopies <= 0) return;
    setIssueFormData({
      borrowerType: "Student",
      studentId: mockStudents[0]?.id || "STU-001",
      manualName: "",
      manualClass: "",
      issueDate: "2026-03-24",
      dueDate: "2026-04-07",
      notes: `Standard checkout for ${book.title}`,
    });
    issueModal.open(book);
  };

  const handleConfirmIssue = (e) => {
    e.preventDefault();
    if (!issueModal.modalData) return;

    let borrowerName = "";
    let rollNumber = "";
    let className = "";
    let borrowerId = "";

    if (issueFormData.borrowerType === "Student") {
      const student = mockStudents.find((s) => s.id === issueFormData.studentId);
      if (student) {
        borrowerId = student.id;
        borrowerName = student.name;
        rollNumber = student.rollNumber;
        className = `${student.grade} (${student.section})`;
      } else {
        borrowerName = "Student";
        className = "Grade 10";
      }
    } else {
      borrowerName = issueFormData.manualName || "Faculty Member";
      className = issueFormData.manualClass || "Department Faculty";
      borrowerId = "FAC-LIB";
      rollNumber = "FAC";
    }

    const result = issueBook({
      bookId: issueModal.modalData.id,
      borrowerId,
      borrowerName,
      borrowerType: issueFormData.borrowerType,
      rollNumber,
      className,
      issueDate: issueFormData.issueDate,
      dueDate: issueFormData.dueDate,
      notes: issueFormData.notes,
    });

    if (result.success) {
      issueModal.close();
      showToast(`Copy of "${issueModal.modalData.title}" issued to ${borrowerName}.`);
    } else {
      alert(result.message || "Failed to issue book.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Library Management"
        description="Comprehensive repository catalog, multi-stack inventory, lending policies, and catalog operations"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetLibraryData}
            title="Reset library state back to initial mock sample"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Book
          </Button>
        </div>
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LibraryNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Book Titles"
          value={stats.totalTitles}
          icon={BookOpen}
          description="Cataloged unique volumes"
          trend={{ value: "+2 new", isPositive: true }}
        />
        <StatsCard
          title="Total Bound Volumes"
          value={stats.totalVolumes}
          icon={Layers}
          description="Total physical copies in stacks"
        />
        <StatsCard
          title="Available for Checkout"
          value={stats.availableVolumes}
          icon={CheckCircle2}
          description="Ready on circulation shelves"
        />
        <StatsCard
          title="Currently Borrowed"
          value={stats.inCirculation}
          icon={Clock}
          description={`${stats.overdueCount} overdue item(s)`}
        />
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN barcode..."
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

            {/* Category Filter */}
            <div className="w-full md:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Availability</option>
                <option value="available">Available Copies (&gt;0)</option>
                <option value="low">Low Stock (&le;3)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === "table"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table List View"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Catalog Contents */}
      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No matching books found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              We couldn&apos;t find any books matching your search query or selected filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedAvailability("all");
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <Card>
          <CardHeader className="border-b border-slate-100 py-3.5 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Book Catalog Register
              </CardTitle>
              <CardDescription className="text-xs">
                Displaying {filteredBooks.length} of {books.length} registered titles
              </CardDescription>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-12 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Book Title & Author</TableHead>
                  <TableHead className="text-xs">ISBN Barcode</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Availability</TableHead>
                  <TableHead className="text-xs">Shelf Location</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book, idx) => {
                  const isOutOfStock = book.availableCopies === 0;
                  const isLowStock = book.availableCopies > 0 && book.availableCopies <= 3;

                  return (
                    <TableRow key={book.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <button
                            type="button"
                            onClick={() => viewModal.open(book)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                          >
                            {book.title}
                          </button>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            by {book.author}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {book.edition}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
                          <Barcode className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{book.isbn}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {book.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 w-28">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {book.availableCopies}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              / {book.totalCopies} copies
                            </span>
                          </div>
                          {/* Mini progress bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isOutOfStock
                                  ? "bg-rose-500"
                                  : isLowStock
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((book.availableCopies / (book.totalCopies || 1)) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{book.shelfLocation || "General Stack"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Out of Stock
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Available
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => handleOpenIssue(book)}
                            className="text-xs px-2.5 py-1 font-semibold"
                            title={isOutOfStock ? "No copies available" : "Issue book to borrower"}
                          >
                            <BookCheck className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                            Issue
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewModal.open(book)}
                            title="View Book Details"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(book)}
                            title="Edit Book Details"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModal.open(book)}
                            title="Delete Book from Catalog"
                            className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isOutOfStock = book.availableCopies === 0;
            const isLowStock = book.availableCopies > 0 && book.availableCopies <= 3;

            return (
              <Card
                key={book.id}
                className="overflow-hidden hover:shadow-md transition-shadow border-slate-200/90 flex flex-col justify-between"
              >
                <div>
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {book.category}
                      </span>
                      {isOutOfStock ? (
                        <Badge variant="danger" className="text-[10px]">
                          Out of Stock
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning" className="text-[10px]">
                          {book.availableCopies} Left
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">
                          Available
                        </Badge>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => viewModal.open(book)}
                      className="text-left font-bold text-base text-slate-900 hover:text-indigo-600 transition line-clamp-2 mb-1"
                    >
                      {book.title}
                    </button>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      by {book.author}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {book.description || "Comprehensive educational volume."}
                    </p>

                    {/* Metadata specs */}
                    <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ISBN:</span>
                        <span className="font-mono text-slate-700">{book.isbn}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Stack:</span>
                        <span className="text-slate-700">{book.shelfLocation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Inventory:</span>
                        <span className="font-semibold text-slate-800">
                          {book.availableCopies} available of {book.totalCopies} copies
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => viewModal.open(book)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(book)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200/60"
                      title="Edit Book"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteModal.open(book)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      title="Delete Book"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isOutOfStock}
                    onClick={() => handleOpenIssue(book)}
                    className="text-xs font-semibold px-3 py-1.5"
                  >
                    <BookCheck className="h-3.5 w-3.5 mr-1.5" />
                    Issue Copy
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD BOOK */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Add New Catalog Volume"
        description="Register a new textbook, fiction work, or research publication into the library system."
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fundamentals of Physics"
                value={bookFormData.title}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                ISBN Barcode *
              </label>
              <input
                type="text"
                required
                placeholder="978-0-12345-678-9"
                value={bookFormData.isbn}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, isbn: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Author(s) *
              </label>
              <input
                type="text"
                required
                placeholder="Author Name(s)"
                value={bookFormData.author}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, author: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={bookFormData.category}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Copies in Stock *
              </label>
              <input
                type="number"
                min="1"
                required
                value={bookFormData.totalCopies}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    totalCopies: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Publisher
              </label>
              <input
                type="text"
                placeholder="e.g. Wiley Academic, MIT Press"
                value={bookFormData.publisher}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, publisher: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Edition / Year
              </label>
              <input
                type="text"
                placeholder="e.g. 11th Edition (2022)"
                value={bookFormData.edition}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, edition: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Shelf / Stack Location
              </label>
              <input
                type="text"
                placeholder="e.g. Stack B, Shelf 04, East Wing"
                value={bookFormData.shelfLocation}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    shelfLocation: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Summary / Curriculum Notes
              </label>
              <textarea
                rows="3"
                placeholder="Key topics, targeted syllabus units, or special collection notes..."
                value={bookFormData.description}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={addModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Book to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT BOOK */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Catalog Volume"
        description={`Update metadata and stack configurations for ${editModal.modalData?.title}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={bookFormData.title}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                ISBN Barcode *
              </label>
              <input
                type="text"
                required
                value={bookFormData.isbn}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, isbn: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Author(s) *
              </label>
              <input
                type="text"
                required
                value={bookFormData.author}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, author: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Category *
              </label>
              <select
                value={bookFormData.category}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, category: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Total Copies in Stock *
              </label>
              <input
                type="number"
                min="1"
                required
                value={bookFormData.totalCopies}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    totalCopies: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={bookFormData.publisher}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, publisher: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Edition / Year
              </label>
              <input
                type="text"
                value={bookFormData.edition}
                onChange={(e) =>
                  setBookFormData({ ...bookFormData, edition: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Shelf / Stack Location
              </label>
              <input
                type="text"
                value={bookFormData.shelfLocation}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    shelfLocation: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Summary / Curriculum Notes
              </label>
              <textarea
                rows="3"
                value={bookFormData.description}
                onChange={(e) =>
                  setBookFormData({
                    ...bookFormData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW BOOK DETAILS */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title="Book Volume Details"
        description="Stack catalog record, barcode metadata, and active borrowing logs"
        size="lg"
      >
        {viewModal.modalData && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <div className="h-16 w-12 rounded bg-indigo-600 text-white flex flex-col items-center justify-center font-bold text-sm shadow-sm shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    {viewModal.modalData.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {viewModal.modalData.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {viewModal.modalData.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  by {viewModal.modalData.author}
                </p>
              </div>
            </div>

            {/* Book specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">ISBN Number</span>
                <span className="font-mono font-bold text-slate-800">
                  {viewModal.modalData.isbn}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Publisher</span>
                <span className="font-semibold text-slate-800">
                  {viewModal.modalData.publisher || "N/A"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Edition</span>
                <span className="font-semibold text-slate-800">
                  {viewModal.modalData.edition || "Standard"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Stack Shelf</span>
                <span className="font-semibold text-indigo-700">
                  {viewModal.modalData.shelfLocation || "General"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Total Copies</span>
                <span className="font-bold text-slate-800">
                  {viewModal.modalData.totalCopies} copies
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Available Now</span>
                <span className="font-bold text-emerald-600">
                  {viewModal.modalData.availableCopies} available
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">
                Overview & Summary
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {viewModal.modalData.description ||
                  "No detailed summary registered for this volume."}
              </p>
            </div>

            {/* Active Borrows for this book */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                Active Circulation Borrowers
              </h4>
              {(() => {
                const activeBorrows = borrowRecords.filter(
                  (r) =>
                    r.bookId === viewModal.modalData.id &&
                    (r.status === "Issued" || r.status === "Overdue")
                );

                if (activeBorrows.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                      No copies currently borrowed in circulation. All available copies are in stacks.
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    {activeBorrows.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {rec.borrowerName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {rec.className} &bull; Due: {rec.dueDate}
                          </p>
                        </div>
                        {rec.status === "Overdue" ? (
                          <Badge variant="danger" className="text-[10px]">
                            Overdue ({rec.daysOverdue}d)
                          </Badge>
                        ) : (
                          <Badge variant="info" className="text-[10px]">
                            Issued
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const b = viewModal.modalData;
                  viewModal.close();
                  handleOpenEdit(b);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit Book
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={viewModal.close}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={viewModal.modalData.availableCopies <= 0}
                  onClick={() => {
                    const b = viewModal.modalData;
                    viewModal.close();
                    handleOpenIssue(b);
                  }}
                >
                  <BookCheck className="h-4 w-4 mr-1.5" />
                  Issue This Book
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: QUICK ISSUE */}
      <Modal
        isOpen={issueModal.isOpen}
        onClose={issueModal.close}
        title="Issue Book to Borrower"
        description={`Record checkout transaction for "${issueModal.modalData?.title}"`}
        size="md"
      >
        {issueModal.modalData && (
          <form onSubmit={handleConfirmIssue} className="space-y-4">
            <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 text-xs">
              <p className="font-bold text-indigo-900 line-clamp-1">
                {issueModal.modalData.title}
              </p>
              <p className="text-slate-600 mt-0.5">
                ISBN: <span className="font-mono">{issueModal.modalData.isbn}</span> &bull; Copies Available:{" "}
                <span className="font-bold text-emerald-600">
                  {issueModal.modalData.availableCopies}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Borrower Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setIssueFormData({ ...issueFormData, borrowerType: "Student" })
                  }
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    issueFormData.borrowerType === "Student"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setIssueFormData({ ...issueFormData, borrowerType: "Faculty" })
                  }
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    issueFormData.borrowerType === "Faculty"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Faculty / Staff
                </button>
              </div>
            </div>

            {issueFormData.borrowerType === "Student" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Student *
                </label>
                <select
                  value={issueFormData.studentId}
                  onChange={(e) =>
                    setIssueFormData({
                      ...issueFormData,
                      studentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {mockStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.grade} - {stu.section}, Roll: {stu.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Staff Member Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Thorne"
                    value={issueFormData.manualName}
                    onChange={(e) =>
                      setIssueFormData({
                        ...issueFormData,
                        manualName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Faculty"
                    value={issueFormData.manualClass}
                    onChange={(e) =>
                      setIssueFormData({
                        ...issueFormData,
                        manualClass: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueFormData.issueDate}
                  onChange={(e) =>
                    setIssueFormData({
                      ...issueFormData,
                      issueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Return Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueFormData.dueDate}
                  onChange={(e) =>
                    setIssueFormData({
                      ...issueFormData,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Lending Notes / Project Reference
              </label>
              <input
                type="text"
                placeholder="Optional purpose, e.g. Lab assignment research"
                value={issueFormData.notes}
                onChange={(e) =>
                  setIssueFormData({ ...issueFormData, notes: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={issueModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm & Issue Book
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Remove Book from Catalog"
        description="Are you certain you wish to purge this volume from the school library index?"
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete &quot;{deleteModal.modalData.title}&quot;?
                </p>
                <p className="mt-0.5">
                  ISBN: {deleteModal.modalData.isbn} &bull; Total copies: {deleteModal.modalData.totalCopies}
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
