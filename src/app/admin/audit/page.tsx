"use client";

import { ShieldAlert } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
         <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black mb-2 text-text">Security Audit Logs</h1>
      <p className="text-subtext max-w-md text-center">End-to-end historical log tracking and admin action verification module is loading.</p>
    </div>
  );
}
