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
  History,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Barcode,
  Eye,
  Printer,
  ShieldCheck,
  FileCheck,
  RotateCcw,
} from "lucide-react";

export default function LibraryReturnsPage() {
  const { returnedRecords, books } = useLibrary();

  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");

  const receiptModal = useModal();

  // Filter returned records
  const filteredReturns = useMemo(() => {
    return returnedRecords.filter((rec) => {
      const matchSearch =
        rec.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCondition =
        conditionFilter === "all" ||
        (rec.returnCondition &&
          rec.returnCondition.toLowerCase() === conditionFilter.toLowerCase());

      return matchSearch && matchCondition;
    });
  }, [returnedRecords, searchTerm, conditionFilter]);

  // Summary counts
  const excellentCount = returnedRecords.filter(
    (r) => r.returnCondition === "Excellent" || r.returnCondition === "Good"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Returned Books History"
        description="Comprehensive audit register of returned books, condition assessments, restock verification, and loan settlements"
      />

      {/* Navigation Sub-Tabs */}
      <LibraryNavTabs />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Processed Returns"
          value={returnedRecords.length}
          icon={FileCheck}
          description="Catalog loans cleared & completed"
        />
        <StatsCard
          title="Optimal Condition Rate"
          value={
            returnedRecords.length > 0
              ? `${Math.round((excellentCount / returnedRecords.length) * 100)}%`
              : "100%"
          }
          icon={ShieldCheck}
          description="Volumes returned in Good/Mint state"
        />
        <StatsCard
          title="Restocked to Stacks"
          value={returnedRecords.length}
          icon={RotateCcw}
          description="Copies available again on shelves"
        />
        <StatsCard
          title="Audit Ledger"
          value="ISO 2789"
          icon={History}
          description="Compliant library statistics"
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
                placeholder="Search return log by title, borrower, barcode, or ID..."
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
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Conditions</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Ledger Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6">
          <CardTitle className="text-sm font-bold text-slate-800">
            Archived Return Transactions
          </CardTitle>
          <CardDescription className="text-xs">
            Review physical condition at check-in, return dates, and librarian inspection logs
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Return Record</TableHead>
                <TableHead className="text-xs">Book Title & ISBN</TableHead>
                <TableHead className="text-xs">Borrower</TableHead>
                <TableHead className="text-xs">Return Date</TableHead>
                <TableHead className="text-xs">Condition</TableHead>
                <TableHead className="text-xs">Fine Settled</TableHead>
                <TableHead className="text-xs">Inspection Notes</TableHead>
                <TableHead className="text-right text-xs">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                    No returned records matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReturns.map((rec, idx) => {
                  const condition = rec.returnCondition || "Good";
                  return (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
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
                            {rec.className}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">{rec.returnDate || "2026-03-24"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Issued: {rec.issueDate}
                        </span>
                      </TableCell>
                      <TableCell>
                        {condition === "Excellent" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Excellent
                          </Badge>
                        ) : condition === "Good" ? (
                          <Badge variant="info" className="text-[10px] font-bold">
                            Good
                          </Badge>
                        ) : condition === "Fair" ? (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Fair
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Damaged
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {rec.finePaid ? formatCurrency(rec.finePaid) : "$0.00"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {rec.notes || "Standard library return clearance"}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => receiptModal.open(rec)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          title="View Check-In Inspection Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: CHECK-IN INSPECTION RECEIPT */}
      <Modal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.close}
        title="Check-In Return Receipt & Inspection Clearance"
        description="Formal certificate confirming item return and physical condition audit"
        size="md"
      >
        {receiptModal.modalData && (
          <div className="space-y-5">
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Oakridge Academy Library
                  </h4>
                  <p className="text-xs text-slate-500">
                    Circulation Desk & Repository Registry
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Returned
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {receiptModal.modalData.id}
                  </p>
                </div>
              </div>

              {/* Book Info */}
              <div className="bg-slate-100/70 p-3 rounded-lg space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Volume Title
                </span>
                <p className="font-bold text-sm text-slate-900">
                  {receiptModal.modalData.bookTitle}
                </p>
                <p className="text-xs font-mono text-slate-600">
                  ISBN: {receiptModal.modalData.isbn}
                </p>
              </div>

              {/* Borrower & Timeline */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Borrower</span>
                  <span className="font-bold text-slate-800">
                    {receiptModal.modalData.borrowerName}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {receiptModal.modalData.className}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Return Date</span>
                  <span className="font-bold text-emerald-700">
                    {receiptModal.modalData.returnDate || "2026-03-24"}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Loaned: {receiptModal.modalData.issueDate}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Physical Condition</span>
                  <span className="font-bold text-indigo-700">
                    {receiptModal.modalData.returnCondition || "Good"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Fine Status</span>
                  <span className="font-bold text-slate-800">
                    {receiptModal.modalData.finePaid
                      ? `${formatCurrency(receiptModal.modalData.finePaid)} (Paid)`
                      : "No Fines Incurred ($0.00)"}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  Librarian Inspection Remarks:
                </span>
                <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded border border-slate-200">
                  &quot;{receiptModal.modalData.notes || "Item examined and cleared back to circulation stacks."}&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Clearance Slip
              </Button>
              <Button variant="primary" size="sm" onClick={receiptModal.close}>
                Close Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
