"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  mockLeaveApplications,
  mockLeaveTypes,
} from "@/data/mock/leave";

let leaveStore = {
  applications: [...mockLeaveApplications],
  leaveTypes: [...mockLeaveTypes],
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
  return leaveStore;
}

function getServerSnapshot() {
  return leaveStore;
}

export function useLeave() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { applications, leaveTypes } = store;

  // Apply Leave
  const applyLeave = useCallback((newApp) => {
    const id = `LV-2026-${String(leaveStore.applications.length + 1).padStart(3, "0")}`;
    const days = parseInt(newApp.totalDays, 10) || 1;

    const created = {
      id,
      applicantId: newApp.applicantId || "APP-GEN",
      applicantName: newApp.applicantName,
      applicantEmail: newApp.applicantEmail || "",
      role: newApp.role || "Teacher",
      department: newApp.department || "General",
      leaveType: newApp.leaveType || "Casual Leave",
      startDate: newApp.startDate || "2026-03-25",
      endDate: newApp.endDate || "2026-03-26",
      totalDays: days,
      reason: newApp.reason || "Personal grounds",
      emergencyContact: newApp.emergencyContact || "Registered phone",
      status: "Pending",
      appliedDate: "2026-03-24",
      reviewedBy: null,
      reviewedDate: null,
      remarks: "",
    };

    leaveStore = {
      ...leaveStore,
      applications: [created, ...leaveStore.applications],
    };
    emitChange();
    return created;
  }, []);

  // Approve Leave Action
  const approveLeave = useCallback((appId, remarks = "Leave approved as requested.") => {
    leaveStore = {
      ...leaveStore,
      applications: leaveStore.applications.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: "Approved",
              reviewedBy: "Dean Robert Sterling",
              reviewedDate: "2026-03-24",
              remarks: remarks || "Approved by administration.",
            }
          : app
      ),
    };
    emitChange();
    return { success: true };
  }, []);

  // Reject Leave Action
  const rejectLeave = useCallback((appId, remarks = "Leave request could not be accommodated.") => {
    leaveStore = {
      ...leaveStore,
      applications: leaveStore.applications.map((app) =>
        app.id === appId
          ? {
              ...app,
              status: "Rejected",
              reviewedBy: "Dean Robert Sterling",
              reviewedDate: "2026-03-24",
              remarks: remarks || "Application declined by administration.",
            }
          : app
      ),
    };
    emitChange();
    return { success: true };
  }, []);

  // Delete Application
  const deleteLeave = useCallback((appId) => {
    leaveStore = {
      ...leaveStore,
      applications: leaveStore.applications.filter((app) => app.id !== appId),
    };
    emitChange();
  }, []);

  // Reset to default
  const resetLeaveData = useCallback(() => {
    leaveStore = {
      applications: [...mockLeaveApplications],
      leaveTypes: [...mockLeaveTypes],
    };
    emitChange();
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const totalApps = applications.length;
    const pendingCount = applications.filter((a) => a.status === "Pending").length;
    const approvedCount = applications.filter((a) => a.status === "Approved").length;
    const rejectedCount = applications.filter((a) => a.status === "Rejected").length;
    const totalDaysApproved = applications
      .filter((a) => a.status === "Approved")
      .reduce((acc, a) => acc + (a.totalDays || 0), 0);

    return {
      totalApps,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalDaysApproved,
    };
  }, [applications]);

  return {
    applications,
    leaveTypes,
    stats,
    applyLeave,
    approveLeave,
    rejectLeave,
    deleteLeave,
    resetLeaveData,
  };
}

export default useLeave;
