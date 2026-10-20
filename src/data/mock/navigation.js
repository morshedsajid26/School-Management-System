import { ROLES } from "@/utils/constants";

export const navigationConfig = {
  [ROLES.ADMIN]: [
    {
      group: "Attendance Management",
      items: [
        {
          label: "Attendance Dashboard",
          href: "/admin",
          icon: "LayoutDashboard",
          exact: true,
        },
        {
          label: "Daily Attendance",
          href: "/admin/attendance",
          icon: "CalendarCheck",
          badge: "Daily",
          subItems: [
            { label: "Student Roll Call", href: "/admin/attendance" },
            { label: "Teacher & Staff Attendance", href: "/admin/attendance/teachers" },
          ],
        },
        {
          label: "Attendance Reports",
          href: "/admin/attendance/reports",
          icon: "BarChart3",
          badge: "Monthly",
        },
      ],
    },
    {
      group: "Course & Teacher Allocation",
      items: [
        {
          label: "Teacher Course Assign",
          href: "/admin/assignments",
          icon: "ClipboardCheck",
          badge: "Assign",
        },
        {
          label: "Students Directory",
          href: "/admin/students",
          icon: "Users2",
          badge: "1.5k",
        },
        {
          label: "Classes & Sections",
          href: "/admin/classes",
          icon: "School",
        },
      ],
    },
    {
      group: "Configuration",
      items: [
        {
          label: "System Settings",
          href: "/admin/settings",
          icon: "Settings",
        },
      ],
    },
  ],

  [ROLES.TEACHER]: [
    {
      group: "Teacher Attendance Portal",
      items: [
        { label: "Teacher Dashboard", href: "/teacher", icon: "LayoutDashboard", exact: true },
        { label: "Take Course Attendance", href: "/teacher/attendance", icon: "ClipboardCheck", badge: "Period Roll Call" },
        { label: "Monthly Reports", href: "/admin/attendance/reports", icon: "BarChart3" },
        { label: "Students Directory", href: "/admin/students", icon: "Users2" },
      ],
    },
  ],

  [ROLES.STUDENT]: [
    {
      group: "Student Portal",
      items: [
        { label: "Attendance Record", href: "/admin/attendance", icon: "CalendarCheck", exact: true },
        { label: "Monthly Summary", href: "/admin/attendance/reports", icon: "BarChart3" },
      ],
    },
  ],

  [ROLES.ACCOUNTANT]: [
    {
      group: "Staff Portal",
      items: [
        { label: "Attendance Summary", href: "/admin", icon: "LayoutDashboard", exact: true },
        { label: "Staff Attendance", href: "/admin/attendance/teachers", icon: "CalendarCheck" },
      ],
    },
  ],
};
