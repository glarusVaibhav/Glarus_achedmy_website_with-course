"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  BookOpen,
  CreditCard,
  Bell,
  Lock,
  Check,
  Save,
  Loader2,
  Sparkles,
  Sliders,
  Users,
  Globe,
  Key,
  Mail,
  RotateCcw
} from "lucide-react";

export type SettingsGroup =
  | "general"
  | "roles"
  | "courses"
  | "payments"
  | "notifications"
  | "security";

export default function AdminSettingsPage() {
  const [activeGroup, setActiveGroup] = useState<SettingsGroup>("general");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [platformName, setPlatformName] = useState("Glarus Academy");
  const [supportEmail, setSupportEmail] = useState("support@glarus.edu");
  const [currency, setCurrency] = useState("INR");
  const [commissionPercent, setCommissionPercent] = useState("15");

  // Feature Toggles
  const [requireInstructorVerification, setRequireInstructorVerification] = useState(true);
  const [requireCourseApproval, setRequireCourseApproval] = useState(true);
  const [autoPublishApproved, setAutoPublishApproved] = useState(true);
  const [allowInstantRefunds, setAllowInstantRefunds] = useState(false);
  const [refundWindowDays, setRefundWindowDays] = useState("7");
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [taskPushAlerts, setTaskPushAlerts] = useState(true);
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState("60");

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            if (data.settings.platformName) setPlatformName(data.settings.platformName);
            if (data.settings.currency) setCurrency(data.settings.currency);
            if (data.settings.commissionPercent) setCommissionPercent(String(data.settings.commissionPercent));
          }
        }
      } catch {
        /* ignore */
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName,
          currency,
          commissionPercent: parseFloat(commissionPercent) || 15
        })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const SETTINGS_TABS: { id: SettingsGroup; label: string; icon: React.ElementType }[] = [
    { id: "general", label: "General & Branding", icon: Globe },
    { id: "roles", label: "Users & Roles", icon: Users },
    { id: "courses", label: "Course Governance", icon: BookOpen },
    { id: "payments", label: "Payments & Payouts", icon: CreditCard },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "security", label: "Security & Access", icon: Lock }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-3 px-4 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-2 animate-in fade-in shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Platform settings have been successfully updated and saved!</span>
        </div>
      )}

      {/* Main Settings Grid: Sub-navigation Sidebar + Content Pane */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings Subnav (3 Cols) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          <div className="bg-card border border-white/10 rounded-2xl p-2 shadow-xl space-y-1">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeGroup === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGroup(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-purple-600 text-white font-bold shadow-md"
                      : "text-subtext hover:text-text hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-purple-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Form Pane (9 Cols) */}
        <div className="md:col-span-8 lg:col-span-9">
          <form onSubmit={handleSaveSettings} className="bg-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            {/* ── 1. GENERAL ── */}
            {activeGroup === "general" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">General Platform Configuration</h3>
                  <p className="text-xs text-subtext">Manage core platform metadata and support contact points</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                      Support Contact Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. USERS & ROLES ── */}
            {activeGroup === "roles" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">Users & Administrative Roles</h3>
                  <p className="text-xs text-subtext">Control onboarding pipelines and role privileges</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Require Instructor Identity Verification</p>
                      <p className="text-[11px] text-subtext">Mandates admin approval of resume & intro video before course creation.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireInstructorVerification}
                      onChange={(e) => setRequireInstructorVerification(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ── 3. COURSES ── */}
            {activeGroup === "courses" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">Course Governance & Catalog Quality</h3>
                  <p className="text-xs text-subtext">Syllabus quality gates and default pricing models</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Enforce Admin Course Approvals</p>
                      <p className="text-[11px] text-subtext">New courses remain in Pending queue until audited by Academic Ops.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireCourseApproval}
                      onChange={(e) => setRequireCourseApproval(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Auto-Publish on Approval</p>
                      <p className="text-[11px] text-subtext">Directly list approved courses in the student marketplace catalog.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoPublishApproved}
                      onChange={(e) => setAutoPublishApproved(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ── 4. PAYMENTS ── */}
            {activeGroup === "payments" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">Payments, Commissions & Refund Policies</h3>
                  <p className="text-xs text-subtext">Configure revenue split, refund windows, and settlement currencies</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                      Platform Settlement Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                    Student Refund Eligibility Window (Days)
                  </label>
                  <input
                    type="number"
                    value={refundWindowDays}
                    onChange={(e) => setRefundWindowDays(e.target.value)}
                    className="w-full sm:w-48 bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
            )}

            {/* ── 5. NOTIFICATIONS ── */}
            {activeGroup === "notifications" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">Notification Channels & Delivery</h3>
                  <p className="text-xs text-subtext">Manage automated email alerts and in-app bell triggers</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Automated Email Notifications</p>
                      <p className="text-[11px] text-subtext">Send verification updates, task assignments, and invoices via SMTP.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotificationsEnabled}
                      onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Instant Task Push Alerts</p>
                      <p className="text-[11px] text-subtext">Alert admins when instructors submit deliverables for review.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={taskPushAlerts}
                      onChange={(e) => setTaskPushAlerts(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ── 6. SECURITY ── */}
            {activeGroup === "security" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-text">Security, Authentication & Sessions</h3>
                  <p className="text-xs text-subtext">Admin authentication policies and session expiration</p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-white/5 cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-text">Enforce 2-Factor Authentication (2FA) for Admins</p>
                      <p className="text-[11px] text-subtext">Requires TOTP authenticator code on every staff login.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorEnforced}
                      onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </label>

                  <div>
                    <label className="text-[11px] font-bold text-subtext uppercase tracking-wider block mb-1">
                      Admin Inactivity Session Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      value={sessionTimeoutMinutes}
                      onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                      className="w-full sm:w-48 bg-background border border-white/10 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Button Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
