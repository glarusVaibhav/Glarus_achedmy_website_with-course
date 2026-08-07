"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  BookOpen, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  GraduationCap,
  Bell,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  // Configuration based on User Role
  const roleConfig = {
    ADMIN: {
      label: "Super Admin",
      badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      avatarBg: "bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500",
      icon: ShieldCheck,
      dashboardRoute: "/admin",
      settingsRoute: "/admin/settings",
    },
    INSTRUCTOR: {
      label: "Instructor Studio",
      badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      avatarBg: "bg-gradient-to-tr from-purple-600 via-violet-500 to-indigo-500",
      icon: Sparkles,
      dashboardRoute: "/instructor",
      settingsRoute: "/settings",
    },
    STUDENT: {
      label: "Student Account",
      badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      avatarBg: "bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500",
      icon: GraduationCap,
      dashboardRoute: "/dashboard",
      settingsRoute: "/settings",
    },
  };

  const config = roleConfig[user.role] || roleConfig.STUDENT;
  const RoleIcon = config.icon;
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* ── AVATAR TRIGGER BUTTON ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-card/60 hover:bg-card border border-card/80 hover:border-primary/40 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-expanded={isOpen}
      >
        <div className={`w-8 h-8 rounded-full ${config.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-md transition-transform group-hover:scale-105`}>
          {userInitial}
        </div>

        <div className="hidden sm:flex flex-col text-left leading-none">
          <span className="text-xs font-bold text-text group-hover:text-primary transition-colors max-w-[120px] truncate">
            {user.name || user.email.split("@")[0]}
          </span>
          <span className="text-[10px] font-semibold text-subtext uppercase tracking-wider mt-0.5">
            {user.role}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-subtext transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
      </button>

      {/* ── DROPDOWN POPUP MENU ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-72 bg-background/95 backdrop-blur-xl border border-card/80 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
          >
            {/* Header: User Info Card */}
            <div className="p-3 bg-card/40 rounded-2xl border border-card/60 mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl ${config.avatarBg} text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0`}>
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-sm text-text truncate">
                    {user.name || "User"}
                  </h4>
                  <p className="text-xs text-subtext truncate font-medium">
                    {user.email}
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.badgeBg}">
                    <RoleIcon className="w-3 h-3" />
                    <span>{config.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              <Link
                href={config.dashboardRoute}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text hover:text-primary hover:bg-primary/10 transition-colors group"
              >
                <LayoutDashboard className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                <span>Dashboard</span>
              </Link>

              <Link
                href={config.settingsRoute}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-text hover:text-primary hover:bg-primary/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                  <span>Account & Settings</span>
                </div>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono uppercase">
                  Access
                </span>
              </Link>

              {user.role === "STUDENT" && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text hover:text-primary hover:bg-primary/10 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-subtext group-hover:text-primary transition-colors" />
                  <span>My Enrolled Courses</span>
                </Link>
              )}

              {user.role === "INSTRUCTOR" && (
                <Link
                  href="/instructor"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text hover:text-purple-400 hover:bg-purple-500/10 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-subtext group-hover:text-purple-400 transition-colors" />
                  <span>Course Management</span>
                </Link>
              )}

              {user.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-text hover:text-amber-400 hover:bg-amber-500/10 transition-colors group"
                >
                  <User className="w-4 h-4 text-subtext group-hover:text-amber-400 transition-colors" />
                  <span>User Management</span>
                </Link>
              )}
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-card/80" />

            {/* Logout Option */}
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/80 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Log Out</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
