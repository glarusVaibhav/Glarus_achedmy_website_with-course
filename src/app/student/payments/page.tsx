"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/student/StudentPortalLayout";
import {
  CreditCard,
  CheckCircle2,
  Download,
  Receipt,
  FileText,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  invoiceNumber: string;
  course: string;
  category: string;
  date: string;
  paymentMethod: string;
  status: "PAID" | "COMPLETED";
}

export default function StudentPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await fetch("/api/student/payments");
        if (res.ok) {
          const data = await res.json();
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        console.error("Failed to fetch payments:", e);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  const handleDownloadInvoice = (txn: Transaction) => {
    setSelectedInvoice(txn);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <StudentPortalLayout>
      <div className="w-full min-h-screen py-8 px-4 sm:px-8 max-w-[1600px] mx-auto space-y-8 text-text">

        {/* ───────── 1. Header Section ───────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                Payment <span className="text-sky-400">History</span> & Invoices
              </h1>
              <p className="text-xs sm:text-sm text-subtext mt-0.5 font-medium">
                Access and download official tax invoices and receipts for your enrolled courses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              All Invoices Verified
            </span>
          </div>
        </div>

        {/* ───────── 2. Past Course Transactions ───────── */}
        <div className="bg-card/40 border border-card rounded-3xl overflow-hidden shadow-lg">
          <div className="p-5 sm:p-6 border-b border-card flex items-center justify-between bg-card/20">
            <div>
              <h3 className="font-black text-base text-text">Past Course Transactions</h3>
              <p className="text-xs text-subtext mt-0.5">Official invoices and verified payment confirmations</p>
            </div>
            <span className="text-xs font-bold text-subtext px-3 py-1 rounded-xl bg-background/80 border border-card">
              {transactions.length} Total Purchases
            </span>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Loading payment records...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-inner">
                <Receipt className="w-8 h-8 opacity-80" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No payment transactions yet</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  When you purchase a course or live cohort, your official GST tax invoices, payment receipts, and download links will be displayed here.
                </p>
              </div>

              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md shadow-sky-900/30 flex items-center gap-2"
              >
                <span>Browse Courses & Live Cohorts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-card/60">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-card/50 transition-all group"
                >
                  {/* LEFT SIDE: Course Title & Category */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                        {txn.category}
                      </span>
                      <span className="text-subtext/40 font-mono text-xs">•</span>
                      <span className="font-mono text-xs text-subtext font-bold">
                        {txn.invoiceNumber}
                      </span>
                    </div>
                    <h4 className="font-black text-base sm:text-lg text-text group-hover:text-sky-300 transition-colors leading-snug">
                      {txn.course}
                    </h4>
                  </div>

                  {/* RIGHT SIDE: Date, Paid Status, and Invoice Download Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 flex-wrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-card/40">
                    {/* Date on Right */}
                    <div className="flex items-center gap-1.5 text-xs text-subtext font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span>Date: <strong className="text-text font-bold">{txn.date}</strong></span>
                    </div>

                    {/* Paid Badge on Right */}
                    <div className="flex items-center">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Paid</span>
                      </span>
                    </div>

                    {/* Invoice Download Button on Right */}
                    <button
                      onClick={() => handleDownloadInvoice(txn)}
                      className="px-4 py-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ───────── 3. Official Invoice Modal Preview ───────── */}
        <AnimatePresence>
          {selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0B0F17] border border-border/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative text-slate-100"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-border/60 flex items-center justify-between bg-card/20">
                  <div className="flex items-center gap-2.5">
                    <Receipt className="w-5 h-5 text-sky-400" />
                    <h3 className="font-extrabold text-lg text-white">Tax Invoice & Receipt</h3>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 rounded-xl text-subtext hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Invoice Printable Sheet Content */}
                <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto font-sans" id="printable-invoice">
                  {/* Company & Invoice Numbers */}
                  <div className="flex items-start justify-between border-b border-white/[0.08] pb-6">
                    <div>
                      <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                        <span className="text-sky-400">Glarus</span> Academy
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Glarus AI EdTech Technologies Pvt Ltd</p>
                      <p className="text-[11px] text-slate-500">GSTIN: 27AABCG1234F1Z8</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-sky-300 bg-sky-950/60 border border-sky-500/30 px-3 py-1 rounded-lg inline-block">
                        {selectedInvoice.invoiceNumber}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Date: {selectedInvoice.date}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        Payment Verified
                      </span>
                    </div>
                  </div>

                  {/* Course Details Breakdown */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Details</div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-white">{selectedInvoice.course}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{selectedInvoice.category} · Lifetime Curriculum Access</div>
                      </div>
                      <div className="text-right font-mono font-bold text-white text-sm">
                        ₹9,999.00
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-2 border-t border-white/[0.08] pt-4 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-mono text-slate-200">₹8,473.73</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Integrated GST (18%)</span>
                      <span className="font-mono text-slate-200">₹1,525.27</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-white border-t border-white/[0.08] pt-2">
                      <span>Total Amount Paid</span>
                      <span className="font-mono text-emerald-400">₹9,999.00</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 sm:p-6 border-t border-border/60 bg-card/30 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">Digital copy valid for business tax filing</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                        setSelectedInvoice(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-900/30 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </StudentPortalLayout>
  );
}
