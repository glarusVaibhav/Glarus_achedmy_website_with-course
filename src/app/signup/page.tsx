"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bot, UserPlus, Loader2, Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck, GraduationCap, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type SignupStep = "FORM" | "OTP" | "SUCCESS";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const urlRole = searchParams.get("role");
  const router = useRouter();
  const { login } = useAuth();

  const initialRole = urlRole?.toUpperCase() === "INSTRUCTOR" || urlRole?.toLowerCase() === "tutor" ? "INSTRUCTOR" : "STUDENT";

  // Form State
  const [step, setStep] = useState<SignupStep>("FORM");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(oauthError || "");
  const [successMsg, setSuccessMsg] = useState("");

  // Update role if query param changes
  useEffect(() => {
    if (urlRole) {
      if (urlRole.toUpperCase() === "INSTRUCTOR" || urlRole.toLowerCase() === "tutor") {
        setRole("INSTRUCTOR");
      }
    }
  }, [urlRole]);

  // Handle incoming OAuth errors
  useEffect(() => {
    if (oauthError) {
      setError(oauthError);
    }
  }, [oauthError]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Auto focus first OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Step 1: Submit Signup Form & Request OTP
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate registration");
      }

      setStep("OTP");
      setCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("Verification code sent to your email!");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP Input Navigation
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otpDigits];
    
    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 6).split("");
      pastedDigits.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtpDigits(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtpDigits(newOtp);

    if (cleaned !== "" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = "";
        setOtpDigits(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otpDigits];
    pastedData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtpDigits(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputsRef.current[nextIndex]?.focus();
  };

  // Step 3: Verify OTP & Activate Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/signup/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStep("SUCCESS");
      setSuccessMsg("Account verified successfully! Redirecting...");

      if (data.user) {
        login(data.user);
      }

      setTimeout(() => {
        router.push(data.redirectUrl || (role === "INSTRUCTOR" ? "/instructor" : "/dashboard"));
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/signup/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("A fresh verification code was sent to your email.");
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `/api/auth/google?from=signup&role=${role}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-card p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 text-white shadow-lg shadow-primary/20">
            {step === "SUCCESS" ? (
              <CheckCircle2 className="w-7 h-7 text-white" />
            ) : step === "OTP" ? (
              <ShieldCheck className="w-7 h-7 text-white" />
            ) : (
              <Bot className="w-7 h-7" />
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight text-center">
            {step === "FORM" && (role === "INSTRUCTOR" ? "Instructor Registration" : "Create Your Account")}
            {step === "OTP" && "Verify Your Email"}
            {step === "SUCCESS" && "Account Verified!"}
          </h1>
          
          <p className="text-subtext mt-1 text-sm text-center">
            {step === "FORM" && (role === "INSTRUCTOR" ? "Join GlarusAcademy as an expert educator & live mentor" : "Join the new era of AI education with GlarusAcademy")}
            {step === "OTP" && (
              <>
                We&apos;ve sent a 6-digit code to{" "}
                <span className="font-semibold text-text block mt-0.5 break-all">{email}</span>
              </>
            )}
            {step === "SUCCESS" && (role === "INSTRUCTOR" ? "Setting up your Instructor Command Center..." : "Setting up your personal student dashboard...")}
          </p>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 1: REGISTRATION FORM
           ══════════════════════════════════════════════ */}
        {step === "FORM" && (
          <>
            {/* Role Selection Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-background border border-card rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === "STUDENT"
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-subtext hover:text-text"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Learner / Student
              </button>

              <button
                type="button"
                onClick={() => setRole("INSTRUCTOR")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === "INSTRUCTOR"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                    : "text-subtext hover:text-text"
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Instructor / Tutor
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
                  placeholder="name@example.com"
                  autoComplete="email"
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
                  placeholder="At least 8 chars (A-Z, 0-9, symbol)"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-background border border-card text-text rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-subtext/50 text-sm"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-primary/25 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" /> {role === "INSTRUCTOR" ? "Register as Instructor" : "Create Account"}
                  </>
                )}
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
              onClick={handleGoogleSignup}
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
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Log in
              </Link>
            </p>
          </>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2: OTP VERIFICATION SCREEN
           ══════════════════════════════════════════════ */}
        {step === "OTP" && (
          <div className="space-y-6">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-background border border-card rounded-xl text-text focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              {/* Submit Verification */}
              <button
                type="submit"
                disabled={isLoading || otpDigits.join("").length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Verify & Complete Setup
                  </>
                )}
              </button>
            </form>

            {/* Resend & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("FORM");
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-subtext hover:text-text flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Change Email
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isResending}
                className="text-primary hover:underline font-semibold disabled:text-subtext/60 disabled:no-underline flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend Code in ${cooldown}s`
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3: SUCCESS ANIMATION / REDIRECT
           ══════════════════════════════════════════════ */}
        {step === "SUCCESS" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-text">Welcome to GlarusAcademy!</h3>
            <p className="text-sm text-subtext">Your email has been verified. Redirecting you to your {role === "INSTRUCTOR" ? "Instructor Portal" : "Student Dashboard"}...</p>
            <Loader2 className="w-6 h-6 text-primary animate-spin mt-2" />
          </div>
        )}

      </div>
    </div>
  );
}
