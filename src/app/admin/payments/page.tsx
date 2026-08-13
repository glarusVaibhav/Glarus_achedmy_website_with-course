"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Calendar,
  Check,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  DownloadCloud,
  FileText,
  User,
  ShieldCheck,
  RefreshCw,
  Loader2
} from "lucide-react";

export type PaymentTab = "transactions" | "payouts" | "refunds" | "issues";

interface TransactionItem {
  id: string;
  student: string;
  email: string;
  course: string;
  amount: number;
  paymentMethod: "UPI / Razorpay" | "Credit Card" | "Net Banking" | "PayPal";
  status: "COMPLETED" | "REFUNDED" | "FAILED" | "PENDING";
  date: string;
}

interface InstructorPayoutItem {
  id: string;
  instructor: string;
  email: string;
  tasksCompleted: number;
  coursesCount: number;
  pendingAmount: number;
  totalPaid: number;
  payoutMethod: string;
  status: "Pending" | "Processing" | "Paid";
  lastPayoutDate: string;
}

interface RefundRequestItem {
  id: string;
  student: string;
  email: string;
  course: string;
  amount: number;
  reason: string;
  requestedDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface PaymentIssueItem {
  id: string;
  student: string;
  gatewayErrorCode: string;
  course: string;
  amount: number;
  date: string;
  status: "Unresolved" | "Retried" | "Resolved";
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "TXN-89214",
    student: "Aarav Patel",
    email: "aarav.patel@gmail.com",
    course: "Python Bootcamp",
    amount: 12400,
    paymentMethod: "UPI / Razorpay",
    status: "COMPLETED",
    date: "Today, 10:24 AM"
  },
  {
    id: "TXN-89215",
    student: "Priya Nair",
    email: "priya.nair@outlook.com",
    course: "React Masterclass",
    amount: 999,
    paymentMethod: "Credit Card",
    status: "REFUNDED",
    date: "Yesterday, 04:30 PM"
  },
  {
    id: "TXN-89216",
    student: "Lucas Martin",
    email: "lucas.m@yahoo.com",
    course: "Advanced AI Engineering",
    amount: 8990,
    paymentMethod: "Credit Card",
    status: "COMPLETED",
    date: "12 Aug 2026"
  },
  {
    id: "TXN-89217",
    student: "Meera Gupta",
    email: "meera.g@proton.me",
    course: "Cloud Computing",
    amount: 14200,
    paymentMethod: "UPI / Razorpay",
    status: "COMPLETED",
    date: "11 Aug 2026"
  },
  {
    id: "TXN-89218",
    student: "Rohit Sharma",
    email: "rohit.s@gmail.com",
    course: "Agentic AI Workshop",
    amount: 2999,
    paymentMethod: "Net Banking",
    status: "FAILED",
    date: "10 Aug 2026"
  }
];

const INITIAL_INSTRUCTOR_PAYOUTS: InstructorPayoutItem[] = [
  {
    id: "PAY-1",
    instructor: "Dr. Sarah Chen",
    email: "sarah.chen@glarus.edu",
    tasksCompleted: 4,
    coursesCount: 2,
    pendingAmount: 35000,
    totalPaid: 485600,
    payoutMethod: "HDFC Bank (**** 4892)",
    status: "Pending",
    lastPayoutDate: "01 Aug 2026"
  },
  {
    id: "PAY-2",
    instructor: "Alex Chen",
    email: "alex.chen@glarus.edu",
    tasksCompleted: 2,
    coursesCount: 1,
    pendingAmount: 18500,
    totalPaid: 85000,
    payoutMethod: "ICICI UPI (alex@okaxis)",
    status: "Processing",
    lastPayoutDate: "28 Jul 2026"
  },
  {
    id: "PAY-3",
    instructor: "John Doe",
    email: "john.doe@glarus.edu",
    tasksCompleted: 3,
    coursesCount: 2,
    pendingAmount: 12000,
    totalPaid: 215400,
    payoutMethod: "SBI Bank (**** 1120)",
    status: "Paid",
    lastPayoutDate: "10 Aug 2026"
  }
];

const INITIAL_REFUNDS: RefundRequestItem[] = [
  {
    id: "REF-101",
    student: "Priya Nair",
    email: "priya.n@outlook.com",
    course: "React Masterclass",
    amount: 999,
    reason: "Accidental double purchase on checkout",
    requestedDate: "Today, 09:15 AM",
    status: "Pending"
  },
  {
    id: "REF-102",
    student: "Aarav Patel",
    email: "aarav.p@gmail.com",
    course: "Python Bootcamp",
    amount: 12400,
    reason: "Schedule conflict with university semester exams",
    requestedDate: "1 day ago",
    status: "Pending"
  },
  {
    id: "REF-103",
    student: "Lucas Martin",
    email: "lucas.m@yahoo.com",
    course: "Cloud Computing",
    amount: 4500,
    reason: "Course prerequisite was too advanced",
    requestedDate: "3 days ago",
    status: "Approved"
  },
  {
    id: "REF-104",
    student: "Meera Gupta",
    email: "meera.g@proton.me",
    course: "Advanced AI",
    amount: 8990,
    reason: "Completed 95% of course and demanded full refund",
    requestedDate: "1 week ago",
    status: "Rejected"
  }
];

const INITIAL_ISSUES: PaymentIssueItem[] = [
  {
    id: "ISS-401",
    student: "Rohit Sharma",
    gatewayErrorCode: "GATEWAY_TIMEOUT_504",
    course: "Agentic AI Workshop",
    amount: 2999,
    date: "10 Aug 2026",
    status: "Unresolved"
  },
  {
    id: "ISS-402",
    student: "Kiran Rao",
    gatewayErrorCode: "CARD_EXPIRED_OR_DECLINED",
    course: "React Masterclass",
    amount: 999,
    date: "08 Aug 2026",
    status: "Resolved"
  }
];

export default function PaymentsAndRefundsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-subtext space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-sm font-semibold text-text">Loading Payments & Refunds...</p>
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as PaymentTab) || "transactions";

  const [activeTab, setActiveTab] = useState<PaymentTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [payouts, setPayouts] = useState(INITIAL_INSTRUCTOR_PAYOUTS);
  const [refunds, setRefunds] = useState(INITIAL_REFUNDS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);

  // Confirmation modal for sensitive refund actions
  const [pendingRefundAction, setPendingRefundAction] = useState<{
    refund: RefundRequestItem;
    action: "Approved" | "Rejected";
  } | null>(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as PaymentTab;
    if (tabFromUrl && ["transactions", "payouts", "refunds", "issues"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleConfirmRefund = () => {
    if (!pendingRefundAction) return;
    const { refund, action } = pendingRefundAction;

    setRefunds((prev) =>
      prev.map((r) => (r.id === refund.id ? { ...r, status: action } : r))
    );

    // Call API route
    try {
      fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId: refund.id, decision: action })
      });
    } catch {
      /* ignore */
    }

    setPendingRefundAction(null);
  };

  const handleProcessPayout = (payoutId: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === payoutId ? { ...p, status: "Paid", pendingAmount: 0 } : p))
    );
  };

  const pendingRefundsCount = refunds.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-purple-400" />
            <span>Payments & Refunds Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-subtext mt-0.5">
            Manage platform transactions, faculty commission payouts, student refund disputes, and gateway logs.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-card p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "transactions"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Transactions
          </button>

          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "payouts"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Instructor Payouts
          </button>

          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "refunds"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            <span>Refund Requests</span>
            {pendingRefundsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-black">
                {pendingRefundsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("issues")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "issues"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-subtext hover:text-text hover:bg-white/5"
            }`}
          >
            Payment Issues
          </button>
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Total Gross Revenue</p>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">₹18,40,000</h3>
          <span className="text-[11px] text-emerald-400 font-semibold">+12.8% this month</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">This Month Revenue</p>
          <h3 className="text-xl sm:text-2xl font-black text-text mt-1">₹4,20,000</h3>
          <span className="text-[11px] text-subtext font-semibold">142 transactions</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Pending Payouts</p>
          <h3 className="text-xl sm:text-2xl font-black text-amber-400 mt-1">₹65,500</h3>
          <span className="text-[11px] text-amber-400 font-semibold">3 faculty members</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-white/10 shadow-md">
          <p className="text-[10px] font-bold text-subtext uppercase tracking-wider">Refund Requests</p>
          <h3 className="text-xl sm:text-2xl font-black text-red-400 mt-1">{pendingRefundsCount} Active</h3>
          <span className="text-[11px] text-red-400 font-semibold">Action required</span>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, students, IDs, or instructors..."
            className="w-full bg-background border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl bg-background border border-white/10 text-xs font-semibold text-subtext hover:text-text hover:bg-card flex items-center gap-1.5">
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: TRANSACTIONS ── */}
      {activeTab === "transactions" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-4">Student</th>
                  <th className="py-4 px-4">Course Enrolled</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4 text-center">Payment Method</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono text-purple-400 font-bold">{txn.id}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-text">{txn.student}</p>
                      <span className="text-[10px] text-subtext">{txn.email}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-text">{txn.course}</td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-400">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center text-subtext">{txn.paymentMethod}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          txn.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : txn.status === "REFUNDED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-subtext text-[11px]">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: INSTRUCTOR PAYOUTS ── */}
      {activeTab === "payouts" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                  <th className="py-4 px-6">Instructor</th>
                  <th className="py-4 px-4 text-center">Courses / Tasks</th>
                  <th className="py-4 px-4 text-right">Pending Amount</th>
                  <th className="py-4 px-4 text-right">Total Lifetime Paid</th>
                  <th className="py-4 px-4">Payout Account / UPI</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {payouts.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-text">{pay.instructor}</p>
                      <span className="text-[10px] text-subtext">{pay.email}</span>
                    </td>
                    <td className="py-4 px-4 text-center text-text font-semibold">
                      {pay.coursesCount} Courses • {pay.tasksCompleted} Tasks
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-amber-400">
                      ₹{pay.pendingAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-400">
                      ₹{pay.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px] text-purple-300">{pay.payoutMethod}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          pay.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {pay.pendingAmount > 0 ? (
                        <button
                          onClick={() => handleProcessPayout(pay.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-sm"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-xs text-subtext font-semibold">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: REFUND REQUESTS ── */}
      {activeTab === "refunds" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                  <th className="py-4 px-6 w-[20%]">Student</th>
                  <th className="py-4 px-4 w-[20%]">Course & Amount</th>
                  <th className="py-4 px-4 w-[30%]">Reason</th>
                  <th className="py-4 px-4 text-center">Requested</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {refunds.map((ref) => (
                  <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-text">{ref.student}</p>
                      <span className="text-[10px] text-subtext">{ref.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-text">{ref.course}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-0.5">₹{ref.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-subtext italic leading-relaxed">&ldquo;{ref.reason}&rdquo;</p>
                    </td>
                    <td className="py-4 px-4 text-center text-subtext text-[11px]">{ref.requestedDate}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          ref.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : ref.status === "Rejected"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {ref.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {ref.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setPendingRefundAction({ refund: ref, action: "Approved" })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() =>
                              setPendingRefundAction({ refund: ref, action: "Rejected" })
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-subtext font-semibold">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: PAYMENT ISSUES ── */}
      {activeTab === "issues" && (
        <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                  <th className="py-4 px-6">Issue ID</th>
                  <th className="py-4 px-4">Student</th>
                  <th className="py-4 px-4">Error Code</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-medium">
                {issues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-amber-400">{iss.id}</td>
                    <td className="py-4 px-4 font-bold text-text">{iss.student}</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-red-400">{iss.gatewayErrorCode}</td>
                    <td className="py-4 px-4 text-right font-bold text-text">₹{iss.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          iss.status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {iss.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          setIssues((prev) =>
                            prev.map((i) => (i.id === iss.id ? { ...i, status: "Resolved" } : i))
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-card hover:bg-white/5 border border-white/10 text-xs font-bold text-purple-300 flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Webhook</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION MODAL FOR SENSITIVE REFUND ACTIONS ── */}
      {pendingRefundAction && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  pendingRefundAction.action === "Approved"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {pendingRefundAction.action === "Approved" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-text">
                  Confirm {pendingRefundAction.action} Refund
                </h3>
                <p className="text-xs text-subtext">This action is irreversible</p>
              </div>
            </div>

            <p className="text-xs text-subtext leading-relaxed bg-background/50 p-3 rounded-xl border border-white/5">
              Are you sure you want to <span className="font-bold text-text">{pendingRefundAction.action.toLowerCase()}</span> the refund of <span className="font-bold text-emerald-400">₹{pendingRefundAction.refund.amount.toLocaleString()}</span> for <span className="font-bold text-text">{pendingRefundAction.refund.student}</span> ({pendingRefundAction.refund.course})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPendingRefundAction(null)}
                className="py-2 px-4 rounded-xl bg-card hover:bg-white/5 border border-white/10 text-subtext font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRefund}
                className={`py-2 px-4 rounded-xl text-white font-bold text-xs transition-colors shadow-md ${
                  pendingRefundAction.action === "Approved"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                Confirm {pendingRefundAction.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
