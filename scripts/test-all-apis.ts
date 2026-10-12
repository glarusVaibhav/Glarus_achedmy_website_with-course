import { PrismaClient } from "@prisma/client";
import * as jose from "jose";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "glarus-academy-super-secret-key-for-jwt-2024"
);

async function createToken(payload: { id: string; email: string; role: string; name: string }) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

interface TestResult {
  endpoint: string;
  method: string;
  role: string;
  status: number;
  expectedStatus: number[];
  success: boolean;
  message?: string;
  durationMs: number;
}

async function runTest(
  endpoint: string,
  method: string = "GET",
  token?: string,
  body?: any,
  expectedStatus: number[] = [200],
  role: string = "PUBLIC"
): Promise<TestResult> {
  const start = Date.now();
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Cookie"] = `auth_token=${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const durationMs = Date.now() - start;

    let resBody: any = null;
    const text = await res.text();
    try {
      resBody = JSON.parse(text);
    } catch {
      resBody = text.slice(0, 150);
    }

    const success = expectedStatus.includes(res.status);
    return {
      endpoint,
      method,
      role,
      status: res.status,
      expectedStatus,
      success,
      message: success
        ? typeof resBody === "object"
          ? `OK (${Array.isArray(resBody) ? `${resBody.length} items` : Object.keys(resBody).join(",")})`
          : "OK"
        : `Error ${res.status}: ${typeof resBody === "object" ? JSON.stringify(resBody) : resBody}`,
      durationMs,
    };
  } catch (err: any) {
    return {
      endpoint,
      method,
      role,
      status: 0,
      expectedStatus,
      success: false,
      message: `Fetch failed: ${err.message}`,
      durationMs: Date.now() - start,
    };
  }
}

async function main() {
  console.log("==================================================");
  console.log("  Glarus Academy - Complete API Verification Suite");
  console.log("==================================================\n");

  // 1. Fetch Users for Roles
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const instructorUser = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
  const studentUser = await prisma.user.findFirst({ where: { role: "STUDENT" } });

  console.log("Test Accounts Initialized from Database:");
  console.log(`- Admin: ${adminUser ? `${adminUser.email} (${adminUser.id})` : "None found"}`);
  console.log(`- Instructor: ${instructorUser ? `${instructorUser.email} (${instructorUser.id})` : "None found"}`);
  console.log(`- Student: ${studentUser ? `${studentUser.email} (${studentUser.id})` : "None found"}\n`);

  const adminToken = await createToken({
    id: adminUser?.id || "mock-admin-id",
    email: adminUser?.email || "admin@gmail.com",
    role: "ADMIN",
    name: adminUser?.name || "System Admin",
  });

  const instructorToken = await createToken({
    id: instructorUser?.id || "mock-inst-id",
    email: instructorUser?.email || "piyushdhoke11@gmail.com",
    role: "INSTRUCTOR",
    name: instructorUser?.name || "Lead Instructor",
  });

  const studentToken = await createToken({
    id: studentUser?.id || "mock-student-id",
    email: studentUser?.email || "arun.sharma@gmail.com",
    role: "STUDENT",
    name: studentUser?.name || "Active Student",
  });

  const sampleLiveCourse = await prisma.liveCourse.findFirst({
    include: { sessions: true },
  });

  const sampleCourse = await prisma.course.findFirst();

  const results: TestResult[] = [];

  // Group 1: Public & Auth Endpoints
  console.log("Testing Group 1: Public & Auth Endpoints...");
  results.push(await runTest("/api/courses", "GET", undefined, undefined, [200], "PUBLIC"));
  results.push(await runTest("/api/live-courses", "GET", undefined, undefined, [200], "PUBLIC"));
  results.push(await runTest("/api/auth/me", "GET", undefined, undefined, [200, 401], "PUBLIC"));
  results.push(await runTest("/api/auth/me", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/auth/me", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/auth/me", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/dashboard", "GET", studentToken, undefined, [200], "STUDENT"));

  // Group 2: Admin Endpoints
  console.log("Testing Group 2: Admin Operations & Governance Endpoints...");
  results.push(await runTest("/api/admin/overview", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/stats", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/ai-insights", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/analytics", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/live-training/courses", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/live-training/sessions", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/live-training/stats", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/live-training/assignments", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/instructors/permissions", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/users?role=INSTRUCTOR", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/students", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/courses", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/approvals/instructor", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/payments", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/refunds", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/notifications", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/logs", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/settings", "GET", adminToken, undefined, [200], "ADMIN"));
  results.push(await runTest("/api/admin/users", "GET", adminToken, undefined, [200], "ADMIN"));

  // Group 3: Instructor Endpoints
  console.log("Testing Group 3: Instructor Endpoints...");
  results.push(await runTest("/api/instructor/stats", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/courses", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/live-courses", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/live-sessions", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/assignments", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/notifications", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/notifications/unread-count", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/notifications/scheduler", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/students", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/course-creation-permission", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));
  results.push(await runTest("/api/instructor/verification", "GET", instructorToken, undefined, [200], "INSTRUCTOR"));

  // Group 4: Student Endpoints
  console.log("Testing Group 4: Student Dashboard & Learning Endpoints...");
  results.push(await runTest("/api/student/dashboard", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/live-courses", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/live-calendar", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/assignments", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/certificates", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/payments", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/recommendations", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/recordings", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/self-paced", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/notifications", "GET", studentToken, undefined, [200], "STUDENT"));
  results.push(await runTest("/api/student/notifications/unread-count", "GET", studentToken, undefined, [200], "STUDENT"));

  // Group 5: Dynamic Resource Endpoints
  console.log("Testing Group 5: Dynamic Resource Endpoints...");
  if (sampleLiveCourse) {
    results.push(await runTest(`/api/student/live-courses/${sampleLiveCourse.id}`, "GET", studentToken, undefined, [200], "STUDENT"));
    results.push(await runTest(`/api/admin/live-training/courses/${sampleLiveCourse.id}`, "GET", adminToken, undefined, [200], "ADMIN"));
    if (sampleLiveCourse.sessions && sampleLiveCourse.sessions.length > 0) {
      const sampleSession = sampleLiveCourse.sessions[0];
      results.push(await runTest(`/api/admin/live-training/sessions/${sampleSession.id}`, "GET", adminToken, undefined, [200], "ADMIN"));
    }
  }

  if (sampleCourse) {
    results.push(await runTest(`/api/courses/${sampleCourse.id}`, "GET", undefined, undefined, [200], "PUBLIC"));
  }

  // Group 6: AI Studio Assist Endpoints
  console.log("Testing Group 6: AI Generation & Assist Endpoints...");
  results.push(await runTest("/api/ai/live-course/overview-assist", "POST", instructorToken, {
    field: "learningOutcomes",
    title: "Mastering Agentic AI",
    category: "Generative AI",
    level: "Intermediate",
    currentValue: []
  }, [200], "INSTRUCTOR"));

  results.push(await runTest("/api/ai/live-course/session-assist", "POST", instructorToken, {
    action: "GENERATE_AGENDA",
    sessionTitle: "LangGraph State Machines & Graph Architecture",
    courseTitle: "Mastering Agentic AI",
    duration: "90 min"
  }, [200], "INSTRUCTOR"));

  results.push(await runTest("/api/ai/syllabus", "POST", instructorToken, {
    topic: "Production RAG Systems with Vector Databases"
  }, [200], "INSTRUCTOR"));

  results.push(await runTest("/api/ai/chat", "POST", studentToken, {
    message: "What is the difference between RAG and Fine-tuning?"
  }, [200], "STUDENT"));

  results.push(await runTest("/api/ai/quiz", "POST", instructorToken, {
    topic: "Transformer Attention Mechanisms",
    difficulty: "Intermediate",
    count: 3
  }, [200], "INSTRUCTOR"));

  console.log("\n==================================================");
  console.log("                TEST SUMMARY RESULTS              ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.success ? "✅ PASS" : "❌ FAIL";
    console.log(`${icon} [${r.status}] ${r.method.padEnd(4)} ${r.endpoint.padEnd(54)} (${r.role}) - ${r.durationMs}ms`);
    if (!r.success) {
      console.log(`    ↳ Details: ${r.message}`);
      failed++;
    } else {
      passed++;
    }
  }

  console.log("\n==================================================");
  console.log(`Total APIs Tested: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log("==================================================\n");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("Test runner error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
