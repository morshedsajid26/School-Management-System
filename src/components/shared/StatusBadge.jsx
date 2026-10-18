import React from "react";
import Badge from "@/components/ui/Badge";

export default function StatusBadge({ status = "active", className = "" }) {
  const normalized = String(status).toLowerCase();

  const statusMap = {
    active: { label: "Active", variant: "emerald" },
    inactive: { label: "Inactive", variant: "slate" },
    paid: { label: "Paid", variant: "emerald" },
    pending: { label: "Pending", variant: "amber" },
    overdue: { label: "Overdue", variant: "rose" },
    partial: { label: "Partial", variant: "blue" },
    present: { label: "Present", variant: "emerald" },
    absent: { label: "Absent", variant: "rose" },
    late: { label: "Late", variant: "amber" },
    excused: { label: "Excused", variant: "purple" },
  };

  const config = statusMap[normalized] || {
    label: status,
    variant: "slate",
  };

  return (
    <Badge variant={config.variant} dot size="sm" className={className}>
      {config.label}
    </Badge>
  );
}
