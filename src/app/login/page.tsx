"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bot, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(oauthError || "");
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (oauthError) {
      setError(oauthError);
    }
  }, [oauthError]);

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
          // Hydrate global auth context
          login(meData.user, data.redirectUrl || "/dashboard");
          return;
        }
      }

      // Fallback redirect
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google?from=login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-white shadow-lg shadow-primary/20">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">Welcome Back</h1>
          <p className="text-subtext mt-1 text-sm">Sign in to your GlarusAcademy account</p>
          
          <div className="text-subtext mt-4 text-center text-xs space-y-1.5 bg-background/80 border border-card p-3 rounded-xl w-full">
             <div className="font-semibold text-text mb-2">Test Accounts</div>
             <div className="flex justify-between"><span>Admin:</span> <span className="text-primary font-mono">admin@gmail.com</span></div>
             <div className="flex justify-between"><span>Instructor:</span> <span className="text-primary font-mono">piyushdhoke11@gmail.com</span></div>
             <div className="flex justify-between"><span>Student:</span> <span className="text-primary font-mono">arun.sharma@gmail.com</span></div>
             <div className="text-[10px] text-subtext/70 mt-1 pt-1 border-t border-card">Passwords: Admin/Instructor: Piyush@11 · Student: Arun@123</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
              placeholder="student@glarusacademy.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/25 cursor-pointer mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Sign In</>}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-card" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-subtext font-medium">OR</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 bg-background hover:bg-background/80 border border-card hover:border-primary/40 text-text rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.54 0 2.9.54 3.97 1.44l2.97-2.97C17.14 1.8 14.73 1 12 1 7.42 1 3.52 3.61 1.63 7.39l3.58 2.78C6.11 7.22 8.8 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.65 2.83c2.14-1.97 3.37-4.88 3.37-8.65z"
            />
            <path
              fill="#FBBC05"
              d="M5.21 14.83c-.24-.72-.38-1.49-.38-2.33s.14-1.61.38-2.33L1.63 7.39C.59 9.47 0 11.67 0 14s.59 4.53 1.63 6.61l3.58-2.78z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.65-2.83c-1.07.72-2.44 1.16-4.28 1.16-3.2 0-5.89-2.22-6.79-5.17L1.63 16.03C3.52 19.81 7.42 23 12 23z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-8 text-center text-subtext text-sm">
          Don&apos;t have an account? <Link href="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

