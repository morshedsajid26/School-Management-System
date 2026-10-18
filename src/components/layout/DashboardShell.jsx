"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RoleSwitcherModal from "@/components/layout/RoleSwitcherModal";

export default function DashboardShell({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar (Desktop Collapsible Rail + Mobile slide-over) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
      />

      {/* Main Layout Area */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenRoleSwitcher={() => setRoleSwitcherOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={roleSwitcherOpen}
        onClose={() => setRoleSwitcherOpen(false)}
      />
    </div>
  );
}
