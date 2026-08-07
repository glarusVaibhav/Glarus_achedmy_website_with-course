"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Mail,
  Archive,
  Trash2,
  CheckCircle2,
  Paperclip,
  Send,
  X,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  User
} from "lucide-react";

export interface AdminMessage {
  id: string;
  category: "Verification" | "Course Review" | "Announcements" | "Policy Updates" | "Payment Issues" | "Support" | "Others";
  priority: "High" | "Normal" | "Urgent";
  subject: string;
  adminName: string;
  adminRole: string;
  courseTitle?: string;
  messagePreview: string;
  fullMessage: string;
  date: string;
  isUnread: boolean;
  isArchived: boolean;
  attachments?: { name: string; size: string }[];
}

const INITIAL_ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: "adm-1",
    category: "Course Review",
    priority: "High",
    subject: "Course Requires Revision - Python Bootcamp",
    adminName: "Chief Academic Reviewer",
    adminRole: "Platform Quality Assurance",
    courseTitle: "Mastering Agentic AI & Autonomous Workflows",
    messagePreview: "Please improve Module 3 practical examples before resubmitting for final distribution.",
    fullMessage: "Hello Instructor,\n\nOur curriculum review team has evaluated your course 'Mastering Agentic AI & Autonomous Workflows'. While the theoretical overview in Modules 1 and 2 is outstanding, Module 3 requires additional hands-on code files and a downloadable starter repository before we can enable automated student sandbox testing.\n\nPlease update Module 3 with working Python scripts and resubmit for approval.\n\nBest regards,\nPlatform QA Team",
    date: "Yesterday",
    isUnread: true,
    isArchived: false,
    attachments: [
      { name: "module3_review_feedback.pdf", size: "1.2 MB" },
      { name: "code_quality_checklist.pdf", size: "850 KB" }
    ]
  },
  {
    id: "adm-2",
    category: "Verification",
    priority: "Urgent",
    subject: "Instructor Identity Verification Approved",
    adminName: "Glarus Safety Team",
    adminRole: "Trust & Safety Specialist",
    messagePreview: "Your instructor profile credentials have been verified. Full publishing privileges enabled.",
    fullMessage: "Congratulations! Your identity credentials, background documentation, and expert profile have been verified by GlarusAcademy Admins.\n\nYou now have complete access to create courses, host live webinars, and issue assignments.",
    date: "3 days ago",
    isUnread: true,
    isArchived: false,
  },
  {
    id: "adm-3",
    category: "Announcements",
    priority: "Normal",
    subject: "Q3 2026 Platform Revenue Share Boost",
    adminName: "Executive Team",
    adminRole: "Platform Administrator",
    messagePreview: "We are increasing instructor payouts by 5% for all top-rated AI and web development courses.",
    fullMessage: "Dear Instructors,\n\nWe are excited to announce a 5% bonus revenue share for all high-engagement courses starting August 1, 2026. Keep publishing assignments and hosting live webinars to qualify!",
    date: "5 days ago",
    isUnread: false,
    isArchived: false,
  },
  {
    id: "adm-4",
    category: "Policy Updates",
    priority: "Normal",
    subject: "Updated 2026 Copyright & Live Webinar Rules",
    adminName: "Legal & Compliance",
    adminRole: "Compliance Officer",
    messagePreview: "Please ensure all third-party code samples used in live sessions comply with MIT or Apache 2.0 open-source licenses.",
    fullMessage: "Please review the updated open-source licensing policy for all code snippets distributed via assignments and live coding streams.",
    date: "1 week ago",
    isUnread: false,
    isArchived: false,
  },
  {
    id: "adm-5",
    category: "Payment Issues",
    priority: "Normal",
    subject: "Tax Form W-8BEN/GST Clearance Confirmation",
    adminName: "Finance & Accounts",
    adminRole: "Finance Manager",
    messagePreview: "Your submitted tax information has been registered for automatic monthly direct payouts.",
    fullMessage: "Your monthly tax documentation is verified. Direct bank transfers will take place on the 1st of every month.",
    date: "2 weeks ago",
    isUnread: false,
    isArchived: false,
  },
];

export function InstructorAdminInboxView() {
  const [messages, setMessages] = useState<AdminMessage[]>(INITIAL_ADMIN_MESSAGES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);

  /* Reply composer */
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  /* Stats */
  const unreadCount = messages.filter(m => m.isUnread && !m.isArchived).length;
  const readCount = messages.filter(m => !m.isUnread && !m.isArchived).length;
  const archivedCount = messages.filter(m => m.isArchived).length;

  /* Filtered messages */
  const filteredMessages = messages.filter((m) => {
    if (m.isArchived && selectedCategory !== "Archived") return false;
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory || (selectedCategory === "Archived" && m.isArchived);
    const matchesSearch = m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.messagePreview.toLowerCase().includes(searchQuery.toLowerCase()) || m.adminName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleReadStatus = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isUnread: !m.isUnread } : m));
  };

  const archiveMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isArchived: true } : m));
    setSelectedMessage(null);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setIsReplying(false);
    setReplyText("");
    setSelectedMessage(null);
  };

  const getPriorityBadge = (priority: AdminMessage["priority"]) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "High":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Normal":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── HEADER ─── */}
      <div>
        <h1 className="text-3xl font-extrabold text-text tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          Admin Inbox
        </h1>
        <p className="text-sm text-subtext mt-1 font-medium">
          Official communications, compliance notices, and course review feedback sent directly from platform administrators.
        </p>
      </div>

      {/* ─── STATISTICS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Unread Admin Messages</span>
            <span className="text-3xl font-black text-amber-400 mt-1 block">{unreadCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20"><Mail className="w-6 h-6" /></div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Read Messages</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{readCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-6 h-6" /></div>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-card/80 rounded-2xl p-5 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-subtext uppercase tracking-widest block">Archived Messages</span>
            <span className="text-3xl font-black text-subtext mt-1 block">{archivedCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-card text-subtext"><Archive className="w-6 h-6" /></div>
        </div>
      </div>

      {/* ─── CATEGORIES & SEARCH TOOLBAR ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-xl border border-card/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            "All",
            "Verification",
            "Course Review",
            "Announcements",
            "Policy Updates",
            "Payment Issues",
            "Support",
            "Others"
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-subtext hover:bg-card hover:text-text"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-subtext absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admin messages..."
            className="w-full bg-background border border-card rounded-xl pl-10 pr-4 py-2 text-xs text-text placeholder:text-subtext/60 font-medium focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ─── MESSAGE CARDS LIST ─── */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => {
              setSelectedMessage(msg);
              if (msg.isUnread) toggleReadStatus(msg.id);
            }}
            className={`bg-card/60 backdrop-blur-xl border rounded-2xl p-5 shadow-md transition-all cursor-pointer hover:-translate-y-0.5 group ${
              msg.isUnread
                ? "border-l-4 border-l-amber-400 border-card/80 bg-amber-500/5"
                : "border-card/80"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      🛡 ADMIN
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${getPriorityBadge(msg.priority)}`}>
                      {msg.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-subtext bg-card px-2 py-0.5 rounded border border-card">
                      {msg.category}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-text line-clamp-1 group-hover:text-primary transition-colors">
                    {msg.subject}
                  </h3>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-subtext">{msg.date}</span>
                {msg.isUnread && (
                  <span className="text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full block mt-1">
                    Unread
                  </span>
                )}
              </div>
            </div>

            {msg.courseTitle && (
              <p className="text-xs font-bold text-purple-400 mt-2 bg-purple-500/10 px-3 py-1 rounded-xl inline-block border border-purple-500/20">
                Course: {msg.courseTitle}
              </p>
            )}

            <p className="text-xs text-subtext font-medium line-clamp-2 mt-2">
              {msg.messagePreview}
            </p>

            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-card/60 text-xs text-primary font-bold">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{msg.attachments.length} Attachment(s) included</span>
              </div>
            )}
          </div>
        ))}

        {filteredMessages.length === 0 && (
          <div className="bg-card/40 border border-card rounded-2xl p-16 text-center text-subtext">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-extrabold text-base text-text">No admin messages found</p>
            <p className="text-xs">There are no messages in this category.</p>
          </div>
        )}
      </div>

      {/* ─── FULL MESSAGE DETAIL MODAL ─── */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-background border border-card rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-card/40 border-b border-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Official Admin Notice</span>
                  <h2 className="text-xl font-extrabold text-text">{selectedMessage.subject}</h2>
                  <p className="text-xs text-subtext font-medium">{selectedMessage.adminName} • {selectedMessage.adminRole}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="p-2 text-subtext hover:text-text rounded-xl bg-card">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-subtext border-b border-card pb-3">
                <span>Date: {selectedMessage.date}</span>
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-black uppercase ${getPriorityBadge(selectedMessage.priority)}`}>
                  {selectedMessage.priority} Priority
                </span>
              </div>

              <div className="bg-card/40 border border-card rounded-2xl p-5 text-sm text-text font-medium leading-relaxed whitespace-pre-line">
                {selectedMessage.fullMessage}
              </div>

              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-xs text-text uppercase tracking-wider">Attachments ({selectedMessage.attachments.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedMessage.attachments.map((att, idx) => (
                      <div key={idx} className="p-3 bg-card border border-card rounded-xl flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2 text-primary">
                          <FileText className="w-4 h-4" />
                          <span>{att.name}</span>
                        </div>
                        <span className="text-[10px] text-subtext">{att.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply Composer */}
              {isReplying ? (
                <div className="p-4 bg-card/60 border border-card rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-xs text-text">Reply to Admin Team</h4>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response or resubmission notes to the platform admin..."
                    className="w-full bg-background border border-card rounded-xl px-4 py-3 text-xs text-text font-medium focus:outline-none focus:border-primary"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setIsReplying(false)} className="px-3 py-1.5 bg-card text-subtext rounded-xl font-bold text-xs">
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="px-5 py-2 bg-primary text-white rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-md shadow-primary/20"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Reply
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-card/40 border-t border-card flex items-center justify-between">
              <button
                onClick={() => archiveMessage(selectedMessage.id)}
                className="px-4 py-2 bg-card hover:bg-card/80 text-subtext rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Archive className="w-4 h-4" /> Archive Message
              </button>

              {!isReplying && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" /> Reply to Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
