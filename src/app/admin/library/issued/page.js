"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import LibraryNavTabs from "@/components/shared/LibraryNavTabs";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import useLibrary from "@/hooks/useLibrary";
import { mockStudents } from "@/data/mock/students";
import {
  BookCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Calendar,
  User,
  Barcode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function LibraryIssuedPage() {
  const {
    books,
    borrowRecords,
    issuedRecords,
    overdueRecords,
    issueBook,
    returnBook,
    renewLoan,
  } = useLibrary();

  const [searchTerm, setSearchTerm] = useState("");
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const issueModal = useModal();
  const returnModal = useModal();
  const renewModal = useModal();

  // New Issue form
  const [issueFormData, setIssueFormData] = useState({
    bookId: "",
    borrowerType: "Student",
    studentId: "STU-001",
    manualName: "",
    manualClass: "",
    issueDate: "2026-03-24",
    dueDate: "2026-04-07",
    notes: "Curricular research loan",
  });

  // Return Book form
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("Returned on-time in standard state");

  // Renew form
  const [newDueDate, setNewDueDate] = useState("2026-04-14");

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter only available books for issue selector
  const availableBooks = useMemo(
    () => books.filter((b) => b.availableCopies > 0),
    [books]
  );

  // Filter issued records
  const filteredRecords = useMemo(() => {
    return issuedRecords.filter((rec) => {
      const matchSearch =
        rec.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.rollNumber && rec.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        borrowerTypeFilter === "all" || rec.borrowerType === borrowerTypeFilter;

      return matchSearch && matchRole;
    });
  }, [issuedRecords, searchTerm, borrowerTypeFilter]);

  const handleOpenIssue = () => {
    if (availableBooks.length === 0) {
      alert("All catalog books are currently checked out.");
      return;
    }
    setIssueFormData({
      bookId: availableBooks[0]?.id || "",
      borrowerType: "Student",
      studentId: mockStudents[0]?.id || "STU-001",
      manualName: "",
      manualClass: "",
      issueDate: "2026-03-24",
      dueDate: "2026-04-07",
      notes: "Curricular reference loan",
    });
    issueModal.open();
  };

  const handleConfirmIssue = (e) => {
    e.preventDefault();
    if (!issueFormData.bookId) {
      alert("Please select a book.");
      return;
    }

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
      bookId: issueFormData.bookId,
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
      showToast(`Book checkout registered for ${borrowerName}.`);
    } else {
      alert(result.message || "Failed to issue book.");
    }
  };

  const handleOpenReturn = (record) => {
    setReturnCondition("Good");
    setReturnNotes("Returned on-time in good condition");
    returnModal.open(record);
  };

  const handleConfirmReturn = (e) => {
    e.preventDefault();
    if (!returnModal.modalData) return;

    const res = returnBook(returnModal.modalData.id, returnCondition, returnNotes);
    if (res.success) {
      returnModal.close();
      showToast(`Book "${returnModal.modalData.bookTitle}" returned & checked into stacks.`);
    } else {
      alert(res.message || "Failed to process return.");
    }
  };

  const handleOpenRenew = (record) => {
    setNewDueDate("2026-04-14");
    renewModal.open(record);
  };

  const handleConfirmRenew = (e) => {
    e.preventDefault();
    if (!renewModal.modalData) return;
    renewLoan(renewModal.modalData.id, newDueDate);
    renewModal.close();
    showToast(`Loan due date extended to ${newDueDate}.`);
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
        title="Issued Books Register"
        description="Active borrower loans, checkout timelines, return check-in processing, and renewal extensions"
      >
        <Button variant="primary" size="sm" onClick={handleOpenIssue}>
          <Plus className="h-4 w-4 mr-1.5" />
          Issue New Book
        </Button>
      </PageHeader>

      {/* Navigation Sub-Tabs */}
      <LibraryNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Issued Loans"
          value={issuedRecords.length}
          icon={BookCheck}
          description="In standard borrowing window"
        />
        <StatsCard
          title="Pending Return Items"
          value={issuedRecords.length + overdueRecords.length}
          icon={Clock}
          description="Total copies out of stacks"
        />
        <StatsCard
          title="Overdue Delinquencies"
          value={overdueRecords.length}
          icon={AlertCircle}
          description="Requires librarian follow-up"
        />
        <StatsCard
          title="Circulation Health"
          value="94.2%"
          icon={ShieldCheck}
          description="On-time return rate"
        />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search issued records by book, borrower, roll no, or ID..."
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

            <div className="w-full sm:w-48">
              <select
                value={borrowerTypeFilter}
                onChange={(e) => setBorrowerTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Borrowers</option>
                <option value="Student">Students Only</option>
                <option value="Faculty">Faculty & Staff</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Borrow Records Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6">
          <CardTitle className="text-sm font-bold text-slate-800">
            Active Circulation Loans
          </CardTitle>
          <CardDescription className="text-xs">
            Review checked-out volumes, borrower accountability, and process book check-ins
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Issue Record ID</TableHead>
                <TableHead className="text-xs">Book Title & Barcode</TableHead>
                <TableHead className="text-xs">Borrower Details</TableHead>
                <TableHead className="text-xs">Issue Date</TableHead>
                <TableHead className="text-xs">Return Due Date</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Check-in Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                    No active issued books matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <TableRow key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-center text-xs font-mono text-slate-400">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {rec.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-bold text-sm text-slate-900 line-clamp-1">
                          {rec.bookTitle}
                        </p>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 mt-0.5">
                          <Barcode className="h-3 w-3 text-slate-400" />
                          <span>{rec.isbn}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{rec.borrowerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {rec.className} &bull; Roll: {rec.rollNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{rec.issueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-bold text-xs text-indigo-800 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                          {rec.dueDate}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">14-day loan term</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="info" className="text-[10px] font-bold">
                        Issued
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenRenew(rec)}
                          title="Renew / Extend Loan Term"
                          className="text-xs px-2.5 py-1"
                        >
                          Renew
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenReturn(rec)}
                          title="Return Book to Library"
                          className="text-xs px-2.5 py-1 font-semibold"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Return
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

      {/* MODAL: ISSUE NEW BOOK */}
      <Modal
        isOpen={issueModal.isOpen}
        onClose={issueModal.close}
        title="Check Out & Issue Book"
        description="Select available volume and assign loan period to student or faculty borrower."
        size="md"
      >
        <form onSubmit={handleConfirmIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Select Book Title *
            </label>
            <select
              value={issueFormData.bookId}
              onChange={(e) =>
                setIssueFormData({ ...issueFormData, bookId: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            >
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.availableCopies} available) - {b.isbn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Borrower Type *
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
              Purpose / Loan Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Science fair project preparation"
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
              Confirm Checkout
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RETURN BOOK */}
      <Modal
        isOpen={returnModal.isOpen}
        onClose={returnModal.close}
        title="Check-In Book Return"
        description="Verify physical condition of the returned volume and restore copy to shelf inventory."
        size="md"
      >
        {returnModal.modalData && (
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <p className="font-bold text-slate-900">
                {returnModal.modalData.bookTitle}
              </p>
              <p className="text-slate-600 mt-0.5">
                Borrower: <span className="font-semibold">{returnModal.modalData.borrowerName}</span> ({returnModal.modalData.className})
              </p>
              <p className="text-slate-500 mt-0.5 font-mono">
                Loan ID: {returnModal.modalData.id} &bull; Due: {returnModal.modalData.dueDate}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Book Condition on Return *
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Excellent">Excellent (Pristine, no markings)</option>
                <option value="Good">Good (Normal minor wear)</option>
                <option value="Fair">Fair (Noticeable dog-ears/creases)</option>
                <option value="Damaged">Damaged (Torn pages or binding damage)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Check-in Notes / Condition Report
              </label>
              <input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={returnModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Complete Return Check-In
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: RENEW LOAN */}
      <Modal
        isOpen={renewModal.isOpen}
        onClose={renewModal.close}
        title="Renew & Extend Book Loan"
        description="Extend borrower due date for another lending cycle."
        size="sm"
      >
        {renewModal.modalData && (
          <form onSubmit={handleConfirmRenew} className="space-y-4">
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs">
              <p className="font-bold text-indigo-950">
                {renewModal.modalData.bookTitle}
              </p>
              <p className="text-slate-600 mt-0.5">
                Borrower: {renewModal.modalData.borrowerName}
              </p>
              <p className="text-slate-500 mt-0.5">
                Current Due Date: <span className="font-semibold text-rose-700">{renewModal.modalData.dueDate}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                New Extended Due Date *
              </label>
              <input
                type="date"
                required
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={renewModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm Extension
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
