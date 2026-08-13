import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Admin Portal | Glarus Academy",
  description: "Enterprise LMS Administration & Operations Command Center",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
