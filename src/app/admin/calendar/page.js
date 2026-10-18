"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import StatsCard from "@/components/ui/StatsCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import EmptyState from "@/components/shared/EmptyState";
import {
  mockCalendarEvents,
  EVENT_CATEGORIES,
  CATEGORY_COLORS,
} from "@/data/mock/calendarEvents";
import { formatDate } from "@/utils/formatters";
import { useModal } from "@/hooks/useModal";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  List,
  Grid,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function AdminCalendarPage() {
  const [events, setEvents] = useState(mockCalendarEvents);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" | "list"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Month navigation state: Year 2026, Month index 2 (March)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));

  // Modals
  const eventModal = useModal();
  const detailModal = useModal();
  const confirmModal = useModal();

  // Form State
  const [editingEventId, setEditingEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: EVENT_CATEGORIES.EVENT,
    date: "2026-03-25",
    endDate: "",
    time: "09:00 AM - 11:00 AM",
    venue: "Main Campus Auditorium",
    audience: "Entire School Community",
    description: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Month navigation functions
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 2, 1)); // Default demo March 2026
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      !search ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.venue?.toLowerCase().includes(search.toLowerCase()) ||
      ev.audience?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || ev.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Days array for calendar grid (42 cells: 6 rows of 7 days)
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      dateString: `${year}-${String(month).padStart(2, "0")}-${String(daysInPrevMonth - i).padStart(2, "0")}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateString: dayStr,
      isToday: dayStr === "2026-03-18",
    });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let n = 1; n <= remainingCells; n++) {
    calendarCells.push({
      dayNumber: n,
      isCurrentMonth: false,
      dateString: `${year}-${String(month + 2).padStart(2, "0")}-${String(n).padStart(2, "0")}`,
    });
  }

  // Open Create Modal
  const handleOpenCreate = (prefillDate = null) => {
    setEditingEventId(null);
    setFormData({
      title: "",
      category: EVENT_CATEGORIES.EVENT,
      date: prefillDate || "2026-03-25",
      endDate: "",
      time: "09:00 AM - 11:00 AM",
      venue: "Main Campus Auditorium",
      audience: "All Students & Faculty",
      description: "",
    });
    setFormErrors({});
    eventModal.open();
  };

  // Open Edit Modal
  const handleOpenEdit = (evt) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      category: evt.category,
      date: evt.date,
      endDate: evt.endDate || "",
      time: evt.time,
      venue: evt.venue,
      audience: evt.audience,
      description: evt.description || "",
    });
    setFormErrors({});
    eventModal.open();
  };

  // Validate Event Form
  const validateEvent = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Event title is required.";
    }

    if (!formData.date) {
      errors.date = "Event date is required.";
    }

    if (formData.endDate && formData.date) {
      if (new Date(formData.endDate) < new Date(formData.date)) {
        errors.endDate = "Event conclusion date cannot be earlier than start date.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!validateEvent()) return;

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingEventId
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const newEvt = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        ...formData,
      };
      setEvents([newEvt, ...events]);
    }

    eventModal.close();
  };

  const promptDeleteEvent = (evt) => {
    confirmModal.open({
      title: `Delete "${evt.title}"?`,
      message: `Are you sure you want to remove this event from the public school calendar? This will affect academic reminders.`,
      confirmText: "Delete Event",
      variant: "danger",
      action: () => {
        setEvents((prev) => prev.filter((item) => item.id !== evt.id));
        confirmModal.close();
        detailModal.close();
      },
    });
  };

  // Get events on a specific date string
  const getEventsForDate = (dateStr) => {
    return filteredEvents.filter((ev) => {
      if (ev.date === dateStr) return true;
      if (ev.endDate && dateStr >= ev.date && dateStr <= ev.endDate) return true;
      return false;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="School Calendar & Important Dates"
        subtitle="Manage academic schedules, examination weeks, public holidays, and campus events."
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "calendar"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Grid className="h-4 w-4" /> Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="h-4 w-4" /> List View
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => handleOpenCreate()}
            >
              Add Event / Holiday
            </Button>
          </div>
        }
      />

      {/* Month Navigation & Filter Controls */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Month Switcher */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <h2 className="text-base font-bold text-slate-900 min-w-[160px] text-center">
                {monthNames[month]} {year}
              </h2>

              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                title="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={goToToday}
                className="ml-1"
              >
                Today
              </Button>
            </div>

            {/* Category Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-56">
                <Input
                  placeholder="Search events, venues..."
                  icon={Search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-44">
                <Select
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={[
                    { label: "All Categories", value: "all" },
                    { label: "Examinations", value: EVENT_CATEGORIES.EXAMINATION },
                    { label: "Holidays", value: EVENT_CATEGORIES.HOLIDAY },
                    { label: "School Events", value: EVENT_CATEGORIES.EVENT },
                    { label: "Meetings", value: EVENT_CATEGORIES.MEETING },
                    { label: "Deadlines", value: EVENT_CATEGORIES.DEADLINE },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= CALENDAR VIEW ================= */}
      {viewMode === "calendar" && (
        <Card className="overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* 42 Calendar Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
            {calendarCells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.dateString);

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenCreate(cell.dateString)}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    cell.isCurrentMonth
                      ? "bg-white hover:bg-slate-50/80"
                      : "bg-slate-50/40 text-slate-400"
                  } ${cell.isToday ? "bg-indigo-50/30" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold flex items-center justify-center h-6 w-6 rounded-full ${
                        cell.isToday
                          ? "bg-indigo-600 text-white shadow-xs"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreate(cell.dateString);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition"
                      title="Add event on this date"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Events list within cell */}
                  <div className="space-y-1 mt-1 flex-1">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const color = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS[EVENT_CATEGORIES.EVENT];
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            detailModal.open(ev);
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold truncate border transition hover:opacity-90 ${color.bg}`}
                          title={`${ev.title} (${ev.time})`}
                        >
                          {ev.title}
                        </div>
                      );
                    })}

                    {dayEvents.length > 2 && (
                      <span className="text-[10px] font-bold text-slate-500 pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Category Legend */}
          <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-center gap-5 flex-wrap text-xs text-slate-600">
            {Object.entries(EVENT_CATEGORIES).map(([key, label]) => {
              const config = CATEGORY_COLORS[label];
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Chronological Schedule of Events & Holidays</CardTitle>
              <CardDescription>
                Showing {filteredEvents.length} calendar entries matching active filters.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Event & Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Timing & Venue</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((evt) => {
                    const color = CATEGORY_COLORS[evt.category] || CATEGORY_COLORS[EVENT_CATEGORIES.EVENT];
                    return (
                      <TableRow key={evt.id}>
                        <TableCell>
                          <div
                            onClick={() => detailModal.open(evt)}
                            className="cursor-pointer group"
                          >
                            <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                              {evt.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                              {evt.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={color.badge} size="sm">
                            {evt.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {formatDate(evt.date)}
                          {evt.endDate && ` – ${formatDate(evt.endDate)}`}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-700 font-medium">
                            {evt.time}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {evt.venue}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {evt.audience}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(evt)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Edit Event"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => promptDeleteEvent(evt)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No events match criteria"
                description="Try selecting a different category or clear the search query."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={eventModal.isOpen}
        onClose={eventModal.close}
        title={editingEventId ? "Modify Calendar Entry" : "Create Calendar Entry"}
        description="Schedule academic tests, public holidays, assemblies, or administrative deadlines."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={eventModal.close}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEvent}>
              {editingEventId ? "Save Modifications" : "Publish to Calendar"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <Input
            label="Event / Milestone Title *"
            placeholder="e.g. Midterm Examinations Week"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Event Classification"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={Object.values(EVENT_CATEGORIES)}
            />
            <Input
              label="Timing"
              placeholder="e.g. 09:00 AM - 12:00 PM"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
            />
            <Input
              label="End Date (Optional)"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={formErrors.endDate}
              helperText="Fill only if multi-day event or recess"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Venue / Location"
              placeholder="e.g. Science Hall 201"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
            <Input
              label="Target Audience"
              placeholder="e.g. Grade 10 Students"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            />
          </div>

          <Input
            label="Event Description"
            placeholder="Additional agenda or briefing notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Event Details Preview Modal */}
      {detailModal.modalData && (
        <Modal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          title="Event Briefing & Schedule"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => promptDeleteEvent(detailModal.modalData)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => {
                    detailModal.close();
                    handleOpenEdit(detailModal.modalData);
                  }}
                >
                  Edit Event
                </Button>
                <Button variant="secondary" size="sm" onClick={detailModal.close}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    CATEGORY_COLORS[detailModal.modalData.category]?.badge || "indigo"
                  }
                >
                  {detailModal.modalData.category}
                </Badge>
                <span className="text-xs font-mono text-slate-500">
                  {formatDate(detailModal.modalData.date)}
                  {detailModal.modalData.endDate && ` – ${formatDate(detailModal.modalData.endDate)}`}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {detailModal.modalData.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {detailModal.modalData.description || "No extended agenda provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Timing</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.time}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Venue</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.venue}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                <span className="text-slate-400 block font-semibold mb-0.5">Audience</span>
                <span className="text-slate-800 font-medium">{detailModal.modalData.audience}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {confirmModal.modalData && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={confirmModal.close}
          title={confirmModal.modalData.title}
          description={confirmModal.modalData.message}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={confirmModal.close}>
                Cancel
              </Button>
              <Button
                variant={confirmModal.modalData.variant || "primary"}
                size="sm"
                onClick={confirmModal.modalData.action}
              >
                {confirmModal.modalData.confirmText || "Confirm"}
              </Button>
            </>
          }
        >
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <span>This action will update the school calendar in local state.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
