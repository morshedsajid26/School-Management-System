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
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/shared/EmptyState";
import { mockStudents } from "@/data/mock/students";
import { useModal } from "@/hooks/useModal";
import { Search, Plus, Filter, Download, Trash2, Eye, Phone, Mail } from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(mockStudents);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const detailModal = useModal();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.guardianName?.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = gradeFilter === "all" || s.grade === gradeFilter;
    const matchesFee = feeFilter === "all" || s.feeStatus === feeFilter;

    return matchesSearch && matchesGrade && matchesFee;
  });

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to remove this student record from the directory?")) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory"
        subtitle={`Roster of all enrolled students across secondary and high school divisions (${filteredStudents.length} records).`}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={() => alert("Simulating student roster export...")}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => alert("To add a student, use the 'New Admission' button on the Admin Overview.")}
            >
              Add Student
            </Button>
          </>
        }
      />

      <Card>
        <CardContent>
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Search by student name, roll number, or guardian..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                placeholder="All Grades"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                options={[
                  { label: "Grade 10", value: "Grade 10" },
                  { label: "Grade 9", value: "Grade 9" },
                  { label: "Grade 8", value: "Grade 8" },
                ]}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                placeholder="Fee Status (All)"
                value={feeFilter}
                onChange={(e) => setFeeFilter(e.target.value)}
                options={[
                  { label: "Paid", value: "paid" },
                  { label: "Pending", value: "pending" },
                  { label: "Overdue", value: "overdue" },
                ]}
              />
            </div>
          </div>

          {/* Table */}
          {filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Grade & Section</TableHead>
                  <TableHead>Guardian & Contact</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Fee Dues</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar src={student.avatar} name={student.name} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-800">
                        {student.grade} • Sec {student.section}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-slate-800">
                        {student.guardianName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {student.guardianPhone}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-slate-800">
                        {student.attendanceRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={student.feeStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => detailModal.open(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(student.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Remove Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No students match the criteria"
              description="Adjust your search query or reset grade and fee filters."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearch("");
                setGradeFilter("all");
                setFeeFilter("all");
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        title="Student Permanent Record"
        description="Comprehensive academic profile and emergency contacts."
        footer={
          <Button variant="secondary" size="sm" onClick={detailModal.close}>
            Close
          </Button>
        }
      >
        {detailModal.modalData && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Avatar
                src={detailModal.modalData.avatar}
                name={detailModal.modalData.name}
                size="lg"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {detailModal.modalData.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Roll: {detailModal.modalData.rollNumber} • {detailModal.modalData.grade} ({detailModal.modalData.section})
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={detailModal.modalData.status} />
                  <StatusBadge status={detailModal.modalData.feeStatus} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Gender</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.gender}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Date of Birth</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.dob || "2010-04-12"}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Primary Guardian</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.guardianName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Guardian Phone</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.guardianPhone}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
