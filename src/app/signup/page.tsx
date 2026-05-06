"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, UserPlus } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Must map exactly to what the user provides. The UI `role` lowercase needs adjusting.
      const mappedRole = role.toUpperCase(); // STUDENT, INSTRUCTOR, ADMIN
      
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: mappedRole })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect based on role
      let redirectUrl = "/dashboard";
      if (mappedRole === "INSTRUCTOR") redirectUrl = "/instructor";
      if (mappedRole === "ADMIN") redirectUrl = "/admin";

      router.push(redirectUrl);
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
          <h1 className="text-3xl font-bold text-text">Create Account</h1>
          <p className="text-subtext mt-2 text-sm">Join the new era of AI education</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              placeholder="name@example.com"
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

          <div>
            <label className="block text-sm font-medium text-text mb-2">I am a...</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/25 mt-2 bg-gradient-to-r from-primary to-accent"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5" /> Sign Up</>}
          </button>
        </form>

        <p className="mt-8 text-center text-subtext text-sm">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
