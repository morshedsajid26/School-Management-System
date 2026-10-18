"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Award, Calendar, FileCheck, Plus, Download } from "lucide-react";

export default function AdminExaminationsPage() {
  const [exams] = useState([
    {
      id: "EXM-201",
      name: "Midterm Calculus & Higher Math",
      grade: "Grade 10",
      date: "2026-03-24",
      duration: "2 Hours",
      hall: "Examination Hall A",
      totalCandidates: 66,
      status: "Scheduled",
    },
    {
      id: "EXM-202",
      name: "Advanced Physics Theory",
      grade: "Grade 10",
      date: "2026-03-26",
      duration: "2.5 Hours",
      hall: "Examination Hall B",
      totalCandidates: 66,
      status: "Scheduled",
    },
    {
      id: "EXM-203",
      name: "General Biology & Lab Practical",
      grade: "Grade 9",
      date: "2026-03-27",
      duration: "2 Hours",
      hall: "Science Lab 1 & 2",
      totalCandidates: 63,
      status: "Scheduled",
    },
    {
      id: "EXM-198",
      name: "English Literature & Essay",
      grade: "Grade 8",
      date: "2026-03-15",
      duration: "1.5 Hours",
      hall: "Junior Wing Hall",
      totalCandidates: 60,
      status: "Completed",
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessments"
        subtitle="Schedule term evaluations, supervise exam halls, and manage standardized report cards."
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => alert("Downloading examination timetable PDF...")}
            >
              Export Timetable
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => alert("Create examination schedule modal simulated.")}
            >
              Schedule Exam
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Exam Cycle"
          value="Term 2 Midterms"
          description="Beginning in 6 days"
          icon={Calendar}
          variant="indigo"
        />
        <StatsCard
          title="Registered Candidates"
          value="1,420 Students"
          description="Across 36 class cohorts"
          icon={FileCheck}
          variant="emerald"
        />
        <StatsCard
          title="Historical Pass Rate"
          value="96.8%"
          description="Top quartile in regional board"
          icon={Award}
          variant="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Term 2 Examination Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Exam Code</TableHead>
                <TableHead>Subject Paper</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Hall Venue</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-800">
                    {exam.id}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {exam.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {exam.grade}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">
                    {exam.date} • {exam.duration}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {exam.hall}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-800">
                    {exam.totalCandidates}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={exam.status === "Scheduled" ? "indigo" : "emerald"} size="sm">
                      {exam.status}
                    </Badge>
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
