"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { mockAuditLogs } from "@/data/mock/auditLogs";

let auditStore = {
  logs: [...mockAuditLogs],
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
  return auditStore;
}

function getServerSnapshot() {
  return auditStore;
}

export function logAuditEvent(action, module, details, status = "Success", severity = "Low") {
  const now = new Date();
  const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 8)}`;
  const newEntry = {
    id: `AUD-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    user: {
      name: "Dr. Eleanor Vance",
      role: "Super Administrator",
      email: "eleanor.vance@apexacademy.edu",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    },
    action,
    module,
    timestamp,
    status,
    ipAddress: "192.168.1.104",
    device: "Desktop (Windows 11 / Chrome 129)",
    details,
    severity,
  };

  auditStore = {
    logs: [newEntry, ...auditStore.logs],
  };
  emitChange();
  return newEntry;
}

export function useAuditLogs() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { logs } = store;

  const addLog = useCallback(
    (action, module, details, status = "Success", severity = "Low") => {
      return logAuditEvent(action, module, details, status, severity);
    },
    []
  );

  const resetLogs = useCallback(() => {
    auditStore = {
      logs: [...mockAuditLogs],
    };
    emitChange();
  }, []);

  const clearLogs = useCallback(() => {
    auditStore = {
      logs: [],
    };
    emitChange();
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const successCount = logs.filter((l) => l.status === "Success").length;
    const warningCount = logs.filter((l) => l.status === "Warning").length;
    const failedCount = logs.filter((l) => l.status === "Failed").length;
    const highSeverityCount = logs.filter((l) => l.severity === "High").length;
    const uniqueUsers = new Set(logs.map((l) => l.user?.name)).size;

    return {
      total,
      successCount,
      warningCount,
      failedCount,
      highSeverityCount,
      uniqueUsers,
    };
  }, [logs]);

  return {
    logs,
    stats,
    addLog,
    resetLogs,
    clearLogs,
  };
}

export default useAuditLogs;
