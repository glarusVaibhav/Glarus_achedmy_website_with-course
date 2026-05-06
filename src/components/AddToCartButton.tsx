"use client";

import { useCartStore } from "@/store/cartStore";
import { Course } from "@/components/CourseCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function AddToCartButton({ course }: { course: Course }) {
  const { addItem, items } = useCartStore();
  const router = useRouter();
  const { requireAuth } = useAuth();
  
  const inCart = items.some(item => item.id === course.id);

  const handleAdd = () => {
    requireAuth(() => {
      if (!inCart) {
        addItem(course);
      }
    });
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      if (!inCart) {
        addItem(course);
      }
      router.push("/checkout");
    });
  };

  return (
    <>
      <button 
        onClick={handleBuyNow}
        className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg transition-all mb-4 shadow-lg shadow-primary/25"
      >
        Buy Now
      </button>
      <button 
        onClick={handleAdd}
        disabled={inCart}
        className={`w-full py-4 border rounded-full font-bold transition-all ${
          inCart 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 cursor-not-allowed" 
            : "bg-card hover:bg-card/80 border-card text-text"
        }`}
      >
        {inCart ? "In Cart" : "Add to Cart"}
      </button>
    </>
  );
}
