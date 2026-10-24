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
          label: "Batch Attendance",
          href: "/admin/attendance",
          icon: "CalendarCheck",
          badge: "View Only",
          subItems: [
            { label: "Batch-wise Student View", href: "/admin/attendance" },
            { label: "Faculty Attendance (Auto)", href: "/admin/attendance/teachers" },
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
      group: "Batch & Course Management",
      items: [
        {
          label: "Batch Management",
          href: "/admin/classes",
          icon: "School",
        },
        {
          label: "Section Management",
          href: "/admin/sections",
          icon: "DoorOpen",
        },
        {
          label: "Course Management",
          href: "/admin/subjects",
          icon: "BookOpen",
        },
        {
          label: "Course & Teacher Assign",
          href: "/admin/assignments",
          icon: "ClipboardCheck",
          badge: "Assign",
        },
      ],
    },
    {
      group: "Faculty & Students",
      items: [
        {
          label: "Teacher Management",
          href: "/admin/teachers",
          icon: "GraduationCap",
        },
        {
          label: "Students Directory",
          href: "/admin/students",
          icon: "Users2",
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
