"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/ui/Button";
import { mockFinanceSummary, mockRecentTransactions } from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";
import { BadgeDollarSign, CreditCard, ReceiptText, Plus, FileSpreadsheet, ArrowUpRight } from "lucide-react";

export default function AccountantDashboardPage() {
  const { currentUser } = useAuth();
  const [transactions] = useState(mockRecentTransactions);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Finance & Bursary: ${currentUser?.name || "Bursar"}`}
        subtitle="Tuition fee collections, invoicing, and institutional cash flow."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              icon={FileSpreadsheet}
              onClick={() => alert("Exporting financial statement...")}
            >
              Export Statement
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => alert("Receive Fee Payment dialog.")}
            >
              Record Payment
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Collected This Month"
          value={formatCurrency(mockFinanceSummary.collectedThisMonth)}
          trend={{ value: "+8.4%", isPositive: true, text: "vs target" }}
          icon={CreditCard}
          variant="emerald"
        />
        <StatsCard
          title="Outstanding Student Fees"
          value={formatCurrency(mockFinanceSummary.pendingFees)}
          description="Due before finals"
          icon={BadgeDollarSign}
          variant="amber"
        />
        <StatsCard
          title="Monthly Operating Costs"
          value={formatCurrency(mockFinanceSummary.monthlyExpenses)}
          description="Staff payroll & utilities"
          icon={ReceiptText}
          variant="rose"
        />
        <StatsCard
          title="Net Cashflow"
          value={formatCurrency(mockFinanceSummary.netCashflow)}
          trend={{ value: "Positive", isPositive: true, text: "healthy liquidity" }}
          icon={BadgeDollarSign}
          variant="indigo"
        />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Fee Invoices & Payment Submissions</CardTitle>
            <CardDescription>Audited transactions ledger</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Invoice</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                  <TableCell className="text-xs text-slate-600">
                    {txn.method}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {formatCurrency(txn.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Printing receipt for ${txn.id}`)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Print Receipt
                    </button>
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
