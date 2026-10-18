"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import CommunicationNavTabs from "@/components/shared/CommunicationNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/shared/EmptyState";
import { mockNotificationsList } from "@/data/mock/notices";
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  BookOpen,
  DollarSign,
  CalendarCheck,
  Shield,
  Megaphone,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  Inbox,
} from "lucide-react";

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState(mockNotificationsList);
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unreadCount = notifications.filter((n) => n.unread).length;
    const highPriority = notifications.filter((n) => n.priority === "high").length;
    const systemCount = notifications.filter((n) => n.category === "Security" || n.category === "Attendance").length;

    return { total, unreadCount, highPriority, systemCount };
  }, [notifications]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesRead =
        readFilter === "all" ||
        (readFilter === "unread" && item.unread) ||
        (readFilter === "read" && !item.unread);

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesRead && matchesCategory;
    });
  }, [notifications, search, readFilter, categoryFilter]);

  // Mark single read/unread toggle
  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  // Mark all read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast("All notifications marked as read.");
  };

  // Clear single notification
  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification dismissed.", "info");
  };

  // Clear all read notifications
  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => n.unread));
    showToast("Read notifications cleared.");
  };

  // Category Icon & Styling Helper
  const getCategoryConfig = (category) => {
    switch (category) {
      case "Academic":
        return {
          icon: BookOpen,
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "Finance":
        return {
          icon: DollarSign,
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "Attendance":
        return {
          icon: CalendarCheck,
          bg: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "Security":
        return {
          icon: Shield,
          bg: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "Notice":
        return {
          icon: Megaphone,
          bg: "bg-amber-50 text-amber-700 border-amber-200",
        };
      default:
        return {
          icon: Bell,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Notifications & System Alerts Center"
        description="Review operational notifications, examination milestones, bursary collections, and attendance alerts."
        actions={
          <div className="flex items-center gap-2">
            {stats.unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark All Read</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              className="flex items-center gap-1.5 text-slate-600"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Read</span>
            </Button>
          </div>
        }
      />

      {/* Shared Navigation Tabs */}
      <CommunicationNavTabs />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Unread Alerts"
          value={stats.unreadCount}
          icon={Bell}
          trend={{ value: `${stats.unreadCount > 0 ? "Requires review" : "Up to date"}`, isPositive: stats.unreadCount === 0 }}
        />
        <StatsCard
          title="Total Logged Alerts"
          value={stats.total}
          icon={Inbox}
          trend={{ value: "All modules", isPositive: true }}
        />
        <StatsCard
          title="High Priority Alerts"
          value={stats.highPriority}
          icon={AlertCircle}
          trend={{ value: "Immediate follow-up", isPositive: false }}
        />
        <StatsCard
          title="Operational Telemetry"
          value={`${stats.systemCount} Events`}
          icon={Shield}
          trend={{ value: "Security & Attendance", isPositive: true }}
        />
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search alerts by subject, message content, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-3">
              <Select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
              >
                <option value="all">All Read Statuses</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Notifications</option>
              </Select>

              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Alert Categories</option>
                <option value="Academic">Academic</option>
                <option value="Finance">Finance & Bursary</option>
                <option value="Attendance">Attendance</option>
                <option value="Security">Security & Access</option>
                <option value="Notice">Notice Bulletins</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={CheckCheck}
                title="No notifications in this filter"
                description="You are completely caught up! New alerts will automatically stream in here."
                actionLabel="View All Notifications"
                onAction={() => {
                  setSearch("");
                  setReadFilter("all");
                  setCategoryFilter("all");
                }}
              />
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((item) => {
            const conf = getCategoryConfig(item.category);
            const Icon = conf.icon;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                  item.unread
                    ? "bg-white border-indigo-200/90 shadow-sm"
                    : "bg-slate-50/60 border-slate-200/80 text-slate-600"
                }`}
              >
                {/* Category Icon */}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border flex-shrink-0 mt-0.5 ${conf.bg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          item.unread ? "text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.unread && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0" />
                      )}
                      {item.priority === "high" && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.2 rounded-md">
                          High Priority
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {item.time} ({item.date})
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
                        >
                          <span>Open Related Module</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleRead(item.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-2 py-1 rounded-md hover:bg-slate-100 transition"
                      >
                        {item.unread ? "Mark as Read" : "Mark as Unread"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Dismiss Notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
