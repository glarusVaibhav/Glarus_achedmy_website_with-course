# GlarusAcademy LMS — Codebase Hardcoded vs Dynamic Analysis

This report provides a comprehensive, component-by-component architectural audit of the entire GlarusAcademy LMS codebase, categorizing every module as **Dynamic (Database / API Backed)**, **Hardcoded (Mock Data / Constants)**, or **Hybrid (DB-first with Mock Fallbacks / Demo Mode)**.

---

## 📊 Summary Overview

| Area / Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication & Session** | 🟢 **100% Dynamic** | Prisma DB user lookups, bcrypt hashing, JWT HTTP-only cookies, dynamic `AuthContext`, and session invalidation on logout. |
| **Forgot Password & OTP Flow** | 🟢 **100% Dynamic** | Dynamic 6-digit OTPs, DB table `PasswordResetToken`, SMTP nodemailer transport, and expiration validation. |
| **Student Dashboard & Learning Portal** | 🟢 **100% Dynamic** | Real enrollments, video progress tracking, live session attendance, certificates, and streak analytics via Prisma. |
| **Self-Paced Course Catalog** | 🟢 **Dynamic** | Fetches live published courses from PostgreSQL via `/api/courses`. |
| **Instructor Verification Flow** | 🟢 **Dynamic** | Multi-step form submissions write to `InstructorApproval` table; Admin reviews write to DB. |
| **Instructor Studio & Modules** | 🟡 **Hybrid** | Real DB for active instructors; special demo mode with mock assignments/tasks for `abc@gmail.com`. |
| **Admin Portal Overview & Trends** | 🔴 **Hardcoded** | Top revenue & student growth charts, attention center items, recent activity lists use static arrays. |
| **Admin Management Tables (Students/Instructors/Courses/Payments)** | 🟡 **Hybrid** | Uses large mock datasets as default / fallback, then merges real DB approvals/data where available. |
| **Live Course Catalog Tabs** | 🔴 **Hardcoded** | Live course previews on catalog tabs (`ENRICHED_LIVE_COURSES`) use static mock data. |
| **Landing & Marketing Pages** | 🔴 **Hardcoded** | Marketing hero, interactive timeline, demo chat mockup, and feature showcases use static data. |
| **Zoom Video SDK Integration** | 🟡 **Hardcoded IP Fallback** | Hardcoded backend IP (`http://192.168.1.16:8000`) and fallback SDK keys if env variables are omitted. |

---

## 1. 🔐 Authentication, Authorization & User State

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [AuthContext.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/context/AuthContext.tsx) | 🟢 **Dynamic** | Manages reactive user state via `/api/auth/me`, syncs with `localStorage` (`glarus_auth_user`), and handles real logout invalidation. |
| [lib/auth.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/auth.ts) | 🟢 **Dynamic** | Signs/verifies JWTs with `jose`, manages HTTP-only `auth_token` cookies. Fallback secret `process.env.JWT_SECRET || 'glarus-academy-super-secret-key-for-jwt-2024'`. |
| [AdminHeader.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/admin/AdminHeader.tsx) | 🟢 **Dynamic** | Dynamically extracts `user.name`, `user.email`, initials, and real `logout()` action from `useAuth()`. |
| [UserProfileMenu.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/UserProfileMenu.tsx) | 🟢 **Dynamic** | Role-aware dropdown (Admin, Instructor, Student) reading dynamic profile data and invoking `logout()`. |
| [middleware.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/middleware.ts) | 🟢 **Dynamic** | Server-side edge middleware verifying JWT signatures and enforcing role-based route protection on `/admin`, `/instructor`, and `/dashboard`. |
| [login/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/login/page.tsx) | 🟢 **Dynamic** *(with helper buttons)* | Real POST `/api/auth/login` to DB. Contains UI quick-fill helper buttons for test credentials (`admin@gmail.com`, `instructor@gmail.com`, `student@gmail.com`). |
| [signup/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/signup/page.tsx) | 🟢 **Dynamic** | Creates real users with hashed passwords in PostgreSQL. |
| [forgot-password/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/forgot-password/page.tsx) | 🟢 **Dynamic** | Generates real crypto OTP, inserts into DB, dispatches email via SMTP. |

---

## 2. 🎓 Student Dashboard & Learning Portal

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [dashboard/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/dashboard/page.tsx) | 🟢 **100% Dynamic** | Fetches all statistics, enrolled courses, upcoming live classes, certificates, and learning streaks from `/api/student/*` routes. |
| [studentDashboardService.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/services/studentDashboardService.ts) | 🟢 **100% Dynamic** | Executes Prisma queries against `Enrollment`, `LiveCourseEnrollment`, `VideoProgress`, `LiveSessionAttendance`, and `Certificate` models. |
| [learn/[courseId]/[lectureId]/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/learn) | 🟢 **100% Dynamic** | Reads course curriculum, loads video/notes/quiz, and saves real video completion timestamps via `/api/video-progress`. |
| [recommendationEngine.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/recommendationEngine.ts) | 🟢 **Dynamic Algorithm** | Computes course similarity vectors and personalized recommendations based on student enrollment history. |

---

## 3. 👨‍🏫 Instructor Studio & Workflows

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [instructor/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/instructor/page.tsx) | 🟡 **Hybrid** | Real course authoring & curriculum saving to DB. Includes `isDemoUser = user?.email === "abc@gmail.com"` to display rich mock studio assets for demo presentations. |
| [InstructorVerificationForm.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/instructor/InstructorVerificationForm.tsx) | 🟢 **Dynamic** | Multi-step form writing personal details, teaching video links, resume paths, and skills to `InstructorApproval` table. |
| [InstructorTasksView.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/instructor/InstructorTasksView.tsx) | 🟡 **Hybrid** | Populates `INITIAL_TASKS` when `isDemoUser === true`; empty/live for verified instructors. |
| [InstructorAssignmentsView.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/instructor/InstructorAssignmentsView.tsx) | 🟡 **Hybrid** | Uses `INITIAL_ASSIGNMENTS` and `INITIAL_SUBMISSIONS` for demo mode. |
| [InstructorLiveDashboard.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/instructor/InstructorLiveDashboard.tsx) | 🟡 **Hybrid** | Fetches live cohorts from DB, with fallback to `INITIAL_LIVE_CLASSES` if in demo user mode. |

---

## 4. 👑 Admin Command Center & Management

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [admin/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/page.tsx) | 🔴 **Hardcoded Mock** | `revenueTrendData` (7 days), `studentGrowthTrend` (6 months), `attentionItems`, `recentTasks`, `recentCourses`, `recentInstructors`, and `recentStudentActivity` are hardcoded static JavaScript arrays. |
| [admin/courses/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/courses/page.tsx) | 🟡 **Hybrid** | Initialized with `MOCK_COURSES` (15+ sample self-paced and live cohort objects) before merging real submissions. |
| [admin/instructors/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/instructors/page.tsx) | 🟡 **Hybrid** | Initialized with `MOCK_INSTRUCTORS` (`Dr. Sarah Chen`, `Alex Chen`, `John Doe`), then dynamically merges real DB records from `/api/admin/approvals/instructor`. |
| [admin/students/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/students/page.tsx) | 🟡 **Hybrid** | Initialized with `MOCK_STUDENTS` from [mockStudents.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/mockStudents.ts), then merges real learners from `/api/admin/students`. |
| [admin/payments/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/payments/page.tsx) | 🔴 **Hardcoded Mock** | `INITIAL_TRANSACTIONS`, `INITIAL_INSTRUCTOR_PAYOUTS`, and `INITIAL_REFUNDS` contain static dummy financial records. |
| [admin/audit/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/admin/audit/page.tsx) | 🔴 **Hardcoded Mock** | Audit trail logs (`MOCK_AUDIT_LOGS`) contain pre-defined security and event entries with hardcoded IP addresses (`192.168.1.100`, etc.). |

---

## 5. 📚 Course Catalog & Public Pages

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [courses/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/courses/page.tsx) (Self-Paced Tab) | 🟢 **Dynamic** | Fetches real courses from DB via `/api/courses`. |
| [courses/page.tsx](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/courses/page.tsx) (Live Tab) | 🔴 **Hardcoded Mock** | `ENRICHED_LIVE_COURSES` array (5 static live cohorts with hardcoded dates, seats, and pricing). |
| [mockCoursesDetailed.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/mockCoursesDetailed.ts) | 🔴 **Hardcoded Mock** | 900+ lines of static course modules, quiz questions, assignment briefs, and audio quality scores. |
| [courseCatalogDetails.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/courseCatalogDetails.ts) | 🔴 **Hardcoded Mock** | 1,000+ lines of detailed course outlines, learning objectives, and code exercises. |

---

## 6. 🌐 External Integrations, Microservices & Secrets

| Component / File | Status | Hardcoded vs Dynamic Details |
| :--- | :--- | :--- |
| [ZoomService.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/components/zoom/ZoomService.ts) | 🟡 **Hardcoded IP** | Line 1 hardcodes: `const API_BASE = 'http://192.168.1.16:8000/meetings';`. Needs `process.env.NEXT_PUBLIC_ZOOM_API_URL`. |
| [meetings/signature/route.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/app/api/meetings/signature/route.ts) | 🟡 **Fallback Secrets** | Fallback service URL `http://192.168.1.14:8000` and fallback key `1YeeUCULQD7tJesoWxT8h7dTVf3umwu29RBA` used if environment variables are not set. |
| [email.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/email.ts) | 🟢 **Dynamic Env** | Uses `process.env.SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT`, with safe dev console fallback. |
| [db.ts](file:///c:/Users/Admin/Desktop/glarus%20achedmy/frontend/src/lib/db.ts) | 🟢 **Dynamic Env** | Uses `process.env.DATABASE_URL`. |

---

## 7. 🚀 Recommended Steps to Make Everything 100% Dynamic

If you wish to transition remaining mock/hardcoded sections to 100% database-driven in the future:

1. **Admin Overview Charts**:
   - Replace `revenueTrendData` and `studentGrowthTrend` in `src/app/admin/page.tsx` with aggregate Prisma queries grouped by date range (`prisma.purchase.groupBy(...)` and `prisma.user.groupBy(...)`).
2. **Admin Payments & Audit**:
   - Query `prisma.purchase` and `prisma.refund` for `src/app/admin/payments/page.tsx`.
   - Create an `AuditLog` table in `schema.prisma` and log admin actions dynamically.
3. **Live Course Catalog**:
   - Migrate `ENRICHED_LIVE_COURSES` in `src/app/courses/page.tsx` to fetch from `/api/live-courses` (`prisma.liveCourse.findMany`).
4. **Zoom Environment Variables**:
   - Replace hardcoded `http://192.168.1.16:8000` in `ZoomService.ts` with `process.env.NEXT_PUBLIC_ZOOM_API_URL`.
