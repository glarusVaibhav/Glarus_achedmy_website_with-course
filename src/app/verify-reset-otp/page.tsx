"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, RefreshCw, Loader2, KeyRound } from "lucide-react";

export default function VerifyResetOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyResetOtpContent />
    </Suspense>
  );
}

function VerifyResetOtpContent() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(urlEmail);
  const router = useRouter();

  // Retrieve email from sessionStorage if not in URL
  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("reset_email");
      if (stored) {
        setEmail(stored);
      }
    }
  }, [email]);

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto focus first input on load
  useEffect(() => {
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 150);
  }, []);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (!email) {
      setError("Email address missing. Please request a new verification code.");
      return;
    }

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
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

      setSuccessMsg("Code verified successfully! Proceeding to reset password...");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("reset_token", data.resetToken);
        sessionStorage.setItem("reset_email", email.trim().toLowerCase());
      }

      setTimeout(() => {
        router.push(
          `/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&token=${encodeURIComponent(
            data.resetToken
          )}`
        );
      }, 900);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    if (!email) {
      setError("Email address missing. Please return to the Forgot Password page.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/forgot-password/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setCooldown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("A new verification code has been sent to your email.");
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-card border border-card p-10 rounded-3xl shadow-2xl relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text">Session Missing</h2>
          <p className="text-subtext mt-2 text-sm leading-relaxed">
            Please start the password reset process by entering your email address.
          </p>
          <div className="mt-6">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Go to Forgot Password
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
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight text-center">Verify Your Email</h1>
          <p className="text-subtext mt-2 text-sm text-center leading-relaxed">
            Enter the 6-digit verification code sent to
            <span className="font-semibold text-text block mt-0.5 break-all">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl text-center leading-relaxed">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl text-center leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
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

          <button
            type="submit"
            disabled={isLoading || otpDigits.join("").length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/25 cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Verify OTP
              </>
            )}
          </button>
        </form>

        {/* Resend & Back Actions */}
        <div className="mt-6 pt-4 border-t border-card space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-subtext">Didn&apos;t receive the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="text-primary hover:underline font-semibold disabled:text-subtext/60 disabled:no-underline flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Resending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-subtext hover:text-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
