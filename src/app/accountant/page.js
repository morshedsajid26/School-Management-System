"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/shared/StatusBadge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { mockTeacherAttendanceRoster, mockAttendanceStats } from "@/data/mock/attendance";
import { useAuth } from "@/context/AuthContext";
import { CalendarCheck, Users, Clock, CheckCircle2, FileSpreadsheet, ArrowRight } from "lucide-react";

export default function AccountantDashboardPage() {
  const { currentUser } = useAuth();
  const [staffList] = useState(mockTeacherAttendanceRoster);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Staff & Operations Portal: ${currentUser?.name || "Officer"}`}
        subtitle="Operational staff daily attendance roster and payroll presence tracking."
        actions={
          <>
            <Link href="/admin/attendance/reports">
              <Button
                variant="outline"
                size="md"
                icon={FileSpreadsheet}
              >
                Attendance Reports
              </Button>
            </Link>
            <Link href="/admin/attendance/teachers">
              <Button
                variant="primary"
                size="md"
                icon={CalendarCheck}
              >
                Mark Staff Attendance
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Staff Present Today"
          value="26 / 28"
          trend={{ value: "92.8%", isPositive: true, text: "on-duty rate" }}
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatsCard
          title="Total Operational Staff"
          value="28"
          description="Support, finance, admin"
          icon={Users}
          variant="indigo"
        />
        <StatsCard
          title="On Scheduled Leave"
          value="2"
          description="Approved leaves"
          icon={Clock}
          variant="amber"
        />
        <StatsCard
          title="Institutional Attendance"
          value={`${mockAttendanceStats.overallPercentage}%`}
          trend={{ value: "+1.2%", isPositive: true, text: "vs target" }}
          icon={CalendarCheck}
          variant="blue"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Staff Attendance Roster</CardTitle>
            <CardDescription>Verified daily clock-in / clock-out status</CardDescription>
          </div>
          <Link href="/admin/attendance/teachers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All in Attendance Module <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Staff ID</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.slice(0, 8).map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">
                    {staff.id}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {staff.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {staff.department}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {staff.designation || staff.subject || "Staff Member"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-700">
                    {staff.checkInTime || "--:--"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={staff.status} />
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
