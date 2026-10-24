import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Admin Dashboard — Oakridge Academy",
  description: "Executive and administrative school management portal.",
};

// Central Page Width Configuration for Admin Portal:
// Change this value to adjust the width across all Admin pages:
// Examples: "max-w-[1760px]", "max-w-[1920px]", "max-w-full", "max-w-screen-2xl"
export const ADMIN_LAYOUT_CONFIG = {
  maxWidth: "max-w-[1760px]",
};

export default function AdminLayout({ children }) {
  return (
    <DashboardShell contentMaxWidth={ADMIN_LAYOUT_CONFIG.maxWidth}>
      {children}
    </DashboardShell>
  );
}
