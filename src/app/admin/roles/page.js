"use client";

import React, { useState, useMemo } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useRolesAndPermissions } from "@/hooks/useRolesAndPermissions";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  Info,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  BadgeDollarSign,
  BookOpenCheck,
  Bus,
  Boxes,
  CreditCard,
  Settings,
  Sparkles,
} from "lucide-react";

// Module icon mapping
const MODULE_ICONS = {
  students: Users,
  academics: GraduationCap,
  attendance: CalendarCheck,
  examinations: Award,
  finance: BadgeDollarSign,
  library: BookOpenCheck,
  transport: Bus,
  inventory: Boxes,
  payroll: CreditCard,
  leave: CalendarCheck,
  certificates: Award,
  settings: Settings,
};

const COLOR_CLASSES = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    ring: "ring-indigo-500",
    accent: "bg-indigo-600",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    ring: "ring-blue-500",
    accent: "bg-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-500",
    accent: "bg-emerald-600",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    ring: "ring-amber-500",
    accent: "bg-amber-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    ring: "ring-purple-500",
    accent: "bg-purple-600",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    ring: "ring-orange-500",
    accent: "bg-orange-600",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
    ring: "ring-cyan-500",
    accent: "bg-cyan-600",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    ring: "ring-rose-500",
    accent: "bg-rose-600",
  },
};

export default function RolesAndPermissionsPage() {
  const {
    roles,
    permissionGroups,
    stats,
    updateRolePermission,
    toggleModuleAll,
    grantAllRolePermissions,
    revokeAllRolePermissions,
    addRole,
    updateRoleMeta,
    deleteRole,
    resetToDefaults,
  } = useRolesAndPermissions();

  const [selectedRoleId, setSelectedRoleId] = useState("ROLE-ADMIN");
  const [roleSearch, setRoleSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    code: "",
    description: "",
    color: "indigo",
    userCount: "0",
  });

  const [editRoleForm, setEditRoleForm] = useState({
    name: "",
    code: "",
    description: "",
    color: "indigo",
    userCount: "0",
  });

  // Active selected role
  const activeRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || null;
  }, [roles, selectedRoleId]);

  // Filtered roles list for left panel
  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [roles, roleSearch]);

  // Filtered modules for permissions table
  const filteredModules = useMemo(() => {
    if (!moduleSearch.trim()) return permissionGroups;
    const q = moduleSearch.toLowerCase();
    return permissionGroups.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
    );
  }, [permissionGroups, moduleSearch]);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Open Edit Role modal
  const handleOpenEdit = () => {
    if (!activeRole) return;
    setEditRoleForm({
      name: activeRole.name,
      code: activeRole.code,
      description: activeRole.description,
      color: activeRole.color || "indigo",
      userCount: String(activeRole.userCount || 0),
    });
    setIsEditRoleOpen(true);
  };

  // Submit edit role
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!activeRole) return;
    updateRoleMeta(activeRole.id, editRoleForm);
    setIsEditRoleOpen(false);
    showToast(`Updated role profile for "${editRoleForm.name}".`);
  };

  // Submit add role
  const handleSaveNewRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;
    const created = addRole(newRoleForm);
    setSelectedRoleId(created.id);
    setIsAddRoleOpen(false);
    setNewRoleForm({
      name: "",
      code: "",
      description: "",
      color: "indigo",
      userCount: "0",
    });
    showToast(`Created custom role "${created.name}".`);
  };

  // Confirm delete role
  const handleConfirmDelete = () => {
    if (!activeRole) return;
    const res = deleteRole(activeRole.id);
    if (!res.success) {
      showToast(res.error, "error");
    } else {
      setSelectedRoleId("ROLE-ADMIN");
      showToast(`Role "${activeRole.name}" deleted.`);
    }
    setIsDeleteModalOpen(false);
  };

  // Access Tier Badge helper
  const getModuleAccessBadge = (modPerms) => {
    if (!modPerms) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <X className="w-3 h-3 text-slate-400" /> No Access
        </span>
      );
    }
    const count = [modPerms.view, modPerms.create, modPerms.edit, modPerms.delete].filter(Boolean).length;
    if (count === 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Full Access
        </span>
      );
    }
    if (count === 1 && modPerms.view) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Info className="w-3 h-3 text-blue-600" /> Read Only
        </span>
      );
    }
    if (count === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <X className="w-3 h-3 text-slate-400" /> No Access
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Sparkles className="w-3 h-3 text-amber-600" /> {count}/4 Allowed
      </span>
    );
  };

  const activeColor = COLOR_CLASSES[activeRole?.color] || COLOR_CLASSES.indigo;

  return (
    <DashboardShell
      title="Roles & Permissions"
      description="Visual authorization sandbox to model system roles, permission groups, and granular CRUD privileges."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm("Reset all roles and permission matrices to original system defaults?")) {
                resetToDefaults();
                showToast("System roles & permissions restored to initial defaults.");
              }
            }}
            className="text-slate-600 hover:text-slate-900 border-slate-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddRoleOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Custom Role
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Prominent Sandbox Disclaimer Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200/80 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-xl shrink-0 mt-0.5 border border-amber-300/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-600 text-white">
                  UI Simulation Mode
                </span>
                <span className="text-xs font-semibold text-amber-900">
                  Client-Side Authorization Preview
                </span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Changes made in this interface update local mock state only. This screen is an interactive UI
                demonstration designed for modeling privilege tiers and testing user experience workflows. Real access
                control enforcement relies on backend server-side policies and authentication tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Toast Notification Bar */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn transition-all ${
              notification.type === "error"
                ? "bg-rose-50 text-rose-800 border-rose-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <Card className="p-4 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Roles
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRoles}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Defined security profiles</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  System Roles
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.systemRoles}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Immutable root profiles</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Custom Roles
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.customRoles}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">User-defined profiles</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Unlock className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Assigned Users
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Active institutional staff</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 bg-white col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Protected Modules
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalModules}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Granular resource targets</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* 2-Column Layout: Left = Roles List, Right = Role Detail & Permissions Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Role Directory */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4 border-slate-200/80 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Available Roles ({roles.length})
                </h3>
                <span className="text-[11px] text-slate-500">Select to inspect</span>
              </div>

              {/* Search Roles Input */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Roles List */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredRoles.map((role) => {
                  const isSelected = role.id === selectedRoleId;
                  const roleTheme = COLOR_CLASSES[role.color] || COLOR_CLASSES.indigo;

                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      type="button"
                      className={`w-full text-left p-3 rounded-xl border transition-all duration-150 relative ${
                        isSelected
                          ? `bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs`
                          : "bg-white border-slate-200/80 hover:bg-slate-50/80 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${roleTheme.accent}`}
                          />
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {role.name}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                            role.isSystem
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-purple-100 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {role.isSystem ? "System" : "Custom"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {role.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                          {role.code}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Users className="w-3 h-3 text-slate-400" />
                          {role.userCount} users
                        </span>
                      </div>
                    </button>
                  );
                })}

                {filteredRoles.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No roles matched your search criteria.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Active Role Detail & Permission Matrix */}
          <div className="lg:col-span-8 space-y-4">
            {activeRole && (
              <>
                {/* Active Role Header Card */}
                <Card className="p-5 border-slate-200/80 bg-white shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${activeColor.bg} ${activeColor.text} border ${activeColor.border}`}
                      >
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            {activeRole.name}
                          </h2>
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${activeColor.badge}`}
                          >
                            {activeRole.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              activeRole.isSystem
                                ? "bg-slate-100 text-slate-700 border border-slate-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {activeRole.isSystem ? "Built-In System Role" : "Custom Defined Role"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                          {activeRole.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {activeRole.userCount} active users assigned
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-500">
                            Role ID: <code className="font-mono text-slate-600">{activeRole.id}</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-col items-end gap-2 shrink-0">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={handleOpenEdit}
                        className="text-slate-700 border-slate-200 hover:bg-slate-50"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit Role Profile
                      </Button>

                      {!activeRole.isSystem ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete Custom Role
                        </Button>
                      ) : (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 px-1 py-0.5">
                          <Lock className="w-3 h-3" /> System Protected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Batch Permission Actions Toolbar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          grantAllRolePermissions(activeRole.id);
                          showToast(`Granted full privileges to ${activeRole.name}.`);
                        }}
                        className="text-emerald-700 bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/60"
                      >
                        <Check className="w-3 h-3 mr-1 text-emerald-600" />
                        Grant All Permissions
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          revokeAllRolePermissions(activeRole.id);
                          showToast(`Revoked all permissions from ${activeRole.name}.`);
                        }}
                        className="text-rose-700 bg-rose-50/50 border-rose-200 hover:bg-rose-100/60"
                      >
                        <X className="w-3 h-3 mr-1 text-rose-600" />
                        Revoke All Permissions
                      </Button>
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter permission groups..."
                        value={moduleSearch}
                        onChange={(e) => setModuleSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </Card>

                {/* Granular Permissions Matrix Table */}
                <Card className="border-slate-200/80 bg-white overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Granular Module Permissions
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure View, Create, Edit, and Delete authorization flags for {activeRole.name}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {filteredModules.length} Modules Listed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4 w-56">Permission Group / Subsystem</th>
                          <th className="py-3 px-3 text-center w-24">
                            <span className="flex items-center justify-center gap-1">
                              View
                            </span>
                          </th>
                          <th className="py-3 px-3 text-center w-24">
                            <span className="flex items-center justify-center gap-1">
                              Create
                            </span>
                          </th>
                          <th className="py-3 px-3 text-center w-24">
                            <span className="flex items-center justify-center gap-1">
                              Edit
                            </span>
                          </th>
                          <th className="py-3 px-3 text-center w-24">
                            <span className="flex items-center justify-center gap-1">
                              Delete
                            </span>
                          </th>
                          <th className="py-3 px-4 text-center w-28">Status</th>
                          <th className="py-3 px-4 text-right w-24">Batch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredModules.map((group) => {
                          const IconComp = MODULE_ICONS[group.id] || Boxes;
                          const perms = activeRole.permissions?.[group.id] || {
                            view: false,
                            create: false,
                            edit: false,
                            delete: false,
                          };

                          const allChecked =
                            perms.view && perms.create && perms.edit && perms.delete;
                          const anyChecked =
                            perms.view || perms.create || perms.edit || perms.delete;

                          return (
                            <tr
                              key={group.id}
                              className="hover:bg-slate-50/70 transition-colors duration-150"
                            >
                              {/* Module Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-start gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                                    <IconComp className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 leading-snug">
                                      {group.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                      {group.description}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* VIEW Checkbox */}
                              <td className="py-3.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(perms.view)}
                                    onChange={(e) =>
                                      updateRolePermission(
                                        activeRole.id,
                                        group.id,
                                        "view",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* CREATE Checkbox */}
                              <td className="py-3.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(perms.create)}
                                    onChange={(e) =>
                                      updateRolePermission(
                                        activeRole.id,
                                        group.id,
                                        "create",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* EDIT Checkbox */}
                              <td className="py-3.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(perms.edit)}
                                    onChange={(e) =>
                                      updateRolePermission(
                                        activeRole.id,
                                        group.id,
                                        "edit",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* DELETE Checkbox */}
                              <td className="py-3.5 px-3 text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer p-1">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(perms.delete)}
                                    onChange={(e) =>
                                      updateRolePermission(
                                        activeRole.id,
                                        group.id,
                                        "delete",
                                        e.target.checked
                                      )
                                    }
                                    className="w-4 h-4 rounded text-rose-600 border-slate-300 focus:ring-rose-500 focus:ring-offset-0 transition cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4 text-center">
                                {getModuleAccessBadge(perms)}
                              </td>

                              {/* Toggle All Module Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleModuleAll(activeRole.id, group.id, !allChecked)
                                  }
                                  className={`text-[11px] font-semibold px-2 py-1 rounded transition ${
                                    allChecked
                                      ? "text-rose-600 hover:bg-rose-50"
                                      : "text-indigo-600 hover:bg-indigo-50"
                                  }`}
                                  title={allChecked ? "Revoke all 4" : "Grant all 4"}
                                >
                                  {allChecked ? "Clear" : "All"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {filteredModules.length === 0 && (
                    <div className="text-center py-10 text-xs text-slate-400">
                      No permission modules matched your search term.
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD NEW CUSTOM ROLE */}
      <Modal
        isOpen={isAddRoleOpen}
        onClose={() => setIsAddRoleOpen(false)}
        title="Create New Custom Role"
        description="Add a new institutional role to configure customized permission privileges."
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveNewRole}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Create Role
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveNewRole} className="space-y-4">
          <Input
            label="Role Title / Display Name *"
            placeholder="e.g. Guidance Counselor, Lab Assistant"
            value={newRoleForm.name}
            onChange={(e) =>
              setNewRoleForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Role Code *"
              placeholder="e.g. COUNSELOR"
              value={newRoleForm.code}
              onChange={(e) =>
                setNewRoleForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                }))
              }
              required
            />
            <Input
              label="Initial User Count"
              type="number"
              min="0"
              value={newRoleForm.userCount}
              onChange={(e) =>
                setNewRoleForm((prev) => ({ ...prev, userCount: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role Description
            </label>
            <textarea
              rows={2}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              placeholder="Brief summary of duties and responsibilities assigned to this role..."
              value={newRoleForm.description}
              onChange={(e) =>
                setNewRoleForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Badge & Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(COLOR_CLASSES).map((colorKey) => {
                const isSelected = newRoleForm.color === colorKey;
                const c = COLOR_CLASSES[colorKey];
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() =>
                      setNewRoleForm((prev) => ({ ...prev, color: colorKey }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition ${
                      isSelected
                        ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring}`
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {colorKey}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT ROLE PROFILE */}
      <Modal
        isOpen={isEditRoleOpen}
        onClose={() => setIsEditRoleOpen(false)}
        title={`Edit Role: ${activeRole?.name}`}
        description="Update role title, description, badge color, and assigned staff metrics."
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Role Title / Display Name *"
            value={editRoleForm.name}
            onChange={(e) =>
              setEditRoleForm((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Role Code"
              value={editRoleForm.code}
              disabled={activeRole?.isSystem}
              onChange={(e) =>
                setEditRoleForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                }))
              }
            />
            <Input
              label="Assigned Users Count"
              type="number"
              min="0"
              value={editRoleForm.userCount}
              onChange={(e) =>
                setEditRoleForm((prev) => ({ ...prev, userCount: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role Description
            </label>
            <textarea
              rows={3}
              className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
              value={editRoleForm.description}
              onChange={(e) =>
                setEditRoleForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Badge & Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(COLOR_CLASSES).map((colorKey) => {
                const isSelected = editRoleForm.color === colorKey;
                const c = COLOR_CLASSES[colorKey];
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() =>
                      setEditRoleForm((prev) => ({ ...prev, color: colorKey }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border transition ${
                      isSelected
                        ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring}`
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {colorKey}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: CONFIRM DELETE CUSTOM ROLE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Custom Role"
        description="Are you sure you want to delete this custom role?"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Role
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Deleting <strong className="text-slate-900">{activeRole?.name}</strong> will remove
            all configured module permission flags from the sandbox. Any users previously assigned
            will need to be reassigned.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>This action updates client mock state immediately.</span>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
