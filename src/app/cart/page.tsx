"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import { Trash2, ArrowRight, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, total } = useCartStore();

  return (
    <div className="w-full min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-text mb-12">Shopping <span className="text-primary">Cart</span></h1>

        {items.length === 0 ? (
          <div className="bg-card border border-card rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-xl">
            <div className="mb-6 animate-bounce">
              <span className="text-6xl">🛒</span>
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">Your cart is empty</h2>
            <p className="text-subtext mb-8">Looks like you haven't added any courses to your cart yet. Discover your next learning adventure!</p>
            <Link href="/courses" className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold transition-all inline-flex items-center gap-2">
              Browse Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-card border border-card rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 relative shadow-lg">
                  <div className="w-full sm:w-32 h-24 bg-gradient-to-br from-primary/80 to-accent/80 rounded-xl shrink-0" />
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-subtext mb-2">By {item.instructor}</p>
                    <div className="inline-flex px-2 py-1 bg-background border border-card text-xs font-semibold rounded-md text-subtext">
                      {item.level}
                    </div>
                  </div>

                  <div className="text-center sm:text-right shrink-0">
                    <div className="text-2xl font-bold text-text mb-4">₹{item.price.toLocaleString()}</div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-500 transition-colors flex items-center justify-center sm:justify-end gap-1 text-sm font-medium w-full"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-background border border-card rounded-3xl p-8 sticky top-24 shadow-2xl">
                <h2 className="text-2xl font-bold text-text mb-6">Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-subtext">
                    <span>Original Price:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-500 font-medium">
                    <span>Discounts:</span>
                    <span>-₹0</span>
                  </div>
                  <div className="h-px w-full bg-card" />
                  <div className="flex items-center justify-between text-xl font-bold text-text">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mb-4">
                  Checkout
                </Link>
                
                <p className="text-xs text-center text-subtext flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  30-day Money-Back Guarantee
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
