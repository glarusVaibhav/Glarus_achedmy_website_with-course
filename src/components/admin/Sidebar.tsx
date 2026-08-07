"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

import { UserProfileMenu } from "../UserProfileMenu";

const sidebarNav = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Instructor Approvals", href: "/admin/approvals", icon: ShieldCheck },
  { name: "Instructor Management", href: "/admin/instructors", icon: GraduationCap },
  { name: "Course Management", href: "/admin/courses", icon: BookOpen },
  { name: "Student Management", href: "/admin/students", icon: Users },
  { name: "Refund Management", href: "/admin/refunds", icon: RotateCcw },
  { name: "Analytics", href: "/admin/analytics", icon: Activity },
  { name: "Audit Logs", href: "/admin/audit", icon: ShieldAlert },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-card/80 backdrop-blur-xl border-r border-card/40 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          GlarusAcademy Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 relative">
        {sidebarNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href} className="block relative group">
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative z-10 ${
                isActive ? "text-primary font-bold" : "text-subtext group-hover:text-text group-hover:bg-background/40"
              }`}>
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-subtext/70 group-hover:text-text"}`} />
                <span className="text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-card/40 flex justify-center">
        <UserProfileMenu />
      </div>
    </div>
  );
}
