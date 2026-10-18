import { ROLES } from "@/utils/constants";

export const mockUsers = [
  {
    id: "usr-admin-01",
    name: "Dr. Eleanor Vance",
    role: ROLES.ADMIN,
    email: "eleanor.vance@oakridgeacademy.edu",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    title: "Head Administrator & Principal",
    department: "Executive Board",
    phone: "+1 (555) 019-2834",
    initials: "EV",
  },
  {
    id: "usr-teacher-01",
    name: "Prof. Marcus Aurel",
    role: ROLES.TEACHER,
    email: "marcus.aurel@oakridgeacademy.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Senior Physics Faculty",
    department: "Department of Sciences",
    phone: "+1 (555) 019-4821",
    initials: "MA",
  },
  {
    id: "usr-student-01",
    name: "Liam Alexander Chen",
    role: ROLES.STUDENT,
    email: "liam.chen@student.oakridgeacademy.edu",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    title: "Grade 10 - Section A",
    rollNumber: "ST-2025-104",
    department: "High School (Science Stream)",
    phone: "+1 (555) 019-8762",
    initials: "LC",
  },
  {
    id: "usr-accountant-01",
    name: "Sarah Jenkins, CPA",
    role: ROLES.ACCOUNTANT,
    email: "sarah.jenkins@oakridgeacademy.edu",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    title: "Chief Bursar & Accounts Officer",
    department: "Finance & Accounts",
    phone: "+1 (555) 019-9943",
    initials: "SJ",
  },
];

export const defaultUser = mockUsers[0]; // Admin by default
