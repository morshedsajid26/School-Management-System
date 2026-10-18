"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { schoolInfo } from "@/data/mock/school";
import { ROLE_LABELS, ROLE_COLORS, ROLES } from "@/utils/constants";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Dropdown, { DropdownItem, DropdownHeader, DropdownDivider } from "@/components/ui/Dropdown";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  Menu,
  Search,
  Bell,
  ArrowLeftRight,
  Calendar,
  LogOut,
  Settings,
  User,
  Check,
  CheckCheck,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";

export default function Header({
  onOpenMobileSidebar = () => {},
  onOpenRoleSwitcher = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
}) {
  const router = useRouter();
  const { currentRole, currentUser, logout } = useAuth();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Term 2 Tuition Invoices Due",
      message: "18 student fee invoices remain unsettled before midterm cutoffs.",
      time: "10m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Staff Academic Briefing",
      message: "Monthly meeting scheduled for 3:30 PM in Science Hall 201.",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "Attendance Sync Complete",
      message: "Biometric and homeroom morning attendance synchronized (95.4%).",
      time: "3h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markSingleRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMockLogout = () => {
    logout();
    router.push("/login");
  };

  // Keyboard shortcut Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchResults = [
    { title: "Liam Alexander Chen", category: "Student (10-A)", href: "/admin/students" },
    { title: "Prof. Marcus Aurel", category: "Faculty (Physics)", href: "/admin/teachers" },
    { title: "Grade 10 - Section A", category: "Classroom 201", href: "/admin/classes" },
    { title: "Tuition Fee Payments Ledger", category: "Finance", href: "/admin/finance" },
    { title: "School Profile & Terms", category: "Settings", href: "/admin/settings" },
    { title: "Daily Attendance Verification", category: "Attendance", href: "/admin/attendance" },
  ].filter((item) =>
    searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            type="button"
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            title="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:block min-w-0">
            <Breadcrumb />
          </div>
        </div>

        {/* Right Navigation Elements */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          {/* Quick Search UI Trigger Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition duration-150"
            title="Quick search (Ctrl + K)"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <span className="hidden md:inline">Quick search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
              Ctrl K
            </kbd>
          </button>

          {/* Academic Session Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 text-xs font-medium border border-slate-200">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{schoolInfo.currentAcademicYear}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-bold">{schoolInfo.currentTerm.split(" ")[0]}</span>
          </div>

          {/* Quick Persona Switch Button */}
          <button
            onClick={onOpenRoleSwitcher}
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold transition"
            title="Switch Persona / Role"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Role:</span>
            <span className="truncate max-w-[90px]">{ROLE_LABELS[currentRole].split(" ")[0]}</span>
          </button>

          {/* Notification Dropdown */}
          <Dropdown
            align="right"
            width="w-80 sm:w-96"
            trigger={
              <button
                type="button"
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition duration-150 focus:outline-none"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white" />
                  </span>
                )}
              </button>
            }
          >
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markSingleRead(item.id)}
                  className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                    item.unread ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="mt-1">
                    <span
                      className={`block h-2 w-2 rounded-full ${
                        item.unread ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-slate-100 text-center bg-slate-50/60 rounded-b-2xl">
              <Link
                href="/admin/communication"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 block py-1"
              >
                View all announcements & alerts →
              </Link>
            </div>
          </Dropdown>

          {/* Profile Menu Dropdown with Mock Logout */}
          <Dropdown
            align="right"
            width="w-64"
            trigger={
              <button
                type="button"
                className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
              >
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  size="sm"
                  status="online"
                />
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            }
          >
            <DropdownHeader>
              <div className="flex items-center gap-3">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {currentUser?.email}
                  </p>
                  <div className="mt-1">
                    <Badge variant="indigo" size="sm">
                      {ROLE_LABELS[currentRole]}
                    </Badge>
                  </div>
                </div>
              </div>
            </DropdownHeader>

            <DropdownItem
              icon={Settings}
              onClick={() => router.push("/admin/settings")}
            >
              School Settings
            </DropdownItem>

            <DropdownItem
              icon={ArrowLeftRight}
              onClick={onOpenRoleSwitcher}
            >
              Switch Role / Persona
            </DropdownItem>

            <DropdownDivider />

            <DropdownItem
              icon={LogOut}
              variant="danger"
              onClick={handleMockLogout}
            >
              Mock Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      {/* Global Quick Search Modal Dialog */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search students, staff, classes, finance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Direct Navigation Links
              </p>
              {searchResults.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setSearchModalOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {item.category}
                  </span>
                </Link>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">ESC</kbd> to exit</span>
              <span>Oakridge SMS Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
