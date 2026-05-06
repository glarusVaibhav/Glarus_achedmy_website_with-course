import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor?: string | { name: string };
  status?: string;
}

interface WishlistStore {
  items: Course[];
  toggle: (course: Course) => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set) => ({
      items: [],
      toggle: (course) =>
        set((state) => {
          const exists = state.items.find((i) => i.id === course.id);
          if (exists) {
            return { items: state.items.filter((i) => i.id !== course.id) };
          }
          return { items: [...state.items, course] };
        }),
    }),
    {
      name: "edtech-wishlist-storage", // stores in localStorage
    }
  )
);
