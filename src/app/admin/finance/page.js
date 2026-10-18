"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import FinanceNavTabs from "@/components/shared/FinanceNavTabs";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import {
  mockFinanceSummary,
  mockPaymentsHistory,
  mockInvoices,
} from "@/data/mock/finance";
import { formatCurrency } from "@/utils/formatters";
import {
  BadgeDollarSign,
  CreditCard,
  Receipt,
  Layers,
  History,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export default function AdminFinancePage() {
  const [payments] = useState(mockPaymentsHistory);

  const quickLinks = [
    {
      title: "Fee Structure",
      desc: "Configure tuition tiers, ancillary fees, and grade applicability",
      href: "/admin/finance/structure",
      icon: Layers,
      color: "from-indigo-600 to-indigo-800",
      accent: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Student Invoices",
      desc: "Issue term bills, review discounts, and track installment statuses",
      href: "/admin/finance/invoices",
      icon: Receipt,
      color: "from-blue-600 to-blue-800",
      accent: "text-blue-600 bg-blue-50",
    },
    {
      title: "Payment Collection",
      desc: "Cashier portal for recording full and partial fee settlements",
      href: "/admin/finance/collection",
      icon: CreditCard,
      color: "from-emerald-600 to-emerald-800",
      accent: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Payment History",
      desc: "Audited transaction logs, bank wire verifications, and receipts",
      href: "/admin/finance/history",
      icon: History,
      color: "from-purple-600 to-purple-800",
      accent: "text-purple-600 bg-purple-50",
    },
    {
      title: "Outstanding Dues",
      desc: "Monitor delinquent accounts and dispatch overdue reminders",
      href: "/admin/finance/dues",
      icon: AlertCircle,
      color: "from-rose-600 to-rose-800",
      accent: "text-rose-600 bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance, Fees & Bursary"
        description="Comprehensive institutional revenue management, student billing schedules, payment receipts, and delinquent dues tracking."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/finance/invoices">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Receipt className="h-4 w-4" />
                <span>View Invoices</span>
              </Button>
            </Link>
            <Link href="/admin/finance/collection">
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                <CreditCard className="h-4 w-4" />
                <span>Collect Payment</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Tabs */}
      <FinanceNavTabs />

      {/* High-Level Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Revenue (YTD)"
          value={formatCurrency(mockFinanceSummary.totalRevenueYTD)}
          trend={{ value: "+14.2%", isPositive: true }}
          icon={BadgeDollarSign}
        />
        <StatsCard
          title="Collected This Month"
          value={formatCurrency(mockFinanceSummary.collectedThisMonth)}
          trend={{ value: "91.2% quota", isPositive: true }}
          icon={CreditCard}
        />
        <StatsCard
          title="Pending Tuition Dues"
          value={formatCurrency(mockFinanceSummary.pendingFees)}
          trend={{ value: "Term 2 Receivables", isPositive: false }}
          icon={BadgeDollarSign}
        />
        <StatsCard
          title="Delinquent Overdue Invoices"
          value={`${mockFinanceSummary.overdueInvoices} Invoices`}
          trend={{ value: "Action required", isPositive: false }}
          icon={AlertCircle}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Financial Management Subsystems
          </h3>
          <span className="text-xs text-slate-500">
            Dedicated bursary workflows & registers
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group p-4 bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold mb-3 ${item.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition">
                  <span>Open Module</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Settlements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Settlement Transactions & Receipts
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Live stream of fee settlements verified at cashier and online gateway.
              </CardDescription>
            </div>
            <Link href="/admin/finance/history">
              <Button variant="outline" size="sm" className="text-xs font-semibold">
                View All History
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student Candidate</TableHead>
                <TableHead>Fee Category</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Settled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {txn.receiptNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-indigo-700 font-semibold">
                      {txn.invoiceId}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900">
                      {txn.studentName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {txn.rollNumber} • {txn.className}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">{txn.feeCategory}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono font-bold text-xs text-emerald-700">
                      {formatCurrency(txn.amountPaid)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {txn.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-600">
                    {txn.paidDate}
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
