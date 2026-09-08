import { PrismaClient } from "@prisma/client";
import * as jose from "jose";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "glarus-academy-super-secret-key-for-jwt-2024"
);

async function createToken(payload: any) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

interface TestResult {
  group: string;
  endpoint: string;
  method: string;
  status: number;
  ok: boolean;
  notes: string;
}

async function runTests() {
  console.log("=================================================");
  console.log("       COMPREHENSIVE BACKEND API HEALTH CHECK     ");
  console.log("=================================================");

  const results: TestResult[] = [];

  // Find or pick users for auth tokens
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const studentUser = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  const instructorUser = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });

  const adminToken = adminUser ? await createToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role }) : "";
  const studentToken = studentUser ? await createToken({ id: studentUser.id, email: studentUser.email, role: studentUser.role }) : "";
  const instructorToken = instructorUser ? await createToken({ id: instructorUser.id, email: instructorUser.email, role: instructorUser.role }) : "";

  // Helper for requests
  async function testApi(
    group: string,
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
    body?: any,
    token?: string
  ) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Cookie"] = `auth_token=${token}; token=${token}; student_token=${token}; instructor_token=${token}`;
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      let responseText = "";
      try {
        const json = await res.json();
        responseText = JSON.stringify(json).slice(0, 80);
      } catch {
        responseText = await res.text().then(t => t.slice(0, 80)).catch(() => "");
      }

      const isOk = res.status >= 200 && res.status < 400;
      results.push({
        group,
        endpoint,
        method,
        status: res.status,
        ok: isOk,
        notes: isOk ? `Success: ${responseText}` : `Response: ${res.status} ${responseText}`
      });
    } catch (err: any) {
      results.push({
        group,
        endpoint,
        method,
        status: 0,
        ok: false,
        notes: `Network/Execution Error: ${err.message}`
      });
    }
  }

  // 1. PUBLIC & DISCOVERY APIS
  console.log("\n[1] Testing Public & Discovery APIs...");
  await testApi("Public", "/api/courses", "GET");
  await testApi("Public", "/api/live-courses", "GET");

  // 2. ADMIN STUDENT MANAGEMENT APIS
  console.log("\n[2] Testing Admin Student Management APIs...");
  await testApi("Admin Students", "/api/admin/students", "GET", undefined, adminToken);
  await testApi("Admin Students", "/api/admin/students/stu-1", "GET", undefined, adminToken);
  if (studentUser) {
    await testApi("Admin Students", `/api/admin/students/${studentUser.id}`, "GET", undefined, adminToken);
  }
  await testApi("Admin Students", "/api/admin/students/stu-1/message", "POST", { message: "Test diagnostic message" }, adminToken);
  await testApi("Admin Students", "/api/admin/students/stu-1/certificate", "POST", {}, adminToken);
  await testApi("Admin Students", "/api/admin/students/stu-5/status", "PATCH", { status: "Active" }, adminToken);
  await testApi("Admin Students", "/api/admin/students/stu-5/status", "PATCH", { status: "Blocked" }, adminToken);

  // 3. ADMIN GENERAL & DASHBOARD APIS
  console.log("\n[3] Testing Admin General & Management APIs...");
  await testApi("Admin General", "/api/admin/users", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/stats", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/courses", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/live-training/stats", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/live-training/courses", "GET", undefined, adminToken);
  if (instructorUser) {
    await testApi("Admin General", `/api/admin/instructors/${instructorUser.id}`, "GET", undefined, adminToken);
  }
  await testApi("Admin General", "/api/admin/analytics", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/approvals/instructor", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/ai-insights", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/logs", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/refunds", "GET", undefined, adminToken);
  await testApi("Admin General", "/api/admin/settings", "GET", undefined, adminToken);

  // 4. STUDENT PORTAL APIS
  console.log("\n[4] Testing Student Portal APIs...");
  await testApi("Student Portal", "/api/student/dashboard", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/assignments", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/certificates", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/payments", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/recommendations", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/live-calendar", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/live-courses", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/self-paced", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/notifications", "GET", undefined, studentToken);
  await testApi("Student Portal", "/api/student/notifications/unread-count", "GET", undefined, studentToken);

  // 5. INSTRUCTOR PORTAL APIS
  console.log("\n[5] Testing Instructor Portal APIs...");
  await testApi("Instructor Portal", "/api/instructor/stats", "GET", undefined, instructorToken);
  await testApi("Instructor Portal", "/api/instructor/students", "GET", undefined, instructorToken);
  await testApi("Instructor Portal", "/api/instructor/courses", "GET", undefined, instructorToken);
  await testApi("Instructor Portal", "/api/instructor/live-sessions", "GET", undefined, instructorToken);
  await testApi("Instructor Portal", "/api/instructor/notifications", "GET", undefined, instructorToken);

  // 6. AUTH APIS
  console.log("\n[6] Testing Auth & Session APIs...");
  await testApi("Auth", "/api/auth/me", "GET", undefined, studentToken);

  // PRINT SUMMARY TABLE
  console.log("\n=================================================");
  console.log("                TEST RESULTS SUMMARY              ");
  console.log("=================================================");
  console.table(
    results.map(r => ({
      Group: r.group,
      Method: r.method,
      Endpoint: r.endpoint,
      Status: r.status,
      Pass: r.ok ? "✅ PASS" : "❌ FAIL"
    }))
  );

  const passedCount = results.filter(r => r.ok).length;
  const failedCount = results.filter(r => !r.ok).length;
  console.log(`\nTOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);

  if (failedCount === 0) {
    console.log("\n🎉 ALL TESTED API ENDPOINTS ARE FULLY OPERATIONAL AND HEALTHY!");
  } else {
    console.log(`\n⚠️ ${failedCount} endpoint(s) returned non-200 responses.`);
  }

  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
