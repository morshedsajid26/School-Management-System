import { ROLES } from "@/utils/constants";

export const navigationConfig = {
  [ROLES.ADMIN]: [
    {
      group: "Core Operations",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: "LayoutDashboard",
          exact: true,
        },
        {
          label: "Academics",
          href: "/admin/academics",
          icon: "BookOpen",
          badge: "36 Classes",
          subItems: [
            { label: "Academics Overview", href: "/admin/academics" },
            { label: "Classes & Rooms", href: "/admin/classes" },
          ],
        },
        {
          label: "People",
          href: "/admin/students",
          icon: "Users2",
          badge: "1.5k",
          subItems: [
            { label: "Students Directory", href: "/admin/students" },
            { label: "Faculty & Teachers", href: "/admin/teachers" },
            { label: "Support Staff", href: "/admin/staff" },
          ],
        },
        {
          label: "Attendance",
          href: "/admin/attendance",
          icon: "CalendarCheck",
          badge: "95.4%",
        },
      ],
    },
    {
      group: "Academics & Logistics",
      items: [
        {
          label: "Examinations",
          href: "/admin/examinations",
          icon: "Award",
          badge: "Term 2",
        },
        {
          label: "Communication",
          href: "/admin/communication",
          icon: "Megaphone",
        },
        {
          label: "Resources",
          href: "/admin/resources",
          icon: "Library",
        },
      ],
    },
    {
      group: "Management & Records",
      items: [
        {
          label: "Finance",
          href: "/admin/finance",
          icon: "BadgeDollarSign",
        },
        {
          label: "Human Resources (HR)",
          href: "/admin/hr",
          icon: "Briefcase",
        },
        {
          label: "Reports & Analytics",
          href: "/admin/reports",
          icon: "BarChart3",
        },
        {
          label: "School Settings",
          href: "/admin/settings",
          icon: "Settings",
        },
      ],
    },
  ],

  [ROLES.TEACHER]: [
    {
      group: "Academic Portal",
      items: [
        { label: "Teacher Overview", href: "/teacher", icon: "LayoutDashboard", exact: true },
        { label: "My Classes", href: "/teacher/classes", icon: "BookOpen", badge: "4" },
        { label: "Take Attendance", href: "/teacher/attendance", icon: "ClipboardCheck" },
        { label: "Gradebook", href: "/teacher/grades", icon: "Award" },
      ],
    },
  ],

  [ROLES.STUDENT]: [
    {
      group: "Student Portal",
      items: [
        { label: "Student Overview", href: "/student", icon: "LayoutDashboard", exact: true },
        { label: "Class Schedule", href: "/student/schedule", icon: "Calendar" },
        { label: "My Grades & Report", href: "/student/grades", icon: "FileText" },
        { label: "Fee Receipts", href: "/student/fees", icon: "Receipt" },
      ],
    },
  ],

  [ROLES.ACCOUNTANT]: [
    {
      group: "Finance Portal",
      items: [
        { label: "Finance Overview", href: "/accountant", icon: "LayoutDashboard", exact: true },
        { label: "Fee Collection", href: "/accountant/fees", icon: "CreditCard" },
        { label: "Student Invoices", href: "/accountant/invoices", icon: "ReceiptText", badge: "18 Due" },
        { label: "Expenses & Payroll", href: "/accountant/expenses", icon: "PieChart" },
      ],
    },
  ],
};
