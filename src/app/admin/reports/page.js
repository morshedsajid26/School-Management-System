"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import useModal from "@/hooks/useModal";
import { formatCurrency } from "@/utils/formatters";
import { mockStudents } from "@/data/mock/students";
import { mockTeachers } from "@/data/mock/teachers";
import { mockStaffList } from "@/data/mock/staff";
import { mockPayrollRecords } from "@/data/mock/payroll";
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Users,
  Award,
  DollarSign,
  AlertCircle,
  Briefcase,
  Search,
  School,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminReportsPage() {
  const [reportCategory, setReportCategory] = useState("enrollment");
  const [selectedTerm, setSelectedTerm] = useState("term2");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const printModal = useModal();

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CATEGORIES LIST
  const categoriesList = [
    { id: "enrollment", label: "Student Enrollment", icon: Users, desc: "Demographics & admissions" },
    { id: "attendance", label: "Attendance Analytics", icon: Calendar, desc: "Daily present & truant rates" },
    { id: "examinations", label: "Exam Results & GPA", icon: Award, desc: "Scholastic marks & grades" },
    { id: "collection", label: "Fee Collection", icon: DollarSign, desc: "Tuition realization & revenue" },
    { id: "dues", label: "Outstanding Dues", icon: AlertCircle, desc: "Aging fee delinquencies" },
    { id: "staff", label: "Staff & Faculty", icon: Briefcase, desc: "Personnel & workloads" },
    { id: "payroll", label: "Payroll Audit", icon: CreditCard, desc: "Net salaries & tax withholdings" },
  ];

  // 1. DATA: STUDENT ENROLLMENT
  const enrollmentData = useMemo(() => {
    let list = mockStudents.map((s) => ({
      id: s.id,
      name: s.name,
      admNo: s.admissionNumber,
      grade: s.grade,
      section: s.section,
      gender: s.gender,
      dob: s.dob,
      admDate: s.admissionDate,
      attendanceRate: s.attendanceRate,
      status: s.status,
    }));

    if (selectedClass !== "all") {
      list = list.filter((s) => s.grade === selectedClass);
    }
    if (selectedSection !== "all") {
      list = list.filter((s) => s.section === selectedSection);
    }
    if (searchQuery) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.admNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedClass, selectedSection, searchQuery]);

  // 2. DATA: ATTENDANCE ANALYTICS
  const attendanceData = useMemo(() => {
    const classRows = [
      { class: "Grade 10 - Section A", total: 32, present: 31, absent: 1, rate: 96.8, advisor: "Prof. Marcus Aurel" },
      { class: "Grade 10 - Section B", total: 30, present: 28, absent: 2, rate: 93.3, advisor: "Jonathan Michael Hayes" },
      { class: "Grade 9 - Section A", total: 34, present: 33, absent: 1, rate: 97.1, advisor: "Dr. Catherine Bennett" },
      { class: "Grade 9 - Section B", total: 31, present: 29, absent: 2, rate: 93.5, advisor: "Sarah Jenkins" },
      { class: "Grade 8 - Section A", total: 28, present: 27, absent: 1, rate: 96.4, advisor: "Robert Kowalski" },
      { class: "Grade 8 - Section B", total: 29, present: 27, absent: 2, rate: 93.1, advisor: "David O'Connor" },
    ];

    let list = classRows;
    if (selectedClass !== "all") {
      list = list.filter((r) => r.class.includes(selectedClass));
    }
    if (selectedSection !== "all") {
      list = list.filter((r) => r.class.includes(`Section ${selectedSection}`));
    }
    if (searchQuery) {
      list = list.filter(
        (r) =>
          r.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.advisor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedClass, selectedSection, searchQuery]);

  // 3. DATA: EXAM RESULTS
  const examResultsData = useMemo(() => {
    const results = [
      { id: "RES-01", name: "Liam Alexander Chen", grade: "Grade 10", section: "A", subject: "Advanced Physics", marks: 96, max: 100, gpa: 4.0, letter: "A+", remarks: "Highest Honors" },
      { id: "RES-02", name: "Sophia Isabella Rodriguez", grade: "Grade 10", section: "A", subject: "Calculus & Algebra", marks: 92, max: 100, gpa: 4.0, letter: "A+", remarks: "Outstanding" },
      { id: "RES-03", name: "Ethan James Patel", grade: "Grade 10", section: "A", subject: "Computer Science", marks: 88, max: 100, gpa: 3.7, letter: "A", remarks: "Excellent" },
      { id: "RES-04", name: "Emma Grace Taylor", grade: "Grade 10", section: "B", subject: "English Literature", marks: 85, max: 100, gpa: 3.7, letter: "A", remarks: "Commendable" },
      { id: "RES-05", name: "Noah William Davies", grade: "Grade 9", section: "A", subject: "General Chemistry", marks: 78, max: 100, gpa: 3.0, letter: "B", remarks: "Good Standing" },
      { id: "RES-06", name: "Olivia Rose Miller", grade: "Grade 9", section: "B", subject: "World History", marks: 82, max: 100, gpa: 3.7, letter: "A", remarks: "Very Good" },
    ];

    let list = results;
    if (selectedClass !== "all") {
      list = list.filter((r) => r.grade === selectedClass);
    }
    if (selectedSection !== "all") {
      list = list.filter((r) => r.section === selectedSection);
    }
    if (searchQuery) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedClass, selectedSection, searchQuery]);

  // 4. DATA: FEE COLLECTION
  const feeCollectionData = useMemo(() => {
    const txns = [
      { inv: "INV-2026-001", student: "Liam Alexander Chen", grade: "Grade 10-A", amount: 1450, method: "Direct Bank ACH", date: "2026-03-12", status: "Paid" },
      { inv: "INV-2026-002", student: "Sophia Isabella Rodriguez", grade: "Grade 10-A", amount: 1450, method: "Credit Card (Visa)", date: "2026-03-14", status: "Paid" },
      { inv: "INV-2026-003", student: "Ethan James Patel", grade: "Grade 10-A", amount: 1200, method: "Direct Bank ACH", date: "2026-03-15", status: "Paid" },
      { inv: "INV-2026-004", student: "Emma Grace Taylor", grade: "Grade 10-B", amount: 1350, method: "Cashier Terminal", date: "2026-03-18", status: "Paid" },
      { inv: "INV-2026-005", student: "Noah William Davies", grade: "Grade 9-A", amount: 1100, method: "Debit Card", date: "2026-03-20", status: "Paid" },
    ];

    let list = txns;
    if (selectedClass !== "all") {
      list = list.filter((r) => r.grade.includes(selectedClass));
    }
    if (searchQuery) {
      list = list.filter(
        (r) =>
          r.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.inv.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedClass, searchQuery]);

  // 5. DATA: OUTSTANDING DUES
  const outstandingDuesData = useMemo(() => {
    const dues = [
      { inv: "DUE-2026-101", student: "Lucas Mateo Silva", grade: "Grade 10-B", total: 1450, paid: 500, balance: 950, dueDate: "2026-03-10", overdueDays: 14, contact: "+1 (555) 789-1234" },
      { inv: "DUE-2026-102", student: "Isabella Marie Vance", grade: "Grade 9-A", total: 1200, paid: 0, balance: 1200, dueDate: "2026-03-05", overdueDays: 19, contact: "+1 (555) 456-9812" },
      { inv: "DUE-2026-103", student: "Aiden Scott Murphy", grade: "Grade 9-B", total: 1100, paid: 400, balance: 700, dueDate: "2026-02-28", overdueDays: 24, contact: "+1 (555) 678-2233" },
      { inv: "DUE-2026-104", student: "Chloe Elizabeth Evans", grade: "Grade 8-A", total: 950, paid: 0, balance: 950, dueDate: "2026-03-12", overdueDays: 12, contact: "+1 (555) 345-8899" },
    ];

    let list = dues;
    if (selectedClass !== "all") {
      list = list.filter((r) => r.grade.includes(selectedClass));
    }
    if (searchQuery) {
      list = list.filter(
        (r) =>
          r.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.inv.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [selectedClass, searchQuery]);

  // 6. DATA: STAFF & FACULTY
  const staffData = useMemo(() => {
    const teachersMapped = mockTeachers.map((t) => ({
      id: t.employeeId || t.id,
      name: t.name,
      role: "Faculty",
      dept: t.department,
      designation: t.designation,
      qualification: t.qualification,
      experience: `${t.experienceYears} Years`,
      status: "Active",
    }));

    const staffMapped = mockStaffList.map((s) => ({
      id: s.employeeId || s.id,
      name: s.name,
      role: "Staff",
      dept: s.department,
      designation: s.designation,
      qualification: s.qualification,
      experience: "8 Years",
      status: "Active",
    }));

    let list = [...teachersMapped, ...staffMapped];
    if (searchQuery) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [searchQuery]);

  // 7. DATA: PAYROLL AUDIT
  const payrollData = useMemo(() => {
    let list = mockPayrollRecords;
    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [searchQuery]);

  // CSV EXPORT HANDLER
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Oakridge_${reportCategory}_report.csv`;

    if (reportCategory === "enrollment") {
      headers = ["Admission No", "Student Name", "Grade", "Section", "Gender", "Date of Birth", "Admission Date", "Attendance %", "Status"];
      rows = enrollmentData.map((s) => [s.admNo, s.name, s.grade, s.section, s.gender, s.dob, s.admDate, `${s.attendanceRate}%`, s.status]);
    } else if (reportCategory === "attendance") {
      headers = ["Class / Section", "Enrolled", "Present Count", "Absent Count", "Attendance %", "Faculty Advisor"];
      rows = attendanceData.map((a) => [a.class, a.total, a.present, a.absent, `${a.rate}%`, a.advisor]);
    } else if (reportCategory === "examinations") {
      headers = ["Student Name", "Grade", "Section", "Subject", "Marks Obtained", "Max Marks", "GPA", "Letter Grade", "Scholastic Remarks"];
      rows = examResultsData.map((e) => [e.name, e.grade, e.section, e.subject, e.marks, e.max, e.gpa, e.letter, e.remarks]);
    } else if (reportCategory === "collection") {
      headers = ["Invoice No", "Student Name", "Class", "Amount Paid ($)", "Payment Channel", "Transaction Date", "Settlement Status"];
      rows = feeCollectionData.map((f) => [f.inv, f.student, f.grade, f.amount, f.method, f.date, f.status]);
    } else if (reportCategory === "dues") {
      headers = ["Invoice Ref", "Student Name", "Grade", "Billed Total ($)", "Amount Paid ($)", "Outstanding Balance ($)", "Due Date", "Days Overdue", "Parent Phone"];
      rows = outstandingDuesData.map((d) => [d.inv, d.student, d.grade, d.total, d.paid, d.balance, d.dueDate, d.overdueDays, d.contact]);
    } else if (reportCategory === "staff") {
      headers = ["Employee ID", "Staff Name", "Role", "Department", "Designation", "Qualification", "Experience", "Status"];
      rows = staffData.map((s) => [s.id, s.name, s.role, s.dept, s.designation, s.qualification, s.experience, s.status]);
    } else if (reportCategory === "payroll") {
      headers = ["Payslip ID", "Employee Name", "Department", "Designation", "Pay Period", "Base Salary ($)", "Net Salary ($)", "Payment Status"];
      rows = payrollData.map((p) => [p.id, p.employeeName, p.department, p.designation, p.payPeriod, p.baseSalary, p.netSalary, p.paymentStatus]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filename} (${rows.length} records) to your downloads.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Institutional Reports & Analytics"
        description="Comprehensive operational audits across enrollment, daily attendance, examinations, revenue realization, and payroll"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => printModal.open()}
            className="text-xs"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </PageHeader>

      {/* REPORT CATEGORY SELECTOR PILLS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          const isActive = reportCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setReportCategory(cat.id);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FILTERS & AUDIT PARAMETERS */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search records in ${categoriesList.find((c) => c.id === reportCategory)?.label}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Date Range / Term Filter */}
            <div className="w-full sm:w-48">
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="term2">Term 2 (Current)</option>
                <option value="term1">Term 1 Final (2025)</option>
                <option value="year">Full Session 2025-26</option>
                <option value="month">Current Month (March)</option>
              </select>
            </div>

            {/* Class Filter (relevant for student/academic reports) */}
            {["enrollment", "attendance", "examinations", "collection", "dues"].includes(
              reportCategory
            ) && (
              <>
                <div className="w-full sm:w-40">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                  >
                    <option value="all">All Grades</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 8">Grade 8</option>
                  </select>
                </div>

                <div className="w-full sm:w-36">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
                  >
                    <option value="all">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CATEGORY 1: ENROLLMENT AUDIT */}
      {reportCategory === "enrollment" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Enrolled Students"
              value={enrollmentData.length}
              icon={Users}
              description="Active in campus roster"
            />
            <StatsCard
              title="Male / Female Ratio"
              value="52% / 48%"
              icon={School}
              description="Balanced gender distribution"
            />
            <StatsCard
              title="Campus Capacity"
              value="94.6%"
              icon={Layers}
              description="36 Active grade sections"
            />
            <StatsCard
              title="Avg Attendance Rate"
              value="96.2%"
              icon={TrendingUp}
              description="Consistently above 95% target"
            />
          </div>

          {/* Visual Breakdown Bars */}
          <Card>
            <CardHeader className="py-4 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Grade-Level Enrollment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { grade: "Grade 10 (Senior Secondary)", count: 240, percent: 92, color: "bg-indigo-600" },
                  { grade: "Grade 9 (Secondary High)", count: 260, percent: 96, color: "bg-blue-600" },
                  { grade: "Grade 8 (Middle School Upper)", count: 235, percent: 89, color: "bg-emerald-600" },
                  { grade: "Grade 7 (Middle School Core)", count: 220, percent: 85, color: "bg-amber-600" },
                ].map((row) => (
                  <div key={row.grade} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{row.grade}</span>
                      <span className="text-slate-500 font-mono">
                        {row.count} Students ({row.percent}% Capacity)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Enrollment Roster Data
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Admission No</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Grade & Section</TableHead>
                    <TableHead className="text-xs">Gender</TableHead>
                    <TableHead className="text-xs">Admission Date</TableHead>
                    <TableHead className="text-xs">Attendance</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollmentData.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">{s.admNo}</TableCell>
                      <TableCell className="font-bold text-sm text-slate-900">{s.name}</TableCell>
                      <TableCell className="text-xs">{s.grade} ({s.section})</TableCell>
                      <TableCell className="text-xs">{s.gender}</TableCell>
                      <TableCell className="text-xs text-slate-600">{s.admDate}</TableCell>
                      <TableCell className="font-semibold text-xs text-emerald-600">{s.attendanceRate}%</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px]">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 2: ATTENDANCE ANALYTICS */}
      {reportCategory === "attendance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Campus Attendance Rate"
              value="95.4%"
              icon={Calendar}
              description="+0.6% vs monthly goal"
            />
            <StatsCard
              title="Daily Present Count"
              value="1,354"
              icon={CheckCircle2}
              description="Out of 1,420 registered"
            />
            <StatsCard
              title="Authorized Medical Leaves"
              value="38"
              icon={Clock}
              description="Excused physician certificates"
            />
            <StatsCard
              title="Chronic Truancy Rate"
              value="1.8%"
              icon={AlertCircle}
              description="Flagged for counseling"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Class Attendance & Truancy Register
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Class / Section</TableHead>
                    <TableHead className="text-xs">Faculty Advisor</TableHead>
                    <TableHead className="text-xs text-center">Enrolled</TableHead>
                    <TableHead className="text-xs text-center">Present</TableHead>
                    <TableHead className="text-xs text-center">Absent</TableHead>
                    <TableHead className="text-xs text-center">Rate (%)</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-sm text-slate-900">{row.class}</TableCell>
                      <TableCell className="text-xs text-slate-600">{row.advisor}</TableCell>
                      <TableCell className="text-center text-xs font-semibold">{row.total}</TableCell>
                      <TableCell className="text-center text-xs font-bold text-emerald-600">{row.present}</TableCell>
                      <TableCell className="text-center text-xs font-bold text-rose-600">{row.absent}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-sm text-indigo-700">{row.rate}%</TableCell>
                      <TableCell>
                        <Badge variant={row.rate >= 95 ? "success" : "warning"} className="text-[10px]">
                          {row.rate >= 95 ? "Exemplary" : "Normal"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 3: EXAMINATION RESULTS */}
      {reportCategory === "examinations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Overall Exam Pass Rate"
              value="94.8%"
              icon={Award}
              description="Term 2 Midterm cycle"
            />
            <StatsCard
              title="Average Scholastic GPA"
              value="3.68"
              icon={TrendingUp}
              description="Out of 4.0 grading scale"
            />
            <StatsCard
              title="Honor Roll Qualifiers"
              value="182"
              icon={CheckCircle2}
              description="Achieved Grade A or A+"
            />
            <StatsCard
              title="Highest Scored Subject"
              value="Advanced Physics"
              icon={School}
              description="96.2% batch average"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Examination Assessment Ledger
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Marks Obtained</TableHead>
                    <TableHead className="text-xs">GPA</TableHead>
                    <TableHead className="text-xs">Grade</TableHead>
                    <TableHead className="text-xs">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResultsData.map((e) => (
                    <TableRow key={e.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-bold text-sm text-slate-900">{e.name}</TableCell>
                      <TableCell className="text-xs text-slate-600">{e.grade} ({e.section})</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">{e.subject}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{e.marks} / {e.max}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">{e.gpa.toFixed(1)}</TableCell>
                      <TableCell>
                        <span className="font-bold px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {e.letter}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{e.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 4: FEE COLLECTION */}
      {reportCategory === "collection" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Realized Tuition Revenue"
              value={formatCurrency(182400)}
              icon={DollarSign}
              description="Collected this pay term"
            />
            <StatsCard
              title="Collection Realization"
              value="92.4%"
              icon={TrendingUp}
              description="+2.1% YoY improvement"
            />
            <StatsCard
              title="Settled Invoices"
              value="128"
              icon={CheckCircle2}
              description="Zero pending reconciliation"
            />
            <StatsCard
              title="Dominant Payment Channel"
              value="ACH Wire"
              icon={CreditCard}
              description="68% digital settlements"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Fee Collection Transaction Log
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Invoice No</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Class</TableHead>
                    <TableHead className="text-xs">Amount Settled</TableHead>
                    <TableHead className="text-xs">Channel</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeCollectionData.map((f, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">{f.inv}</TableCell>
                      <TableCell className="font-bold text-sm text-slate-900">{f.student}</TableCell>
                      <TableCell className="text-xs text-slate-600">{f.grade}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-emerald-600">{formatCurrency(f.amount)}</TableCell>
                      <TableCell className="text-xs text-slate-700">{f.method}</TableCell>
                      <TableCell className="text-xs text-slate-600">{f.date}</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px]">{f.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 5: OUTSTANDING DUES */}
      {reportCategory === "dues" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Overdue Debts"
              value={formatCurrency(43600)}
              icon={AlertCircle}
              description="Across all grade tiers"
            />
            <StatsCard
              title="Delinquent Accounts"
              value={outstandingDuesData.length}
              icon={Clock}
              description="Pending fee settlements"
            />
            <StatsCard
              title="Average Overdue Aging"
              value="17.2 Days"
              icon={Calendar}
              description="Grace period elapsed"
            />
            <StatsCard
              title="Reminder Notices Sent"
              value="100%"
              icon={CheckCircle2}
              description="Dispatched to guardians"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Overdue Aging & Delinquencies Register
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Invoice Ref</TableHead>
                    <TableHead className="text-xs">Student Name</TableHead>
                    <TableHead className="text-xs">Grade</TableHead>
                    <TableHead className="text-xs">Billed</TableHead>
                    <TableHead className="text-xs">Paid</TableHead>
                    <TableHead className="text-xs">Remaining Balance</TableHead>
                    <TableHead className="text-xs">Aging Period</TableHead>
                    <TableHead className="text-xs">Guardian Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingDuesData.map((d, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-bold text-rose-700">{d.inv}</TableCell>
                      <TableCell className="font-bold text-sm text-slate-900">{d.student}</TableCell>
                      <TableCell className="text-xs text-slate-600">{d.grade}</TableCell>
                      <TableCell className="font-mono text-xs">{formatCurrency(d.total)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{formatCurrency(d.paid)}</TableCell>
                      <TableCell className="font-mono text-sm font-bold text-rose-600">{formatCurrency(d.balance)}</TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {d.overdueDays} Days Late
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{d.contact}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 6: STAFF & FACULTY */}
      {reportCategory === "staff" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Employed Personnel"
              value={staffData.length}
              icon={Briefcase}
              description="Teaching faculty & staff"
            />
            <StatsCard
              title="Faculty to Student Ratio"
              value="1 : 16.5"
              icon={School}
              description="Low individual student load"
            />
            <StatsCard
              title="Average Faculty Tenure"
              value="8.4 Years"
              icon={Award}
              description="High retention stability"
            />
            <StatsCard
              title="Compliance & Clearances"
              value="100%"
              icon={CheckCircle2}
              description="Background audits verified"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Staff & Faculty Employment Dossier
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Employee ID</TableHead>
                    <TableHead className="text-xs">Staff Name</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Designation</TableHead>
                    <TableHead className="text-xs">Qualification</TableHead>
                    <TableHead className="text-xs">Experience</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffData.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-bold text-slate-700">{s.id}</TableCell>
                      <TableCell className="font-bold text-sm text-slate-900">{s.name}</TableCell>
                      <TableCell>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.role === "Faculty" ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"}`}>
                          {s.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 font-medium">{s.dept}</TableCell>
                      <TableCell className="text-xs text-slate-600">{s.designation}</TableCell>
                      <TableCell className="text-xs text-slate-500 line-clamp-1">{s.qualification}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">{s.experience}</TableCell>
                      <TableCell><Badge variant="success" className="text-[10px]">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* CATEGORY 7: PAYROLL AUDIT */}
      {reportCategory === "payroll" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Monthly Payroll"
              value={formatCurrency(payrollData.reduce((acc, p) => acc + p.netSalary, 0))}
              icon={CreditCard}
              description="Net disbursement liability"
            />
            <StatsCard
              title="Tax Withholdings"
              value={formatCurrency(payrollData.reduce((acc, p) => acc + p.deductions.tax, 0))}
              icon={TrendingUp}
              description="Federal & State remittances"
            />
            <StatsCard
              title="Benefit Allowances"
              value={formatCurrency(payrollData.reduce((acc, p) => acc + p.allowances.housing + p.allowances.transport, 0))}
              icon={CheckCircle2}
              description="Housing & transit support"
            />
            <StatsCard
              title="Disbursement Rate"
              value="100%"
              icon={DollarSign}
              description="Fully reconciled"
            />
          </div>

          <Card>
            <CardHeader className="py-3.5 px-6 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Staff Payroll Compensation Ledger
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/75">
                    <TableHead className="text-xs">Payslip ID</TableHead>
                    <TableHead className="text-xs">Employee Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Pay Period</TableHead>
                    <TableHead className="text-xs">Base Salary</TableHead>
                    <TableHead className="text-xs">Allowances</TableHead>
                    <TableHead className="text-xs">Deductions</TableHead>
                    <TableHead className="text-xs">Net Salary</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((p) => {
                    const totalAllow = p.allowances.housing + p.allowances.transport + p.allowances.medical + p.allowances.academicBonus;
                    const totalDeduct = p.deductions.tax + p.deductions.healthInsurance + p.deductions.pension;

                    return (
                      <TableRow key={p.id} className="hover:bg-slate-50/80">
                        <TableCell className="font-mono text-xs font-bold text-slate-700">{p.id}</TableCell>
                        <TableCell className="font-bold text-sm text-slate-900">{p.employeeName}</TableCell>
                        <TableCell className="text-xs text-slate-600">{p.department}</TableCell>
                        <TableCell className="text-xs font-semibold text-slate-700">{p.payPeriod}</TableCell>
                        <TableCell className="font-mono text-xs">{formatCurrency(p.baseSalary)}</TableCell>
                        <TableCell className="font-mono text-xs text-emerald-600">+{formatCurrency(totalAllow)}</TableCell>
                        <TableCell className="font-mono text-xs text-rose-600">-{formatCurrency(totalDeduct)}</TableCell>
                        <TableCell className="font-mono text-sm font-bold text-slate-900">{formatCurrency(p.netSalary)}</TableCell>
                        <TableCell><Badge variant="success" className="text-[10px]">{p.paymentStatus}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: PRINT-FRIENDLY REPORT VIEW */}
      <Modal
        isOpen={printModal.isOpen}
        onClose={printModal.close}
        title="Official Institutional Audit Report"
        description="Print-friendly consolidated summary formatted for school board and compliance review"
        size="lg"
      >
        <div className="space-y-5">
          {/* Print Letterhead Document */}
          <div className="border border-slate-200 rounded-xl p-6 bg-gradient-to-b from-white to-slate-50 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Oakridge Academy
                </h3>
                <p className="text-xs text-slate-500">
                  Institutional Research & Administrative Audits Office
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Report ID: REP-2026-{reportCategory.toUpperCase()} &bull; Term: {selectedTerm.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {categoriesList.find((c) => c.id === reportCategory)?.label}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Generated: 2026-03-24</p>
              </div>
            </div>

            {/* Scope Summary Box */}
            <div className="bg-slate-100/70 p-3.5 rounded-lg text-xs space-y-1">
              <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider">
                Audit Scope & Parameters
              </span>
              <p className="text-slate-600">
                Category: <span className="font-semibold text-slate-900">{categoriesList.find((c) => c.id === reportCategory)?.label}</span> &bull; Academic Class Scope:{" "}
                <span className="font-semibold text-slate-900">{selectedClass}</span> &bull; Section:{" "}
                <span className="font-semibold text-slate-900">{selectedSection}</span>
              </p>
            </div>

            {/* Key Findings Notice */}
            <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-900 mb-1">Executive Certification:</p>
              <p>
                All data compiled within this document has been verified against institutional campus registries,
                bursary accounts, and academic assessment registers in full accordance with Oakridge Academy accreditation guidelines.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 pt-6 border-t border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 text-[11px]">Compiled By:</p>
                <p className="font-bold text-slate-800 mt-1">Institutional Reporting Desk</p>
                <p className="text-[10px] text-slate-500 font-mono">Office of Academic Administration</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[11px]">Approved By:</p>
                <p className="font-bold text-slate-800 mt-1">Dr. Evelyn Reed</p>
                <p className="text-[10px] text-slate-500">Principal & Head of School</p>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print Document (Browser)
            </Button>
            <Button variant="primary" size="sm" onClick={printModal.close}>
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
