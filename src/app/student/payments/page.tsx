"use client";

import React, { useState } from "react";
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
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: string;
  invoiceNumber: string;
  course: string;
  category: string;
  date: string;
  paymentMethod: string;
  status: "PAID";
}

export default function StudentPaymentsPage() {
  const [transactions] = useState<Transaction[]>([
    {
      id: "txn-1",
      invoiceNumber: "INV-2026-0801",
      course: "Advanced Generative AI Masterclass",
      category: "Live Training Cohort",
      date: "Aug 01, 2026",
      paymentMethod: "Credit Card (•••• 4242)",
      status: "PAID",
    },
    {
      id: "txn-2",
      invoiceNumber: "INV-2026-0715",
      course: "Generative AI Application Engineering",
      category: "Self-Paced Course",
      date: "Jul 15, 2026",
      paymentMethod: "UPI / Net Banking",
      status: "PAID",
    },
  ]);

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
                    className="px-4 py-2 bg-card hover:bg-sky-500/15 border border-card hover:border-sky-500/40 text-subtext hover:text-sky-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ───────── 3. OFFICIAL INVOICE MODAL / VIEWER ───────── */}
        <AnimatePresence>
          {selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-card rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative"
              >
                {/* Modal Top Bar */}
                <div className="flex items-start justify-between gap-4 border-b border-card pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-text">Tax Invoice & Receipt</h3>
                      <p className="text-xs text-subtext">{selectedInvoice.invoiceNumber} • Issued by Glarus Academy</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-2 rounded-xl bg-background hover:bg-card border border-card text-subtext hover:text-text cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Printable Invoice Body */}
                <div className="p-6 rounded-2xl bg-background/80 border border-card space-y-6 font-sans">
                  {/* Invoice Header Details */}
                  <div className="flex items-start justify-between flex-wrap gap-4 border-b border-card pb-5">
                    <div>
                      <h4 className="font-black text-xl text-text">GLARUS ACADEMY</h4>
                      <p className="text-xs text-subtext mt-0.5">Advanced AI & Engineering Education</p>
                      <p className="text-[11px] text-subtext">Tax ID / GSTIN: 29AAACG1234F1Z5</p>
                    </div>

                    <div className="text-right space-y-0.5 text-xs">
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-black text-[10px] uppercase">
                        ✓ Paid In Full
                      </span>
                      <p className="text-subtext pt-1">Invoice Date: <strong className="text-text">{selectedInvoice.date}</strong></p>
                      <p className="text-subtext">Payment: <strong className="text-text">{selectedInvoice.paymentMethod}</strong></p>
                    </div>
                  </div>

                  {/* Billed To Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-extrabold text-subtext uppercase tracking-wider block">Billed To (Student)</span>
                      <p className="font-bold text-text mt-0.5">Alex Vance (Student)</p>
                      <p className="text-subtext">alex.vance@example.com</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold text-subtext uppercase tracking-wider block">Program Type</span>
                      <p className="font-bold text-text mt-0.5">{selectedInvoice.category}</p>
                      <p className="text-subtext">Lifetime Access & Certificate</p>
                    </div>
                  </div>

                  {/* Item Description Table */}
                  <div className="border border-card rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-12 p-3 bg-card/60 font-black text-subtext border-b border-card uppercase text-[10px] tracking-wider">
                      <div className="col-span-8">Description</div>
                      <div className="col-span-4 text-right">Status</div>
                    </div>

                    <div className="grid grid-cols-12 p-4 items-center bg-background/50">
                      <div className="col-span-8 space-y-0.5">
                        <div className="font-bold text-text text-sm">{selectedInvoice.course}</div>
                        <div className="text-[11px] text-subtext">Complete course curriculum, video lectures, sandbox labs, and verified certificate.</div>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                          PAID
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  <p className="text-[11px] text-subtext/80 italic text-center pt-2">
                    This is an official computer-generated receipt for your course enrollment at Glarus Academy.
                  </p>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-card hover:bg-card/80 border border-card text-text rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-sky-400" />
                    <span>Print / Save as PDF</span>
                  </button>

                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-primary/25"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </StudentPortalLayout>
  );
}
