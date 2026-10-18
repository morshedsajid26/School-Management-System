import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Student Portal — Oakridge Academy",
  description: "Personal academic hub, class schedule, and progress report.",
};

export default function StudentLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
