"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockPayrollRecords,
  mockPayPeriods,
} from "@/data/mock/payroll";

let payrollStore = {
  records: [...mockPayrollRecords],
  payPeriods: [...mockPayPeriods],
};

const listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return payrollStore;
}

function getServerSnapshot() {
  return payrollStore;
}

export function usePayroll() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { records, payPeriods } = store;

  // Add Payslip Record
  const addPayrollRecord = useCallback((newRec) => {
    const id = `PAY-2026-${String(payrollStore.records.length + 1).padStart(3, "0")}`;
    const base = parseFloat(newRec.baseSalary) || 0;
    const allowances = {
      housing: parseFloat(newRec.housing) || 0,
      transport: parseFloat(newRec.transport) || 0,
      medical: parseFloat(newRec.medical) || 0,
      academicBonus: parseFloat(newRec.academicBonus) || 0,
    };
    const deductions = {
      tax: parseFloat(newRec.tax) || 0,
      healthInsurance: parseFloat(newRec.healthInsurance) || 0,
      pension: parseFloat(newRec.pension) || 0,
    };

    const totalAllowances =
      allowances.housing +
      allowances.transport +
      allowances.medical +
      allowances.academicBonus;

    const totalDeductions =
      deductions.tax + deductions.healthInsurance + deductions.pension;

    const netSalary = Math.max(0, base + totalAllowances - totalDeductions);

    const created = {
      id,
      employeeId: newRec.employeeId || "EMP-GEN",
      employeeName: newRec.employeeName,
      role: newRec.role || "Teacher",
      designation: newRec.designation || "Faculty Member",
      department: newRec.department || "Academics",
      payPeriod: newRec.payPeriod || "March 2026",
      baseSalary: base,
      allowances,
      deductions,
      netSalary,
      paymentStatus: newRec.paymentStatus || "Pending",
      paymentMethod: newRec.paymentMethod || "Direct Deposit (ACH)",
      paymentDate: newRec.paymentDate || "2026-03-28",
      bankAccount: newRec.bankAccount || "Registered Payroll Bank",
    };

    payrollStore = {
      ...payrollStore,
      records: [created, ...payrollStore.records],
    };
    emitChange();
    return created;
  }, []);

  // Update Record
  const updatePayrollRecord = useCallback((recId, updatedFields) => {
    payrollStore = {
      ...payrollStore,
      records: payrollStore.records.map((r) => {
        if (r.id !== recId) return r;

        const base =
          parseFloat(updatedFields.baseSalary) !== undefined
            ? parseFloat(updatedFields.baseSalary)
            : r.baseSalary;

        const allowances = {
          housing:
            parseFloat(updatedFields.housing) !== undefined
              ? parseFloat(updatedFields.housing)
              : r.allowances.housing,
          transport:
            parseFloat(updatedFields.transport) !== undefined
              ? parseFloat(updatedFields.transport)
              : r.allowances.transport,
          medical:
            parseFloat(updatedFields.medical) !== undefined
              ? parseFloat(updatedFields.medical)
              : r.allowances.medical,
          academicBonus:
            parseFloat(updatedFields.academicBonus) !== undefined
              ? parseFloat(updatedFields.academicBonus)
              : r.allowances.academicBonus,
        };

        const deductions = {
          tax:
            parseFloat(updatedFields.tax) !== undefined
              ? parseFloat(updatedFields.tax)
              : r.deductions.tax,
          healthInsurance:
            parseFloat(updatedFields.healthInsurance) !== undefined
              ? parseFloat(updatedFields.healthInsurance)
              : r.deductions.healthInsurance,
          pension:
            parseFloat(updatedFields.pension) !== undefined
              ? parseFloat(updatedFields.pension)
              : r.deductions.pension,
        };

        const totalAllowances =
          allowances.housing +
          allowances.transport +
          allowances.medical +
          allowances.academicBonus;

        const totalDeductions =
          deductions.tax + deductions.healthInsurance + deductions.pension;

        const netSalary = Math.max(0, base + totalAllowances - totalDeductions);

        return {
          ...r,
          ...updatedFields,
          baseSalary: base,
          allowances,
          deductions,
          netSalary,
        };
      }),
    };
    emitChange();
  }, []);

  // Mark as Paid
  const markAsPaid = useCallback((recId) => {
    payrollStore = {
      ...payrollStore,
      records: payrollStore.records.map((r) =>
        r.id === recId
          ? {
              ...r,
              paymentStatus: "Paid",
              paymentDate: "2026-03-24",
            }
          : r
      ),
    };
    emitChange();
    return { success: true };
  }, []);

  // Delete Record
  const deletePayrollRecord = useCallback((recId) => {
    payrollStore = {
      ...payrollStore,
      records: payrollStore.records.filter((r) => r.id !== recId),
    };
    emitChange();
  }, []);

  // Reset to default
  const resetPayrollData = useCallback(() => {
    payrollStore = {
      records: [...mockPayrollRecords],
      payPeriods: [...mockPayPeriods],
    };
    emitChange();
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const totalRecords = records.length;
    const paidRecords = records.filter((r) => r.paymentStatus === "Paid");
    const pendingRecords = records.filter((r) => r.paymentStatus === "Pending");

    const totalDisbursed = paidRecords.reduce(
      (acc, r) => acc + (r.netSalary || 0),
      0
    );
    const totalPending = pendingRecords.reduce(
      (acc, r) => acc + (r.netSalary || 0),
      0
    );
    const totalNetPayroll = records.reduce(
      (acc, r) => acc + (r.netSalary || 0),
      0
    );

    return {
      totalRecords,
      paidCount: paidRecords.length,
      pendingCount: pendingRecords.length,
      totalDisbursed,
      totalPending,
      totalNetPayroll,
      averageNetSalary: totalRecords > 0 ? Math.round(totalNetPayroll / totalRecords) : 0,
    };
  }, [records]);

  return {
    records,
    payPeriods,
    stats,
    addPayrollRecord,
    updatePayrollRecord,
    markAsPaid,
    deletePayrollRecord,
    resetPayrollData,
  };
}

export default usePayroll;
