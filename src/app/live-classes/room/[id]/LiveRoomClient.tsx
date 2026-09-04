'use client';

import React, { useEffect, useState } from 'react';
import ZoomSession from '@/components/zoom/ZoomSession';

export default function LiveRoomClient({ sessionId }: { sessionId: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Loading Zoom Video SDK Classroom...</p>
      </div>
    );
  }

  return <ZoomSession sessionId={sessionId} />;
}
