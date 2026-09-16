"use client";

import React from "react";
import { formatDate, formatTime, formatDateTime } from "@/lib/dateTime";

export interface DateDisplayProps {
  date?: string | Date | number | null;
  fallback?: string;
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  fallback = "TBA",
  className = "",
}) => {
  const formatted = formatDate(date, fallback);
  return <span className={className}>{formatted}</span>;
};

export interface TimeDisplayProps {
  time?: string | Date | number | null;
  fallback?: string;
  className?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  fallback = "TBA",
  className = "",
}) => {
  const formatted = formatTime(time, fallback);
  return <span className={className}>{formatted}</span>;
};

export interface DateTimeDisplayProps {
  value?: string | Date | number | null;
  fallback?: string;
  className?: string;
}

export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  value,
  fallback = "TBA",
  className = "",
}) => {
  const formatted = formatDateTime(value, fallback);
  return <span className={className}>{formatted}</span>;
};
