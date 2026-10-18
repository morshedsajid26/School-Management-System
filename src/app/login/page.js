"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { schoolInfo } from "@/data/mock/school";
import { mockUsers } from "@/data/mock/users";
import { useAuth } from "@/context/AuthContext";
import { ROLES, ROLE_LABELS } from "@/utils/constants";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { School, ArrowRight, ShieldCheck, Mail, Lock, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, allUsers } = useAuth();
  const [email, setEmail] = useState("eleanor.vance@oakridgeacademy.edu");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = (user) => {
    switchRole(user.role);
    setLoading(true);
    setTimeout(() => {
      router.push(`/${user.role}`);
    }, 400);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    switchRole(selectedRole);
    setLoading(true);
    setTimeout(() => {
      router.push(`/${selectedRole}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <School className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Sign In to SMS Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {schoolInfo.name} • Academic Year {schoolInfo.currentAcademicYear}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          {/* Quick Demo Access banner */}
          <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">
                1-Click Quick Demo Sign-In
              </span>
            </div>
            <p className="text-[11px] text-indigo-700/90 mb-3">
              Click any role persona below to test immediately without typing credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickLogin(user)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-200/80 hover:border-indigo-500 hover:shadow-xs transition text-left group"
                >
                  <Avatar src={user.avatar} name={user.name} size="xs" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate group-hover:text-indigo-600">
                      {ROLE_LABELS[user.role].split(" ")[0]}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">
                      {user.name.split(" ")[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">
                Or Sign In Manually
              </span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value={ROLES.ADMIN}>Administrator (Principal)</option>
                <option value={ROLES.TEACHER}>Teacher / Faculty</option>
                <option value={ROLES.STUDENT}>Student</option>
                <option value={ROLES.ACCOUNTANT}>Accountant / Bursar</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember session</span>
              </label>
              <span className="text-indigo-600 font-medium hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Enter Dashboard
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 transition"
            >
              ← Back to Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
