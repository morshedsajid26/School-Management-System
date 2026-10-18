"use client";

import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { BarChart3, TrendingUp, Download, FileText, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  const reportCategories = [
    {
      title: "Comprehensive Academic Performance Audit",
      description: "Class-by-class GPA distribution, subject failure rates, and honor roll qualifiers.",
      period: "Term 1 & Term 2",
      type: "Academic",
      icon: TrendingUp,
      color: "indigo",
    },
    {
      title: "Institutional Attendance & Truancy Analytics",
      description: "Weekly patterns, medical excuse validations, and chronic absentee tracking.",
      period: "Current Academic Year",
      type: "Attendance",
      icon: Calendar,
      color: "emerald",
    },
    {
      title: "Fee Collection & Bursary Cash Flow Audit",
      description: "Tuition realization rates, overdue debts ageing analysis, and departmental expenses.",
      period: "YTD (2025 - 2026)",
      type: "Finance",
      icon: BarChart3,
      color: "amber",
    },
    {
      title: "Teacher Workload & Classroom Utilization",
      description: "Period assignments, student-faculty ratios, and laboratory room occupancy metrics.",
      period: "Active Session",
      type: "Logistics",
      icon: FileText,
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Institutional Analytics"
        subtitle="Generate executive reports, inspect longitudinal academic trends, and export verified audit files."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Download}
            onClick={() => alert("Simulating Consolidated Board Report PDF export...")}
          >
            Export All Data
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((rep) => {
          const Icon = rep.icon;
          return (
            <Card key={rep.title} hover>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{rep.title}</CardTitle>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rep.period}</p>
                  </div>
                </div>
                <Badge variant={rep.color}>{rep.type}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rep.description}
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">PDF / XLSX Ready</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => alert(`Generating ${rep.title}...`)}
                  >
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
