import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Student Portal — Oakridge Academy",
  description: "Personal academic hub, class schedule, and progress report.",
};

// Central Page Width Configuration for Student Portal:
// Change this value to adjust the width across all Student pages:
export const STUDENT_LAYOUT_CONFIG = {
  maxWidth: "max-w-[1760px]",
};

export default function StudentLayout({ children }) {
  return (
    <DashboardShell contentMaxWidth={STUDENT_LAYOUT_CONFIG.maxWidth}>
      {children}
    </DashboardShell>
  );
}
