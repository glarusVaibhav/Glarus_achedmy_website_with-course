"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, Check, ChevronDown, X } from "lucide-react";
import { formatTime, parseTime, formatTimeForInput } from "@/lib/dateTime";

export interface TimePickerProps {
  value?: string | Date | number | null;
  onChange: (value: string) => void;
  outputFormat?: "12h" | "24h";
  minuteInterval?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  ariaLabel?: string;
  align?: "left" | "right";
  showPresets?: boolean;
}

const DEFAULT_PRESETS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  outputFormat = "12h",
  minuteInterval = 15,
  placeholder = "Select time",
  disabled = false,
  required = false,
  error,
  className = "",
  id,
  name,
  ariaLabel = "Time picker",
  align = "left",
  showPresets = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsed = parseTime(value as any);

  const [selectedHour, setSelectedHour] = useState<number>(parsed ? parsed.hours12 : 11);
  const [selectedMinute, setSelectedMinute] = useState<number>(parsed ? parsed.minutes : 0);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsed ? parsed.period : "AM");

  // Sync internal state when external value changes
  useEffect(() => {
    if (parsed) {
      setSelectedHour(parsed.hours12);
      setSelectedMinute(parsed.minutes);
      setSelectedPeriod(parsed.period);
    }
  }, [value]);

  // Click outside and ESC handling
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

  const emitValue = (h12: number, min: number, period: "AM" | "PM") => {
    let h24 = period === "AM" ? (h12 === 12 ? 0 : h12) : h12 === 12 ? 12 : h12 + 12;
    const hh24 = h24 < 10 ? `0${h24}` : `${h24}`;
    const hh12 = h12 < 10 ? `0${h12}` : `${h12}`;
    const mm = min < 10 ? `0${min}` : `${min}`;

    if (outputFormat === "24h") {
      onChange(`${hh24}:${mm}`);
    } else {
      onChange(`${hh12}:${mm} ${period}`);
    }
  };

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    emitValue(h, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
    emitValue(selectedHour, m, selectedPeriod);
  };

  const handlePeriodToggle = (p: "AM" | "PM") => {
    setSelectedPeriod(p);
    emitValue(selectedHour, selectedMinute, p);
  };

  const handlePresetSelect = (preset: string) => {
    const p = parseTime(preset);
    if (p) {
      setSelectedHour(p.hours12);
      setSelectedMinute(p.minutes);
      setSelectedPeriod(p.period);
      if (outputFormat === "24h") {
        onChange(p.raw24);
      } else {
        onChange(p.formatted12);
      }
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange("");
  };

  // Generate minutes options based on minuteInterval
  const minutesOptions: number[] = [];
  const step = minuteInterval > 0 && minuteInterval <= 30 ? minuteInterval : 15;
  for (let m = 0; m < 60; m += step) {
    minutesOptions.push(m);
  }
  // Ensure the currently selected minute is in the options list if custom
  if (!minutesOptions.includes(selectedMinute)) {
    minutesOptions.push(selectedMinute);
    minutesOptions.sort((a, b) => a - b);
  }

  const hoursOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const formattedDisplay = formatTime(value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Visual Button */}
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
              title="Clear time"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
      </button>

      {/* Hidden input for form requirements */}
      {required && (
        <input
          type="text"
          tabIndex={-1}
          required={required}
          value={value ? formatTime(value) : ""}
          onChange={() => {}}
          className="sr-only"
        />
      )}

      {error && <p className="text-[11px] text-red-400 mt-1 font-medium">{error}</p>}

      {/* Popover Selector */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 p-4 w-72 rounded-2xl bg-card border border-white/15 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* AM / PM Toggle */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-text">Select Time</span>
            <div className="flex rounded-lg bg-background p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => handlePeriodToggle("AM")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedPeriod === "AM"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handlePeriodToggle("PM")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedPeriod === "PM"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-subtext hover:text-text"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Hour and Minute Selectors */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Hours Column */}
            <div>
              <label className="block text-[10px] font-bold text-subtext uppercase mb-1.5 text-center">
                Hour
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {hoursOptions.map((h) => {
                  const isHourSelected = selectedHour === h;
                  const label = h < 10 ? `0${h}` : `${h}`;
                  return (
                    <button
                      key={`hour-${h}`}
                      type="button"
                      onClick={() => handleHourSelect(h)}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        isHourSelected
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                          : "text-text hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <label className="block text-[10px] font-bold text-subtext uppercase mb-1.5 text-center">
                Minute
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {minutesOptions.map((m) => {
                  const isMinSelected = selectedMinute === m;
                  const label = m < 10 ? `0${m}` : `${m}`;
                  return (
                    <button
                      key={`min-${m}`}
                      type="button"
                      onClick={() => handleMinuteSelect(m)}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        isMinSelected
                          ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                          : "text-text hover:bg-white/10"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          {showPresets && (
            <div className="pt-3 border-t border-white/10">
              <label className="block text-[10px] font-bold text-subtext uppercase mb-1.5">
                Quick Select
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {DEFAULT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="px-1.5 py-1 rounded-md text-[11px] font-medium bg-background hover:bg-purple-600 hover:text-white border border-white/10 text-subtext transition-all text-center"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Done Button */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs">
            <span className="text-[11px] font-bold text-purple-300">
              {formatTime(
                `${selectedHour < 10 ? "0" + selectedHour : selectedHour}:${
                  selectedMinute < 10 ? "0" + selectedMinute : selectedMinute
                } ${selectedPeriod}`
              )}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
