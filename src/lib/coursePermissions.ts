/**
 * Centralized Course Governance & Permission Helpers
 * 
 * Defines strict authorization boundaries between Instructors and Admins.
 * Instructors author and submit courses for review; Admins govern approval and publication.
 */

export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN" | string;

export type CourseLifecycleStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED";

/**
 * Checks if the user can create new courses
 */
export function canCreateCourse(role?: UserRole): boolean {
  return role === "INSTRUCTOR" || role === "ADMIN";
}

/**
 * Checks if the user can edit course curriculum & metadata.
 * Instructors can edit during DRAFT and CHANGES_REQUESTED states.
 * Editing is locked while UNDER_REVIEW.
 */
export function canEditCourse(role?: UserRole, status?: CourseLifecycleStatus): boolean {
  if (role === "ADMIN") return true;
  if (role === "INSTRUCTOR") {
    return status === "DRAFT" || status === "CHANGES_REQUESTED";
  }
  return false;
}

/**
 * Checks if the user can submit the course for Admin review.
 */
export function canSubmitCourse(role?: UserRole, status?: CourseLifecycleStatus): boolean {
  if (role === "INSTRUCTOR" || role === "ADMIN") {
    return status === "DRAFT" || status === "CHANGES_REQUESTED";
  }
  return false;
}

/**
 * Checks if the user can approve courses.
 * Strictly restricted to Platform Administrators.
 */
export function canApproveCourse(role?: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Checks if the user can publish courses to the live public catalog.
 * Strictly restricted to Platform Administrators.
 * Instructors CANNOT publish courses under any circumstance.
 */
export function canPublishCourse(role?: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Returns human-readable governance status labels and descriptions for display.
 */
export function getGovernanceDisplay(status: CourseLifecycleStatus, submissionDate?: string, feedback?: string) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        colorClass: "text-amber-400",
        dotColorClass: "bg-amber-400 shadow-amber-400/40",
        bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-300",
        subtitle: "Draft saved · In progress",
        badge: "Draft",
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        colorClass: "text-rose-400",
        dotColorClass: "bg-rose-500 shadow-rose-500/40 animate-pulse",
        bgClass: "bg-rose-500/10 border-rose-500/20 text-rose-300",
        subtitle: `Submitted ${submissionDate || "recently"} · Waiting for Admin approval`,
        badge: "Under Review",
      };
    case "CHANGES_REQUESTED":
      return {
        label: "Changes Requested",
        colorClass: "text-orange-400",
        dotColorClass: "bg-orange-400 shadow-orange-400/40",
        bgClass: "bg-orange-500/10 border-orange-500/20 text-orange-300",
        subtitle: feedback ? `Admin: "${feedback.slice(0, 48)}..."` : "Admin requested revisions",
        badge: "Changes Requested",
      };
    case "APPROVED":
      return {
        label: "Approved",
        colorClass: "text-violet-400",
        dotColorClass: "bg-violet-400 shadow-violet-400/40",
        bgClass: "bg-violet-500/10 border-violet-500/20 text-violet-300",
        subtitle: "Approved by Admin · Awaiting Publication",
        badge: "Approved",
      };
    case "PUBLISHED":
      return {
        label: "Published",
        colorClass: "text-emerald-400",
        dotColorClass: "bg-emerald-400 shadow-emerald-400/40",
        bgClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
        subtitle: "Approved by Admin · Live on Catalog",
        badge: "Published",
      };
    default:
      return {
        label: "Draft",
        colorClass: "text-slate-400",
        dotColorClass: "bg-slate-400",
        bgClass: "bg-white/5 border-white/10 text-slate-300",
        subtitle: "Draft",
        badge: "Draft",
      };
  }
}
