import React from "react";
import { cn } from "@/utils/cn";

export function Table({ children, className = "", ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80">
      <table className={cn("w-full text-left border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={cn("bg-slate-50/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500", className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={cn("divide-y divide-slate-100 bg-white", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", hover = true, ...props }) {
  return (
    <tr
      className={cn(
        "transition-colors duration-150",
        hover && "hover:bg-slate-50/70",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }) {
  return (
    <th className={cn("py-3 px-4 font-semibold text-slate-600", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }) {
  return (
    <td className={cn("py-3.5 px-4 text-slate-700 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export default Table;
