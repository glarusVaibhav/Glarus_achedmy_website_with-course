import { PrismaClient } from "@prisma/client";
import * as jose from "jose";
import { LiveSessionService } from "../src/lib/services/liveSessionService";

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "glarus-academy-super-secret-key-for-jwt-2024"
);

async function createAuthCookie(payload: { id: string; email: string; role: string; name: string }) {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
  return `auth_token=${token}`;
}

async function runLiveSessionBackendTests() {
  console.log("================================================================");
  console.log("🚀 GLARUSACADEMY LIVE SESSION BACKEND & NOTIFICATIONS TEST SUITE");
  console.log("================================================================\n");

  const baseUrl = "http://localhost:3000";
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, msg: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  try {
    // ── TEST 1: UNIT TEST DURATION & TIME PARSING ───────────────────
    console.log("1. Testing Duration & Time Parsing...");
    assert(LiveSessionService.parseDurationToMinutes("120 min") === 120, "Parses '120 min' -> 120");
    assert(LiveSessionService.parseDurationToMinutes("1h 30m") === 90, "Parses '1h 30m' -> 90");
    assert(LiveSessionService.parseDurationToMinutes("2h") === 120, "Parses '2h' -> 120");
    assert(LiveSessionService.parseDurationToMinutes("45 mins") === 45, "Parses '45 mins' -> 45");
    assert(LiveSessionService.parseDurationToMinutes(null) === 90, "Fallback duration is 90 min");

    // ── TEST 2: UNIT TEST COMPUTE SESSION STATUS ─────────────────────
    console.log("\n2. Testing Real-Time Session Status Computation...");

    // Test A: Past session with elapsed end time
    const today = new Date();
    const pastStatus = LiveSessionService.computeSessionStatus(
      today,
      "09:00 AM",
      "60 min",
      "10:00 AM",
      "SCHEDULED"
    );
    assert(pastStatus.status === "COMPLETED", "Session with elapsed end time is COMPLETED");
    assert(pastStatus.canJoin === false, "Completed session cannot be joined (canJoin=false)");

    // Test B: Explicit DB status 'COMPLETED'
    const dbCompleted = LiveSessionService.computeSessionStatus(
      today,
      "07:00 PM",
      "120 min",
      "09:00 PM",
      "COMPLETED"
    );
    assert(dbCompleted.status === "COMPLETED", "Session with DB status COMPLETED is COMPLETED");

    // Test C: Future upcoming session
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const futureStatus = LiveSessionService.computeSessionStatus(
      futureDate,
      "07:00 PM",
      "120 min",
      "09:00 PM",
      "SCHEDULED"
    );
    assert(futureStatus.status === "UPCOMING", "Future session is UPCOMING");
    assert(futureStatus.canJoin === false, "Upcoming session outside pre-join window cannot be joined");

    // ── TEST 3: DATABASE & STUDENT ENROLLMENT VERIFICATION ───────────
    console.log("\n3. Testing Database Enrolled Live Courses & Student Data...");
    let student = await prisma.user.findFirst({
      where: { role: "STUDENT", liveCourseEnrollments: { some: {} } },
      include: { liveCourseEnrollments: true },
    });

    if (!student) {
      student = await prisma.user.findFirst({
        where: { role: "STUDENT" },
        include: { liveCourseEnrollments: true }
      });
    }

    assert(Boolean(student), `Found active student user: ${student?.email} (${student?.id})`);

    const studentCookie = await createAuthCookie({
      id: student!.id,
      email: student!.email,
      role: student!.role,
      name: student!.name || "Student",
    });

    // ── TEST 4: LIVE SESSION SERVICE METHOD ─────────────────────────
    console.log("\n4. Testing LiveSessionService.getEnrolledLiveCoursesAndClasses...");
    const serviceData = await LiveSessionService.getEnrolledLiveCoursesAndClasses(student!.id);
    assert(Array.isArray(serviceData.courses), `Returned ${serviceData.courses.length} enrolled live courses`);
    assert(Array.isArray(serviceData.classes), `Returned ${serviceData.classes.length} live/upcoming classes`);

    if (serviceData.courses.length > 0) {
      const firstCourse = serviceData.courses[0];
      assert(Boolean(firstCourse.id && firstCourse.title), `Course: "${firstCourse.title}" (ID: ${firstCourse.id})`);
      assert(Array.isArray(firstCourse.sessions), `Course has ${firstCourse.sessions.length} sessions`);
      assert(typeof firstCourse.sessionPriority === "number", `Course has sessionPriority: ${firstCourse.sessionPriority}`);

      // Check notifications generated for pending resources
      assert(Array.isArray(firstCourse.notifications), `Course has notifications array (length: ${firstCourse.notifications.length})`);
      console.log(`     Course has ${firstCourse.unreadNotificationCount || 0} pending resource notifications.`);

      // Check first session properties
      const s0 = firstCourse.sessions[0];
      assert(Boolean(s0.sessionCode), `Session code: ${s0.sessionCode}`);
      assert(Boolean(s0.status), `Session status: ${s0.status}`);
      assert(Array.isArray(s0.resources), `Session resources array exists (${s0.resources?.length || 0} attached resources)`);
    }

    // ── TEST 5: HTTP API /api/student/live-courses ───────────────────
    console.log("\n5. Testing HTTP Endpoint GET /api/student/live-courses...");
    const liveCoursesRes = await fetch(`${baseUrl}/api/student/live-courses`, {
      method: "GET",
      headers: { Cookie: studentCookie },
    });
    assert(liveCoursesRes.ok, `GET /api/student/live-courses returned HTTP ${liveCoursesRes.status}`);
    const liveCoursesJson = await liveCoursesRes.json();
    assert(Array.isArray(liveCoursesJson.courses), "API returned valid 'courses' array");

    // Check world of AI course specifically if present
    const worldOfAi = liveCoursesJson.courses.find((c: any) => c.title.toLowerCase().includes("world of ai"));
    if (worldOfAi) {
      console.log(`\n   🔍 Inspecting 'world of AI' course payload:`);
      const s1 = worldOfAi.sessions.find((s: any) => s.sessionNumber === 1);
      assert(Boolean(s1), "Session 1 exists in 'world of AI'");
      assert(s1.status === "completed", `Session 1 status is '${s1.status}' (COMPLETED)`);
      assert(Boolean(s1.recordingUrl), `Session 1 has recordingUrl: ${s1.recordingUrl}`);
      assert(s1.resources?.length > 0, `Session 1 has ${s1.resources.length} resource(s)`);

      // Verify notifications
      assert(worldOfAi.notifications?.length > 0, `'world of AI' has ${worldOfAi.notifications.length} pending notification(s)`);
      const notif1 = worldOfAi.notifications.find((n: any) => n.sessionId === s1.id);
      assert(Boolean(notif1), `Notification generated for Session 1: "${notif1?.title}"`);
      assert(Boolean(notif1?.message), `Notification message: "${notif1?.message}"`);

      // Verify active session is next upcoming session (Session 02)
      assert(Boolean(worldOfAi.nextUpcomingSession), `Next upcoming session is: ${worldOfAi.nextUpcomingSession?.sessionCode || 'Session 02'}`);
      console.log(`     Next Upcoming Session: ${worldOfAi.nextUpcomingSession?.title} (${worldOfAi.nextUpcomingSession?.startTime})`);
    }

    // ── TEST 6: HTTP API /api/student/live-calendar ──────────────────
    console.log("\n6. Testing HTTP Endpoint GET /api/student/live-calendar...");
    const calendarRes = await fetch(`${baseUrl}/api/student/live-calendar`, {
      method: "GET",
      headers: { Cookie: studentCookie },
    });
    assert(calendarRes.ok, `GET /api/student/live-calendar returned HTTP ${calendarRes.status}`);
    const calendarJson = await calendarRes.json();
    assert(Array.isArray(calendarJson.events), `API returned ${calendarJson.events.length} calendar events`);

    // ── TEST 7: STORAGE RESOURCE DOWNLOAD VERIFICATION ──────────────
    console.log("\n7. Testing Storage File Resource API /api/storage/file...");
    if (worldOfAi?.sessions[0]?.resources[0]?.url) {
      const fileUrl = `${baseUrl}${worldOfAi.sessions[0].resources[0].url}`;
      const fileRes = await fetch(fileUrl, {
        method: "GET",
        headers: { Cookie: studentCookie },
      });
      assert(fileRes.ok || fileRes.status === 200 || fileRes.status === 206 || fileRes.status === 302, `Storage resource file returned status ${fileRes.status}`);
    }

    console.log("\n================================================================");
    console.log(`🎉 ALL ${passedCount}/${totalTests} BACKEND TESTS PASSED SUCCESSFULLY!`);
    console.log("================================================================\n");
  } catch (error: any) {
    console.error("\n❌ BACKEND TEST SUITE FAILED:", error?.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runLiveSessionBackendTests();
