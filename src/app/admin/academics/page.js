"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { BookOpen, Layers, GraduationCap, School, ArrowUpRight, Plus, FileText, Calendar } from "lucide-react";

export default function AdminAcademicsPage() {
  const departments = [
    { name: "Science & Technology", head: "Prof. Marcus Aurel", courses: 12, facultyCount: 18, color: "indigo" },
    { name: "Mathematics & Computing", head: "Dr. Catherine Bennett", courses: 8, facultyCount: 14, color: "emerald" },
    { name: "Languages & Humanities", head: "Jonathan Hayes", courses: 10, facultyCount: 16, color: "blue" },
    { name: "Arts & Physical Education", head: "Elena Rostova", courses: 6, facultyCount: 9, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Curriculum & Departments"
        subtitle="Manage academic disciplines, faculty departments, curriculum standards, and timetables."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/academic-years">
              <Button variant="outline" size="md" icon={Calendar}>
                Academic Years & Terms
              </Button>
            </Link>
            <Link href="/admin/calendar">
              <Button variant="outline" size="md" icon={Calendar}>
                School Calendar
              </Button>
            </Link>
            <Link href="/admin/classes">
              <Button variant="outline" size="md" icon={School}>
                Classes & Rooms
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Active Departments"
          value="4 Divisions"
          description="Science, Math, Humanities, Arts"
          icon={Layers}
          variant="indigo"
        />
        <StatsCard
          title="Offered Courses"
          value="36 Subjects"
          description="Accredited secondary curriculum"
          icon={BookOpen}
          variant="emerald"
        />
        <StatsCard
          title="Academic Calendar"
          value="Term 2 of 3"
          description="6 weeks remaining until finals"
          icon={GraduationCap}
          variant="blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.name} hover>
            <CardHeader>
              <div>
                <CardTitle>{dept.name}</CardTitle>
                <CardDescription>Department Head: {dept.head}</CardDescription>
              </div>
              <Badge variant={dept.color}>{dept.courses} Courses</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                <span>Faculty Members Assigned:</span>
                <span className="font-bold text-slate-900">{dept.facultyCount} Teachers</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Curriculum v2025.2</span>
                <Link
                  href="/admin/teachers"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  View Department Faculty <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
