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
import Avatar from "@/components/ui/Avatar";
import {
  mockInvoices,
  mockPaymentMethods,
  mockPaymentsHistory,
} from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  CreditCard,
  DollarSign,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  School,
  Sparkles,
  Calendar,
  Check,
  X,
  History,
  User,
  Search,
} from "lucide-react";

export default function PaymentCollectionPage() {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [paymentsHistory, setPaymentsHistory] = useState(mockPaymentsHistory);

  // Invoices with remaining balance
  const activeInvoicesWithDues = useMemo(() => {
    return invoices.filter((inv) => inv.remainingBalance > 0);
  }, [invoices]);

  // Selected Invoice ID (defaults to first invoice with balance or first invoice)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    activeInvoicesWithDues[0]?.id || invoices[0]?.id || ""
  );

  // The active invoice object
  const activeInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Payment Form State
  const [amount, setAmount] = useState(
    activeInvoice ? activeInvoice.remainingBalance.toString() : "500"
  );
  const [method, setMethod] = useState("Cash Deposit");
  const [refNumber, setRefNumber] = useState("CASH-DESK-2026");
  const [cashierName, setCashierName] = useState("Marcus Thorne (Bursar)");
  const [notes, setNotes] = useState("Counter fee collection settlement.");
  const [formError, setFormError] = useState("");

  // Modals & Toasts
  const receiptModal = useModal();
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const receiptRef = useRef(null);

  // Update amount when invoice changes
  const handleSelectInvoice = (id) => {
    setSelectedInvoiceId(id);
    const chosen = invoices.find((inv) => inv.id === id);
    if (chosen) {
      setAmount(chosen.remainingBalance.toString());
      setRefNumber(`TXN-${chosen.id.replace("INV-", "")}`);
      setFormError("");
    }
  };

  // Quick Amount preset buttons
  const handleSetFull = () => {
    if (activeInvoice) {
      setAmount(activeInvoice.remainingBalance.toString());
      setFormError("");
    }
  };

  const handleSetHalf = () => {
    if (activeInvoice) {
      const half = Math.round((activeInvoice.remainingBalance / 2) * 100) / 100;
      setAmount(half.toString());
      setFormError("");
    }
  };

  // Validate and submit payment
  const handleCollectPayment = (e) => {
    e.preventDefault();
    if (!activeInvoice) return;

    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      setFormError("Payment collection amount must be strictly greater than $0.00.");
      return;
    }

    if (payAmt > activeInvoice.remainingBalance) {
      setFormError(
        `Payment amount of ${formatCurrency(payAmt)} exceeds the current outstanding balance of ${formatCurrency(
          activeInvoice.remainingBalance
        )}.`
      );
      return;
    }

    const newPaidAmount = activeInvoice.paidAmount + payAmt;
    const newRemainingBalance = activeInvoice.netAmount - newPaidAmount;
    const newStatus = newRemainingBalance <= 0 ? "Paid" : "Partial";

    // Update invoices
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activeInvoice.id
          ? {
              ...inv,
              paidAmount: newPaidAmount,
              remainingBalance: newRemainingBalance,
              status: newStatus,
              paymentMethod: method,
              lastPaymentDate: "2026-03-24",
            }
          : inv
      )
    );

    // New transaction record
    const newReceiptNum = `REC-2026-${(paymentsHistory.length + 1).toString().padStart(3, "0")}`;
    const newTxn = {
      id: `TXN-88${(paymentsHistory.length + 1).toString().padStart(2, "0")}`,
      receiptNumber: newReceiptNum,
      invoiceId: activeInvoice.id,
      studentId: activeInvoice.studentId,
      studentName: activeInvoice.studentName,
      rollNumber: activeInvoice.rollNumber,
      className: activeInvoice.className,
      feeCategory: activeInvoice.feeCategory,
      amountPaid: payAmt,
      paymentMethod: method,
      referenceNumber: refNumber || "CASH-REC",
      paidDate: "2026-03-24",
      receivedBy: cashierName,
      remarks: notes.trim() || `${newStatus} settlement recorded at cashier terminal.`,
    };

    setPaymentsHistory((prev) => [newTxn, ...prev]);

    // Build printable receipt
    const receiptObj = {
      receiptNumber: newReceiptNum,
      invoiceId: activeInvoice.id,
      studentName: activeInvoice.studentName,
      admissionNumber: activeInvoice.admissionNumber,
      rollNumber: activeInvoice.rollNumber,
      className: activeInvoice.className,
      sectionName: activeInvoice.sectionName,
      feeCategory: activeInvoice.feeCategory,
      title: activeInvoice.title,
      amountPaidNow: payAmt,
      totalBilled: activeInvoice.netAmount,
      totalPaidToDate: newPaidAmount,
      remainingBalance: newRemainingBalance,
      paymentMethod: method,
      referenceNumber: refNumber || "CASH-REC",
      paidDate: "2026-03-24",
      receivedBy: cashierName,
      remarks: notes || (newStatus === "Paid" ? "Settled in Full" : "Partial Installment"),
    };

    setActiveReceipt(receiptObj);
    showToast(
      `Collected ${formatCurrency(payAmt)} from ${activeInvoice.studentName}. Balance: ${formatCurrency(
        newRemainingBalance
      )}.`
    );
    receiptModal.openModal();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
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
        title="Payment Collection Desk"
        description="Cashier portal for recording student fee settlements, partial installments, and issuing instant verified receipts."
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* Main Terminal Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invoice Selector & Student Statement */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                1. Select Account / Invoice
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Choose an invoice with outstanding dues to process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Active Invoices With Balance
                </label>
                <Select
                  value={selectedInvoiceId}
                  onChange={(e) => handleSelectInvoice(e.target.value)}
                  className="font-mono text-xs font-semibold"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.id} - {inv.studentName} ({formatCurrency(inv.remainingBalance)} due)
                    </option>
                  ))}
                </Select>
              </div>

              {/* Selected Candidate Meta Card */}
              {activeInvoice && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={activeInvoice.studentName}
                      size="md"
                      className="bg-indigo-100 text-indigo-700 font-bold"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {activeInvoice.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {activeInvoice.admissionNumber} • {activeInvoice.rollNumber}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class & Section:</span>
                      <span className="font-semibold text-slate-800">
                        {activeInvoice.className} ({activeInvoice.sectionName})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fee Category:</span>
                      <span className="font-semibold text-indigo-700">
                        {activeInvoice.feeCategory}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice Due Date:</span>
                      <span
                        className={`font-mono font-bold ${
                          activeInvoice.status === "Overdue" ? "text-rose-600" : "text-slate-800"
                        }`}
                      >
                        {activeInvoice.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Net Billed:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(activeInvoice.netAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Settled to Date:</span>
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(activeInvoice.paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-100 font-bold">
                      <span className="text-rose-600">Current Outstanding:</span>
                      <span className="text-rose-600">
                        {formatCurrency(activeInvoice.remainingBalance)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Cashier Transaction Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    2. Cashier Payment Form
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Record full or partial fee payment and print transaction receipt.
                  </CardDescription>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                  Terminal #01 (Active)
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {activeInvoice?.remainingBalance === 0 ? (
                <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div className="font-bold text-base">Invoice is Fully Settled</div>
                  <p className="text-xs max-w-sm mx-auto text-emerald-700">
                    This invoice ({activeInvoice.id}) has a zero remaining balance. No further payments are required.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activeInvoicesWithDues.length > 0) {
                        handleSelectInvoice(activeInvoicesWithDues[0].id);
                      }
                    }}
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    Select Another Invoice
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCollectPayment} className="space-y-4">
                  {/* Amount Field with Quick Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Amount to Collect ($) *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSetFull}
                          className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 transition"
                        >
                          Full Balance ({formatCurrency(activeInvoice?.remainingBalance)})
                        </button>
                        <button
                          type="button"
                          onClick={handleSetHalf}
                          className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition"
                        >
                          50% Installment
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        type="number"
                        min="1"
                        max={activeInvoice?.remainingBalance}
                        step="5"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setFormError("");
                        }}
                        error={formError}
                        className="font-mono text-lg font-bold pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Payment Method *
                      </label>
                      <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                        {mockPaymentMethods.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Cheque / Auth / Reference #
                      </label>
                      <Input
                        placeholder="e.g. CHQ-4092 or WIRE-881"
                        value={refNumber}
                        onChange={(e) => setRefNumber(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Cashier / Receiving Officer
                      </label>
                      <Input
                        value={cashierName}
                        onChange={(e) => setCashierName(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Payment Date
                      </label>
                      <Input
                        type="date"
                        defaultValue="2026-03-24"
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cashier Notes / Remarks
                    </label>
                    <Input
                      placeholder="e.g. Counter fee deposit. Official bursary stamp affixed."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Dynamic Post-Payment Preview */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span>Live Account Reconciliation Preview</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                      <div>
                        <span className="text-slate-500 block">Amount Collecting:</span>
                        <span className="font-bold text-indigo-700 text-sm">
                          {formatCurrency(Number(amount) || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">New Remaining Due:</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {formatCurrency(
                            Math.max(0, (activeInvoice?.remainingBalance || 0) - (Number(amount) || 0))
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Resulting Status:</span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {Number(amount) >= (activeInvoice?.remainingBalance || 0)
                            ? "Paid in Full"
                            : "Partial Balance"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 px-6"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Confirm & Record Collection</span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Settled Transactions Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">
                Today&apos;s Settlement Transactions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Payment logs captured at the bursar desk in this session.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {paymentsHistory.length} Receipts Issued
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Ref / Cheque #</TableHead>
                <TableHead>Officer</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsHistory.slice(0, 5).map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {txn.receiptNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">{txn.studentName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{txn.rollNumber} • {txn.className}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-700">{txn.feeCategory}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-emerald-700">
                      {formatCurrency(txn.amountPaid)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{txn.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] text-slate-500">{txn.referenceNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{txn.receivedBy}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => {
                        setActiveReceipt({
                          ...txn,
                          amountPaidNow: txn.amountPaid,
                          totalBilled: txn.amountPaid,
                          totalPaidToDate: txn.amountPaid,
                          remainingBalance: 0,
                          title: txn.feeCategory,
                        });
                        receiptModal.openModal();
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
                    >
                      Receipt
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OFFICIAL RECEIPT MODAL */}
      <Modal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.closeModal}
        title="Official Payment Receipt"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
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
                  Roll: {activeReceipt?.rollNumber}
                </div>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
                <span className="font-semibold text-slate-800">{activeReceipt?.className}</span>
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
                      Payment Received ({activeReceipt?.paymentMethod})
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

            {/* Stamp Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Received By</span>
                <span className="font-semibold text-slate-800">{activeReceipt?.receivedBy}</span>
                <div className="text-[10px] italic">&quot;{activeReceipt?.remarks}&quot;</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-indigo-700/40 flex items-center justify-center text-[8px] uppercase font-bold text-indigo-900 text-center tracking-tighter">
                  Bursary Stamp
                </div>
              </div>
            </div>
          </div>

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
              onClick={handlePrint}
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
