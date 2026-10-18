import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Teacher Portal — Oakridge Academy",
  description: "Academic classroom management, attendance, and grading.",
};

export default function TeacherLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
