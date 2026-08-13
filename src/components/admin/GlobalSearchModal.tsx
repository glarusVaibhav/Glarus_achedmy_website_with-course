"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  GraduationCap,
  Users,
  BookOpen,
  CheckSquare,
  CreditCard,
  ArrowRight,
  Sparkles,
  Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Instructors" | "Students" | "Courses" | "Tasks" | "Transactions";
  href: string;
  badge?: string;
  meta?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Instructors
  {
    id: "inst-1",
    title: "Dr. Sarah Chen",
    subtitle: "sarah.chen@glarus.edu • AI & Machine Learning",
    category: "Instructors",
    href: "/admin/instructors?tab=all&search=Sarah",
    badge: "Active",
    meta: "1,842 Students"
  },
  {
    id: "inst-2",
    title: "Alex Chen",
    subtitle: "alex.chen@glarus.edu • Autonomous Workflows & RAG",
    category: "Instructors",
    href: "/admin/instructors?tab=approvals&search=Alex",
    badge: "Pending Review",
    meta: "Submitted 2h ago"
  },
  {
    id: "inst-3",
    title: "John Doe",
    subtitle: "john.doe@glarus.edu • Frontend & React Architecture",
    category: "Instructors",
    href: "/admin/instructors?tab=all&search=John",
    badge: "Active",
    meta: "967 Students"
  },
  {
    id: "inst-4",
    title: "Bob Smith",
    subtitle: "b.smith@glarus.edu • Web Fundamentals",
    category: "Instructors",
    href: "/admin/instructors?tab=suspended&search=Bob",
    badge: "Suspended",
    meta: "23 Students"
  },

  // Students
  {
    id: "stu-1",
    title: "Aarav Patel",
    subtitle: "aarav.patel@gmail.com • Python Bootcamp, ML Engineering",
    category: "Students",
    href: "/admin/students?search=Aarav",
    badge: "72% Progress",
    meta: "₹12,400 Spent"
  },
  {
    id: "stu-2",
    title: "Priya Nair",
    subtitle: "priya.nair@outlook.com • React Masterclass, UI/UX",
    category: "Students",
    href: "/admin/students?search=Priya",
    badge: "45% Progress",
    meta: "₹18,750 Spent"
  },
  {
    id: "stu-3",
    title: "Lucas Martin",
    subtitle: "lucas.m@yahoo.com • Advanced AI Engineering",
    category: "Students",
    href: "/admin/students?search=Lucas",
    badge: "91% Progress",
    meta: "₹8,990 Spent"
  },
  {
    id: "stu-4",
    title: "Meera Gupta",
    subtitle: "meera.g@proton.me • Cloud Computing",
    category: "Students",
    href: "/admin/students?search=Meera",
    badge: "33% Progress",
    meta: "₹14,200 Spent"
  },

  // Courses
  {
    id: "crs-1",
    title: "Advanced AI Agents & Multi-Agent Workflows",
    subtitle: "Instructor: Dr. Sarah Chen • ₹1,499",
    category: "Courses",
    href: "/admin/courses?tab=published&search=Agents",
    badge: "Published",
    meta: "1,842 Enrolled"
  },
  {
    id: "crs-2",
    title: "Mastering Next.js 14 App Router & Streaming",
    subtitle: "Instructor: Jordan Walke • ₹3,499",
    category: "Courses",
    href: "/admin/courses?tab=approvals&search=Next.js",
    badge: "Pending Review",
    meta: "Web Dev"
  },
  {
    id: "crs-3",
    title: "React 19 Enterprise Architecture & Server Actions",
    subtitle: "Instructor: John Doe • ₹999",
    category: "Courses",
    href: "/admin/courses?tab=published&search=React",
    badge: "Published",
    meta: "967 Enrolled"
  },
  {
    id: "crs-4",
    title: "Quantum Computing Basics & Qiskit",
    subtitle: "Instructor: Alice Smith • ₹2,199",
    category: "Courses",
    href: "/admin/courses?tab=rejected&search=Quantum",
    badge: "Rejected",
    meta: "Computer Science"
  },

  // Tasks
  {
    id: "tsk-1",
    title: "TSK-1042: AI Bootcamp Multi-Agent Review",
    subtitle: "Assigned to Alex Chen • Due in 8 days",
    category: "Tasks",
    href: "/admin/tasks?search=TSK-1042",
    badge: "Under Review",
    meta: "₹5,000"
  },
  {
    id: "tsk-2",
    title: "TSK-1043: Create Advanced RAG Course",
    subtitle: "Assigned to Dr. Sarah Chen • Due in 14 days",
    category: "Tasks",
    href: "/admin/tasks?search=TSK-1043",
    badge: "In Progress",
    meta: "₹15,000"
  },
  {
    id: "tsk-3",
    title: "TSK-1044: Build Interactive Python Code Lab",
    subtitle: "Assigned to Jessica Lin • Due in 3 days",
    category: "Tasks",
    href: "/admin/tasks?search=TSK-1044",
    badge: "Submitted",
    meta: "₹8,500"
  },

  // Transactions
  {
    id: "txn-1",
    title: "TXN-89214: Python Bootcamp Enrollment",
    subtitle: "Student: Aarav Patel • UPI / Razorpay",
    category: "Transactions",
    href: "/admin/payments?tab=transactions&search=TXN-89214",
    badge: "Completed",
    meta: "₹12,400"
  },
  {
    id: "txn-2",
    title: "TXN-89215: React Masterclass Purchase",
    subtitle: "Student: Priya Nair • Credit Card",
    category: "Transactions",
    href: "/admin/payments?tab=refunds&search=TXN-89215",
    badge: "Refund Requested",
    meta: "₹999"
  }
];

const CATEGORY_ICONS: Record<SearchItem["category"], React.ElementType> = {
  Instructors: GraduationCap,
  Students: Users,
  Courses: BookOpen,
  Tasks: CheckSquare,
  Transactions: CreditCard
};

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent("open-admin-search"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 8);

  const handleSelect = (item: SearchItem) => {
    router.push(item.href);
    onClose();
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  const groupedCategories = Array.from(new Set(filteredItems.map((item) => item.category)));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[80vh]"
          >
            {/* Input Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-background/40">
              <Search className="w-5 h-5 text-purple-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDownInInput}
                placeholder="Search students, instructors, courses, tasks, transactions... (Ctrl + K)"
                className="w-full bg-transparent text-text text-base placeholder:text-subtext/60 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-subtext hover:text-text hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-subtext bg-card-hover px-2 py-0.5 rounded border border-white/10 shrink-0">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-subtext space-y-2">
                  <p className="text-sm font-medium text-text">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs">Try searching for an instructor name, course topic, task code, or student email.</p>
                </div>
              ) : (
                groupedCategories.map((category) => {
                  const itemsInCategory = filteredItems.filter((i) => i.category === category);
                  const Icon = CATEGORY_ICONS[category];

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center gap-2 px-3 py-1 text-[11px] font-bold tracking-wider text-purple-400 uppercase">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{category}</span>
                      </div>
                      <div className="space-y-1">
                        {itemsInCategory.map((item) => {
                          const flatIndex = filteredItems.indexOf(item);
                          const isSelected = flatIndex === selectedIndex;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${
                                isSelected
                                  ? "bg-purple-500/15 border border-purple-500/30 text-text shadow-sm"
                                  : "hover:bg-white/5 border border-transparent text-subtext hover:text-text"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                    isSelected
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                      : "bg-white/5 text-subtext border-white/10"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-text truncate">{item.title}</p>
                                    {item.badge && (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                                          item.badge.includes("Pending") || item.badge.includes("Review")
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : item.badge.includes("Active") || item.badge.includes("Published") || item.badge.includes("Completed")
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : item.badge.includes("Suspended") || item.badge.includes("Rejected")
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                        }`}
                                      >
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-subtext truncate mt-0.5">{item.subtitle}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {item.meta && <span className="text-xs font-medium text-subtext/80">{item.meta}</span>}
                                <ArrowRight
                                  className={`w-4 h-4 transition-transform ${
                                    isSelected ? "text-purple-400 translate-x-0.5" : "text-subtext/40"
                                  }`}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-white/10 bg-background/50 flex items-center justify-between text-[11px] text-subtext px-4">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-card border border-white/10 rounded text-text font-mono text-[10px]">↑</kbd>{" "}
                  <kbd className="px-1.5 py-0.5 bg-card border border-white/10 rounded text-text font-mono text-[10px]">↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-card border border-white/10 rounded text-text font-mono text-[10px]">↵</kbd> Select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-card border border-white/10 rounded text-text font-mono text-[10px]">esc</kbd> Close
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Glarus Intelligent Search</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
