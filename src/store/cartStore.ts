import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Course } from "@/components/CourseCard";

interface CartState {
  items: Course[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (course) => {
        const currentItems = get().items;
        const exists = currentItems.find((item) => item.id === course.id);
        
        if (!exists) {
          set({ 
            items: [...currentItems, course],
            total: get().total + course.price
          });
        }
      },
      removeItem: (courseId) => {
        const currentItems = get().items;
        const courseToRemove = currentItems.find((item) => item.id === courseId);
        
        if (courseToRemove) {
          set({
            items: currentItems.filter((item) => item.id !== courseId),
            total: get().total - courseToRemove.price
          });
        }
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "eduai-cart",
    }
  )
);
