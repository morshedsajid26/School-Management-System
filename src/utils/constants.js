export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  ACCOUNTANT: "accountant",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administrator",
  [ROLES.TEACHER]: "Teacher / Faculty",
  [ROLES.STUDENT]: "Student",
  [ROLES.ACCOUNTANT]: "Accountant / Bursar",
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-100 text-indigo-800",
    primary: "indigo",
  },
  [ROLES.TEACHER]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    primary: "emerald",
  },
  [ROLES.STUDENT]: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    primary: "blue",
  },
  [ROLES.ACCOUNTANT]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    primary: "amber",
  },
};

export const STATUS_TYPES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  PARTIAL: "partial",
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
};

export const ACADEMIC_YEARS = [
  "2025 - 2026",
  "2024 - 2025",
  "2023 - 2024",
];

export const SCHOOL_TERMS = [
  "Term 1 (Spring)",
  "Term 2 (Summer)",
  "Term 3 (Fall)",
];
