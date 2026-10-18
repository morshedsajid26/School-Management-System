"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { schoolInfo } from "@/data/mock/school";
import { ACADEMIC_YEARS, SCHOOL_TERMS } from "@/utils/constants";
import { Save, Check, School, Bell, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({
    name: schoolInfo.name,
    code: schoolInfo.code,
    phone: schoolInfo.phone,
    email: schoolInfo.email,
    address: schoolInfo.address,
    academicYear: schoolInfo.currentAcademicYear,
    term: schoolInfo.currentTerm,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Institution Configuration"
        subtitle="Manage academy credentials, academic calendar sessions, and system parameters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>School Identity & Profile</CardTitle>
              <CardDescription>
                Official information displayed on transcripts, fee invoices, and student ID cards.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Institution Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Official School Code"
                value={profile.code}
                onChange={(e) => setProfile({ ...profile, code: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Primary Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <Input
              label="Campus Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Academic Session & Term Alignment</CardTitle>
              <CardDescription>
                Defines the active grading cycle and financial accounting term.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Active Academic Year"
                value={profile.academicYear}
                onChange={(e) => setProfile({ ...profile, academicYear: e.target.value })}
                options={ACADEMIC_YEARS}
              />
              <Select
                label="Current Term"
                value={profile.term}
                onChange={(e) => setProfile({ ...profile, term: e.target.value })}
                options={SCHOOL_TERMS}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            {saved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Preferences saved successfully
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                All changes reflect across the client prototype.
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
            >
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
