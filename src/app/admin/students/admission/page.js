"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import PeopleNavTabs from "@/components/shared/PeopleNavTabs";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import {
  UserPlus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  School,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  Award,
  AlertCircle,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Academic Enrollment", desc: "Grade, section & admission ID", icon: School },
  { id: 2, title: "Personal Information", desc: "Demographics & identity", icon: User },
  { id: 3, title: "Contact & Emergency", desc: "Address & emergency lines", icon: Phone },
  { id: 4, title: "Medical & Institutional", desc: "Health & institutional notes", icon: HeartPulse },
  { id: 5, title: "Review & Submit", desc: "Verification & confirmation", icon: FileCheck2 },
];

const BATCH_OPTIONS = ["Batch 2025", "Batch 2024", "Batch 2026", "Batch 2027", "Batch 2028"];
const SECTIONS = ["A", "B", "C"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function StudentAdmissionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Academic
    admissionNumber: "ADM-2025-088",
    admissionDate: "2025-09-01",
    academicYear: "2025-2026",
    batch: "Batch 2025",
    grade: "Batch 2025",
    section: "A",
    rollNumber: "B25-A-15",
    enrollmentType: "Regular Admission",
    previousSchool: "St. Jude Middle School",

    // Step 2: Personal
    firstName: "",
    lastName: "",
    dob: "2010-06-15",
    gender: "Male",
    bloodGroup: "O+",
    nationality: "American",
    primaryLanguage: "English",

    // Step 3: Contact & Emergency
    email: "",
    phone: "+1 (555) 234-8901",
    address: "742 Evergreen Terrace",
    city: "Oakridge",
    postalCode: "97034",
    emergencyContactName: "Eleanor Vance",
    emergencyContactPhone: "+1 (555) 901-4455",
    emergencyRelationship: "Designated Emergency Contact",

    // Step 4: Medical & Institutional
    allergies: "None reported",
    dietary: "Standard",
    peClearance: "Full Clearance",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});

  // Auto-fill sample application for rapid demonstration
  const handleQuickFill = () => {
    setFormData({
      admissionNumber: "ADM-2025-104",
      admissionDate: "2025-09-01",
      academicYear: "2025-2026",
      batch: "Batch 2024",
      grade: "Batch 2024",
      section: "B",
      rollNumber: "B24-B-12",
      enrollmentType: "Regular Admission",
      previousSchool: "Oakridge Preparatory Junior High",

      firstName: "Samantha",
      lastName: "Renee Miller",
      dob: "2011-04-18",
      gender: "Female",
      bloodGroup: "B+",
      nationality: "American",
      primaryLanguage: "English",

      email: "samantha.miller@student.oakridgeacademy.edu",
      phone: "+1 (555) 345-9811",
      address: "528 Whispering Pines Way",
      city: "Oakridge",
      postalCode: "97034",
      emergencyContactName: "Jonathan Miller",
      emergencyContactPhone: "+1 (555) 902-8811",
      emergencyRelationship: "Primary Emergency Contact",

      allergies: "Mild pollen allergy in spring",
      dietary: "Nut-free",
      peClearance: "Full Clearance",
      status: "active",
    });
    setFormErrors({});
  };

  // Validation per step
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      if (!formData.admissionNumber.trim()) errors.admissionNumber = "Admission number is required";
      if (!formData.admissionDate) errors.admissionDate = "Admission date is required";
      if (!formData.rollNumber.trim()) errors.rollNumber = "Roll number is required";
      if (!formData.grade) errors.grade = "Grade is required";
      if (!formData.section) errors.section = "Section is required";
    } else if (step === 2) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.dob) errors.dob = "Date of birth is required";
    } else if (step === 3) {
      if (!formData.emergencyContactPhone.trim()) {
        errors.emergencyContactPhone = "Emergency contact phone number is required";
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Enter a valid email address";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert("Please check and complete all required fields across all sections.");
      return;
    }
    setIsSubmitted(true);
  };

  const studentFullName = `${formData.firstName} ${formData.lastName}`.trim() || "Student";

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <PageHeader
        title="Student Admission & Enrollment"
        subtitle="Multi-section intake form to register and allocate new students to Oakridge Academy cohorts."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={handleQuickFill}
            >
              Fill Sample Data
            </Button>
            <Link href="/admin/students">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Directory
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sub Navigation */}
      <PeopleNavTabs />

      {/* Success Confirmation State */}
      {isSubmitted ? (
        <Card className="border-emerald-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-8 text-white text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto ring-4 ring-white/30">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Admission Registration Confirmed!</h2>
            <p className="text-sm text-emerald-100 max-w-md mx-auto">
              Student record has been successfully minted and allocated to the active academic cohort.
            </p>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* Admission Credential Certificate Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Oakridge Academy • Admission Slip
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{studentFullName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Official Admission #</span>
                  <p className="text-base font-mono font-black text-indigo-600">
                    {formData.admissionNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Assigned Class</span>
                  <strong className="text-slate-900 text-sm">{formData.grade}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Section</span>
                  <strong className="text-slate-900 text-sm">Section {formData.section}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Roll Number</span>
                  <strong className="text-slate-900 text-sm font-mono">{formData.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Academic Year</span>
                  <strong className="text-slate-900 text-sm">{formData.academicYear}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Date of Admission</span>
                  <span className="text-slate-800 font-semibold">{formData.admissionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Emergency Line</span>
                  <span className="text-slate-800 font-semibold font-mono">
                    {formData.emergencyContactPhone} ({formData.emergencyContactName})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/admin/students">
                <Button variant="primary" size="md">
                  View in Student Directory
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsSubmitted(false);
                  setCurrentStep(1);
                  handleQuickFill();
                }}
              >
                Enroll Another Student
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isCurrent = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    if (isPast) setCurrentStep(step.id);
                  }}
                  disabled={!isPast && !isCurrent}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20"
                      : isPast
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100/70 cursor-pointer"
                      : "bg-white text-slate-400 border-slate-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-white text-indigo-600"
                          : isPast
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isPast ? "✓" : step.id}
                    </div>
                    <StepIcon className="h-4 w-4 shrink-0" />
                  </div>
                  <p className="text-xs font-bold truncate">{step.title}</p>
                  <p
                    className={`text-[10px] truncate ${
                      isCurrent ? "text-indigo-200" : isPast ? "text-emerald-700" : "text-slate-400"
                    }`}
                  >
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Step {currentStep} of {STEPS.length}
                  </span>
                  <CardTitle className="text-lg mt-0.5">{STEPS[currentStep - 1].title}</CardTitle>
                  <CardDescription>{STEPS[currentStep - 1].desc}</CardDescription>
                </div>
                <Badge variant="indigo" size="md">
                  Cohort AY {formData.academicYear}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* STEP 1: ACADEMIC ENROLLMENT */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Official Admission Number *"
                        placeholder="e.g. ADM-2025-088"
                        value={formData.admissionNumber}
                        error={formErrors.admissionNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, admissionNumber: e.target.value })
                        }
                        helperText="Unique permanent identifier for academic records."
                      />

                      <Input
                        label="Admission Date *"
                        type="date"
                        value={formData.admissionDate}
                        error={formErrors.admissionDate}
                        onChange={(e) =>
                          setFormData({ ...formData, admissionDate: e.target.value })
                        }
                      />

                      <Select
                        label="Academic Year *"
                        value={formData.academicYear}
                        onChange={(e) =>
                          setFormData({ ...formData, academicYear: e.target.value })
                        }
                        options={[
                          { label: "2025-2026 (Active)", value: "2025-2026" },
                          { label: "2026-2027 (Upcoming)", value: "2026-2027" },
                        ]}
                      />

                      <Select
                        label="Target Academic Batch *"
                        value={formData.batch || formData.grade}
                        error={formErrors.grade}
                        onChange={(e) => {
                          const val = e.target.value;
                          const yr = val.replace("Batch ", "").slice(-2);
                          setFormData({
                            ...formData,
                            batch: val,
                            grade: val,
                            rollNumber: `B${yr}-${formData.section}-15`,
                          });
                        }}
                        options={BATCH_OPTIONS.map((b) => ({ label: b, value: b }))}
                      />

                      <Select
                        label="Assigned Section *"
                        value={formData.section}
                        error={formErrors.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        options={SECTIONS.map((sec) => ({
                          label: `Section ${sec}`,
                          value: sec,
                        }))}
                      />

                      <Input
                        label="Roll Number *"
                        placeholder="e.g. 10-A-15"
                        value={formData.rollNumber}
                        error={formErrors.rollNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, rollNumber: e.target.value })
                        }
                      />

                      <Select
                        label="Enrollment Type"
                        value={formData.enrollmentType}
                        onChange={(e) =>
                          setFormData({ ...formData, enrollmentType: e.target.value })
                        }
                        options={[
                          { label: "Regular New Admission", value: "Regular Admission" },
                          { label: "Transfer from Other District", value: "Transfer" },
                          { label: "International Student", value: "International" },
                        ]}
                      />

                      <Input
                        label="Previous School Attended"
                        placeholder="e.g. St. Jude Middle School"
                        value={formData.previousSchool}
                        onChange={(e) =>
                          setFormData({ ...formData, previousSchool: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: PERSONAL INFORMATION */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name *"
                        placeholder="e.g. Samantha"
                        value={formData.firstName}
                        error={formErrors.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                      />

                      <Input
                        label="Last Name *"
                        placeholder="e.g. Miller"
                        value={formData.lastName}
                        error={formErrors.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />

                      <Input
                        label="Date of Birth *"
                        type="date"
                        value={formData.dob}
                        error={formErrors.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      />

                      <Select
                        label="Gender *"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Non-binary / Other", value: "Other" },
                        ]}
                      />

                      <Select
                        label="Blood Group"
                        value={formData.bloodGroup}
                        onChange={(e) =>
                          setFormData({ ...formData, bloodGroup: e.target.value })
                        }
                        options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
                      />

                      <Input
                        label="Nationality"
                        placeholder="e.g. American"
                        value={formData.nationality}
                        onChange={(e) =>
                          setFormData({ ...formData, nationality: e.target.value })
                        }
                      />

                      <Input
                        label="Primary Language"
                        placeholder="e.g. English"
                        value={formData.primaryLanguage}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryLanguage: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: CONTACT & EMERGENCY DETAILS */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Student Institutional Email"
                        type="email"
                        placeholder="firstname.lastname@student.oakridgeacademy.edu"
                        value={formData.email}
                        error={formErrors.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />

                      <Input
                        label="Student Contact Phone"
                        placeholder="+1 (555) XXX-XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />

                      <div className="md:col-span-2">
                        <Input
                          label="Residential Street Address"
                          placeholder="e.g. 528 Whispering Pines Way"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                        />
                      </div>

                      <Input
                        label="City / Municipality"
                        placeholder="e.g. Oakridge"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />

                      <Input
                        label="Postal / ZIP Code"
                        placeholder="e.g. 97034"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({ ...formData, postalCode: e.target.value })
                        }
                      />

                      <Input
                        label="Designated Emergency Contact Name *"
                        placeholder="e.g. Jonathan Miller"
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContactName: e.target.value,
                          })
                        }
                      />

                      <Input
                        label="Emergency Contact Phone *"
                        placeholder="+1 (555) 902-8811"
                        value={formData.emergencyContactPhone}
                        error={formErrors.emergencyContactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContactPhone: e.target.value,
                          })
                        }
                        helperText="Required for campus health and safety response."
                      />

                      <Input
                        label="Relationship to Student"
                        placeholder="e.g. Primary Emergency Contact"
                        value={formData.emergencyRelationship}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyRelationship: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: MEDICAL & INSTITUTIONAL NOTES */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          label="Known Allergies / Medical Notes"
                          placeholder="e.g. Mild pollen allergy in spring, or None"
                          value={formData.allergies}
                          onChange={(e) =>
                            setFormData({ ...formData, allergies: e.target.value })
                          }
                        />
                      </div>

                      <Select
                        label="Dietary Preferences / Restrictions"
                        value={formData.dietary}
                        onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
                        options={[
                          { label: "Standard Cafeteria Plan", value: "Standard" },
                          { label: "Nut-Free Strict", value: "Nut-free" },
                          { label: "Vegetarian", value: "Vegetarian" },
                          { label: "Halal Certified", value: "Halal" },
                          { label: "Gluten-Free", value: "Gluten-free" },
                        ]}
                      />

                      <Select
                        label="Physical Education (P.E.) Clearance"
                        value={formData.peClearance}
                        onChange={(e) =>
                          setFormData({ ...formData, peClearance: e.target.value })
                        }
                        options={[
                          { label: "Full Physical Clearance", value: "Full Clearance" },
                          { label: "Restricted Light Exercise Only", value: "Restricted" },
                          { label: "Medical Exemption", value: "Exempt" },
                        ]}
                      />

                      <Select
                        label="Initial Enrollment Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={[
                          { label: "Active Student", value: "active" },
                          { label: "Conditional Intake", value: "conditional" },
                          { label: "Pending Health Form", value: "pending" },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & VERIFICATION */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-indigo-950 space-y-1">
                        <p className="font-bold">Please review the student record before final submission.</p>
                        <p className="text-indigo-800">
                          Confirming will generate the student permanent academic profile and allocate them to the
                          selected grade division.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Academic Summary */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <School className="h-3.5 w-3.5 text-indigo-600" />
                            Academic Enrollment
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Admission #</span>
                            <span className="font-mono font-bold text-slate-900">
                              {formData.admissionNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Roll Number</span>
                            <span className="font-mono font-bold text-slate-900">
                              {formData.rollNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Batch & Sec</span>
                            <span className="font-bold text-slate-800">
                              {formData.batch || formData.grade} (Sec {formData.section})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Admission Date</span>
                            <span className="text-slate-800">{formData.admissionDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Personal Summary */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-indigo-600" />
                            Personal Details
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Full Name</span>
                            <span className="font-bold text-slate-900">{studentFullName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                            <span className="text-slate-800">{formData.dob}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Gender</span>
                            <span className="text-slate-800">{formData.gender}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Blood Group</span>
                            <span className="font-mono font-bold text-slate-800">
                              {formData.bloodGroup}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Emergency Summary */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-indigo-600" />
                            Emergency & Contact
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <p className="text-slate-700">
                            <strong>Emergency Contact:</strong> {formData.emergencyContactName} (
                            <span className="font-mono">{formData.emergencyContactPhone}</span>)
                          </p>
                          <p className="text-slate-500 text-[11px] truncate">
                            <strong>Address:</strong> {formData.address}, {formData.city}
                          </p>
                          {formData.email && (
                            <p className="text-slate-500 text-[11px] truncate">
                              <strong>Email:</strong> {formData.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Health & Status */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <HeartPulse className="h-3.5 w-3.5 text-indigo-600" />
                            Institutional & Medical
                          </h4>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Dietary Plan</span>
                            <span className="text-slate-800 font-medium">{formData.dietary}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">P.E. Status</span>
                            <span className="text-slate-800 font-medium">{formData.peClearance}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[11px]">Allergies</span>
                            <span className="text-slate-800 font-medium">{formData.allergies}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-between bg-slate-50 border-t border-slate-100 rounded-b-2xl p-4">
              <Button
                variant="outline"
                size="md"
                icon={ArrowLeft}
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Previous Step
              </Button>

              <div className="flex items-center gap-3">
                {currentStep < STEPS.length ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={handleNext}
                  >
                    Proceed to Next Step
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    icon={CheckCircle2}
                    onClick={handleSubmit}
                  >
                    Complete & Confirm Admission
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
