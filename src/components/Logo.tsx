import React from "react";
import Image from "next/image";

export function Logo({
  className = "h-7 sm:h-8 w-auto"
}: {
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center select-none ${className}`}>
      <Image
        src="/images/glarus_logo.png"
        alt="Glarus Academy"
        width={240}
        height={48}
        priority
        className="h-full w-auto max-h-full object-contain transition-transform group-hover:scale-105"
      />
    </div>
  );
}
