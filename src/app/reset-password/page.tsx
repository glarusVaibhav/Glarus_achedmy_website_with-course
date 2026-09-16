"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";

  const [email, setEmail] = useState(urlEmail);
  const [resetToken, setResetToken] = useState(urlToken);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Hydrate from sessionStorage if query params are empty
  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem("reset_email");
      if (storedEmail) setEmail(storedEmail);
    }
    if (!resetToken && typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("reset_token");
      if (storedToken) setResetToken(storedToken);
    }
  }, [email, resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resetToken || !email) {
      setError("Password reset authorization missing. Please verify your OTP again.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password strength check
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      // Clear sensitive session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("reset_token");
        sessionStorage.removeItem("reset_email");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Direct access protection if no reset token exists
  if (!resetToken && !urlToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text">Authorization Required</h2>
          <p className="text-subtext mt-2 text-sm leading-relaxed">
            Direct access to this page is restricted. Please request a password reset and verify your email OTP first.
          </p>
          <div className="mt-6">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Start Password Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">Password Reset Successful</h2>
          <p className="text-subtext mt-3 text-sm leading-relaxed">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 text-white shadow-lg shadow-primary/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight text-center">Reset Password</h1>
          <p className="text-subtext mt-2 text-sm text-center leading-relaxed">
            Create a new secure password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 pr-11 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
                placeholder="At least 8 chars (A-Z, 0-9, symbol)"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text p-1 cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-subtext" /> : <Eye className="w-4 h-4 text-subtext" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 pr-11 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text p-1 cursor-pointer transition-colors"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-subtext" />
                ) : (
                  <Eye className="w-4 h-4 text-subtext" />
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-background/80 border border-card rounded-xl text-xs text-subtext space-y-1">
            <div className="font-semibold text-text">Password requirements:</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className={password.length >= 8 ? "text-emerald-400" : ""}>• 8+ characters</span>
              <span className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>• 1 uppercase</span>
              <span className={/[a-z]/.test(password) ? "text-emerald-400" : ""}>• 1 lowercase</span>
              <span className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>• 1 number</span>
              <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : ""}>• 1 special char</span>
              <span className={password && password === confirmPassword ? "text-emerald-400" : ""}>• Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/25 cursor-pointer mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-subtext hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
