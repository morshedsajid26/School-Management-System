"use client";

import React, { createContext, useContext, useState } from "react";
import { mockUsers, defaultUser } from "@/data/mock/users";
import { ROLES } from "@/utils/constants";

const AuthContext = createContext({
  currentUser: defaultUser,
  currentRole: ROLES.ADMIN,
  switchRole: () => {},
  loginAs: () => {},
  logout: () => {},
  isAuthenticated: true,
  allUsers: mockUsers,
});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedRole = localStorage.getItem("sms_active_role");
        if (storedRole) {
          const found = mockUsers.find((u) => u.role === storedRole);
          if (found) return found;
        }
      } catch {
        // Ignore
      }
    }
    return defaultUser;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const storedRole = localStorage.getItem("sms_active_role");
        if (storedRole) {
          const found = mockUsers.find((u) => u.role === storedRole);
          if (found) return found.role;
        }
      } catch {
        // Ignore
      }
    }
    return defaultUser.role;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const switchRole = (newRole) => {
    const targetUser = mockUsers.find((u) => u.role === newRole) || mockUsers[0];
    setCurrentUser(targetUser);
    setCurrentRole(targetUser.role);
    setIsAuthenticated(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sms_active_role", targetUser.role);
      }
    } catch {
      // Ignore
    }
  };

  const loginAs = (role) => {
    switchRole(role);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        loginAs,
        logout,
        isAuthenticated,
        allUsers: mockUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
