"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  User, 
  Shield, 
  Bell, 
  KeyRound, 
  Check, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  Save, 
  Globe, 
  Mail, 
  Lock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("Lifelong learner & tech enthusiast.");
  const [headline, setHeadline] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-text mb-2">Sign in Required</h2>
        <p className="text-subtext mb-6">Please log in to manage your account settings.</p>
        <Link href="/login" className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg">
          Go to Login
        </Link>
      </div>
    );
  }

  const roleDetails = {
    ADMIN: { label: "Super Administrator", icon: ShieldCheck, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
    INSTRUCTOR: { label: "Verified Educator", icon: Sparkles, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
    STUDENT: { label: "Student Member", icon: GraduationCap, color: "text-blue-400 border-blue-500/30 bg-blue-500/10" }
  }[user.role];

  const RoleIcon = roleDetails.icon;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-text py-12 px-6 sm:px-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href={user.role === "ADMIN" ? "/admin" : user.role === "INSTRUCTOR" ? "/instructor" : "/dashboard"}
              className="p-2 rounded-xl bg-card hover:bg-card/80 text-subtext hover:text-text transition-colors border border-card/60"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Account & Settings</h1>
          </div>
          <p className="text-subtext text-sm">Manage your profile, security credentials, and preferences.</p>
        </div>

        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs font-bold ${roleDetails.color}`}>
          <RoleIcon className="w-4 h-4" />
          <span>{roleDetails.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <aside className="space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
              activeTab === "profile" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-card/40 text-subtext hover:text-text hover:bg-card border border-card/60"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Info</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
              activeTab === "security" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-card/40 text-subtext hover:text-text hover:bg-card border border-card/60"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Auth</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
              activeTab === "notifications" 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "bg-card/40 text-subtext hover:text-text hover:bg-card border border-card/60"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </aside>

        {/* Content Box */}
        <main className="md:col-span-3 bg-card/40 border border-card/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold mb-1">Personal Profile</h3>
                <p className="text-subtext text-xs">Update your public name and bio visible across GlarusAcademy.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-subtext absolute left-4 top-3.5" />
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-card rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-subtext absolute left-4 top-3.5" />
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-background/50 opacity-70 border border-card rounded-2xl pl-11 pr-4 py-3 text-sm font-medium cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-subtext mt-1">Email cannot be changed directly for security reasons.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">Headline / Role</label>
                  <input 
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior AI Engineer / Student at Tech University"
                    className="w-full bg-background border border-card rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-card rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-card flex items-center justify-between">
                {isSaved ? (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                    <Check className="w-4 h-4" /> Changes saved successfully!
                  </span>
                ) : <span />}
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold mb-1">Security & Credentials</h3>
                <p className="text-subtext text-xs">Manage your password and security settings.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-subtext absolute left-4 top-3.5" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-background border border-card rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-subtext mb-1.5">New Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-subtext absolute left-4 top-3.5" />
                    <input 
                      type="password"
                      placeholder="Enter new password"
                      className="w-full bg-background border border-card rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-card flex justify-end">
                <button className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold mb-1">Notification Preferences</h3>
                <p className="text-subtext text-xs">Control how and when you receive updates.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-background border border-card rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-sm block">Course Announcements</span>
                    <span className="text-subtext text-xs">Get notified when new lessons or assignments are added.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded" />
                </label>

                <label className="flex items-center justify-between p-4 bg-background border border-card rounded-2xl cursor-pointer">
                  <div>
                    <span className="font-bold text-sm block">Platform Updates & AI Features</span>
                    <span className="text-subtext text-xs">Receive updates on new AI agents and platform features.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary rounded" />
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
