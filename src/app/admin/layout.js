import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Admin Dashboard — Oakridge Academy",
  description: "Executive and administrative school management portal.",
};

export default function AdminLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
