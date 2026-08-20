import React from "react";
import AdminLiveSessionsList from "@/components/admin/live-training/AdminLiveSessionsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Training Sessions | Admin Portal | Glarus Academy",
  description: "Directory of all scheduled, active, and completed live workshop sessions across cohorts."
};

export default function AdminLiveSessionsPage() {
  return <AdminLiveSessionsList />;
}
