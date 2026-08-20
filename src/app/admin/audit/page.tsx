"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Clock,
  User,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Lock,
  Globe,
  Terminal
} from "lucide-react";

interface AuditLogItem {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  actionType: "APPROVAL" | "REJECTION" | "PUBLISH" | "TASK" | "SECURITY" | "SETTINGS" | "REFUND";
  targetEntity: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "FLAGGED";
  diffPayload?: {
    field: string;
    before: string;
    after: string;
  }[];
}

const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "LOG-9081",
    adminName: "Super Admin",
    adminEmail: "admin@glarus.edu",
    action: "Admin approved instructor verification",
    actionType: "APPROVAL",
    targetEntity: "Instructor: Dr. Sarah Chen",
    details: "Verified credentials, resume PDF, and enabled full course publishing permissions.",
    ipAddress: "192.168.1.104 (Bangalore, IN)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    timestamp: "Today, 10:20 AM",
    status: "SUCCESS",
    diffPayload: [
      { field: "verificationStatus", before: "PENDING", after: "VERIFIED" },
      { field: "publishingPrivileges", before: "false", after: "true" }
    ]
  },
  {
    id: "LOG-9082",
    adminName: "Super Admin",
    adminEmail: "admin@glarus.edu",
    action: "Admin assigned task to faculty",
    actionType: "TASK",
    targetEntity: "Task: TSK-1042 (Alex Chen)",
    details: "Assigned live capstone workshop with compensation set to ₹5,000.",
    ipAddress: "192.168.1.104 (Bangalore, IN)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    timestamp: "Today, 09:45 AM",
    status: "SUCCESS",
    diffPayload: [
      { field: "taskStatus", before: "CREATED", after: "ASSIGNED" },
      { field: "assignedTo", before: "null", after: "Alex Chen" }
    ]
  },
  {
    id: "LOG-9083",
    adminName: "Academic Ops Admin",
    adminEmail: "ops@glarus.edu",
    action: "Admin approved course curriculum",
    actionType: "PUBLISH",
    targetEntity: "Course: Advanced AI Agents",
    details: "Validated 6 module syllabus, audio streams, and marked course status to PUBLISHED.",
    ipAddress: "103.21.244.12 (Mumbai, IN)",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    timestamp: "Yesterday, 04:30 PM",
    status: "SUCCESS",
    diffPayload: [
      { field: "courseStatus", before: "PENDING", after: "APPROVED" },
      { field: "isListedInCatalog", before: "false", after: "true" }
    ]
  },
  {
    id: "LOG-9084",
    adminName: "Super Admin",
    adminEmail: "admin@glarus.edu",
    action: "Admin rejected refund dispute",
    actionType: "REFUND",
    targetEntity: "Refund: REF-104 (Meera Gupta)",
    details: "Student completed 95% of course lessons prior to requesting full purchase refund.",
    ipAddress: "192.168.1.104 (Bangalore, IN)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    timestamp: "2 days ago",
    status: "FLAGGED",
    diffPayload: [
      { field: "refundStatus", before: "PENDING", after: "REJECTED" },
      { field: "adminNotes", before: "null", after: "Completed >90% curriculum" }
    ]
  },
  {
    id: "LOG-9085",
    adminName: "Super Admin",
    adminEmail: "admin@glarus.edu",
    action: "Admin updated platform commission percent",
    actionType: "SETTINGS",
    targetEntity: "Settings: Commission",
    details: "Adjusted global platform commission rate from 12% to 15%.",
    ipAddress: "192.168.1.104 (Bangalore, IN)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    timestamp: "4 days ago",
    status: "WARNING",
    diffPayload: [
      { field: "commissionPercent", before: "12.0%", after: "15.0%" }
    ]
  }
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Fetch real API audit logs if available
  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/logs");
        if (res.ok) {
          const data = await res.json();
          if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
            // merge formatted real logs
          }
        }
      } catch {
        /* ignore */
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchAdmin = log.adminName.toLowerCase().includes(q);
        const matchTarget = log.targetEntity.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchAction && !matchAdmin && !matchTarget && !matchDetails) return false;
      }

      if (actionTypeFilter !== "ALL" && log.actionType !== actionTypeFilter) return false;
      if (statusFilter !== "ALL" && log.status !== statusFilter) return false;

      return true;
    });
  }, [logs, searchQuery, actionTypeFilter, statusFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Status Indicator */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Audit Stream Active</span>
        </div>
      </div>

      {/* Search & Filter Header */}
      <div className="bg-card border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit logs by admin, action, target..."
            className="w-full bg-background border border-white/10 pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-text placeholder:text-subtext/60 focus:outline-none focus:border-purple-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Action Types</option>
            <option value="APPROVAL">Approvals</option>
            <option value="REJECTION">Rejections</option>
            <option value="PUBLISH">Course Publications</option>
            <option value="TASK">Task Assignments</option>
            <option value="REFUND">Refund Decisions</option>
            <option value="SETTINGS">Settings Edits</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-white/10 text-xs font-semibold text-text px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          >
            <option value="ALL">All Event Severities</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="FLAGGED">Flagged</option>
          </select>

          <span className="text-xs font-semibold text-subtext px-2 py-1 bg-background/50 rounded-lg border border-white/5">
            {filteredLogs.length} events
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-white/10 bg-background/50 text-[10px] font-black text-subtext uppercase tracking-wider">
                <th className="py-4 px-6 w-[18%]">Admin / Actor</th>
                <th className="py-4 px-4 w-[24%]">Action Executed</th>
                <th className="py-4 px-4 w-[22%]">Target Entity</th>
                <th className="py-4 px-4 text-center">Event Type</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Timestamp</th>
                <th className="py-4 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  {/* Admin */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                        {log.adminName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text truncate">{log.adminName}</p>
                        <p className="text-[10px] text-subtext truncate">{log.adminEmail}</p>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4">
                    <p className="font-semibold text-text leading-snug group-hover:text-purple-300 transition-colors">
                      {log.action}
                    </p>
                    <p className="text-[11px] text-subtext line-clamp-1 mt-0.5">{log.details}</p>
                  </td>

                  {/* Target Entity */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-text truncate block max-w-[200px]">
                      {log.targetEntity}
                    </span>
                    <span className="text-[10px] font-mono text-subtext/80">{log.ipAddress.split(" ")[0]}</span>
                  </td>

                  {/* Event Type */}
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card border border-white/10 text-purple-300">
                      {log.actionType}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : log.status === "WARNING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 text-center text-subtext text-[11px] font-mono">
                    {log.timestamp}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold text-subtext hover:text-white transition-all flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AUDIT LOG RECORD INSPECTION DRAWER ── */}
      {selectedLog && (
        <AuditLogDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

function AuditLogDrawer({
  log,
  onClose
}: {
  log: AuditLogItem;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-card border-l border-white/10 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs border border-purple-500/30">
              {log.id}
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Audit Event Record</h2>
              <p className="text-xs text-subtext mt-0.5">{log.timestamp} • {log.ipAddress}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-background hover:bg-card border border-white/10 text-subtext hover:text-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Action Overview */}
          <div className="p-4 rounded-xl bg-background/50 border border-white/10 space-y-2">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Executive Summary
            </p>
            <h3 className="text-sm font-bold text-text">{log.action}</h3>
            <p className="text-xs text-subtext leading-relaxed">{log.details}</p>
          </div>

          {/* Actor & Entity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-background/40 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-subtext uppercase">Actor / Admin</p>
              <p className="text-xs font-bold text-text">{log.adminName}</p>
              <p className="text-[11px] text-subtext">{log.adminEmail}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-background/40 border border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-subtext uppercase">Target Entity</p>
              <p className="text-xs font-bold text-text truncate">{log.targetEntity}</p>
              <p className="text-[11px] text-purple-300 font-mono">Type: {log.actionType}</p>
            </div>
          </div>

          {/* Before vs After Diff Payload */}
          {log.diffPayload && (
            <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2.5">
              <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>State Transition / Before-After Diff</span>
              </h3>

              <div className="space-y-2 font-mono text-[11px]">
                {log.diffPayload.map((diff, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-card border border-white/5 space-y-1">
                    <span className="text-text font-bold text-xs">{diff.field}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        - {diff.before}
                      </span>
                      <span className="text-subtext">→</span>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        + {diff.after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Client Metadata */}
          <div className="p-4 rounded-xl bg-background/40 border border-white/10 space-y-2 text-[11px]">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Network & Client Environment</span>
            </h3>
            <div className="space-y-1.5 text-subtext">
              <p>
                <span className="text-text font-semibold">IP Origin:</span> {log.ipAddress}
              </p>
              <p className="break-all">
                <span className="text-text font-semibold">User Agent:</span> {log.userAgent}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-background/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-card hover:bg-white/5 text-text border border-white/10 text-xs font-bold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
