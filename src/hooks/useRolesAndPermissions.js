"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { mockRoles, mockPermissionGroups } from "@/data/mock/rolesAndPermissions";
import { logAuditEvent } from "@/hooks/useAuditLogs";

let rolesStore = {
  roles: JSON.parse(JSON.stringify(mockRoles)),
  permissionGroups: [...mockPermissionGroups],
};

const listeners = new Set();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return rolesStore;
}

function getServerSnapshot() {
  return rolesStore;
}

export function useRolesAndPermissions() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { roles, permissionGroups } = store;

  // Toggle single action checkbox (view, create, edit, delete)
  const updateRolePermission = useCallback((roleId, moduleId, action, value) => {
    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.map((r) => {
        if (r.id !== roleId) return r;
        const currentMod = r.permissions[moduleId] || {
          view: false,
          create: false,
          edit: false,
          delete: false,
        };
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: {
              ...currentMod,
              [action]: Boolean(value),
            },
          },
        };
      }),
    };
    emitChange();

    const targetRole = rolesStore.roles.find((r) => r.id === roleId);
    logAuditEvent(
      `Updated ${action.toUpperCase()} Permission for ${targetRole?.name || roleId}`,
      "Roles & Permissions",
      `Changed module '${moduleId}' permission '${action}' to ${value ? "ALLOWED" : "DENIED"} in UI preview mode.`,
      "Success",
      "Low"
    );
  }, []);

  // Toggle all 4 actions for a specific module
  const toggleModuleAll = useCallback((roleId, moduleId, value) => {
    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [moduleId]: {
              view: Boolean(value),
              create: Boolean(value),
              edit: Boolean(value),
              delete: Boolean(value),
            },
          },
        };
      }),
    };
    emitChange();

    const targetRole = rolesStore.roles.find((r) => r.id === roleId);
    logAuditEvent(
      `Batch Toggled Permissions for ${targetRole?.name || roleId} (${moduleId})`,
      "Roles & Permissions",
      `Set all actions (View, Create, Edit, Delete) for module '${moduleId}' to ${value ? "ENABLED" : "DISABLED"}.`,
      "Success",
      "Low"
    );
  }, []);

  // Grant all permissions for role
  const grantAllRolePermissions = useCallback((roleId) => {
    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.map((r) => {
        if (r.id !== roleId) return r;
        const granted = {};
        rolesStore.permissionGroups.forEach((g) => {
          granted[g.id] = { view: true, create: true, edit: true, delete: true };
        });
        return {
          ...r,
          permissions: granted,
        };
      }),
    };
    emitChange();

    const targetRole = rolesStore.roles.find((r) => r.id === roleId);
    logAuditEvent(
      `Granted Full Permissions to '${targetRole?.name || roleId}'`,
      "Roles & Permissions",
      "Applied unrestricted administrative access across all 12 system modules in preview mode.",
      "Warning",
      "Medium"
    );
  }, []);

  // Revoke all permissions for role
  const revokeAllRolePermissions = useCallback((roleId) => {
    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.map((r) => {
        if (r.id !== roleId) return r;
        const revoked = {};
        rolesStore.permissionGroups.forEach((g) => {
          revoked[g.id] = { view: false, create: false, edit: false, delete: false };
        });
        return {
          ...r,
          permissions: revoked,
        };
      }),
    };
    emitChange();

    const targetRole = rolesStore.roles.find((r) => r.id === roleId);
    logAuditEvent(
      `Revoked All Permissions from '${targetRole?.name || roleId}'`,
      "Roles & Permissions",
      "Zeroed out all access permissions across all modules in preview mode.",
      "Warning",
      "Medium"
    );
  }, []);

  // Add new custom role
  const addRole = useCallback((roleData) => {
    const defaultPermissions = {};
    rolesStore.permissionGroups.forEach((g) => {
      defaultPermissions[g.id] = {
        view: Boolean(roleData.defaultView ?? true),
        create: false,
        edit: false,
        delete: false,
      };
    });

    const newRole = {
      id: `ROLE-${(roleData.code || "CUSTOM").toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: roleData.name || "Untitled Role",
      code: (roleData.code || "CUSTOM").toUpperCase(),
      description: roleData.description || "Custom assigned role definition.",
      isSystem: false,
      userCount: parseInt(roleData.userCount, 10) || 0,
      color: roleData.color || "cyan",
      permissions: defaultPermissions,
    };

    rolesStore = {
      ...rolesStore,
      roles: [...rolesStore.roles, newRole],
    };
    emitChange();

    logAuditEvent(
      `Created Custom Role '${newRole.name}' (${newRole.code})`,
      "Roles & Permissions",
      `New role added with read access defaults and 0 assigned users.`,
      "Success",
      "Medium"
    );

    return newRole;
  }, []);

  // Update role metadata
  const updateRoleMeta = useCallback((roleId, roleData) => {
    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          name: roleData.name || r.name,
          code: roleData.code ? roleData.code.toUpperCase() : r.code,
          description: roleData.description || r.description,
          color: roleData.color || r.color,
          userCount: roleData.userCount !== undefined ? parseInt(roleData.userCount, 10) : r.userCount,
        };
      }),
    };
    emitChange();

    logAuditEvent(
      `Updated Role Metadata for '${roleData.name || roleId}'`,
      "Roles & Permissions",
      `Role configuration, descriptor, and badge color refreshed.`,
      "Success",
      "Low"
    );
  }, []);

  // Delete custom role
  const deleteRole = useCallback((roleId) => {
    const target = rolesStore.roles.find((r) => r.id === roleId);
    if (target?.isSystem) {
      return { success: false, error: "System protected roles cannot be deleted." };
    }

    rolesStore = {
      ...rolesStore,
      roles: rolesStore.roles.filter((r) => r.id !== roleId),
    };
    emitChange();

    logAuditEvent(
      `Deleted Custom Role '${target?.name || roleId}'`,
      "Roles & Permissions",
      `Removed role definition from the authorization sandbox.`,
      "Warning",
      "High"
    );

    return { success: true };
  }, []);

  // Reset to default
  const resetToDefaults = useCallback(() => {
    rolesStore = {
      roles: JSON.parse(JSON.stringify(mockRoles)),
      permissionGroups: [...mockPermissionGroups],
    };
    emitChange();

    logAuditEvent(
      "Reset All Roles & Permissions to System Defaults",
      "Roles & Permissions",
      "Restored standard initial matrix for Administrator, Principal, Teacher, Accountant, Librarian, Transport.",
      "Warning",
      "Medium"
    );
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const systemRoles = roles.filter((r) => r.isSystem).length;
    const customRoles = roles.filter((r) => !r.isSystem).length;
    const totalUsers = roles.reduce((acc, r) => acc + (r.userCount || 0), 0);
    const totalModules = permissionGroups.length;

    return {
      totalRoles,
      systemRoles,
      customRoles,
      totalUsers,
      totalModules,
    };
  }, [roles, permissionGroups]);

  return {
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
  };
}

export default useRolesAndPermissions;
