"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { navigationConfig } from "@/data/mock/navigation";
import { schoolInfo } from "@/data/mock/school";
import { ROLE_LABELS, ROLES } from "@/utils/constants";
import Avatar from "@/components/ui/Avatar";
import {
  LayoutDashboard,
  GraduationCap,
  Users2,
  School,
  CalendarCheck,
  BadgeDollarSign,
  Settings,
  BookOpen,
  ClipboardCheck,
  Award,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  ReceiptText,
  PieChart,
  Megaphone,
  Library,
  Briefcase,
  BarChart3,
  ArrowLeftRight,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  GraduationCap,
  Users2,
  School,
  CalendarCheck,
  BadgeDollarSign,
  Settings,
  BookOpen,
  ClipboardCheck,
  Award,
  Calendar,
  FileText,
  Receipt,
  CreditCard,
  ReceiptText,
  PieChart,
  Megaphone,
  Library,
  Briefcase,
  BarChart3,
};

export default function Sidebar({
  mobileOpen = false,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onCloseMobile = () => {},
  onOpenRoleSwitcher = () => {},
}) {
  const pathname = usePathname();
  const { currentRole, currentUser } = useAuth();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const navGroups = navigationConfig[currentRole] || navigationConfig[ROLES.ADMIN];

  const toggleSubMenu = (label) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const renderIcon = (iconName, className = "h-4 w-4") => {
    const IconComponent = ICON_MAP[iconName] || LayoutDashboard;
    return <IconComponent className={`${className} shrink-0`} />;
  };

  const isLinkActive = (href, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand / Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link
            href={`/${currentRole}`}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <School className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="text-sm font-bold text-white tracking-tight block truncate">
                  {schoolInfo.shortName}
                </span>
                <p className="text-[10px] text-indigo-400 font-mono tracking-wider truncate">
                  {schoolInfo.code}
                </p>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onToggleCollapse}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Persona Banner (hidden when collapsed) */}
        {!isCollapsed ? (
          <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 truncate">
                {ROLE_LABELS[currentRole]}
              </span>
            </div>
            <button
              onClick={onOpenRoleSwitcher}
              title="Switch Active Persona"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 transition shrink-0"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>Switch</span>
            </button>
          </div>
        ) : (
          <div className="py-2 flex justify-center border-b border-slate-800">
            <button
              onClick={onOpenRoleSwitcher}
              title={`Switch Persona (${ROLE_LABELS[currentRole]})`}
              className="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-800 transition"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.group && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {group.group}
                </p>
              )}
              {isCollapsed && group.group && (
                <div className="h-px bg-slate-800 my-2 mx-1" />
              )}

              {group.items.map((item) => {
                const active = isLinkActive(item.href, item.exact);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubOpen = openSubMenus[item.label] || active;

                return (
                  <div key={item.href} className="relative">
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        className={`group flex items-center flex-1 rounded-xl text-xs font-medium transition-all duration-150 ${
                          isCollapsed
                            ? "justify-center p-2.5"
                            : "justify-between px-3 py-2"
                        } ${
                          active
                            ? "bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/40"
                            : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {renderIcon(item.icon, isCollapsed ? "h-5 w-5" : "h-4 w-4")}
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && !hasSubItems && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              active
                                ? "bg-indigo-700 text-white"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>

                      {/* Expand / Collapse Submenu Button */}
                      {!isCollapsed && hasSubItems && (
                        <button
                          type="button"
                          onClick={() => toggleSubMenu(item.label)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 ml-1 transition"
                          title="Toggle sub-items"
                        >
                          {isSubOpen ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Submenu Accordion */}
                    {!isCollapsed && hasSubItems && isSubOpen && (
                      <div className="mt-1 ml-6 pl-2.5 border-l border-slate-800 space-y-1">
                        {item.subItems.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                subActive
                                  ? "text-indigo-400 font-semibold bg-slate-800/60"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Area */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/50 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  size="sm"
                  status="online"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                title="Mock Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                size="sm"
                status="online"
              />
              <Link
                href="/login"
                title="Mock Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
