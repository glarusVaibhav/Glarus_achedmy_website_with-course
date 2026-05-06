"use client";

import { useWishlist } from "@/store/useWishlist";
import { CourseCard } from "@/components/CourseCard";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const { items } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-text">My Wishlist</h1>
            <p className="text-subtext mt-1">{items.length} {items.length === 1 ? 'course' : 'courses'} saved</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="w-full  py-32 flex flex-col items-center justify-center border-2 border-dashed border-card rounded-3xl bg-card/30">
            <Heart className="w-16 h-16 text-subtext/30 mb-6" />
            <h2 className="text-2xl font-bold text-text mb-2">Your wishlist is empty</h2>
            <p className="text-subtext mb-8">Courses you favorite will live here so you can easily find them later.</p>
            <Link 
              href="/courses" 
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
            >
              Explore Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((course) => (
              <CourseCard key={course.id} course={course as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
