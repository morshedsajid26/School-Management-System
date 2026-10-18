"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeDollarSign,
  Layers,
  Receipt,
  CreditCard,
  History,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

export default function FinanceNavTabs({ className = "" }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: "/admin/finance", icon: LayoutDashboard, exact: true },
    { label: "Fee Structure", href: "/admin/finance/structure", icon: Layers },
    { label: "Student Invoices", href: "/admin/finance/invoices", icon: Receipt },
    { label: "Payment Collection", href: "/admin/finance/collection", icon: CreditCard },
    { label: "Payment History", href: "/admin/finance/history", icon: History },
    { label: "Outstanding Dues", href: "/admin/finance/dues", icon: AlertCircle },
  ];

  return (
    <div className={`flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto mb-6 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              isActive
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
