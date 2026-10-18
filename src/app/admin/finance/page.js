"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/ui/Button";
import { mockFinanceSummary, mockRecentTransactions } from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import { BadgeDollarSign, CreditCard, ArrowUpRight, Plus, Download, FileSpreadsheet } from "lucide-react";

export default function AdminFinancePage() {
  const [transactions] = useState(mockRecentTransactions);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Collections & Financial Overview"
        subtitle="Institutional revenue tracking, student tuition dues, and fee ledgers."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              icon={FileSpreadsheet}
              onClick={() => alert("Simulating export to Excel/CSV...")}
            >
              Export Ledger
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => alert("Batch invoice generation dialog.")}
            >
              Issue Invoices
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Revenue (YTD)"
          value={formatCurrency(mockFinanceSummary.totalRevenueYTD)}
          trend={{ value: "+14.2%", isPositive: true, text: "ahead of budget" }}
          icon={BadgeDollarSign}
          variant="indigo"
        />
        <StatsCard
          title="Collected This Month"
          value={formatCurrency(mockFinanceSummary.collectedThisMonth)}
          trend={{ value: "91.2%", isPositive: true, text: "collection quota" }}
          icon={CreditCard}
          variant="emerald"
        />
        <StatsCard
          title="Pending Tuition Dues"
          value={formatCurrency(mockFinanceSummary.pendingFees)}
          description="Due by end of term"
          icon={BadgeDollarSign}
          variant="amber"
        />
        <StatsCard
          title="Overdue Accounts"
          value={`${mockFinanceSummary.overdueInvoices} Invoices`}
          description="Immediate follow-up required"
          icon={BadgeDollarSign}
          variant="rose"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Fee Settlements & Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Fee Category</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Settled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">
                    {txn.id}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {txn.studentName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {txn.type}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {txn.method}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                  <TableCell className="text-right text-xs font-mono text-slate-500">
                    {txn.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
