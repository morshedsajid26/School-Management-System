"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { mockAttendanceStats, mockRecentAbsences } from "@/data/mock/attendance";
import { CalendarCheck, UserX, Clock, Calendar, CheckCircle } from "lucide-react";

export default function AdminAttendancePage() {
  const [absences, setAbsences] = useState(mockRecentAbsences);

  const handleMarkExcuse = (id) => {
    setAbsences(
      absences.map((item) =>
        item.id === id ? { ...item, status: "Excused" } : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Attendance"
        subtitle={`Real-time attendance logs for ${mockAttendanceStats.date}.`}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={CalendarCheck}
            onClick={() => alert("Daily attendance synchronization triggered.")}
          >
            Sync Bio-metrics
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Students Present"
          value={mockAttendanceStats.presentCount}
          description={`${mockAttendanceStats.overallPercentage}% of student body`}
          icon={CalendarCheck}
          variant="emerald"
        />
        <StatsCard
          title="Recorded Absences"
          value={mockAttendanceStats.absentCount}
          description="48 students not marked in homeroom"
          icon={UserX}
          variant="rose"
        />
        <StatsCard
          title="Late Arrivals"
          value={mockAttendanceStats.lateCount}
          description="Arrived after 8:15 AM bell"
          icon={Clock}
          variant="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Absence Incident Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Student</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Stated Reason</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {absences.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-bold text-xs text-slate-900">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {item.grade}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {item.reason}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {item.reportedBy}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "Excused" ? "emerald" : "rose"}
                          dot
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status !== "Excused" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkExcuse(item.id)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Mark Excused
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <CheckCircle className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Grade-Wise Attendance Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAttendanceStats.byGrade.map((item) => (
                <div key={item.grade} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.grade}</span>
                    <span className="text-indigo-600">{item.present}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${item.present}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
