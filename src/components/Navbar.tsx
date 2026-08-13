"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { ShoppingCart, LogIn, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlist } from "@/store/useWishlist";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlist((state) => state.items);
  const { user, isLoading } = useAuth();
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

  const getAdminBreadcrumb = () => {
    if (!pathname || pathname === "/admin") return "Overview";
    const segment = pathname.replace("/admin/", "").split("/")[0];
    return segment.replace(/-/g, " ");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/80 backdrop-blur-md">
      <div className={`w-full mx-auto px-6 sm:px-10 h-16 flex items-center justify-between transition-all ${
        isAdmin ? "md:pl-72" : "max-w-[1650px]"
      }`}>
        {/* Left: Logo (for public/student) OR Breadcrumb (for admin) */}
        {isAdmin ? (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-subtext">
            <span className="text-primary font-bold uppercase tracking-wider text-[11px]">Admin Portal</span>
            <span className="text-subtext/40">/</span>
            <span className="text-text capitalize font-medium">{getAdminBreadcrumb()}</span>
          </div>
        ) : (
          <Link href="/" className="flex items-center cursor-pointer select-none group py-1">
            <Logo className="h-8 sm:h-9 w-auto" />
          </Link>
        )}
        
        {/* Middle: Links (Hidden on Admin) */}
        {!isAdmin && (
          <div className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-subtext hover:text-text transition-colors text-sm font-medium">Courses</Link>
            {mounted && user && (
              <Link href={getDashboardRoute()} className="text-subtext hover:text-text transition-colors text-sm font-medium">Dashboard</Link>
            )}
          </div>
        )}

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3.5">
          <ThemeToggle />
          
          {!isAdmin && (
            <>
              <Link href="/wishlist" className="relative p-2 text-subtext hover:text-rose-500 transition-colors">
                <Heart className="h-5 w-5" />
                {wishCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center shadow-sm">
                    {wishCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative p-2 text-subtext hover:text-text transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {mounted && user && <NotificationBell />}

          {/* ── Auth-Aware Section ── */}
          <div className="flex items-center gap-3 ml-1">
            {!mounted || isLoading ? (
              <div className="w-24 h-9 bg-card/60 rounded-lg animate-pulse" />
            ) : user ? (
              <UserProfileMenu />
            ) : (
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
