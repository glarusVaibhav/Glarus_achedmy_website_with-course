"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("glarus_admin_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("glarus_admin_sidebar_collapsed", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-text flex admin-dashboard selection:bg-purple-500/30">
      {/* Dynamic Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <AdminHeader
          onToggleSidebar={() => setMobileOpen(true)}
          isSidebarCollapsed={collapsed}
        />

        <main className="flex-1 p-5 sm:p-8 max-w-[1600px] w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
