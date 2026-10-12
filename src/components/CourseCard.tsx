"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Clock, BarChart, Heart } from "lucide-react";
import { useWishlist } from "@/store/useWishlist";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  level: string;
  rating: number;
  duration: string;
  image: string;
}

export function CourseCard({ course }: { course: Course }) {
  const { items, toggle } = useWishlist();
  const isWishlisted = items.some((i) => i.id === course.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(course as any);
  };

  const courseUrl = `/course/${course.id === "ai-1" ? "Generative_AI_Application_Engineer" : course.id}`;

  const getImageSrc = () => {
    if (course.image && course.image !== "/placeholder-course.jpg") return course.image;
    const title = (course.title || "").toLowerCase();
    if (title.includes("python fundamentals") || title.includes("python")) return "/images/courses/python-fundamentals.png";
    if (title.includes("machine learning") || title.includes("ml")) return "/images/courses/ml-math.png";
    if (title.includes("ai engineering") || title.includes("advanced ai") || title.includes("llm")) return "/images/courses/llm-architecture.png";
    if (title.includes("rag") || title.includes("vector")) return "/images/courses/rag-vector-db.png";
    if (title.includes("generative")) return "/images/courses/generative-ai.png";
    if (title.includes("smart contract") || title.includes("security")) return "/images/courses/smart-contracts.png";
    if (title.includes("automation")) return "/images/courses/python-fundamentals.png";
    if (title.includes("next.js") || title.includes("full-stack")) return "/images/courses/generative-ai.png";
    return "/images/courses/llm-architecture.png";
  };

  return (
    <Link href={courseUrl} className="group h-full block">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs dark:shadow-md hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500/40">
        {/* Image Container */}
        <div className="relative w-full h-36 sm:h-40 overflow-hidden bg-background">
          <Image 
            src={getImageSrc()} 
            alt={course.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-90" />
          <div className="absolute bottom-2.5 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-white/20 shadow-xs">
            <span className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-wider">{course.level}</span>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md border border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-xs"
            title="Add to wishlist"
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-zinc-800 dark:text-white'}`} />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-4.5 flex flex-col flex-grow">
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-text">{course.rating.toFixed(1)}</span>
            <span className="text-subtext text-[11px] ml-1">(120+ reviews)</span>
          </div>

          <h3 className="font-extrabold text-sm sm:text-[15px] text-text mb-1.5 line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-subtext text-xs mb-3 line-clamp-2 leading-relaxed flex-grow">
            {course.description}
          </p>

          <div className="flex items-center gap-3 text-[11px] font-medium text-subtext mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-3.5 h-3.5 text-purple-500" />
              <span>{course.level}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/25 uppercase tracking-wider">
              Full Access
            </span>
            <span className="font-black text-base text-text">₹{course.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
