"use client";

import React from "react";

export default function LiveCourseSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Navigation placeholder */}
        <div className="w-36 h-5 bg-muted rounded-md" />

        {/* Hero two-column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex gap-3">
              <div className="w-24 h-6 bg-muted rounded-md" />
              <div className="w-24 h-6 bg-muted rounded-md" />
            </div>
            <div className="w-3/4 h-12 bg-muted rounded-2xl" />
            <div className="w-full h-20 bg-muted rounded-xl" />
            <div className="flex gap-4">
              <div className="w-28 h-6 bg-muted rounded-md" />
              <div className="w-28 h-6 bg-muted rounded-md" />
              <div className="w-28 h-6 bg-muted rounded-md" />
            </div>
          </div>

          <div className="lg:col-span-5 w-full">
            <div className="h-80 rounded-3xl bg-muted/60 border border-border/70 p-8 space-y-4" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 rounded-2xl bg-muted/50" />
          <div className="h-24 rounded-2xl bg-muted/50" />
          <div className="h-24 rounded-2xl bg-muted/50" />
          <div className="h-24 rounded-2xl bg-muted/50" />
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          <div className="w-64 h-8 bg-muted rounded-xl" />
          <div className="h-24 rounded-2xl bg-muted/50" />
          <div className="h-24 rounded-2xl bg-muted/50" />
          <div className="h-24 rounded-2xl bg-muted/50" />
        </div>

      </div>
    </div>
  );
}
