"use client";

import { useCartStore } from "@/store/cartStore";
import { useEnrollmentStore } from "@/store/useEnrollmentStore";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, CreditCard, ChevronRight, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function CheckoutContent() {
  const { total, items, addItem, clearCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-populate cart from URL query params if provided
  useEffect(() => {
    setMounted(true);

    const queryCourseId = searchParams.get("courseId");
    const queryType = searchParams.get("type");

    if (queryCourseId && items.length === 0) {
      if (queryType === "live") {
        fetch(`/api/student/live-courses/${encodeURIComponent(queryCourseId)}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.course) {
              addItem({
                id: json.course.id,
                title: json.course.title,
                instructor: json.course.instructor?.name || "Lead Cohort Instructor",
                price: json.course.price || 18999,
                level: json.course.level || "Intermediate",
                rating: 4.9,
                duration: json.course.duration || "4 Weeks",
                image: "/images/courses/generative-ai.png",
                isLive: true,
              } as any);
            }
          })
          .catch(() => {});
      } else {
        fetch(`/api/courses/${encodeURIComponent(queryCourseId)}`)
          .then((res) => res.json())
          .then((json) => {
            const c = json.data || json.course;
            if (c) {
              addItem({
                id: c.id,
                title: c.title,
                instructor: c.instructor?.name || "Senior AI Architect",
                price: c.price || 4999,
                level: c.level || "All Levels",
                rating: 4.9,
                duration: c.duration || "30h Self-Paced",
                image: "/images/courses/generative-ai.png",
                isLive: false,
              } as any);
            }
          })
          .catch(() => {});
      }
    }
  }, [searchParams, items.length, addItem]);

  if (!mounted) return null;

  if (items.length === 0 && !searchParams.get("courseId")) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-text mb-2">Your Cart is Empty</h2>
        <p className="text-subtext text-sm mb-6 max-w-md">
          Explore our catalog of live cohorts and self-paced curriculums to unlock access.
        </p>
        <Link
          href="/courses"
          className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Courses
        </Link>
      </div>
    );
  }

  const handlePayment = async () => {
    setErrorMessage(null);

    // If user is not logged in, prompt login
    if (!isAuthenticated && !user) {
      router.push(`/login?redirect=/checkout`);
      return;
    }

    setIsProcessing(true);

    try {
      const checkoutItems = items.map((it: any) => ({
        id: it.id,
        type: it.isLive ? ("LIVE_COURSE" as const) : ("SELF_PACED_COURSE" as const),
      }));

      const payload = {
        items: checkoutItems,
        paymentMethod: "CARD",
        billingDetails: {
          name: user?.name || "Student Learner",
          email: user?.email || "",
        },
      };

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Payment processing failed. Please try again.");
      }

      // Sync client-side enrollment store
      for (const item of items) {
        useEnrollmentStore.getState().enrollCourse(item.id);
      }

      setSuccess(true);
      clearCart();

      // Short delay for visual confirmation, then navigate to dashboard
      setTimeout(() => {
        router.push("/dashboard?enrolled=true");
      }, 1200);
    } catch (err: any) {
      console.error("[Checkout Error]:", err);
      setErrorMessage(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-[85vh] py-16 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="px-3.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-black uppercase tracking-widest inline-block mb-3">
            Instant Enrollment
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-text mb-2">Secure Checkout</h1>
          <p className="text-subtext text-sm">Complete your purchase to immediately unlock your courses and live sessions.</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-3 shadow-lg shadow-emerald-950/20">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400 animate-bounce" />
            <div>
              <p className="text-white font-black">Enrollment Successful!</p>
              <p className="text-emerald-300/80 text-xs font-medium">Redirecting you to your Student Dashboard...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Order Summary */}
          <div className="order-2 md:order-1 bg-card/50 border border-card rounded-3xl p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-card">
                <h2 className="text-lg font-black text-text">Order Summary</h2>
                <span className="text-xs font-bold text-subtext">{items.length} {items.length === 1 ? "Course" : "Courses"}</span>
              </div>

              <div className="space-y-4 mb-6">
                {items.map((item: any) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-background/60 border border-card flex items-center justify-between text-sm">
                    <div className="min-w-0 pr-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block mb-0.5">
                        {item.isLive ? "Live Cohort Training" : "Self-Paced Course"}
                      </span>
                      <p className="text-text font-bold truncate text-xs sm:text-sm">{item.title}</p>
                    </div>
                    <span className="text-text font-black text-sm shrink-0">
                      ₹{item.price ? item.price.toLocaleString() : "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="h-px w-full bg-card mb-4" />
              <div className="flex items-center justify-between text-base font-black text-text mb-1">
                <span>Total Amount</span>
                <span className="text-lg sm:text-xl text-emerald-400 font-mono">₹{total.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-subtext">Inclusive of GST, certificate verification, and lifetime updates</p>
            </div>
          </div>

          {/* Right: Payment Method & CTA Container */}
          <div className="order-1 md:order-2">
            <div className="bg-card border border-card/80 rounded-3xl p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <h2 className="text-lg font-black text-text mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <div className="w-full p-4 border-2 border-purple-500/60 bg-purple-500/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-4 border-purple-500 bg-background" />
                      <div>
                        <span className="font-bold text-xs text-text block">Credit / Debit Card / NetBanking</span>
                        <span className="text-[10px] text-subtext">Instant automated enrollment access</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full p-4 border border-card rounded-2xl flex items-center gap-3 opacity-60">
                    <div className="w-4 h-4 rounded-full border border-subtext" />
                    <div>
                      <span className="font-bold text-xs text-text block">UPI / QR Code</span>
                      <span className="text-[10px] text-subtext">Available for INR transactions</span>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && !user && (
                  <div className="mt-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold">Sign in required to link course to your account.</span>
                    <Link
                      href="/login?redirect=/checkout"
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || success}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30 hover:shadow-purple-700/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Enrollment...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>Enrolled! Loading Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{total.toLocaleString()} & Enroll</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-subtext">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-bit encrypted SSL checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
