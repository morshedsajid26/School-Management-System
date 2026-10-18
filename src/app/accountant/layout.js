import DashboardShell from "@/components/layout/DashboardShell";

export const metadata = {
  title: "Accountant Portal — Oakridge Academy",
  description: "Bursary, student tuition collection, and institutional ledger.",
};

export default function AccountantLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
