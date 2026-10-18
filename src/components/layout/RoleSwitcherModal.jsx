"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS, ROLE_COLORS, ROLES } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { currentRole, switchRole, allUsers } = useAuth();
  const router = useRouter();

  const handleSelectRole = (user) => {
    switchRole(user.role);
    onClose();
    // Navigate to role's dashboard root
    router.push(`/${user.role}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Switch Active Persona / Role"
      description="Quickly preview the dashboard through different role perspectives. No password required in mock environment."
      maxWidth="max-w-md"
    >
      <div className="space-y-2.5">
        {allUsers.map((user) => {
          const isActive = user.role === currentRole;
          const colorConfig = ROLE_COLORS[user.role] || ROLE_COLORS[ROLES.ADMIN];

          return (
            <button
              key={user.id}
              onClick={() => handleSelectRole(user)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                isActive
                  ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar} name={user.name} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {user.name}
                    </span>
                    {isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{user.title}</p>
                  <div className="mt-1">
                    <Badge variant={colorConfig.primary} size="sm">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
