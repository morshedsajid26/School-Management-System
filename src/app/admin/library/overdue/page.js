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
import { formatCurrency } from "@/utils/formatters";
import {
  AlertCircle,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Barcode,
  DollarSign,
  Send,
  RotateCcw,
  Clock,
  ShieldAlert,
  Bell,
  Check,
} from "lucide-react";

export default function LibraryOverduePage() {
  const { overdueRecords, collectFineAndReturn } = useLibrary();

  const [searchTerm, setSearchTerm] = useState("");
  const [daysFilter, setDaysFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  const collectModal = useModal();
  const reminderModal = useModal();

  // Fine collection form state
  const [collectedFine, setCollectedFine] = useState(0);
  const [waiveFine, setWaiveFine] = useState(false);
  const [returnCondition, setReturnCondition] = useState("Good");
  const [deskNotes, setDeskNotes] = useState("Overdue fine settled at library desk");

  // Reminder form state
  const [reminderType, setReminderType] = useState("email");
  const [customNoticeText, setCustomNoticeText] = useState(
    "Please return this overdue library volume immediately to avoid daily fine escalation."
  );

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter overdue items
  const filteredOverdue = useMemo(() => {
    return overdueRecords.filter((rec) => {
      const matchSearch =
        rec.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.rollNumber && rec.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      const days = rec.daysOverdue || 0;
      let matchDays = true;
      if (daysFilter === "7") matchDays = days >= 7;
      if (daysFilter === "14") matchDays = days >= 14;
      if (daysFilter === "21") matchDays = days >= 21;

      return matchSearch && matchDays;
    });
  }, [overdueRecords, searchTerm, daysFilter]);

  // Statistics
  const totalFines = overdueRecords.reduce(
    (acc, r) => acc + (r.fineAmount || 0),
    0
  );
  const severeDelinquencies = overdueRecords.filter(
    (r) => (r.daysOverdue || 0) >= 14
  ).length;

  const handleOpenCollect = (rec) => {
    setCollectedFine(rec.fineAmount || 0);
    setWaiveFine(false);
    setReturnCondition("Good");
    setDeskNotes("Overdue fine settled at library desk");
    collectModal.open(rec);
  };

  const handleConfirmCollect = (e) => {
    e.preventDefault();
    if (!collectModal.modalData) return;

    const amount = waiveFine ? 0 : parseFloat(collectedFine) || 0;
    const res = collectFineAndReturn(
      collectModal.modalData.id,
      amount,
      returnCondition,
      deskNotes
    );

    if (res.success) {
      collectModal.close();
      showToast(
        `Fine settled (${formatCurrency(amount)}) and "${
          collectModal.modalData.bookTitle
        }" returned to inventory.`
      );
    } else {
      alert(res.message || "Failed to process settlement.");
    }
  };

  const handleOpenReminder = (rec) => {
    setReminderType("email");
    setCustomNoticeText(
      `Dear ${rec.borrowerName}, our records show that "${rec.bookTitle}" (Due: ${rec.dueDate}) is overdue by ${rec.daysOverdue} days. Current accrued fine is $${(rec.fineAmount || 0).toFixed(2)}. Please return immediately to the library circulation desk.`
    );
    reminderModal.open(rec);
  };

  const handleSendReminder = (e) => {
    e.preventDefault();
    if (!reminderModal.modalData) return;
    reminderModal.close();
    showToast(
      `Overdue reminder notification successfully dispatched to ${reminderModal.modalData.borrowerName}.`
    );
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
        title="Overdue Books Management"
        description="Delinquency monitoring, automated fine calculations ($0.50/day), reminder escalation notices, and fine settlement check-ins"
      />

      {/* Navigation Sub-Tabs */}
      <LibraryNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Overdue Loan Items"
          value={overdueRecords.length}
          icon={AlertCircle}
          description="Past scheduled due dates"
        />
        <StatsCard
          title="Accrued Library Fines"
          value={formatCurrency(totalFines)}
          icon={DollarSign}
          description="$0.50 rate per elapsed day"
        />
        <StatsCard
          title="Severe Delinquencies"
          value={severeDelinquencies}
          icon={ShieldAlert}
          description="Exceeding 14+ days overdue"
        />
        <StatsCard
          title="Escalation Status"
          value="Automated"
          icon={Bell}
          description="Direct homeroom alerts"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search overdue items by book, student, roll no, or ID..."
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

            <div className="w-full sm:w-56">
              <select
                value={daysFilter}
                onChange={(e) => setDaysFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Overdue Terms</option>
                <option value="7">&ge; 7 Days Overdue</option>
                <option value="14">&ge; 14 Days Overdue (Severe)</option>
                <option value="21">&ge; 21 Days Overdue (Critical)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Delinquencies Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6">
          <CardTitle className="text-sm font-bold text-slate-800">
            Delinquent Circulation Register
          </CardTitle>
          <CardDescription className="text-xs">
            Audit unreturned volumes, enforce lending penalties, and execute fee settlements
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Loan ID</TableHead>
                <TableHead className="text-xs">Book Title & Barcode</TableHead>
                <TableHead className="text-xs">Borrower Details</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
                <TableHead className="text-xs">Delinquency Period</TableHead>
                <TableHead className="text-xs">Accrued Fine</TableHead>
                <TableHead className="text-xs">Notice Status</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOverdue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      <p className="font-bold text-slate-700">No Overdue Books</p>
                      <p className="text-slate-400">All student and faculty loans are currently in good standing.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOverdue.map((rec, idx) => {
                  const days = rec.daysOverdue || 0;
                  const isSevere = days >= 14;

                  return (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
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
                        <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{rec.dueDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              isSevere
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {days} Days Late
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-sm text-rose-600">
                          {formatCurrency(rec.fineAmount || 0)}
                        </span>
                        <p className="text-[10px] text-slate-400">$0.50/day</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-xs text-slate-600 block line-clamp-1">
                          {rec.notes || "Overdue notice dispatched"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenReminder(rec)}
                            title="Dispatch Escalation Reminder Notice"
                            className="text-xs px-2.5 py-1"
                          >
                            <Send className="h-3 w-3 mr-1 text-indigo-600" />
                            Notice
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenCollect(rec)}
                            title="Settle Fine & Return Book"
                            className="text-xs px-2.5 py-1 font-semibold"
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            Settle & Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: COLLECT FINE & RETURN */}
      <Modal
        isOpen={collectModal.isOpen}
        onClose={collectModal.close}
        title="Settle Fine & Check-In Book"
        description="Record payment of overdue penalties and return volume to library inventory."
        size="md"
      >
        {collectModal.modalData && (
          <form onSubmit={handleConfirmCollect} className="space-y-4">
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {collectModal.modalData.bookTitle}
                </span>
                <Badge variant="danger" className="text-[10px]">
                  {collectModal.modalData.daysOverdue} Days Late
                </Badge>
              </div>
              <p className="text-slate-600">
                Borrower: <span className="font-semibold">{collectModal.modalData.borrowerName}</span> ({collectModal.modalData.className})
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Due Date: {collectModal.modalData.dueDate} &bull; Standard Fine: ${collectModal.modalData.fineAmount?.toFixed(2)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Fine Amount to Collect *
                </label>
                <label className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waiveFine}
                    onChange={(e) => setWaiveFine(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>Waive Fine ($0.00)</span>
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={waiveFine}
                value={waiveFine ? 0 : collectedFine}
                onChange={(e) => setCollectedFine(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold ${
                  waiveFine
                    ? "bg-slate-100 text-slate-400 border-slate-200"
                    : "border-slate-300 text-slate-900"
                }`}
              />
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
                <option value="Good">Good (Normal wear)</option>
                <option value="Excellent">Excellent (Pristine)</option>
                <option value="Fair">Fair (Noticeable dog-ears)</option>
                <option value="Damaged">Damaged (Cover/Binding defect)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Settlement & Inspection Notes
              </label>
              <input
                type="text"
                value={deskNotes}
                onChange={(e) => setDeskNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={collectModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Complete Settlement & Restock
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: SEND REMINDER NOTICE */}
      <Modal
        isOpen={reminderModal.isOpen}
        onClose={reminderModal.close}
        title="Dispatch Delinquency Notice"
        description="Send automated overdue notification to borrower and homeroom advisor."
        size="md"
      >
        {reminderModal.modalData && (
          <form onSubmit={handleSendReminder} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
              <p className="font-bold text-slate-900">
                To: {reminderModal.modalData.borrowerName} ({reminderModal.modalData.className})
              </p>
              <p className="text-slate-600 mt-0.5">
                Book: {reminderModal.modalData.bookTitle} (Due: {reminderModal.modalData.dueDate})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dispatch Channel *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["email", "sms", "homeroom"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReminderType(type)}
                    className={`py-2 text-xs font-bold rounded-lg border uppercase transition ${
                      reminderType === type
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Notice Message Content *
              </label>
              <textarea
                rows="4"
                value={customNoticeText}
                onChange={(e) => setCustomNoticeText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={reminderModal.close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <Send className="h-4 w-4 mr-1.5" />
                Dispatch Reminder
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
