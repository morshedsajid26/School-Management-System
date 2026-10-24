import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Teacher Portal — Oakridge Academy",
  description: "Academic classroom management, attendance, and grading.",
};

// Central Page Width Configuration for Teacher Portal:
// Change this value to adjust the width across all Teacher pages:
export const TEACHER_LAYOUT_CONFIG = {
  maxWidth: "max-w-[1760px]",
};

export default function TeacherLayout({ children }) {
  return (
    <DashboardShell contentMaxWidth={TEACHER_LAYOUT_CONFIG.maxWidth}>
      {children}
    </DashboardShell>
  );
}
