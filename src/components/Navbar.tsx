"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingCart, LogIn, Heart, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/store/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlist((state) => state.items);
  const { user, isLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? items.length : 0;
  const wishCount = mounted ? wishlistItems.length : 0;

  // Determine dashboard route based on role
  const getDashboardRoute = () => {
    if (!user) return "/dashboard";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "INSTRUCTOR") return "/instructor";
    return "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-card bg-background/80 backdrop-blur-md">
      <div className="max-w-[1650px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl tracking-tight text-text">
            Glarus<span className="text-primary">Academy</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/courses" className="text-subtext hover:text-text transition-colors text-sm font-medium">Courses</Link>
          {user && (
            <Link href={getDashboardRoute()} className="text-subtext hover:text-text transition-colors text-sm font-medium">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/wishlist" className="relative p-2 text-subtext hover:text-rose-500 transition-colors">
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-sm">
                {wishCount}
              </span>
            )}
          </Link>
          {mounted && user && <NotificationBell />}
          <Link href="/cart" className="relative p-2 text-subtext hover:text-text transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {/* ── Auth-Aware Section ── */}
          <div className="flex items-center gap-3 ml-2">
            {isLoading ? (
              /* Brief skeleton while verifying — prevents flicker */
              <div className="w-24 h-9 bg-card rounded-lg animate-pulse" />
            ) : user ? (
              /* ── AUTHENTICATED USER PROFILE MENU ── */
              <UserProfileMenu />
            ) : (
              /* ── UNAUTHENTICATED VIEW ── */
              <>
                <Link href="/login" className="text-text font-medium hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link href="/signup" className="bg-primary text-white font-semibold px-5 py-2 rounded-lg hover:bg-primary/90 transition-all text-sm shadow-md flex items-center gap-2 bg-gradient-to-r from-primary to-accent">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
