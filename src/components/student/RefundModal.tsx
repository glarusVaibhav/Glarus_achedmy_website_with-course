"use client";

import { useState } from "react";
import { AlertTriangle, X, RotateCcw } from "lucide-react";

export default function RefundModal({ 
  courseName, 
  price, 
  onClose, 
  onSubmit 
}: { 
  courseName: string, 
  price: number, 
  onClose: () => void, 
  onSubmit: (reason: string) => Promise<void> 
}) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = reason.trim().length > 10 && confirmText === "REFUND";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      await onSubmit(reason);
      onClose();
    } catch (error) {
       console.error("Refund failed", error);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-3xl border border-card/60 shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/50 text-subtext hover:text-text transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 pb-2 border-b border-card/40">
           <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 shadow-inner">
              <RotateCcw className="w-6 h-6" />
           </div>
           <h2 className="text-xl font-bold mb-1">Request Refund</h2>
           <p className="text-sm text-subtext leading-relaxed">You are requesting a refund for <span className="font-bold text-text">{courseName}</span> (₹{price}).</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div>
              <label className="block text-sm font-bold text-text mb-2">Reason for Refund</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please tell us why you are requesting a refund (min 10 characters)..."
                className="w-full bg-background border border-card rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                required
              />
           </div>

           <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
             <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
             <div className="text-sm text-subtext">
               <p className="mb-2.5">This action is irreversible and will immediately revoke your access to the course content.</p>
               <label className="block font-bold text-text mb-1.5 flex items-center gap-1.5">Type <span className="text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded select-all font-mono">REFUND</span> to confirm:</label>
               <input 
                 type="text" 
                 value={confirmText}
                 onChange={(e) => setConfirmText(e.target.value)}
                 className="w-full bg-background border border-red-500/30 rounded-lg px-3 py-2 text-sm font-bold text-text uppercase focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                 placeholder="REFUND"
                 autoComplete="off"
                 required
               />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={!isFormValid || loading}
             className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
               isFormValid && !loading
                 ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:-translate-y-0.5 active:translate-y-0" 
                 : "bg-background border border-card text-subtext/50 cursor-not-allowed"
             }`}
           >
             {loading ? "Processing..." : "Submit Refund Request"}
           </button>
        </form>
      </div>
    </div>
  );
}
