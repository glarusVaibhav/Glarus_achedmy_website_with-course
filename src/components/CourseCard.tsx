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

  return (
    <Link href={`/course/${course.id}`} className="group h-full">
      <div className="bg-card border border-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden bg-background">
          <Image 
            src={course.image} 
            alt={course.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-white text-xs font-semibold uppercase">{course.level}</span>
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={handleWishlist}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors shadow-xl"
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-text">{course.rating.toFixed(1)}</span>
            <span className="text-subtext text-xs ml-1">(120+ reviews)</span>
          </div>

          <h3 className="font-bold text-lg text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-subtext text-sm mb-4 line-clamp-2 flex-grow">
            {course.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-subtext mb-6">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart className="w-4 h-4" />
              <span>{course.level}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-background">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {course.instructor.charAt(0)}
              </div>
              <span className="text-sm font-medium text-text">{course.instructor}</span>
            </div>
            <span className="font-bold text-lg text-text">₹{course.price.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
