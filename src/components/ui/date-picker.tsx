"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { formatDate, parseDate, formatDateForInput } from "@/lib/dateTime";

export interface DatePickerProps {
  value?: string | Date | null;
  onChange: (value: string) => void;
  minDate?: string | Date | null;
  maxDate?: string | Date | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  align?: "left" | "right";
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  disabled = false,
  required = false,
  error,
  className = "",
  id,
  name,
  ariaLabel = "Date picker",
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDate(value);
  const minDateObj = parseDate(minDate);
  const maxDateObj = parseDate(maxDate);

  // Calendar navigation state
  const initialYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = selectedDate ? selectedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Sync calendar view when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = formatDateForInput(new Date(viewYear, viewMonth, day, 12, 0, 0));
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.preventDefault();
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(formatDateForInput(today));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
  };

  // Calendar Grid Calculation
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const isDayDisabled = (day: number) => {
    const target = new Date(viewYear, viewMonth, day, 12, 0, 0);
    if (minDateObj) {
      const minClean = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate(), 0, 0, 0);
      if (target.getTime() < minClean.getTime()) return true;
    }
    if (maxDateObj) {
      const maxClean = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate(), 23, 59, 59);
      if (target.getTime() > maxClean.getTime()) return true;
    }
    return false;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const formattedDisplay = formatDate(value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Visual Input Field */}
      <button
        type="button"
        id={id}
        name={name}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full h-10 px-3.5 rounded-xl bg-background border text-left flex items-center justify-between gap-2 transition-all focus:outline-none select-none text-xs font-medium cursor-pointer ${
          error
            ? "border-red-500/80 focus:border-red-500 shadow-sm shadow-red-500/20"
            : isOpen
            ? "border-purple-500 ring-2 ring-purple-500/20"
            : "border-white/10 hover:border-white/20 focus:border-purple-500/60"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-white/[0.02]" : ""} ${className}`}
      >
        <span className={formattedDisplay ? "text-text font-semibold" : "text-subtext"}>
          {formattedDisplay || placeholder}
        </span>

        <div className="flex items-center gap-1.5 shrink-0 text-subtext">
          {formattedDisplay && !required && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-white/10 hover:text-text transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarIcon className="w-4 h-4 text-purple-400" />
        </div>
      </button>

      {/* Hidden input for form requirements */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          required={required}
          value={value ? formatDateForInput(value) : ""}
          onChange={() => {}}
          className="sr-only"
        />
      )}

      {error && <p className="text-[11px] text-red-400 mt-1 font-medium">{error}</p>}

      {/* Interactive Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 p-3.5 w-72 rounded-2xl bg-card border border-white/15 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header Month / Year Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-subtext hover:text-text transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-bold text-text">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white/10 text-subtext hover:text-text transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="text-[10px] font-bold text-subtext uppercase">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month Filler Days */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const day = daysInPrevMonth - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="h-8 flex items-center justify-center text-[11px] text-subtext/30 font-medium select-none"
                >
                  {day}
                </div>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              const disabledDay = isDayDisabled(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-full rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    selected
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/40"
                      : today
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
                      : disabledDay
                      ? "text-subtext/30 cursor-not-allowed"
                      : "text-text hover:bg-white/10"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Footer Action */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-subtext hover:text-text transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
