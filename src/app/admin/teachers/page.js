"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import StatusBadge from "@/components/shared/StatusBadge";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { mockTeachers } from "@/data/mock/teachers";
import { Search, Plus, Mail, Phone, BookOpen, Award } from "lucide-react";

export default function AdminTeachersPage() {
  const [teachers] = useState(mockTeachers);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "all" || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Teaching Staff"
        subtitle="Roster of academic faculty, subject specialists, and departmental heads."
        actions={
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => alert("Faculty onboarding form will connect here.")}
          >
            Add Faculty Member
          </Button>
        }
      />

      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search faculty by name or subject..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="All Departments"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={[
                  { label: "Science", value: "Science" },
                  { label: "Mathematics", value: "Mathematics" },
                  { label: "Humanities", value: "Humanities" },
                  { label: "Technology", value: "Technology" },
                ]}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Teacher</TableHead>
                <TableHead>Department & Subject</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Classes Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={teacher.avatar} name={teacher.name} size="sm" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {teacher.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold text-slate-800">
                      {teacher.subject}
                    </p>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      Dept of {teacher.department}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600">
                      {teacher.qualification}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classesAssigned.map((cls) => (
                        <Badge key={cls} variant="slate" size="sm">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={teacher.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-mono text-slate-600">
                      {teacher.phone}
                    </span>
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
