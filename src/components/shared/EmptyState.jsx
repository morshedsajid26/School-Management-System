import React from "react";
import Button from "@/components/ui/Button";
import { FolderSearch } from "lucide-react";

export default function EmptyState({
  icon: Icon = FolderSearch,
  title = "No records found",
  description = "Try adjusting your search query or filter options.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
