"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/formatters";
import { Briefcase, Users, CalendarCheck, Clock, Check, X } from "lucide-react";

export default function AdminHRPage() {
  const [leaves, setLeaves] = useState([
    {
      id: "LV-101",
      staffName: "Prof. Marcus Aurel",
      role: "Senior Physics Faculty",
      type: "Conference / Academic Leave",
      dates: "March 22 - March 24 (3 days)",
      status: "Pending Approval",
    },
    {
      id: "LV-102",
      staffName: "Derrick Vance",
      role: "Lab Technician",
      type: "Medical Leave",
      dates: "March 19 (1 day)",
      status: "Approved",
    },
    {
      id: "LV-103",
      staffName: "Clara Oswald, RN",
      role: "Infirmary Officer",
      type: "Annual Paid Leave",
      dates: "April 02 - April 06 (5 days)",
      status: "Pending Approval",
    },
  ]);

  const handleDecision = (id, newStatus) => {
    setLeaves(
      leaves.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources & Staff Administration"
        subtitle="Manage faculty employment contracts, leave applications, payroll disbursement, and staff evaluations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Employed Staff"
          value="114 Members"
          description="86 Teaching Faculty • 28 Support Staff"
          icon={Users}
          variant="indigo"
        />
        <StatsCard
          title="Monthly Payroll Expense"
          value={formatCurrency(98400)}
          description="Next run on March 31, 2026"
          icon={Briefcase}
          variant="emerald"
        />
        <StatsCard
          title="Pending Leave Inquiries"
          value="2 Requests"
          description="Awaiting administrative sign-off"
          icon={Clock}
          variant="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Leave & Absence Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Requested Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-bold text-xs text-slate-900">
                    {req.staffName}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {req.role}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {req.type}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">
                    {req.dates}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "Approved"
                          ? "emerald"
                          : req.status === "Rejected"
                          ? "rose"
                          : "amber"
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "Pending Approval" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDecision(req.id, "Approved")}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(req.id, "Rejected")}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Decided</span>
                    )}
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
