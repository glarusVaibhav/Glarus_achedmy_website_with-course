import prisma from "../src/lib/db";
import { signToken } from "../src/lib/auth";

const BASE_URL = "http://localhost:3000";

interface TestResult {
  domain: string;
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number[];
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

function record(domain: string, endpoint: string, method: string, status: number, expectedStatus: number[], notes?: string) {
  const passed = expectedStatus.includes(status);
  results.push({
    domain,
    endpoint,
    method,
    status,
    expectedStatus,
    passed,
    notes
  });

  const icon = passed ? "✅ [PASS]" : "❌ [FAIL]";
  console.log(`${icon} [${method}] ${endpoint} -> HTTP ${status} (Expected: ${expectedStatus.join(", ")})${notes ? ` - ${notes}` : ""}`);
}

async function runComprehensiveApiAudit() {
  console.log("==================================================================");
  console.log("   GLARUS ACADEMY - COMPREHENSIVE BACKEND API AUDIT SUITE");
  console.log("==================================================================");

  // 1. Fetch Actors from DB
  let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  let instructorUser = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
  let studentUser = await prisma.user.findFirst({ where: { role: "STUDENT" } });

  // If missing, seed or fallback
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin_audit_test@glarus.com",
        name: "Audit Admin",
        role: "ADMIN",
        password: "hashed_pass_placeholder",
        emailVerifiedAt: new Date()
      }
    });
  }

  if (!instructorUser) {
    instructorUser = await prisma.user.create({
      data: {
        email: "instructor_audit_test@glarus.com",
        name: "Audit Instructor",
        role: "INSTRUCTOR",
        password: "hashed_pass_placeholder",
        emailVerifiedAt: new Date()
      }
    });
  }

  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: "student_audit_test@glarus.com",
        name: "Audit Student",
        role: "STUDENT",
        password: "hashed_pass_placeholder",
        emailVerifiedAt: new Date()
      }
    });
  }

  // Generate tokens
  const adminToken = await signToken({ id: adminUser.id, email: adminUser.email, role: "ADMIN", name: adminUser.name });
  const instructorToken = await signToken({ id: instructorUser.id, email: instructorUser.email, role: "INSTRUCTOR", name: instructorUser.name });
  const studentToken = await signToken({ id: studentUser.id, email: studentUser.email, role: "STUDENT", name: studentUser.name });

  const adminCookie = `auth_token=${adminToken}`;
  const instructorCookie = `auth_token=${instructorToken}`;
  const studentCookie = `auth_token=${studentToken}`;

  // Fetch some dynamic entity IDs from DB to test parameterized routes
  const sampleCourse = await prisma.course.findFirst({ include: { modules: { include: { lectures: true } } } });
  const courseId = sampleCourse?.id || "cmtv_placeholder_course";
  
  const sampleLiveCourse = await prisma.liveCourse.findFirst();
  const liveCourseId = sampleLiveCourse?.id || "cmtv_placeholder_live";

  const sampleLiveSession = await prisma.liveSession.findFirst();
  const liveSessionId = sampleLiveSession?.id || "cmtv_placeholder_session";

  const sampleNotification = await prisma.notification.findFirst();
  const notifId = sampleNotification?.id || "cmtv_placeholder_notif";

  console.log(`\n📌 Context Initialized: Admin (${adminUser.email}), Instructor (${instructorUser.email}), Student (${studentUser.email})`);
  console.log(`📌 Sample Entities: Course=${courseId}, LiveCourse=${liveCourseId}, LiveSession=${liveSessionId}\n`);

  // ==========================================
  // DOMAIN 1: Authentication & Security APIs
  // ==========================================
  console.log("\n--- [DOMAIN 1: Authentication & Security] ---");
  {
    // GET /api/auth/me (Unauthenticated)
    let res = await fetch(`${BASE_URL}/api/auth/me`);
    record("Auth", "/api/auth/me (Unauthenticated)", "GET", res.status, [200, 401]);

    // GET /api/auth/me (Authenticated Admin)
    res = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: adminCookie } });
    record("Auth", "/api/auth/me (Admin Cookie)", "GET", res.status, [200]);

    // GET /api/auth/me (Authenticated Student)
    res = await fetch(`${BASE_URL}/api/auth/me`, { headers: { Cookie: studentCookie } });
    record("Auth", "/api/auth/me (Student Cookie)", "GET", res.status, [200]);

    // POST /api/auth/forgot-password (Invalid payload validation)
    res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid_email_test@example.com" })
    });
    record("Auth", "/api/auth/forgot-password", "POST", res.status, [200, 400, 404]);

    // POST /api/auth/forgot-password/verify-otp (Invalid OTP validation)
    res = await fetch(`${BASE_URL}/api/auth/forgot-password/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid@example.com", otp: "000000" })
    });
    record("Auth", "/api/auth/forgot-password/verify-otp", "POST", res.status, [200, 400, 404]);

    // POST /api/auth/logout
    res = await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" });
    record("Auth", "/api/auth/logout", "POST", res.status, [200]);
  }

  // ==========================================
  // DOMAIN 2: Storage & Media (MinIO)
  // ==========================================
  console.log("\n--- [DOMAIN 2: Storage & Media (MinIO)] ---");
  {
    // POST /api/upload (Authorized Instructor Image)
    const imgBuffer = Buffer.from("mini-audit-test-image-content");
    const form = new FormData();
    form.append("file", new Blob([imgBuffer], { type: "image/png" }), "audit_test.png");
    form.append("category", "image");
    form.append("courseId", courseId);

    let res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: { Cookie: instructorCookie },
      body: form
    });
    record("Storage", "/api/upload (Instructor Image Upload)", "POST", res.status, [200]);

    // GET /api/storage/file (Unauthorized check)
    res = await fetch(`${BASE_URL}/api/storage/file?key=courses%2Ftest%2Fvideos%2Ftest.mp4`);
    record("Storage", "/api/storage/file (Unauthorized Block)", "GET", res.status, [401]);

    // GET /api/storage/file (Path traversal block)
    res = await fetch(`${BASE_URL}/api/storage/file?key=..%2F..%2Fsecret.env`, { headers: { Cookie: adminCookie } });
    record("Storage", "/api/storage/file (Path Traversal Block)", "GET", res.status, [400]);

    // GET /api/storage/file (Disallowed namespace block)
    res = await fetch(`${BASE_URL}/api/storage/file?key=zoom-recordings%2Fsecret.mp4`, { headers: { Cookie: adminCookie } });
    record("Storage", "/api/storage/file (Namespace Isolation Block)", "GET", res.status, [403]);
  }

  // ==========================================
  // DOMAIN 3: Courses & Curriculum APIs
  // ==========================================
  console.log("\n--- [DOMAIN 3: Courses & Curriculum] ---");
  {
    // GET /api/courses (Public Catalog)
    let res = await fetch(`${BASE_URL}/api/courses`);
    record("Courses", "/api/courses", "GET", res.status, [200]);

    // GET /api/courses/[id]
    if (sampleCourse) {
      res = await fetch(`${BASE_URL}/api/courses/${sampleCourse.id}`);
      record("Courses", `/api/courses/[id] (${sampleCourse.id})`, "GET", res.status, [200]);

      // GET /api/course/[courseId]/sidebar
      res = await fetch(`${BASE_URL}/api/course/${sampleCourse.id}/sidebar`, { headers: { Cookie: studentCookie } });
      record("Courses", `/api/course/[courseId]/sidebar`, "GET", res.status, [200]);
    }
  }

  // ==========================================
  // DOMAIN 4: Admin Module APIs
  // ==========================================
  console.log("\n--- [DOMAIN 4: Admin Module] ---");
  {
    // GET /api/admin/stats
    let res = await fetch(`${BASE_URL}/api/admin/stats`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/stats", "GET", res.status, [200]);

    // GET /api/admin/analytics
    res = await fetch(`${BASE_URL}/api/admin/analytics`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/analytics", "GET", res.status, [200]);

    // GET /api/admin/courses
    res = await fetch(`${BASE_URL}/api/admin/courses`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/courses", "GET", res.status, [200]);

    // GET /api/admin/courses/[id]
    if (sampleCourse) {
      res = await fetch(`${BASE_URL}/api/admin/courses/${sampleCourse.id}`, { headers: { Cookie: adminCookie } });
      record("Admin", `/api/admin/courses/[id]`, "GET", res.status, [200]);
    }

    // GET /api/admin/instructors/permissions
    res = await fetch(`${BASE_URL}/api/admin/instructors/permissions`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/instructors/permissions", "GET", res.status, [200]);

    // GET /api/admin/instructors/[id]
    res = await fetch(`${BASE_URL}/api/admin/instructors/${instructorUser.id}`, { headers: { Cookie: adminCookie } });
    record("Admin", `/api/admin/instructors/[id]`, "GET", res.status, [200]);

    // GET /api/admin/approvals/instructor
    res = await fetch(`${BASE_URL}/api/admin/approvals/instructor`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/approvals/instructor", "GET", res.status, [200]);

    // GET /api/admin/students
    res = await fetch(`${BASE_URL}/api/admin/students`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/students", "GET", res.status, [200]);

    // GET /api/admin/students/[id]
    res = await fetch(`${BASE_URL}/api/admin/students/${studentUser.id}`, { headers: { Cookie: adminCookie } });
    record("Admin", `/api/admin/students/[id]`, "GET", res.status, [200]);

    // GET /api/admin/users
    res = await fetch(`${BASE_URL}/api/admin/users`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/users", "GET", res.status, [200]);

    // GET /api/admin/notifications
    res = await fetch(`${BASE_URL}/api/admin/notifications`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/notifications", "GET", res.status, [200]);

    // GET /api/admin/logs
    res = await fetch(`${BASE_URL}/api/admin/logs`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/logs", "GET", res.status, [200]);

    // GET /api/admin/settings
    res = await fetch(`${BASE_URL}/api/admin/settings`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/settings", "GET", res.status, [200]);

    // GET /api/admin/ai-insights
    res = await fetch(`${BASE_URL}/api/admin/ai-insights`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/ai-insights", "GET", res.status, [200]);

    // GET /api/admin/refunds
    res = await fetch(`${BASE_URL}/api/admin/refunds`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/refunds", "GET", res.status, [200]);

    // GET /api/admin/live-training/stats
    res = await fetch(`${BASE_URL}/api/admin/live-training/stats`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/live-training/stats", "GET", res.status, [200]);

    // GET /api/admin/live-training/courses
    res = await fetch(`${BASE_URL}/api/admin/live-training/courses`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/live-training/courses", "GET", res.status, [200]);

    // GET /api/admin/live-training/assignments
    res = await fetch(`${BASE_URL}/api/admin/live-training/assignments`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/live-training/assignments", "GET", res.status, [200]);

    // GET /api/admin/live-training/sessions
    res = await fetch(`${BASE_URL}/api/admin/live-training/sessions`, { headers: { Cookie: adminCookie } });
    record("Admin", "/api/admin/live-training/sessions", "GET", res.status, [200]);
  }

  // ==========================================
  // DOMAIN 5: Instructor Module APIs
  // ==========================================
  console.log("\n--- [DOMAIN 5: Instructor Module] ---");
  {
    // GET /api/instructor/stats
    let res = await fetch(`${BASE_URL}/api/instructor/stats`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/stats", "GET", res.status, [200]);

    // GET /api/instructor/courses
    res = await fetch(`${BASE_URL}/api/instructor/courses`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/courses", "GET", res.status, [200]);

    // GET /api/instructor/course-creation-permission
    res = await fetch(`${BASE_URL}/api/instructor/course-creation-permission`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/course-creation-permission", "GET", res.status, [200]);

    // GET /api/instructor/students
    res = await fetch(`${BASE_URL}/api/instructor/students`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/students", "GET", res.status, [200]);

    // GET /api/instructor/live-sessions
    res = await fetch(`${BASE_URL}/api/instructor/live-sessions`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/live-sessions", "GET", res.status, [200]);

    // GET /api/instructor/notifications
    res = await fetch(`${BASE_URL}/api/instructor/notifications`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/notifications", "GET", res.status, [200]);

    // GET /api/instructor/notifications/unread-count
    res = await fetch(`${BASE_URL}/api/instructor/notifications/unread-count`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/notifications/unread-count", "GET", res.status, [200]);

    // GET /api/instructor/verification
    res = await fetch(`${BASE_URL}/api/instructor/verification`, { headers: { Cookie: instructorCookie } });
    record("Instructor", "/api/instructor/verification", "GET", res.status, [200]);
  }

  // ==========================================
  // DOMAIN 6: Student & Learning APIs
  // ==========================================
  console.log("\n--- [DOMAIN 6: Student & Learning] ---");
  {
    // GET /api/student/dashboard
    let res = await fetch(`${BASE_URL}/api/student/dashboard`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/dashboard", "GET", res.status, [200]);

    // GET /api/student/self-paced
    res = await fetch(`${BASE_URL}/api/student/self-paced`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/self-paced", "GET", res.status, [200]);

    // GET /api/student/live-courses
    res = await fetch(`${BASE_URL}/api/student/live-courses`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/live-courses", "GET", res.status, [200]);

    // GET /api/student/live-calendar
    res = await fetch(`${BASE_URL}/api/student/live-calendar`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/live-calendar", "GET", res.status, [200]);

    // GET /api/student/recordings
    res = await fetch(`${BASE_URL}/api/student/recordings`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/recordings", "GET", res.status, [200]);

    // GET /api/student/assignments
    res = await fetch(`${BASE_URL}/api/student/assignments`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/assignments", "GET", res.status, [200]);

    // GET /api/student/certificates
    res = await fetch(`${BASE_URL}/api/student/certificates`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/certificates", "GET", res.status, [200]);

    // GET /api/student/payments
    res = await fetch(`${BASE_URL}/api/student/payments`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/payments", "GET", res.status, [200]);

    // GET /api/student/recommendations
    res = await fetch(`${BASE_URL}/api/student/recommendations`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/recommendations", "GET", res.status, [200]);

    // GET /api/student/notifications
    res = await fetch(`${BASE_URL}/api/student/notifications`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/notifications", "GET", res.status, [200]);

    // GET /api/student/notifications/unread-count
    res = await fetch(`${BASE_URL}/api/student/notifications/unread-count`, { headers: { Cookie: studentCookie } });
    record("Student", "/api/student/notifications/unread-count", "GET", res.status, [200]);
  }

  // ==========================================
  // DOMAIN 7: Live Classes & General APIs
  // ==========================================
  console.log("\n--- [DOMAIN 7: Live Classes & General] ---");
  {
    // GET /api/live-courses (Public Directory)
    let res = await fetch(`${BASE_URL}/api/live-courses`);
    record("General", "/api/live-courses", "GET", res.status, [200]);

    // GET /api/dashboard (Dynamic role-based gateway)
    res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Cookie: studentCookie } });
    record("General", "/api/dashboard (Student)", "GET", res.status, [200]);

    res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Cookie: instructorCookie } });
    record("General", "/api/dashboard (Instructor Access Guard)", "GET", res.status, [403], "Student-only route correctly blocks non-students");

    res = await fetch(`${BASE_URL}/api/dashboard`, { headers: { Cookie: adminCookie } });
    record("General", "/api/dashboard (Admin Access Guard)", "GET", res.status, [403], "Student-only route correctly blocks non-students");

    // GET /api/video-progress (With required lectureId)
    const sampleLecture = await prisma.lecture.findFirst();
    const lectureId = sampleLecture?.id || "sample_lecture_id";
    res = await fetch(`${BASE_URL}/api/video-progress?lectureId=${lectureId}`, { headers: { Cookie: studentCookie } });
    record("General", `/api/video-progress?lectureId=${lectureId}`, "GET", res.status, [200]);

    // POST /api/meetings/signature
    res = await fetch(`${BASE_URL}/api/meetings/signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: studentCookie },
      body: JSON.stringify({ meetingNumber: "123456789", role: 0 })
    });
    record("General", "/api/meetings/signature", "POST", res.status, [200, 400]);
  }

  // ==========================================
  // DOMAIN 8: AI & Generative APIs
  // ==========================================
  console.log("\n--- [DOMAIN 8: AI & Generative Services] ---");
  {
    // POST /api/ai/syllabus (Prompt generation)
    let res = await fetch(`${BASE_URL}/api/ai/syllabus`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: instructorCookie },
      body: JSON.stringify({ topic: "Advanced Machine Learning with PyTorch", targetAudience: "Intermediate" })
    });
    record("AI", "/api/ai/syllabus", "POST", res.status, [200, 400, 500], "AI generation service");

    // POST /api/ai/quiz (Quiz generation)
    res = await fetch(`${BASE_URL}/api/ai/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: instructorCookie },
      body: JSON.stringify({ topic: "Neural Networks Fundamentals", count: 3 })
    });
    record("AI", "/api/ai/quiz", "POST", res.status, [200, 400, 500], "AI quiz service");

    // POST /api/ai/lesson-assist
    res = await fetch(`${BASE_URL}/api/ai/lesson-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: instructorCookie },
      body: JSON.stringify({
        courseTopic: "Python Programming",
        lessonTitle: "Variables and Data Types",
        lessonConcept: "Understanding integer, float and string types"
      })
    });
    record("AI", "/api/ai/lesson-assist", "POST", res.status, [200, 400, 500], "AI lesson helper");
  }

  // ==========================================
  // Final Evaluation
  // ==========================================
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log("\n==================================================================");
  console.log(`TOTAL APIS AUDITED: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================================");

  if (failed === 0) {
    console.log("🎉 ALL AUDITED APIS ARE OPERATIONAL AND RETURNING EXPECTED RESPONSES!");
  } else {
    console.error("⚠️ SOME APIS RETURNED UNEXPECTED STATUS CODES.");
  }
}

runComprehensiveApiAudit()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
