"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Fetch full user profile after successful cookie-based login
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) {
          // Hydrate the global auth context — Navbar updates instantly
          login(meData.user, data.redirectUrl || "/dashboard");
          return;
        }
      }

      // Fallback: just redirect
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full point-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full point-events-none" />

      <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-white">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
          <div className="text-subtext mt-4 text-center text-xs space-y-1.5 bg-background border border-card p-3 rounded-xl w-full">
             <div className="font-semibold text-text mb-2">Test Accounts</div>
             <div className="flex justify-between"><span>Admin:</span> <span className="text-primary font-mono">admin@gmail.com</span></div>
             <div className="flex justify-between"><span>Instructor:</span> <span className="text-primary font-mono">piyushdhoke11@gmail.com</span></div>
             <div className="flex justify-between"><span>Student:</span> <span className="text-primary font-mono">arun.sharma@gmail.com</span></div>
             <div className="text-[10px] text-subtext/70 mt-1 pt-1 border-t border-card">Passwords: Admin/Instructor: Piyush@11 · Student: Arun@123</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="student@glarusacademy.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/25"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="w-5 h-5" /> Sign In</>}
          </button>
        </form>

        <p className="mt-8 text-center text-subtext text-sm">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
