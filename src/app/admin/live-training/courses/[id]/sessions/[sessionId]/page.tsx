import React from "react";
import AdminSessionBuilder from "@/components/admin/live-training/AdminSessionBuilder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Session Builder & Agenda Architect | Admin Portal | Glarus Academy",
  description: "Configure workshop timeline, agenda steps, topics, outcomes, and AI assistant suggestions."
};

export default function SessionBuilderPage() {
  return <AdminSessionBuilder />;
}
