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
import Avatar from "@/components/ui/Avatar";
import {
  mockInvoices,
  mockPaymentMethods,
  mockFeeCategories,
} from "@/data/mock/finance";
import { mockClassesList } from "@/data/mock/academicStructure";
import { mockStudents } from "@/data/mock/students";
import { formatCurrency } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Bell,
  Mail,
  Phone,
  CheckCircle2,
  BadgeDollarSign,
  Calendar,
  X,
  Send,
  Sparkles,
} from "lucide-react";

export default function OutstandingDuesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [bracketFilter, setBracketFilter] = useState("all");

  // Modals
  const collectModal = useModal();
  const reminderModal = useModal();
  const bulkReminderModal = useModal();

  // Active target
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Quick Pay State
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState("Cash Deposit");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Only invoices with outstanding balances
  const duesList = useMemo(() => {
    return invoices.filter((inv) => inv.remainingBalance > 0);
  }, [invoices]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalDues = duesList.reduce((acc, inv) => acc + (Number(inv.remainingBalance) || 0), 0);
    const overdueCount = duesList.filter((inv) => inv.status === "Overdue").length;
    const partialCount = duesList.filter((inv) => inv.status === "Partial").length;
    const criticalOverdue = duesList
      .filter((inv) => inv.status === "Overdue")
      .reduce((acc, inv) => acc + (Number(inv.remainingBalance) || 0), 0);

    return { totalDues, overdueCount, partialCount, criticalOverdue };
  }, [duesList]);

  // Filtered Dues
  const filteredDues = useMemo(() => {
    return duesList.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.studentName.toLowerCase().includes(query) ||
        item.rollNumber.toLowerCase().includes(query) ||
        item.admissionNumber.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query);

      const matchesClass = classFilter === "all" || item.className === classFilter;
      const matchesBracket =
        bracketFilter === "all" ||
        (bracketFilter === "Overdue" && item.status === "Overdue") ||
        (bracketFilter === "Partial" && item.status === "Partial") ||
        (bracketFilter === "Unpaid" && item.status === "Unpaid");

      return matchesSearch && matchesClass && matchesBracket;
    });
  }, [duesList, search, classFilter, bracketFilter]);

  // Handle open Quick Collect
  const handleOpenCollect = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remainingBalance);
    setPaymentMethod("Cash Deposit");
    setReferenceNumber(`CASH-${invoice.id.replace("INV-", "")}`);
    setPaymentError("");
    collectModal.openModal();
  };

  // Submit Quick Collect
  const handleRecordPayment = (e) => {
    e.preventDefault();
    const payAmt = Number(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setPaymentError("Payment amount must be greater than zero.");
      return;
    }
    if (payAmt > selectedInvoice.remainingBalance) {
      setPaymentError(
        `Payment amount cannot exceed outstanding balance of ${formatCurrency(
          selectedInvoice.remainingBalance
        )}.`
      );
      return;
    }

    const newPaidAmount = selectedInvoice.paidAmount + payAmt;
    const newRemainingBalance = selectedInvoice.netAmount - newPaidAmount;
    const newStatus = newRemainingBalance <= 0 ? "Paid" : "Partial";

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === selectedInvoice.id
          ? {
              ...inv,
              paidAmount: newPaidAmount,
              remainingBalance: newRemainingBalance,
              status: newStatus,
              paymentMethod: paymentMethod,
              lastPaymentDate: "2026-03-24",
            }
          : inv
      )
    );

    showToast(
      `Collected ${formatCurrency(payAmt)} from ${selectedInvoice.studentName}. Remaining: ${formatCurrency(
        newRemainingBalance
      )}.`
    );
    collectModal.closeModal();
  };

  // Handle Send Reminder Notice
  const handleSendReminder = (invoice) => {
    setSelectedInvoice(invoice);
    reminderModal.openModal();
  };

  const handleConfirmReminder = () => {
    showToast(`Payment reminder dispatch queued for ${selectedInvoice?.studentName}.`);
    reminderModal.closeModal();
  };

  // Handle Bulk Reminder
  const handleConfirmBulkReminder = () => {
    showToast(`Delinquent payment notices successfully dispatched to ${filteredDues.length} candidate accounts.`);
    bulkReminderModal.closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
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
        title="Outstanding Dues & Delinquent Accounts"
        description="Monitor unpaid tuition balances, track overdue accounts past grace periods, and dispatch automated payment notices."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={bulkReminderModal.openModal}
              disabled={filteredDues.length === 0}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Bell className="h-4 w-4" />
              <span>Dispatch Overdue Reminders</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Outstanding Dues"
          value={formatCurrency(stats.totalDues)}
          icon={AlertCircle}
          trend={{ value: `${duesList.length} Accounts Pending`, isPositive: false }}
        />
        <StatsCard
          title="Overdue Accounts"
          value={stats.overdueCount}
          icon={AlertTriangle}
          trend={{ value: "Exceeded 15-day grace", isPositive: false }}
        />
        <StatsCard
          title="Critical Delinquency"
          value={formatCurrency(stats.criticalOverdue)}
          icon={BadgeDollarSign}
          trend={{ value: "High-priority recovery", isPositive: false }}
        />
        <StatsCard
          title="Partial Installments"
          value={stats.partialCount}
          icon={Calendar}
          trend={{ value: "Committed for month-end", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by student name, roll number, admission number, invoice ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              <Select
                value={bracketFilter}
                onChange={(e) => setBracketFilter(e.target.value)}
              >
                <option value="all">All Outstanding Accounts</option>
                <option value="Overdue">Overdue Only</option>
                <option value="Partial">Partial Installments</option>
                <option value="Unpaid">Unpaid Invoices</option>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Dues Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Delinquent & Pending Fee Accounts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Accounts with positive remaining balances requiring cashier collection or reminder notices.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              {filteredDues.length} Unsettled Accounts
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDues.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All student fee accounts are fully settled"
              description="No outstanding dues or overdue invoices found matching your filters."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Candidate</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Invoice & Category</TableHead>
                  <TableHead className="w-28">Net Billed</TableHead>
                  <TableHead className="w-28">Paid to Date</TableHead>
                  <TableHead className="w-32">Outstanding Balance</TableHead>
                  <TableHead>Due Date & Delinquency</TableHead>
                  <TableHead className="text-right w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDues.map((item) => {
                  const isOverdue = item.status === "Overdue";
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={item.studentName}
                            size="sm"
                            className="bg-indigo-100 text-indigo-700 font-bold"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {item.studentName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Roll: {item.rollNumber} • {item.admissionNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-xs text-slate-800">
                          {item.className}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-xs text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-[11px] font-mono text-indigo-700">
                          {item.id} • {item.feeCategory}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {formatCurrency(item.netAmount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-emerald-700">
                          {formatCurrency(item.paidAmount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                          {formatCurrency(item.remainingBalance)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-mono text-xs font-semibold text-slate-800">
                            {item.dueDate}
                          </div>
                          {isOverdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-0.5">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Grace Period Expired</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5 inline-block">
                              Partial Installment
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenCollect(item)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1"
                            title="Collect Payment"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Collect</span>
                          </button>
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Dispatch Payment Reminder"
                          >
                            <Bell className="h-4 w-4" />
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

      {/* QUICK COLLECT MODAL */}
      <Modal
        isOpen={collectModal.isOpen}
        onClose={collectModal.closeModal}
        title={`Receive Payment: ${selectedInvoice?.studentName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">{selectedInvoice?.title}</div>
            <div className="text-slate-500 font-mono">Invoice Ref: {selectedInvoice?.id}</div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-mono">
              <span className="text-slate-600">Total Outstanding Balance:</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(selectedInvoice?.remainingBalance)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Amount to Collect ($) *
              </label>
              <button
                type="button"
                onClick={() => setPaymentAmount(selectedInvoice?.remainingBalance || 0)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Pay Full Balance
              </button>
            </div>
            <Input
              type="number"
              min="1"
              max={selectedInvoice?.remainingBalance}
              step="5"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                setPaymentError("");
              }}
              error={paymentError}
              className="font-mono text-base font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Channel *
              </label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {mockPaymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference #
              </label>
              <Input
                placeholder="e.g. CASH-882"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={collectModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            >
              <CreditCard className="h-4 w-4" />
              <span>Record Settlement</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* INDIVIDUAL REMINDER NOTICE MODAL */}
      <Modal
        isOpen={reminderModal.isOpen}
        onClose={reminderModal.closeModal}
        title="Dispatch Payment Reminder"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <div className="font-bold text-amber-900">
              Outstanding Tuition Notice: {selectedInvoice?.studentName}
            </div>
            <div className="text-amber-800">
              Account has an unsettled balance of <strong>{formatCurrency(selectedInvoice?.remainingBalance)}</strong> under invoice {selectedInvoice?.id}.
            </div>
          </div>

          <p>
            An official institutional notice will be queued and sent via email and SMS to the registered student contact with online payment settlement instructions.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={reminderModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmReminder}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Send Notice</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* BULK REMINDER NOTICE MODAL */}
      <Modal
        isOpen={bulkReminderModal.isOpen}
        onClose={bulkReminderModal.closeModal}
        title="Dispatch Bulk Overdue Notices"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
            <div className="font-bold text-rose-900">
              Broadcast Reminder to {filteredDues.length} Unsettled Accounts
            </div>
            <div>
              Cumulative outstanding receivables:{" "}
              <strong>
                {formatCurrency(
                  filteredDues.reduce((sum, d) => sum + (Number(d.remainingBalance) || 0), 0)
                )}
              </strong>
            </div>
          </div>

          <p>
            This action will generate automated payment notifications for all candidate accounts currently displayed in the table.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={bulkReminderModal.closeModal}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmBulkReminder}
              className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>Dispatch All Notices</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
