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
            { label: "Academic Years & Terms", href: "/admin/academic-years" },
            { label: "School Calendar", href: "/admin/calendar" },
            { label: "Classes Cohorts", href: "/admin/classes" },
            { label: "Sections & Rooms", href: "/admin/sections" },
            { label: "Subject Catalog", href: "/admin/subjects" },
            { label: "Teacher Assignments", href: "/admin/assignments" },
            { label: "Class Routine & Timetable", href: "/admin/timetable" },
            { label: "Homework & Tasks", href: "/admin/homework" },
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
          subItems: [
            { label: "Student Attendance", href: "/admin/attendance" },
            { label: "Teacher Attendance", href: "/admin/attendance/teachers" },
          ],
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
          subItems: [
            { label: "Exam Schedules", href: "/admin/examinations" },
            { label: "Marks Entry", href: "/admin/examinations/marks" },
            { label: "Grading Scale", href: "/admin/examinations/grading" },
            { label: "Results & Report Cards", href: "/admin/examinations/results" },
          ],
        },
        {
          label: "Communication",
          href: "/admin/communication",
          icon: "Megaphone",
          subItems: [
            { label: "Notice Board", href: "/admin/communication" },
            { label: "Notifications Center", href: "/admin/notifications" },
          ],
        },
        {
          label: "Library",
          href: "/admin/library",
          icon: "BookOpenCheck",
          subItems: [
            { label: "Book Catalog", href: "/admin/library" },
            { label: "Book Categories", href: "/admin/library/categories" },
            { label: "Issued Books", href: "/admin/library/issued" },
            { label: "Return History", href: "/admin/library/returns" },
            { label: "Overdue Books", href: "/admin/library/overdue" },
          ],
        },
        {
          label: "Transport",
          href: "/admin/transport",
          icon: "Bus",
        },
        {
          label: "Inventory",
          href: "/admin/inventory",
          icon: "Boxes",
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
          label: "Finance & Fees",
          href: "/admin/finance",
          icon: "BadgeDollarSign",
          subItems: [
            { label: "Fee Structure", href: "/admin/finance/structure" },
            { label: "Student Invoices", href: "/admin/finance/invoices" },
            { label: "Payment Collection", href: "/admin/finance/collection" },
            { label: "Payment History", href: "/admin/finance/history" },
            { label: "Outstanding Dues", href: "/admin/finance/dues" },
          ],
        },
        {
          label: "Human Resources (HR)",
          href: "/admin/hr",
          icon: "Briefcase",
        },
        {
          label: "Payroll",
          href: "/admin/payroll",
          icon: "CreditCard",
        },
        {
          label: "Leave Management",
          href: "/admin/leave",
          icon: "CalendarCheck",
        },
        {
          label: "Certificates",
          href: "/admin/certificates",
          icon: "Award",
        },
        {
          label: "Reports & Analytics",
          href: "/admin/reports",
          icon: "BarChart3",
        },
        {
          label: "Roles & Permissions",
          href: "/admin/roles",
          icon: "ShieldCheck",
          badge: "6 Roles",
        },
        {
          label: "Audit Logs",
          href: "/admin/audit-logs",
          icon: "Activity",
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
