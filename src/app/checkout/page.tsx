"use client";

import { useCartStore } from "@/store/cartStore";
import { useEnrollmentStore } from "@/store/useEnrollmentStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, CreditCard, ChevronRight } from "lucide-react";

export default function CheckoutPage() {
  const { total, items, clearCart } = useCartStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Process purchase for each item in cart and enroll user
      for (const item of items) {
         useEnrollmentStore.getState().enrollCourse(item.id);
         await fetch("/api/purchase", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ courseId: item.id })
         }).catch(() => {
           // fallback client side enrollment
         });
      }
      
      clearCart();
      router.push("/dashboard?success=true");
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] py-20 flex flex-col items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-text mb-4">Secure Checkout</h1>
          <p className="text-subtext">Complete your purchase to unlock your courses immediately.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-bold text-text mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-subtext truncate pr-4">{item.title}</span>
                  <span className="text-text font-medium">₹{item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="h-px w-full bg-card mb-4" />
            <div className="flex items-center justify-between text-lg font-bold text-text">
              <span>Total Payable</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Container (Mock) */}
          <div className="order-1 md:order-2">
            <div className="bg-card border border-card rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              
              <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <div className="w-full p-4 border border-primary bg-primary/5 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-primary bg-background" />
                    <span className="font-medium text-text">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-background rounded border border-card" />
                    <div className="w-8 h-5 bg-background rounded border border-card" />
                  </div>
                </div>
                
                <div className="w-full p-4 border border-card rounded-xl flex items-center gap-3 cursor-not-allowed opacity-50">
                  <div className="w-4 h-4 rounded-full border border-subtext" />
                  <span className="font-medium text-text">UPI / Net Banking</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-text text-background font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay ₹{total.toLocaleString()} <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-subtext">
                  <Lock className="w-3 h-3" /> Payments are secure and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
