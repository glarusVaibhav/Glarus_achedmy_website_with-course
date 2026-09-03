import prisma from "../../../lib/db";
import { notificationService } from "../notificationService";
import { DOMAIN_EVENT_TYPES } from "../events";

async function runTests() {
  console.log("=================================================");
  console.log("🔔 RUNNING NOTIFICATION SYSTEM VERIFICATION SUITE");
  console.log("=================================================\n");

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      testPassed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (detail) console.error("   Details:", detail);
      testFailed++;
    }
  }

  try {
    // 0. Setup Test Users
    let instructorA = await prisma.user.findFirst({
      where: { role: "INSTRUCTOR" },
    });
    if (!instructorA) {
      instructorA = await prisma.user.create({
        data: {
          name: "Test Instructor Alpha",
          email: `test_inst_alpha_${Date.now()}@glarus.ai`,
          role: "INSTRUCTOR",
        },
      });
    }

    let instructorB = await prisma.user.findFirst({
      where: { email: { not: instructorA.email }, role: "INSTRUCTOR" },
    });
    if (!instructorB) {
      instructorB = await prisma.user.create({
        data: {
          name: "Test Instructor Beta",
          email: `test_inst_beta_${Date.now()}@glarus.ai`,
          role: "INSTRUCTOR",
        },
      });
    }

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    console.log(`Using Test Users:`);
    console.log(` - Instructor A: ${instructorA.name} (${instructorA.id})`);
    console.log(` - Instructor B: ${instructorB.name} (${instructorB.id})`);
    console.log(` - Admin: ${admin?.name || "System Admin"} (${admin?.id})\n`);

    // Clean any prior test notifications for Instructor A
    await prisma.notification.deleteMany({
      where: { recipientId: instructorA.id },
    });

    // ── TEST 1: Task Assigned Event ──
    console.log("--- TEST 1: Task Assigned Event ---");
    const taskCount = await notificationService.processDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.TASK_ASSIGNED,
      actorId: admin?.id || null,
      timestamp: new Date(),
      payload: {
        taskId: `task-${Date.now()}`,
        taskTitle: "Build Agentic AI Curriculum",
        priority: "High",
        deadline: "2026-09-15",
        instructorId: instructorA.id,
        description: "Admin assigned you a new course creation task.",
      },
    });

    assert(taskCount === 1, "processDomainEvent generated 1 notification for TASK_ASSIGNED");

    const instANotifs = await notificationService.getNotifications({
      recipientId: instructorA.id,
    });
    const taskNotif = instANotifs.notifications.find((n) => n.category === "TASK");
    assert(!!taskNotif, "Notification found with category TASK");
    assert(taskNotif?.priority === "HIGH", "Notification has correct HIGH priority");
    assert(taskNotif?.actionUrl === "/instructor/tasks", "Notification has correct actionUrl (/instructor/tasks)");

    // ── TEST 2: Course Approved Event ──
    console.log("\n--- TEST 2: Course Approved Event ---");
    const courseCount = await notificationService.processDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.COURSE_APPROVED,
      actorId: admin?.id || null,
      timestamp: new Date(),
      payload: {
        courseId: `course-ai-${Date.now()}`,
        courseTitle: "Mastering LangGraph & ReAct Agents",
        instructorId: instructorA.id,
        isPublished: true,
        feedback: "Excellent quality standards met.",
      },
    });

    assert(courseCount === 1, "processDomainEvent generated 1 notification for COURSE_APPROVED");
    const updatedNotifs = await notificationService.getNotifications({
      recipientId: instructorA.id,
    });
    const courseNotif = updatedNotifs.notifications.find((n) => n.category === "COURSE");
    assert(!!courseNotif, "Notification found with category COURSE");
    assert(Boolean(courseNotif?.title.includes("Live")), "Course notification reflects publication status in title");

    // ── TEST 3: Idempotency & Duplicate Prevention ──
    console.log("\n--- TEST 3: Idempotency & Duplicate Prevention ---");
    const fixedDedupKey = `DEDUP_TEST_${Date.now()}`;
    const firstInsert = await notificationService.createNotification({
      recipientId: instructorA.id,
      category: "SYSTEM",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "NORMAL",
      title: "Platform Maintenance",
      message: "Scheduled maintenance notice",
      deduplicationKey: fixedDedupKey,
    });

    assert(!!firstInsert, "First notification created successfully with deduplicationKey");

    const secondInsert = await notificationService.createNotification({
      recipientId: instructorA.id,
      category: "SYSTEM",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "NORMAL",
      title: "Platform Maintenance",
      message: "Scheduled maintenance notice (duplicate)",
      deduplicationKey: fixedDedupKey,
    });

    assert(secondInsert?.id === firstInsert?.id, "Second insertion with duplicate key returned existing record (Idempotent)");

    // ── TEST 4: Security & IDOR Isolation ──
    console.log("\n--- TEST 4: Security & IDOR Isolation ---");
    // Create a notification for Instructor B
    const notifB = await notificationService.createNotification({
      recipientId: instructorB.id,
      category: "PAYMENT",
      type: "PAYOUT_COMPLETED",
      priority: "NORMAL",
      title: "Confidential Payout Notice",
      message: "₹50,000 credited to Instructor B account.",
    });

    // Instructor A tries to read Instructor B's notification
    const idorAttempt = await notificationService.getNotificationById(instructorA.id, notifB.id);
    assert(idorAttempt === null, "Instructor A cannot fetch Instructor B notification (Anti-IDOR verified)");

    // Instructor A tries to mark Instructor B's notification as read
    const idorMarkRead = await notificationService.markAsRead(instructorA.id, notifB.id);
    assert(idorMarkRead === false, "Instructor A cannot mark Instructor B notification as read");

    // Instructor B can access their own notification
    const ownerAccess = await notificationService.getNotificationById(instructorB.id, notifB.id);
    assert(ownerAccess?.id === notifB.id, "Instructor B successfully accesses their own notification");

    // ── TEST 5: Read State & Unread Counts ──
    console.log("\n--- TEST 5: Read State & Unread Counts ---");
    const initialUnread = await notificationService.getUnreadCount(instructorA.id);
    assert(initialUnread > 0, `Instructor A initial unread count is positive (${initialUnread})`);

    // Mark single notification as read
    if (taskNotif) {
      await notificationService.markAsRead(instructorA.id, taskNotif.id);
      const readItem = await notificationService.getNotificationById(instructorA.id, taskNotif.id);
      assert(readItem?.isRead === true, "Single notification marked as read");
      assert(!!readItem?.readAt, "Single notification has readAt timestamp");
    }

    // Mark all as read in single query
    const markedCount = await notificationService.markAllAsRead(instructorA.id);
    const finalUnread = await notificationService.getUnreadCount(instructorA.id);
    assert(finalUnread === 0, "markAllAsRead sets unreadCount to 0");
    console.log(`   Bulk marked ${markedCount} notifications as read.`);

    // ── TEST 6: Pagination & Filters ──
    console.log("\n--- TEST 6: Pagination & Filters ---");
    const paginatedRes = await notificationService.getNotifications({
      recipientId: instructorA.id,
      page: 1,
      limit: 2,
    });
    assert(paginatedRes.notifications.length <= 2, "Pagination respects limit (max 2 items)");
    assert(typeof paginatedRes.total === "number", "Pagination returns total count");
    assert(typeof paginatedRes.totalPages === "number", "Pagination returns totalPages");

    // ── TEST 7: Live Session Reminder Threshold Evaluation ──
    console.log("\n--- TEST 7: Live Session Reminder ---");
    const reminderCount = await notificationService.processDomainEvent({
      eventType: DOMAIN_EVENT_TYPES.LIVE_SESSION_REMINDER,
      actorId: null,
      timestamp: new Date(),
      payload: {
        sessionId: `sess-remind-${Date.now()}`,
        sessionTitle: "Transformer Attention Walkthrough",
        liveCourseId: "live-genai",
        liveCourseTitle: "Generative AI Cohort",
        instructorId: instructorA.id,
        startsInMinutes: 20,
        meetingUrl: "https://meet.google.com/abc-defg-hij",
      },
    });

    assert(reminderCount === 1, "Live session reminder generated successfully");
    const reminderNotifs = await notificationService.getNotifications({
      recipientId: instructorA.id,
      category: "REMINDER",
    });
    assert(reminderNotifs.notifications.length > 0, "Reminder notification fetched under category REMINDER");

    console.log("\n=================================================");
    console.log(`🏁 TEST SUMMARY: ${testPassed} Passed, ${testFailed} Failed`);
    console.log("=================================================");

    if (testFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
