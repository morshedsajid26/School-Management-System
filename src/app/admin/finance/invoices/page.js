"use client";

import React, { useState, useMemo, useRef } from "react";
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
  mockFeeCategories,
  mockPaymentMethods,
  mockPaymentsHistory,
} from "@/data/mock/finance";
import { mockStudents } from "@/data/mock/students";
import { mockClassesList } from "@/data/mock/academicStructure";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CreditCard,
  Printer,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  BadgeDollarSign,
  TrendingUp,
  FileCheck2,
  X,
  School,
  Calendar,
  Sparkles,
  DollarSign,
} from "lucide-react";

export default function StudentInvoicesPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Modals
  const createModal = useModal();
  const paymentModal = useModal();
  const receiptModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Active targets
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create Invoice Form State
  const initialCreateForm = {
    studentId: "STU-001",
    feeCategory: "Tuition Fee",
    title: "Term 2 Tuition & Facilities Dues",
    amount: 1800,
    discount: 0,
    dueDate: "2026-04-15",
    remarks: "",
  };
  const [createFormData, setCreateFormData] = useState(initialCreateForm);
  const [createErrors, setCreateErrors] = useState({});

  // Quick Pay Form State
  const [paymentAmount, setPaymentAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState("Cash Deposit");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Print Ref
  const receiptRef = useRef(null);

  // Metrics
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const totalBilled = invoices.reduce((acc, inv) => acc + (Number(inv.netAmount) || 0), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
    const outstanding = invoices.reduce((acc, inv) => acc + (Number(inv.remainingBalance) || 0), 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return { totalCount, totalBilled, totalCollected, outstanding, collectionRate };
  }, [invoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.studentName.toLowerCase().includes(query) ||
        item.rollNumber.toLowerCase().includes(query) ||
        item.admissionNumber.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || item.feeCategory === categoryFilter;
      const matchesClass = classFilter === "all" || item.className === classFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesClass;
    });
  }, [invoices, search, statusFilter, categoryFilter, classFilter]);

  // Handle open create invoice
  const handleOpenCreate = () => {
    setCreateFormData(initialCreateForm);
    setCreateErrors({});
    createModal.openModal();
  };

  // Validate create invoice
  const validateCreate = () => {
    const errors = {};
    const amt = Number(createFormData.amount);
    const disc = Number(createFormData.discount) || 0;

    if (isNaN(amt) || amt <= 0) {
      errors.amount = "Base amount must be greater than zero.";
    }
    if (disc < 0) {
      errors.discount = "Discount cannot be negative.";
    } else if (disc > amt) {
      errors.discount = `Discount cannot exceed base amount (${formatCurrency(amt)}).`;
    }
    if (!createFormData.title.trim()) {
      errors.title = "Invoice title/description is required.";
    }
    if (!createFormData.dueDate) {
      errors.dueDate = "Due date is required.";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit create invoice
  const handleSaveInvoice = (e) => {
    e.preventDefault();
    if (!validateCreate()) return;

    const student = mockStudents.find((s) => s.id === createFormData.studentId) || mockStudents[0];
    const amt = Number(createFormData.amount);
    const disc = Number(createFormData.discount) || 0;
    const net = amt - disc;

    const newInvoice = {
      id: `INV-2026-${(invoices.length + 1).toString().padStart(3, "0")}`,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      admissionNumber: student.admissionNumber,
      className: student.grade,
      sectionName: `Section ${student.section}`,
      feeCategory: createFormData.feeCategory,
      title: createFormData.title.trim(),
      amount: amt,
      discount: disc,
      netAmount: net,
      paidAmount: 0,
      remainingBalance: net,
      issueDate: "2026-03-20",
      dueDate: createFormData.dueDate,
      status: "Unpaid",
      paymentMethod: "Pending",
      lastPaymentDate: null,
      remarks: createFormData.remarks.trim() || "Generated by finance administration.",
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`Invoice ${newInvoice.id} issued for ${student.name}.`);
    createModal.closeModal();
  };

  // Handle open Quick Pay Modal
  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remainingBalance);
    setPaymentMethod("Cash Deposit");
    setReferenceNumber(`TXN-${invoice.id.replace("INV-", "")}`);
    setPaymentRemarks("");
    setPaymentError("");
    paymentModal.openModal();
  };

  // Submit Payment (Supports Partial and Full Payments)
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

    // Update invoice state
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
              remarks: paymentRemarks.trim() || inv.remarks,
            }
          : inv
      )
    );

    // Create receipt for this payment transaction
    const newReceipt = {
      receiptNumber: `REC-2026-${(mockPaymentsHistory.length + 10).toString().padStart(3, "0")}`,
      invoiceId: selectedInvoice.id,
      studentName: selectedInvoice.studentName,
      admissionNumber: selectedInvoice.admissionNumber,
      rollNumber: selectedInvoice.rollNumber,
      className: selectedInvoice.className,
      sectionName: selectedInvoice.sectionName,
      feeCategory: selectedInvoice.feeCategory,
      title: selectedInvoice.title,
      amountPaidNow: payAmt,
      totalBilled: selectedInvoice.netAmount,
      totalPaidToDate: newPaidAmount,
      remainingBalance: newRemainingBalance,
      paymentMethod: paymentMethod,
      referenceNumber: referenceNumber || "CASH-DESK",
      paidDate: "2026-03-24",
      receivedBy: "Marcus Thorne (Accountant)",
      remarks: paymentRemarks || (newStatus === "Paid" ? "Settled in Full" : "Partial Installment"),
    };

    paymentModal.closeModal();
    showToast(
      `Payment of ${formatCurrency(payAmt)} recorded for ${selectedInvoice.studentName}. Status: ${newStatus}.`
    );

    // Offer receipt preview
    setActiveReceipt(newReceipt);
    receiptModal.openModal();
  };

  // Open existing receipt preview from invoice row
  const handleOpenReceiptFromInvoice = (invoice) => {
    const receiptData = {
      receiptNumber: `REC-2026-${invoice.id.slice(-3)}`,
      invoiceId: invoice.id,
      studentName: invoice.studentName,
      admissionNumber: invoice.admissionNumber,
      rollNumber: invoice.rollNumber,
      className: invoice.className,
      sectionName: invoice.sectionName,
      feeCategory: invoice.feeCategory,
      title: invoice.title,
      amountPaidNow: invoice.paidAmount,
      totalBilled: invoice.netAmount,
      totalPaidToDate: invoice.paidAmount,
      remainingBalance: invoice.remainingBalance,
      paymentMethod: invoice.paymentMethod,
      referenceNumber: "CONFIRMED-LEDGER",
      paidDate: invoice.lastPaymentDate || invoice.issueDate,
      receivedBy: "Accounts Bursar Office",
      remarks: invoice.remarks,
    };
    setActiveReceipt(receiptData);
    receiptModal.openModal();
  };

  // Print Receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  // Status Badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
      case "Partial":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "Unpaid":
        return "bg-blue-100 text-blue-800 border-blue-300 font-semibold";
      case "Overdue":
        return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
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
        title="Student Invoices & Billing"
        description="Issue institutional fee bills, track payment reconciliations, inspect partial installments, and generate verified receipts."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Issue New Invoice</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Invoiced"
          value={formatCurrency(stats.totalBilled)}
          icon={Receipt}
          trend={{ value: `${stats.totalCount} Invoices`, isPositive: true }}
        />
        <StatsCard
          title="Revenue Collected"
          value={formatCurrency(stats.totalCollected)}
          icon={CreditCard}
          trend={{ value: "Received", isPositive: true }}
        />
        <StatsCard
          title="Outstanding Dues"
          value={formatCurrency(stats.outstanding)}
          icon={BadgeDollarSign}
          trend={{ value: "Pending / Overdue", isPositive: false }}
        />
        <StatsCard
          title="Collection Ratio"
          value={`${stats.collectionRate}%`}
          icon={TrendingUp}
          trend={{ value: "Billed vs Settled", isPositive: true }}
        />
        <StatsCard
          title="Active Fiscal Term"
          value="Term 2 (2026)"
          icon={Calendar}
          trend={{ value: "Current Semester", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by invoice number, student name, roll number, or fee title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Invoice Statuses</option>
                <option value="Paid">Paid in Full</option>
                <option value="Partial">Partial Payment</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </Select>

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Fee Categories</option>
                {mockFeeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
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

      {/* Main Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Student Invoice Ledger
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {filteredInvoices.length} invoices. Click &quot;Pay&quot; to record full or partial installments.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Partial Payments Supported with Automated Balance Recalculation</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices matched"
              description="Adjust your filters or issue a new invoice to students."
              actionLabel="Issue New Invoice"
              onAction={handleOpenCreate}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Invoice ID</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Fee Category & Title</TableHead>
                  <TableHead className="w-28">Net Billed</TableHead>
                  <TableHead className="w-32">Paid (Progress)</TableHead>
                  <TableHead className="w-28">Balance Due</TableHead>
                  <TableHead className="w-28">Due Date</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => {
                  const pct = Math.round(
                    ((Number(inv.paidAmount) || 0) / (Number(inv.netAmount) || 1)) * 100
                  );
                  const isOverdue = inv.status === "Overdue";

                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                          {inv.id}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={inv.studentName}
                            size="sm"
                            className="bg-indigo-100 text-indigo-700 font-bold"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">
                              {inv.studentName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Roll: <strong className="text-slate-700">{inv.rollNumber}</strong> • {inv.className}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-slate-900 text-xs">
                          {inv.title}
                        </div>
                        <div className="text-[11px] text-indigo-600 font-medium">
                          {inv.feeCategory}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-mono font-bold text-xs text-slate-900">
                          {formatCurrency(inv.netAmount)}
                        </div>
                        {inv.discount > 0 && (
                          <div className="text-[10px] text-emerald-600 font-mono">
                            Disc: -{formatCurrency(inv.discount)}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="font-bold text-slate-800">
                              {formatCurrency(inv.paidAmount)}
                            </span>
                            <span className="text-indigo-600 font-bold">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(pct, 100)}%` }}
                              className={`h-full rounded-full transition-all ${
                                pct >= 100
                                  ? "bg-emerald-500"
                                  : pct > 0
                                  ? "bg-amber-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-mono text-xs font-bold ${
                            inv.remainingBalance > 0 ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(inv.remainingBalance)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div
                          className={`text-xs font-mono ${
                            isOverdue ? "text-rose-600 font-bold flex items-center gap-1" : "text-slate-600"
                          }`}
                        >
                          {isOverdue && <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
                          <span>{inv.dueDate}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-xs border ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.remainingBalance > 0 ? (
                            <button
                              onClick={() => handleOpenPayment(inv)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1"
                              title="Record Payment"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>Pay</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenReceiptFromInvoice(inv)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center gap-1"
                              title="View Official Receipt"
                            >
                              <FileCheck2 className="h-3.5 w-3.5" />
                              <span>Receipt</span>
                            </button>
                          )}
                          {inv.paidAmount > 0 && inv.remainingBalance > 0 && (
                            <button
                              onClick={() => handleOpenReceiptFromInvoice(inv)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="View Partial Receipt"
                            >
                              <FileCheck2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* CREATE INVOICE MODAL */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Issue Student Fee Invoice"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Student Candidate *
            </label>
            <Select
              value={createFormData.studentId}
              onChange={(e) => setCreateFormData({ ...createFormData, studentId: e.target.value })}
            >
              {mockStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNumber} - {s.grade})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fee Category *
              </label>
              <Select
                value={createFormData.feeCategory}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, feeCategory: e.target.value })
                }
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
                Due Date *
              </label>
              <Input
                type="date"
                value={createFormData.dueDate}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, dueDate: e.target.value })
                }
                error={createErrors.dueDate}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Invoice Title / Bill Item *
            </label>
            <Input
              placeholder="e.g. Term 2 Senior Secondary Tuition & Laboratory Fee"
              value={createFormData.title}
              onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
              error={createErrors.title}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Base Fee Amount ($) *
              </label>
              <Input
                type="number"
                min="1"
                step="5"
                placeholder="1800"
                value={createFormData.amount}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, amount: e.target.value })
                }
                error={createErrors.amount}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Discount / Scholarship ($)
              </label>
              <Input
                type="number"
                min="0"
                step="5"
                placeholder="0"
                value={createFormData.discount}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, discount: e.target.value })
                }
                error={createErrors.discount}
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Computed Net Amount banner */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Net Payable Amount Billed:</span>
            <span className="font-mono font-extrabold text-indigo-700 text-sm">
              {formatCurrency(
                Math.max(
                  0,
                  (Number(createFormData.amount) || 0) - (Number(createFormData.discount) || 0)
                )
              )}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Special Instructions
            </label>
            <Input
              placeholder="e.g. Merit scholar 10% waiver approved by principal."
              value={createFormData.remarks}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, remarks: e.target.value })
              }
            />
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
              Generate & Issue Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUICK PAYMENT RECORD MODAL (PARTIAL & FULL) */}
      <Modal
        isOpen={paymentModal.isOpen}
        onClose={paymentModal.closeModal}
        title={`Record Payment: ${selectedInvoice?.id}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900 flex justify-between">
              <span>{selectedInvoice?.studentName}</span>
              <span className="font-mono text-indigo-700">{selectedInvoice?.id}</span>
            </div>
            <div className="text-slate-500">
              {selectedInvoice?.title} • {selectedInvoice?.className}
            </div>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 font-mono">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Net Billed</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(selectedInvoice?.netAmount)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Paid So Far</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(selectedInvoice?.paidAmount)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase">Balance Due</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(selectedInvoice?.remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Amount to Collect ($) *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(selectedInvoice?.remainingBalance || 0)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Full ({formatCurrency(selectedInvoice?.remainingBalance)})
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmount(
                      Math.round(((selectedInvoice?.remainingBalance || 0) / 2) * 100) / 100
                    )
                  }
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  50% Installment
                </button>
              </div>
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
                Payment Method *
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {mockPaymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ref / Cheque / Auth #
              </label>
              <Input
                placeholder="e.g. CHQ-4093 or WIRE-998"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Balance projection preview */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600 font-semibold">Remaining Balance After Settlement:</span>
            <span className="font-mono font-bold text-emerald-800">
              {formatCurrency(
                Math.max(0, (selectedInvoice?.remainingBalance || 0) - (Number(paymentAmount) || 0))
              )}{" "}
              {Number(paymentAmount) >= (selectedInvoice?.remainingBalance || 0) ? (
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold ml-1">
                  PAID IN FULL
                </span>
              ) : (
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-extrabold ml-1">
                  PARTIAL
                </span>
              )}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cashier Remarks / Settlement Notes
            </label>
            <Input
              placeholder="e.g. Cash received at Bursar counter. Official receipt issued."
              value={paymentRemarks}
              onChange={(e) => setPaymentRemarks(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={paymentModal.closeModal}
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
              <span>Confirm & Record Payment</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* OFFICIAL PAYMENT RECEIPT MODAL */}
      <Modal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.closeModal}
        title="Official Fee Payment Receipt"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Printable Receipt Paper */}
          <div
            ref={receiptRef}
            className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm space-y-4 text-slate-800"
          >
            {/* Header */}
            <div className="border-b-2 border-indigo-900 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center">
                  <School className="h-7 w-7 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-indigo-950 uppercase tracking-tight">
                    Oakridge International Academy
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Accounts & Bursary Division • 1000 Academy Blvd, CA 94025
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-extrabold text-[11px] rounded uppercase font-mono">
                  RECEIPT #{activeReceipt?.receiptNumber}
                </span>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Date: {activeReceipt?.paidDate}
                </div>
              </div>
            </div>

            {/* Student & Invoice Meta */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Student Candidate</span>
                <span className="font-bold text-slate-900">{activeReceipt?.studentName}</span>
                <div className="text-[11px] text-slate-500 font-mono">
                  Roll: {activeReceipt?.rollNumber} • {activeReceipt?.admissionNumber}
                </div>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
                <span className="font-semibold text-slate-800">{activeReceipt?.className} ({activeReceipt?.sectionName})</span>
                <div className="text-[11px] text-indigo-700 font-mono font-bold">
                  Invoice Ref: {activeReceipt?.invoiceId}
                </div>
              </div>
            </div>

            {/* Itemized Breakdown */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">
                      {activeReceipt?.title}
                      <span className="block text-[10px] text-slate-400 font-sans">
                        Category: {activeReceipt?.feeCategory}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(activeReceipt?.totalBilled)}
                    </td>
                  </tr>
                  <tr className="bg-indigo-50/40">
                    <td className="py-2 px-3 font-bold text-indigo-950 font-sans">
                      Payment Received In This Transaction ({activeReceipt?.paymentMethod})
                      <span className="block text-[10px] text-slate-500 font-mono">
                        Ref: {activeReceipt?.referenceNumber}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-emerald-700 text-sm">
                      {formatCurrency(activeReceipt?.amountPaidNow)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-sans">Total Cumulative Paid:</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(activeReceipt?.totalPaidToDate)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2 px-3 text-slate-800 font-sans">Remaining Balance Due:</td>
                    <td className="py-2 px-3 text-right text-rose-600">
                      {formatCurrency(activeReceipt?.remainingBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cashier & Stamp Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Received By</span>
                <span className="font-semibold text-slate-800">{activeReceipt?.receivedBy}</span>
                <div className="text-[10px] italic">&quot;{activeReceipt?.remarks}&quot;</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-indigo-700/40 flex items-center justify-center text-[8px] uppercase font-bold text-indigo-900 text-center tracking-tighter">
                  Bursary Verified
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={receiptModal.closeModal}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrintReceipt}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Receipt</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
