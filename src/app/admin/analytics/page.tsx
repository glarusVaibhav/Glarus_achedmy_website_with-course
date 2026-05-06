"use client";

import { Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
      <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
         <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black mb-2 text-text">Pro Analytics Module</h1>
      <p className="text-subtext max-w-md text-center">Comprehensive analytics, retention pathways, and funnel drop-off predictions are being aggregated. Coming soon!</p>
    </div>
  );
}
