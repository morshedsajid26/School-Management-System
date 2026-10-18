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
  mockPaymentsHistory,
  mockPaymentMethods,
  mockFeeCategories,
} from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  History,
  Search,
  Filter,
  CreditCard,
  Printer,
  FileCheck2,
  School,
  Building,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  X,
  FileSpreadsheet,
} from "lucide-react";

export default function PaymentHistoryPage() {
  const [transactions] = useState(mockPaymentsHistory);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Receipt Modal
  const receiptModal = useModal();
  const [activeReceipt, setActiveReceipt] = useState(null);
  const receiptRef = useRef(null);

  // Stats
  const stats = useMemo(() => {
    const totalCount = transactions.length;
    const totalCollected = transactions.reduce((acc, t) => acc + (Number(t.amountPaid) || 0), 0);
    const cardOrOnline = transactions
      .filter((t) => t.paymentMethod.includes("Card") || t.paymentMethod.includes("Online"))
      .reduce((acc, t) => acc + (Number(t.amountPaid) || 0), 0);
    const digitalPct = totalCollected > 0 ? Math.round((cardOrOnline / totalCollected) * 100) : 0;
    const bankWires = transactions.filter((t) => t.paymentMethod.includes("Bank")).length;

    return { totalCount, totalCollected, digitalPct, bankWires };
  }, [transactions]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.receiptNumber.toLowerCase().includes(query) ||
        t.invoiceId.toLowerCase().includes(query) ||
        t.studentName.toLowerCase().includes(query) ||
        t.rollNumber.toLowerCase().includes(query) ||
        t.referenceNumber.toLowerCase().includes(query);

      const matchesMethod = methodFilter === "all" || t.paymentMethod === methodFilter;
      const matchesCategory = categoryFilter === "all" || t.feeCategory === categoryFilter;

      return matchesSearch && matchesMethod && matchesCategory;
    });
  }, [transactions, search, methodFilter, categoryFilter]);

  // Open Receipt Modal
  const handleOpenReceipt = (txn) => {
    setActiveReceipt({
      receiptNumber: txn.receiptNumber,
      invoiceId: txn.invoiceId,
      studentName: txn.studentName,
      admissionNumber: "ADM-VERIFIED",
      rollNumber: txn.rollNumber,
      className: txn.className,
      sectionName: "Section A",
      feeCategory: txn.feeCategory,
      title: txn.feeCategory,
      amountPaidNow: txn.amountPaid,
      totalBilled: txn.amountPaid,
      totalPaidToDate: txn.amountPaid,
      remainingBalance: 0,
      paymentMethod: txn.paymentMethod,
      referenceNumber: txn.referenceNumber,
      paidDate: txn.paidDate,
      receivedBy: txn.receivedBy,
      remarks: txn.remarks,
    });
    receiptModal.openModal();
  };

  const handlePrint = () => {
    window.print();
  };

  // Payment method badge helper
  const getMethodBadge = (m) => {
    if (m.includes("Card")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (m.includes("Bank")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (m.includes("Cash")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (m.includes("Cheque")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payment History & Transaction Ledger"
        description="Comprehensive audit trail of all settled tuition payments, cashier cash deposits, bank wires, and card reconciliations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print Ledger</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Settlements"
          value={stats.totalCount}
          icon={History}
          trend={{ value: "Recorded Receipts", isPositive: true }}
        />
        <StatsCard
          title="Total Inflow Collected"
          value={formatCurrency(stats.totalCollected)}
          icon={DollarSign}
          trend={{ value: "Term 2 to Date", isPositive: true }}
        />
        <StatsCard
          title="Digital Gateway Share"
          value={`${stats.digitalPct}%`}
          icon={CreditCard}
          trend={{ value: "Card & Online Portal", isPositive: true }}
        />
        <StatsCard
          title="Bank Wire Reconciliations"
          value={stats.bankWires}
          icon={Building}
          trend={{ value: "Verified ACH/Wires", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by receipt number, invoice ID, student name, or transaction reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Payment Channels</option>
                {mockPaymentMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {mockFeeCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Audited Fee Receipts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Showing {filteredTransactions.length} settled payments. Click &quot;Receipt&quot; to review or reprint.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Permanent Audit Trail
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={History}
              title="No transaction records found"
              description="Try adjusting your search criteria or payment method filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearch("");
                setMethodFilter("all");
                setCategoryFilter("all");
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Receipt #</TableHead>
                  <TableHead className="w-28">Invoice ID</TableHead>
                  <TableHead>Student Candidate</TableHead>
                  <TableHead>Fee Category</TableHead>
                  <TableHead className="w-28">Amount Paid</TableHead>
                  <TableHead>Payment Channel</TableHead>
                  <TableHead>Ref / Cheque #</TableHead>
                  <TableHead className="w-24">Date</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead className="text-right w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.receiptNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-indigo-700 font-semibold">
                        {item.invoiceId}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs">
                        {item.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {item.rollNumber} • {item.className}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-800">
                        {item.feeCategory}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono font-bold text-xs text-emerald-700">
                        {formatCurrency(item.amountPaid)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getMethodBadge(
                          item.paymentMethod
                        )}`}
                      >
                        {item.paymentMethod}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">
                        {item.referenceNumber}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">
                        {item.paidDate}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-600 max-w-[120px] truncate block" title={item.receivedBy}>
                        {item.receivedBy}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        onClick={() => handleOpenReceipt(item)}
                        className="px-2 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition"
                      >
                        Receipt
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* OFFICIAL RECEIPT MODAL */}
      <Modal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.closeModal}
        title="Audited Fee Payment Receipt"
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
                      Settled Category: {activeReceipt?.feeCategory}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Ref / Auth: {activeReceipt?.referenceNumber}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(activeReceipt?.amountPaidNow)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/60 font-bold">
                    <td className="py-2 px-3 text-emerald-950 font-sans">
                      Amount Paid ({activeReceipt?.paymentMethod}):
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 text-sm">
                      {formatCurrency(activeReceipt?.amountPaidNow)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stamp Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Verified & Received By</span>
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
              <span>Print Receipt</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
