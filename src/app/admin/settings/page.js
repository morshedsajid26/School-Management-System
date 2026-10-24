"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { schoolInfo } from "@/data/mock/school";
import { ACADEMIC_YEARS, SCHOOL_TERMS } from "@/utils/constants";
import {
  School,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sliders,
  Building,
} from "lucide-react";

const getInitialSchoolData = () => {
  const base = {
    // Profile
    name: schoolInfo.name,
    shortName: schoolInfo.shortName,
    code: schoolInfo.code,
    motto: schoolInfo.motto,
    established: schoolInfo.established,
    principalName: schoolInfo.principalName,
    taxId: schoolInfo.taxId,
    address: schoolInfo.address,
    city: schoolInfo.city,
    state: schoolInfo.state,
    zipCode: schoolInfo.zipCode,
    country: schoolInfo.country,
    phone: schoolInfo.phone,
    alternatePhone: schoolInfo.alternatePhone,
    email: schoolInfo.email,
    website: schoolInfo.website,
    logo: schoolInfo.logo,

    // Academic Configuration
    academicYear: schoolInfo.academicSettings.academicYear,
    term: schoolInfo.academicSettings.term,
    sessionStart: schoolInfo.academicSettings.sessionStart,
    sessionEnd: schoolInfo.academicSettings.sessionEnd,
    gradingSystem: schoolInfo.academicSettings.gradingSystem,
    passingScore: schoolInfo.academicSettings.passingScore,
    workingDays: schoolInfo.academicSettings.workingDays,
    periodsPerDay: schoolInfo.academicSettings.periodsPerDay,
    periodDuration: schoolInfo.academicSettings.periodDuration,

    // Preferences
    currency: schoolInfo.preferences.currency,
    dateFormat: schoolInfo.preferences.dateFormat,
    timeZone: schoolInfo.preferences.timeZone,
    language: schoolInfo.preferences.language,
    lateAttendanceGrace: schoolInfo.preferences.lateAttendanceGrace,
    autoFeeReminders: schoolInfo.preferences.autoFeeReminders,
    maintenanceMode: schoolInfo.preferences.maintenanceMode,
    enableBiometricSync: schoolInfo.preferences.enableBiometricSync,
  };

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("sms_school_profile_v1");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }
  }

  return base;
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "academic" | "preferences"
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(getInitialSchoolData);
  const [savedSnapshot, setSavedSnapshot] = useState(getInitialSchoolData);

  // Preset logo options for instant preview selection
  const presetLogos = [
    { label: "Shield Emblem", url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=80" },
    { label: "Modern Academic", url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80" },
    { label: "Classical Crest", url: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80" },
  ];

  // Client-side validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "School name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Contact email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Primary telephone number is required.";
    }

    if (!formData.code.trim()) {
      newErrors.code = "School identification code is required.";
    }

    if (!formData.website.trim()) {
      newErrors.website = "Website URL is required.";
    }

    const est = Number(formData.established);
    if (!est || est < 1800 || est > new Date().getFullYear()) {
      newErrors.established = "Please enter a valid establishment year.";
    }

    const pass = Number(formData.passingScore);
    if (isNaN(pass) || pass < 30 || pass > 100) {
      newErrors.passingScore = "Passing score must be between 30% and 100%.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) {
      if (errors.name || errors.email || errors.phone || errors.code || errors.website || errors.established) {
        setActiveTab("profile");
      } else if (errors.passingScore) {
        setActiveTab("academic");
      }
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSnapshot(formData);
      setSaveSuccess(true);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("sms_school_profile_v1", JSON.stringify(formData));
        }
      } catch {
        // Ignore
      }
      setTimeout(() => setSaveSuccess(false), 3500);
    }, 500);
  };

  const handleCancel = () => {
    setFormData(savedSnapshot);
    setErrors({});
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all settings and profile information back to factory demo defaults?")) {
      const defaults = {
        name: schoolInfo.name,
        shortName: schoolInfo.shortName,
        code: schoolInfo.code,
        motto: schoolInfo.motto,
        established: schoolInfo.established,
        principalName: schoolInfo.principalName,
        taxId: schoolInfo.taxId,
        address: schoolInfo.address,
        city: schoolInfo.city,
        state: schoolInfo.state,
        zipCode: schoolInfo.zipCode,
        country: schoolInfo.country,
        phone: schoolInfo.phone,
        alternatePhone: schoolInfo.alternatePhone,
        email: schoolInfo.email,
        website: schoolInfo.website,
        logo: schoolInfo.logo,
        academicYear: schoolInfo.academicSettings.academicYear,
        term: schoolInfo.academicSettings.term,
        sessionStart: schoolInfo.academicSettings.sessionStart,
        sessionEnd: schoolInfo.academicSettings.sessionEnd,
        gradingSystem: schoolInfo.academicSettings.gradingSystem,
        passingScore: schoolInfo.academicSettings.passingScore,
        workingDays: schoolInfo.academicSettings.workingDays,
        periodsPerDay: schoolInfo.academicSettings.periodsPerDay,
        periodDuration: schoolInfo.academicSettings.periodDuration,
        currency: schoolInfo.preferences.currency,
        dateFormat: schoolInfo.preferences.dateFormat,
        timeZone: schoolInfo.preferences.timeZone,
        language: schoolInfo.preferences.language,
        lateAttendanceGrace: schoolInfo.preferences.lateAttendanceGrace,
        autoFeeReminders: schoolInfo.preferences.autoFeeReminders,
        maintenanceMode: schoolInfo.preferences.maintenanceMode,
        enableBiometricSync: schoolInfo.preferences.enableBiometricSync,
      };
      setFormData(defaults);
      setSavedSnapshot(defaults);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sms_school_profile_v1");
        }
      } catch {
        // Ignore
      }
      setErrors({});
    }
  };

  const toggleWorkingDay = (day) => {
    if (formData.workingDays.includes(day)) {
      if (formData.workingDays.length > 1) {
        setFormData({
          ...formData,
          workingDays: formData.workingDays.filter((d) => d !== day),
        });
      }
    } else {
      setFormData({
        ...formData,
        workingDays: [...formData.workingDays, day],
      });
    }
  };

  // Client-side local file preview reader
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(savedSnapshot);

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <PageHeader
        title="School Profile & Settings"
        subtitle="Manage official institutional identity, academic session cycles, and global system preferences."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDefaults}
              title="Reset all fields to factory defaults"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty || isSaving}
            >
              Discard Changes
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save Configuration
            </Button>
          </div>
        }
      />

      {/* Success Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                School settings updated successfully!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                All changes have been saved to local client state and applied across the portal.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Summary Banner if validation failed */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-900">
              Please fix the following validation errors before saving:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "profile"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>School Profile & Identity</span>
          {errors.name || errors.email || errors.phone || errors.code ? (
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "academic"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Academic Sessions & Grading</span>
          {errors.passingScore ? (
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-t-xl"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>General Preferences & Regional</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* ================= TAB 1: SCHOOL PROFILE ================= */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Logo Preview Card */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Institutional Brand & Logo Preview</CardTitle>
                  <CardDescription>
                    Displayed on student report cards, fee invoices, transcripts, and dashboard headers.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Logo Image Preview */}
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shadow-xs">
                      {formData.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={formData.logo}
                          alt="School Logo Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <School className="h-10 w-10 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Preset / Upload controls */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Select Demo Crest or Paste Logo Image URL:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {presetLogos.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setFormData({ ...formData, logo: preset.url })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                              formData.logo === preset.url
                                ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          placeholder="https://example.com/school-logo.png"
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          className="text-xs font-mono"
                        />
                      </div>
                      <label className="cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs">
                          <Upload className="h-3.5 w-3.5" /> Select Local File
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Basic Institutional Information</CardTitle>
                  <CardDescription>
                    Official school designation and administrative identity.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="School Official Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    placeholder="Oakridge International Academy"
                  />
                  <Input
                    label="Short Display Name"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="Oakridge Academy"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="School Identification Code *"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    error={errors.code}
                    placeholder="OIA-9042"
                  />
                  <Input
                    label="Head / Principal Name"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="Dr. Eleanor Vance"
                  />
                  <Input
                    label="Established Year *"
                    type="number"
                    value={formData.established}
                    onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                    error={errors.established}
                    placeholder="1998"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Institutional Motto / Tagline"
                    value={formData.motto}
                    onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                    placeholder="Excellence in Education, Leadership in Character"
                  />
                  <Input
                    label="Tax / Regulatory Registration Number"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="EIN-47-8910243"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Location Details */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Official Campus Location & Contact Channels</CardTitle>
                  <CardDescription>
                    Communication endpoints for parents, regulatory authorities, and students.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Contact Email *"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    placeholder="info@oakridgeacademy.edu"
                  />
                  <Input
                    label="Official Public Website *"
                    icon={Globe}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    error={errors.website}
                    placeholder="https://oakridgeacademy.edu"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Telephone Number *"
                    icon={Phone}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+1 (555) 234-5678"
                  />
                  <Input
                    label="Alternate / Emergency Phone"
                    icon={Phone}
                    value={formData.alternatePhone}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="+1 (555) 234-5679"
                  />
                </div>

                <Input
                  label="Physical Campus Street Address"
                  icon={MapPin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="742 Evergreen Terrace"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Springfield"
                  />
                  <Input
                    label="State / Province"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Illinois"
                  />
                  <Input
                    label="Zip / Postal Code"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="62704"
                  />
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================= TAB 2: ACADEMIC CONFIGURATION ================= */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Session Cycle & Terms</CardTitle>
                  <CardDescription>
                    Configure the active academic year and terms that drive class promotions and transcripts.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Active Academic Year"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    options={ACADEMIC_YEARS}
                  />
                  <Select
                    label="Current Active Term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    options={SCHOOL_TERMS}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Academic Session Start Date"
                    type="date"
                    value={formData.sessionStart}
                    onChange={(e) => setFormData({ ...formData, sessionStart: e.target.value })}
                  />
                  <Input
                    label="Academic Session End Date"
                    type="date"
                    value={formData.sessionEnd}
                    onChange={(e) => setFormData({ ...formData, sessionEnd: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Grading Standard & Assessment Rules</CardTitle>
                  <CardDescription>
                    Determines how student examination marks convert into GPA and report cards.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Institutional Grading Scale"
                    value={formData.gradingSystem}
                    onChange={(e) => setFormData({ ...formData, gradingSystem: e.target.value })}
                    options={[
                      "GPA 4.0 Scale (Standard A-F)",
                      "Percentage Scale (0-100%)",
                      "British GCSE Standard (9-1)",
                      "Letter Grade Only (A+, A, B, C, D, F)",
                    ]}
                  />
                  <Input
                    label="Minimum Passing Benchmark (%) *"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    error={errors.passingScore}
                    helperText="Students scoring below this percentage are flagged for academic remediation."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>School Week & Daily Bell Schedule</CardTitle>
                  <CardDescription>
                    Active operational instructional days and period distribution.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Official Working School Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                      const isSelected = formData.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWorkingDay(day)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <Input
                    label="Periods / Classes Per Day"
                    type="number"
                    value={formData.periodsPerDay}
                    onChange={(e) => setFormData({ ...formData, periodsPerDay: Number(e.target.value) })}
                  />
                  <Input
                    label="Period Duration (Minutes)"
                    type="number"
                    value={formData.periodDuration}
                    onChange={(e) => setFormData({ ...formData, periodDuration: Number(e.target.value) })}
                    helperText="Standard lesson length per timetable block."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ================= TAB 3: GENERAL PREFERENCES ================= */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Regional Localization & Formats</CardTitle>
                  <CardDescription>
                    Display formatting for currency, dates, timestamps, and active language.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Primary Accounting Currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={[
                      "USD ($)",
                      "EUR (€)",
                      "GBP (£)",
                      "BDT (৳)",
                      "CAD ($)",
                      "AUD ($)",
                    ]}
                  />
                  <Select
                    label="Date Display Format"
                    value={formData.dateFormat}
                    onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                    options={["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Campus Timezone"
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                    options={[
                      "America/Chicago (Central Time UTC-6)",
                      "America/New_York (Eastern Time UTC-5)",
                      "America/Los_Angeles (Pacific Time UTC-8)",
                      "Europe/London (GMT UTC+0)",
                      "Asia/Dhaka (BST UTC+6)",
                    ]}
                  />
                  <Select
                    label="Portal Default Language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    options={["English (US)", "English (UK)", "Español", "Français"]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Attendance & Automated Communication Rules</CardTitle>
                  <CardDescription>
                    Thresholds for automated student reminders and morning roll call.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Morning Attendance Grace Period (Minutes)"
                  type="number"
                  value={formData.lateAttendanceGrace}
                  onChange={(e) => setFormData({ ...formData, lateAttendanceGrace: Number(e.target.value) })}
                  helperText="Students scanning in after this duration are logged as 'Late' instead of 'Present'."
                />

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={formData.autoFeeReminders}
                      onChange={(e) => setFormData({ ...formData, autoFeeReminders: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Automated Student Tuition Due Alerts
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Automatically dispatch inbox reminders 7 days and 2 days prior to payment deadlines.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={formData.enableBiometricSync}
                      onChange={(e) => setFormData({ ...formData, enableBiometricSync: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Biometric Turnstile Synchronization
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Allow RFID and turnstile morning gate hardware to feed directly into attendance logs.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 transition">
                    <input
                      type="checkbox"
                      checked={formData.maintenanceMode}
                      onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-rose-900">
                        Portal Maintenance Mode
                      </p>
                      <p className="text-[11px] text-rose-700">
                        Restrict public student and teacher portals during term-end database migration.
                      </p>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Save Action Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved modifications detected
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                All settings synchronized with active client session.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleCancel}
              disabled={!isDirty || isSaving}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              isLoading={isSaving}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
