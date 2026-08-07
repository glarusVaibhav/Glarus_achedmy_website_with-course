// ============================================================
// Component — TopicItem (Clean, Minimalist Text Item)
// ============================================================

"use client";

import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { SidebarTopic } from '@/types/sidebar.types';

interface TopicItemProps {
  topic: SidebarTopic;
  index: number;
  onSelect: () => void;
  isLast: boolean;
}

export function TopicItem({
  topic,
  index,
  onSelect,
  isLast,
}: TopicItemProps) {
  const { id, title, isLocked, isActive, isVisited } = topic;

  return (
    <div className="relative group select-none ml-6 mr-1">
      <motion.button
        id={`topic-item-${id}`}
        onClick={() => onSelect()}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.99 }}
        className={clsx(
          "w-full text-left py-1.5 px-3 rounded-lg flex items-center justify-between transition-colors duration-200 cursor-pointer",
          isActive
            ? "bg-violet-500/15 text-violet-300 font-medium shadow-[inset_2px_0_0_rgba(139,92,246,0.5)]"
            : isLocked
            ? "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
            : "text-white/50 hover:bg-white/[0.04] hover:text-white/90"
        )}
      >
        <span className="text-[13px] leading-snug truncate" title={title}>
          {title}
        </span>
        {isVisited && !isActive && (
          <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0 ml-2" />
        )}
      </motion.button>
    </div>
  );
}

