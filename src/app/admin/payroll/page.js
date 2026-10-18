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
import usePayroll from "@/hooks/usePayroll";
import { mockTeachers } from "@/data/mock/teachers";
import { mockStaffList } from "@/data/mock/staff";
import { formatCurrency } from "@/utils/formatters";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Printer,
  Edit2,
  Trash2,
  Eye,
  RotateCcw,
  Building,
  User,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  FileText,
} from "lucide-react";

export default function PayrollManagementPage() {
  const {
    records,
    payPeriods,
    stats,
    addPayrollRecord,
    updatePayrollRecord,
    markAsPaid,
    deletePayrollRecord,
    resetPayrollData,
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const addModal = useModal();
  const editModal = useModal();
  const viewModal = useModal();
  const deleteModal = useModal();

  // Combine teachers and staff for employee select dropdown
  const allEmployees = useMemo(() => {
    const list = [];
    mockTeachers.forEach((t) =>
      list.push({
        id: t.employeeId || t.id,
        name: t.name,
        role: "Teacher",
        designation: t.designation,
        department: t.department,
        salaryBase: 5200,
      })
    );
    mockStaffList.forEach((s) =>
      list.push({
        id: s.employeeId || s.id,
        name: s.name,
        role: "Staff",
        designation: s.designation,
        department: s.department,
        salaryBase: 4000,
      })
    );
    return list;
  }, []);

  // Form State
  const initialPayrollForm = {
    employeeName: allEmployees[0]?.name || "Prof. Marcus Aurel",
    employeeId: allEmployees[0]?.id || "EMP-T-101",
    role: allEmployees[0]?.role || "Teacher",
    designation: allEmployees[0]?.designation || "Senior Faculty",
    department: allEmployees[0]?.department || "Science",
    payPeriod: "March 2026",
    baseSalary: 5200,
    housing: 800,
    transport: 300,
    medical: 250,
    academicBonus: 350,
    tax: 620,
    healthInsurance: 180,
    pension: 310,
    paymentStatus: "Paid",
    paymentMethod: "Direct Deposit (ACH)",
    bankAccount: "Oakridge Teachers CU •••• 4892",
  };
  const [formData, setFormData] = useState(initialPayrollForm);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPeriod =
        selectedPeriod === "all" || r.payPeriod === selectedPeriod;

      const matchStatus =
        selectedStatus === "all" || r.paymentStatus === selectedStatus;

      const matchDept =
        selectedDepartment === "all" || r.department === selectedDepartment;

      return matchSearch && matchPeriod && matchStatus && matchDept;
    });
  }, [records, searchTerm, selectedPeriod, selectedStatus, selectedDepartment]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set(records.map((r) => r.department));
    return Array.from(set);
  }, [records]);

  // Handlers
  const handleOpenAdd = () => {
    setFormData(initialPayrollForm);
    addModal.open();
  };

  const handleEmployeeSelect = (empName) => {
    const emp = allEmployees.find((e) => e.name === empName);
    if (emp) {
      setFormData({
        ...formData,
        employeeName: emp.name,
        employeeId: emp.id,
        role: emp.role,
        designation: emp.designation,
        department: emp.department,
        baseSalary: emp.salaryBase,
      });
    }
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.employeeName) {
      alert("Please select an employee.");
      return;
    }
    const created = addPayrollRecord(formData);
    addModal.close();
    showToast(`Payslip generated for ${created.employeeName} (${created.payPeriod}).`);
  };

  const handleOpenEdit = (rec) => {
    setFormData({
      employeeName: rec.employeeName,
      employeeId: rec.employeeId,
      role: rec.role,
      designation: rec.designation,
      department: rec.department,
      payPeriod: rec.payPeriod,
      baseSalary: rec.baseSalary,
      housing: rec.allowances.housing,
      transport: rec.allowances.transport,
      medical: rec.allowances.medical,
      academicBonus: rec.allowances.academicBonus,
      tax: rec.deductions.tax,
      healthInsurance: rec.deductions.healthInsurance,
      pension: rec.deductions.pension,
      paymentStatus: rec.paymentStatus,
      paymentMethod: rec.paymentMethod,
      bankAccount: rec.bankAccount,
    });
    editModal.open(rec);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editModal.modalData) return;
    updatePayrollRecord(editModal.modalData.id, formData);
    editModal.close();
    showToast(`Payslip for ${formData.employeeName} updated successfully.`);
  };

  const handleMarkAsPaid = (rec) => {
    markAsPaid(rec.id);
    showToast(`Salary payment confirmed for ${rec.employeeName}.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.modalData) return;
    deletePayrollRecord(deleteModal.modalData.id);
    deleteModal.close();
    showToast(`Payroll record purged.`);
  };

  // Helper for live calculated net salary in modals
  const liveNetSalary = useMemo(() => {
    const base = parseFloat(formData.baseSalary) || 0;
    const allowances =
      (parseFloat(formData.housing) || 0) +
      (parseFloat(formData.transport) || 0) +
      (parseFloat(formData.medical) || 0) +
      (parseFloat(formData.academicBonus) || 0);
    const deductions =
      (parseFloat(formData.tax) || 0) +
      (parseFloat(formData.healthInsurance) || 0) +
      (parseFloat(formData.pension) || 0);
    return Math.max(0, base + allowances - deductions);
  }, [formData]);

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
        title="Payroll & Compensation"
        description="Employee salary disbursement, tax withholdings, medical allowances, and printable salary vouchers"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetPayrollData}
            title="Reset to default mock payroll records"
          >
            <RotateCcw className="h-4 w-4 mr-1.5 text-slate-500" />
            Reset Defaults
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-1.5" />
            Generate Payslip
          </Button>
        </div>
      </PageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Net Payroll"
          value={formatCurrency(stats.totalNetPayroll)}
          icon={CreditCard}
          description={`${stats.totalRecords} active employee payslips`}
        />
        <StatsCard
          title="Disbursed Salaries"
          value={formatCurrency(stats.totalDisbursed)}
          icon={CheckCircle2}
          description={`${stats.paidCount} cleared ACH settlements`}
        />
        <StatsCard
          title="Pending Disbursement"
          value={formatCurrency(stats.totalPending)}
          icon={Clock}
          description={`${stats.pendingCount} payslips awaiting transfer`}
        />
        <StatsCard
          title="Average Net Salary"
          value={formatCurrency(stats.averageNetSalary)}
          icon={TrendingUp}
          description="Institutional monthly mean"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payroll by employee name, ID, or designation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pay Period Selector */}
            <div className="w-full md:w-48">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Pay Periods</option>
                {payPeriods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-40">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader className="border-b border-slate-100 py-3.5 px-6 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800">
              Employee Payroll Register
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredRecords.length} of {records.length} salary records for academic and operational staff
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/75">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Employee Details</TableHead>
                <TableHead className="text-xs">Pay Period</TableHead>
                <TableHead className="text-xs">Base Salary</TableHead>
                <TableHead className="text-xs">Allowances (+)</TableHead>
                <TableHead className="text-xs">Deductions (-)</TableHead>
                <TableHead className="text-xs">Net Take-Home</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                    No payroll records matching your query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const totalAllowances =
                    (rec.allowances.housing || 0) +
                    (rec.allowances.transport || 0) +
                    (rec.allowances.medical || 0) +
                    (rec.allowances.academicBonus || 0);

                  const totalDeductions =
                    (rec.deductions.tax || 0) +
                    (rec.deductions.healthInsurance || 0) +
                    (rec.deductions.pension || 0);

                  const isPaid = rec.paymentStatus === "Paid";

                  return (
                    <TableRow key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <button
                            type="button"
                            onClick={() => viewModal.open(rec)}
                            className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition text-left line-clamp-1"
                          >
                            {rec.employeeName}
                          </button>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {rec.designation} &bull;{" "}
                            <span className="font-mono text-[11px] text-slate-400">
                              {rec.employeeId}
                            </span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {rec.payPeriod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {formatCurrency(rec.baseSalary)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-emerald-600">
                          +{formatCurrency(totalAllowances)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-rose-600">
                          -{formatCurrency(totalDeductions)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-bold text-slate-900 bg-indigo-50/60 px-2 py-0.5 rounded border border-indigo-100">
                          {formatCurrency(rec.netSalary)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] font-bold">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isPaid && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMarkAsPaid(rec)}
                              title="Confirm ACH Disbursal"
                              className="text-xs px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              Disburse
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewModal.open(rec)}
                            title="View Official Payslip Voucher"
                            className="p-1.5 h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(rec)}
                            title="Edit Payslip"
                            className="p-1.5 h-8 w-8 text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteModal.open(rec)}
                            title="Delete Record"
                            className="p-1.5 h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* MODAL: ADD / GENERATE PAYSLIP */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Generate Employee Payslip"
        description="Calculate monthly earnings, tax withholdings, and institutional benefits."
        size="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Employee *
              </label>
              <select
                value={formData.employeeName}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role} - {emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pay Period *
              </label>
              <select
                value={formData.payPeriod}
                onChange={(e) =>
                  setFormData({ ...formData, payPeriod: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {payPeriods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Base Monthly Salary ($) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Housing Allowance ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.housing}
                onChange={(e) =>
                  setFormData({ ...formData, housing: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Transport Allowance ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({ ...formData, transport: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Medical Allowance ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.medical}
                onChange={(e) =>
                  setFormData({ ...formData, medical: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Academic Bonus ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.academicBonus}
                onChange={(e) =>
                  setFormData({ ...formData, academicBonus: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Income Tax Deduction ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.tax}
                onChange={(e) =>
                  setFormData({ ...formData, tax: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Health Insurance Premium ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.healthInsurance}
                onChange={(e) =>
                  setFormData({ ...formData, healthInsurance: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pension Fund Deduction ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.pension}
                onChange={(e) =>
                  setFormData({ ...formData, pension: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Computed Net Preview Box */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900 uppercase block">
                Calculated Net Take-Home Salary
              </span>
              <p className="text-xs text-indigo-700">
                (Base Salary + Allowances - Deductions)
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-indigo-900">
                {formatCurrency(liveNetSalary)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={addModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Generate & Save Payslip
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT PAYSLIP */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Salary Breakdown"
        description={`Modify compensation figures for ${editModal.modalData?.employeeName}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Base Monthly Salary ($) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.baseSalary}
                onChange={(e) =>
                  setFormData({ ...formData, baseSalary: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, paymentStatus: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Housing Allowance ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.housing}
                onChange={(e) =>
                  setFormData({ ...formData, housing: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Transport Allowance ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.transport}
                onChange={(e) =>
                  setFormData({ ...formData, transport: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Income Tax Deduction ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.tax}
                onChange={(e) =>
                  setFormData({ ...formData, tax: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pension Fund Deduction ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.pension}
                onChange={(e) =>
                  setFormData({ ...formData, pension: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase">
              Updated Net Salary
            </span>
            <span className="text-xl font-bold font-mono text-indigo-900">
              {formatCurrency(liveNetSalary)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={editModal.close}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW OFFICIAL PAYSLIP VOUCHER */}
      <Modal
        isOpen={viewModal.isOpen}
        onClose={viewModal.close}
        title="Official Salary Voucher & Payslip"
        description="Formal earnings breakdown and institutional disbursement certificate"
        size="md"
      >
        {viewModal.modalData && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-b from-white to-slate-50 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Oakridge Academy
                  </h4>
                  <p className="text-xs text-slate-500">
                    Office of Finance & Human Resources
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={viewModal.modalData.paymentStatus === "Paid" ? "success" : "warning"}
                    className="text-[10px] font-bold"
                  >
                    {viewModal.modalData.paymentStatus}
                  </Badge>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">
                    {viewModal.modalData.id}
                  </p>
                </div>
              </div>

              {/* Employee & Period */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/60 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block text-[11px]">Employee Name</span>
                  <span className="font-bold text-slate-900">
                    {viewModal.modalData.employeeName}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {viewModal.modalData.designation} ({viewModal.modalData.department})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Pay Period</span>
                  <span className="font-bold text-indigo-700">
                    {viewModal.modalData.payPeriod}
                  </span>
                  <p className="text-[11px] font-mono text-slate-500">
                    ID: {viewModal.modalData.employeeId}
                  </p>
                </div>
              </div>

              {/* Breakdown Tables */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="space-y-1.5 border-r border-slate-200 pr-3">
                  <h5 className="font-bold text-slate-700 uppercase text-[11px] border-b border-slate-100 pb-1">
                    Earnings & Allowances
                  </h5>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Base Salary</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(viewModal.modalData.baseSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Housing Allowance</span>
                    <span className="font-mono text-slate-700">
                      +{formatCurrency(viewModal.modalData.allowances.housing)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transport Allowance</span>
                    <span className="font-mono text-slate-700">
                      +{formatCurrency(viewModal.modalData.allowances.transport)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical Allowance</span>
                    <span className="font-mono text-slate-700">
                      +{formatCurrency(viewModal.modalData.allowances.medical)}
                    </span>
                  </div>
                  {viewModal.modalData.allowances.academicBonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Academic Bonus</span>
                      <span className="font-mono text-slate-700">
                        +{formatCurrency(viewModal.modalData.allowances.academicBonus)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Deductions */}
                <div className="space-y-1.5 pl-1">
                  <h5 className="font-bold text-slate-700 uppercase text-[11px] border-b border-slate-100 pb-1">
                    Tax & Deductions
                  </h5>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax (W-4)</span>
                    <span className="font-mono text-rose-600">
                      -{formatCurrency(viewModal.modalData.deductions.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Health Insurance</span>
                    <span className="font-mono text-rose-600">
                      -{formatCurrency(viewModal.modalData.deductions.healthInsurance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pension Contribution</span>
                    <span className="font-mono text-rose-600">
                      -{formatCurrency(viewModal.modalData.deductions.pension)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Total Banner */}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between bg-indigo-50/80 p-3 rounded-lg">
                <div>
                  <span className="text-[11px] font-bold text-indigo-950 uppercase block">
                    Net Take-Home Pay
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    Disbursed via {viewModal.modalData.paymentMethod}
                  </span>
                </div>
                <span className="text-xl font-bold font-mono text-indigo-900">
                  {formatCurrency(viewModal.modalData.netSalary)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Voucher Slip
              </Button>
              <Button variant="primary" size="sm" onClick={viewModal.close}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DELETE CONFIRMATION */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Purge Payroll Record"
        description="Are you certain you wish to delete this salary voucher?"
        size="sm"
      >
        {deleteModal.modalData && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800">
                <p className="font-bold">
                  Delete Payslip for {deleteModal.modalData.employeeName}?
                </p>
                <p className="mt-0.5 font-mono">
                  Period: {deleteModal.modalData.payPeriod} &bull; Net: {formatCurrency(deleteModal.modalData.netSalary)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
