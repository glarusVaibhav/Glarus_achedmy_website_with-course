import React from "react";

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform hover:scale-105`}
    >
      <defs>
        {/* Outer Circular G Gradient */}
        <linearGradient id="logoGGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="40%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>

        {/* Inner A Monogram Cyan Gradient */}
        <linearGradient id="logoAGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#00a3ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Outer Circular G Ring */}
      <path
        d="M 375 145 C 320 75, 210 55, 130 95 C 50 135, 20 240, 50 330 C 80 420, 180 460, 275 440 C 365 420, 430 340, 435 250 H 260"
        stroke="url(#logoGGrad)"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner Interlocking A Monogram */}
      <path
        d="M 250 75 L 125 410 M 250 75 L 360 410 M 165 250 H 425"
        stroke="url(#logoAGrad)"
        strokeWidth="56"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
