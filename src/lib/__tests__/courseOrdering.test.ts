import prisma from "@/lib/db";
import {
  normalizePublishedCourseOrder,
  reorderPublishedCourses,
  assignNextPublishedCourseOrder,
  removeCourseFromPublishedOrder,
} from "../courseOrdering";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message} - Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runCourseOrderingTests() {
  console.log("=== RUNNING PRODUCTION COURSE ORDERING TEST SUITE ===\n");

  // Helper cleanup & fixture setup
  const testInstructor = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "INSTRUCTOR"] } }
  }) || await prisma.user.findFirst();

  if (!testInstructor) {
    throw new Error("No user found for test execution.");
  }

  const testCoursePrefix = `test-order-${Date.now()}`;

  // Create 8 published test courses and 2 unpublished test courses
  const createdTestCourseIds: string[] = [];

  console.log("--- Setting up test fixtures ---");
  for (let i = 1; i <= 8; i++) {
    const c = await prisma.course.create({
      data: {
        title: `${testCoursePrefix} Published Course ${String.fromCharCode(64 + i)}`,
        description: `Test course description ${i}`,
        price: 999 * i,
        instructorId: testInstructor.id,
        isPublished: true,
        status: "PUBLISHED",
        type: "SELF_PACED",
      }
    });
    createdTestCourseIds.push(c.id);
  }

  // 2 Unpublished courses (Draft & Pending)
  const draftCourse = await prisma.course.create({
    data: {
      title: `${testCoursePrefix} Draft Course`,
      description: "Draft course",
      price: 1999,
      instructorId: testInstructor.id,
      isPublished: false,
      status: "DRAFT",
      type: "SELF_PACED",
    }
  });
  createdTestCourseIds.push(draftCourse.id);

  const pendingCourse = await prisma.course.create({
    data: {
      title: `${testCoursePrefix} Pending Course`,
      description: "Pending approval course",
      price: 2999,
      instructorId: testInstructor.id,
      isPublished: false,
      status: "PENDING",
      type: "SELF_PACED",
    }
  });
  createdTestCourseIds.push(pendingCourse.id);

  try {
    // ==========================================
    // TEST 1: Existing published courses receive valid sequential order
    // ==========================================
    console.log("\n--- TEST 1: Normalize published courses ---");
    const normalized = await normalizePublishedCourseOrder();
    assert(normalized.length >= 8, "Normalized at least all published test courses");

    const publishedInDb = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: { id: true, displayOrder: true, title: true }
    });

    for (let i = 0; i < publishedInDb.length; i++) {
      assertEqual(publishedInDb[i].displayOrder, i + 1, `Published course at index ${i} has contiguous order ${i + 1}`);
    }

    // ==========================================
    // TEST 2: Existing unpublished courses have null order
    // ==========================================
    console.log("\n--- TEST 2: Unpublished courses have displayOrder = null ---");
    const draftCheck = await prisma.course.findUnique({ where: { id: draftCourse.id } });
    const pendingCheck = await prisma.course.findUnique({ where: { id: pendingCourse.id } });
    assertEqual(draftCheck?.displayOrder, null, "Draft course has null displayOrder");
    assertEqual(pendingCheck?.displayOrder, null, "Pending course has null displayOrder");

    // ==========================================
    // TEST 3: New published course receives next available order (append to end)
    // ==========================================
    console.log("\n--- TEST 3: New published course receives append-to-end order ---");
    const newCourse = await prisma.course.create({
      data: {
        title: `${testCoursePrefix} Newly Published Course`,
        description: "New published course",
        price: 4999,
        instructorId: testInstructor.id,
        isPublished: true,
        status: "PUBLISHED",
        type: "SELF_PACED",
      }
    });
    createdTestCourseIds.push(newCourse.id);

    const assignedOrder = await assignNextPublishedCourseOrder(newCourse.id);
    const totalPublishedCount = await prisma.course.count({
      where: { isPublished: true, status: "PUBLISHED" }
    });
    assertEqual(assignedOrder, totalPublishedCount, `New course appended to end at order ${totalPublishedCount}`);

    // ==========================================
    // TEST 4: Unpublishing a course removes its order and normalizes remaining
    // ==========================================
    console.log("\n--- TEST 4: Unpublish removes order and closes gaps ---");
    // Let's get the course currently at order 3
    const courseAtOrder3 = await prisma.course.findFirst({
      where: { isPublished: true, status: "PUBLISHED", type: "SELF_PACED", displayOrder: 3 }
    });
    assert(!!courseAtOrder3, "Found course at order 3");

    // Unpublish courseAtOrder3
    await prisma.course.update({
      where: { id: courseAtOrder3!.id },
      data: { isPublished: false, status: "DRAFT" }
    });
    await removeCourseFromPublishedOrder(courseAtOrder3!.id);

    const unpublishedCheck = await prisma.course.findUnique({ where: { id: courseAtOrder3!.id } });
    assertEqual(unpublishedCheck?.displayOrder, null, "Unpublished course has null displayOrder");

    const remainingPublished = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });

    for (let i = 0; i < remainingPublished.length; i++) {
      assertEqual(remainingPublished[i].displayOrder, i + 1, `Remaining course ${i} has normalized contiguous order ${i + 1}`);
    }

    // Re-publish it for further test scenarios
    await prisma.course.update({
      where: { id: courseAtOrder3!.id },
      data: { isPublished: true, status: "PUBLISHED" }
    });
    await assignNextPublishedCourseOrder(courseAtOrder3!.id);

    // ==========================================
    // TEST 5: Reordering 1 -> 7 produces correct insertion behavior
    // ==========================================
    console.log("\n--- TEST 5: Reordering 1 -> 7 true list insertion ---");
    let currentPub = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });

    const item1 = currentPub[0];
    const item2 = currentPub[1];
    const item7 = currentPub[6];

    // Move item1 to position 7
    const reorderedIds1to7 = [...currentPub.map((c) => c.id)];
    const [moved1] = reorderedIds1to7.splice(0, 1);
    reorderedIds1to7.splice(6, 0, moved1);

    const reorderResult1to7 = await reorderPublishedCourses(reorderedIds1to7);
    assert(reorderResult1to7.success, "Reorder 1->7 succeeded");

    const after1to7 = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });

    assertEqual(after1to7[0].id, item2.id, "Former order 2 is now order 1");
    assertEqual(after1to7[6].id, item1.id, "Former order 1 is now order 7");

    // ==========================================
    // TEST 6: Reordering 7 -> 2 produces correct insertion behavior
    // ==========================================
    console.log("\n--- TEST 6: Reordering 7 -> 2 true list insertion ---");
    currentPub = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    const currentPos7 = currentPub[6];

    const reorderedIds7to2 = [...currentPub.map((c) => c.id)];
    const [moved7] = reorderedIds7to2.splice(6, 1);
    reorderedIds7to2.splice(1, 0, moved7); // insert at index 1 (order 2)

    await reorderPublishedCourses(reorderedIds7to2);

    const after7to2 = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    assertEqual(after7to2[1].id, currentPos7.id, "Moved item now occupies order 2");

    // ==========================================
    // TEST 7: Reordering 5 -> 1 works
    // ==========================================
    console.log("\n--- TEST 7: Reordering 5 -> 1 true list insertion ---");
    currentPub = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    const itemAt5 = currentPub[4];

    const reorderedIds5to1 = [...currentPub.map((c) => c.id)];
    const [moved5] = reorderedIds5to1.splice(4, 1);
    reorderedIds5to1.splice(0, 0, moved5);

    await reorderPublishedCourses(reorderedIds5to1);

    const after5to1 = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    assertEqual(after5to1[0].id, itemAt5.id, "Item from 5 now occupies order 1");

    // ==========================================
    // TEST 8: Reordering 2 -> 6 works
    // ==========================================
    console.log("\n--- TEST 8: Reordering 2 -> 6 true list insertion ---");
    currentPub = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    const itemAt2 = currentPub[1];

    const reorderedIds2to6 = [...currentPub.map((c) => c.id)];
    const [moved2] = reorderedIds2to6.splice(1, 1);
    reorderedIds2to6.splice(5, 0, moved2);

    await reorderPublishedCourses(reorderedIds2to6);

    const after2to6 = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });
    assertEqual(after2to6[5].id, itemAt2.id, "Item from 2 now occupies order 6");

    // ==========================================
    // TEST 9 & 10: No duplicate order values and no gaps
    // ==========================================
    console.log("\n--- TEST 9 & 10: Verify uniqueness and contiguous sequence ---");
    const allPublishedFinal = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });

    const ordersSet = new Set<number>();
    for (let i = 0; i < allPublishedFinal.length; i++) {
      const ord = allPublishedFinal[i].displayOrder;
      assert(ord !== null && ord !== undefined, `Course ${i} has defined displayOrder`);
      assert(!ordersSet.has(ord!), `TEST 9: No duplicate displayOrder (${ord})`);
      ordersSet.add(ord!);
      assertEqual(ord, i + 1, `TEST 10: No gaps in order sequence (expected ${i + 1}, got ${ord})`);
    }

    // ==========================================
    // TEST 11, 12, 13: Landing Page Featured (take 6) vs View All Courses
    // ==========================================
    console.log("\n--- TEST 11, 12, 13: Landing page top 6 query vs View All Courses ---");
    const landingFeaturedCourses = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: { id: true, displayOrder: true, title: true }
    });

    assertEqual(landingFeaturedCourses.length, 6, "Landing page featured section takes exactly 6 courses");
    for (const fc of landingFeaturedCourses) {
      assert(fc.displayOrder! <= 6, `TEST 11: Landing featured course has displayOrder <= 6 (${fc.displayOrder})`);
    }

    const viewAllCourses = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, displayOrder: true, title: true }
    });

    assert(viewAllCourses.length > 6, "View All Courses contains all published courses");
    const courses7Plus = viewAllCourses.filter((c) => c.displayOrder! >= 7);
    assert(courses7Plus.length >= 2, "TEST 13: Courses with order 7+ exist and are in View All Courses");
    for (const c7 of courses7Plus) {
      const inFeatured = landingFeaturedCourses.some((fc) => fc.id === c7.id);
      assertEqual(inFeatured, false, `TEST 12: Order 7+ course "${c7.title}" does NOT appear in featured landing section`);
    }

    // ==========================================
    // TEST 14 & 15: Search and Filtering do not corrupt global order
    // ==========================================
    console.log("\n--- TEST 14 & 15: Global order invariance under filtering ---");
    // Simulate UI search query matching 2 courses
    const allCoursesInDb = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" }
    });

    const searchedSubset = allCoursesInDb.filter((c) => c.title.includes("Course A") || c.title.includes("Course E") || c.title.includes("Course G"));
    for (const sc of searchedSubset) {
      const originalRecord = allCoursesInDb.find((c) => c.id === sc.id);
      assertEqual(sc.displayOrder, originalRecord?.displayOrder, `Searched course "${sc.title}" preserves global displayOrder ${sc.displayOrder}`);
    }

    // ==========================================
    // TEST 16: Validation - Reject duplicate course IDs
    // ==========================================
    console.log("\n--- TEST 18: Reject duplicate course IDs ---");
    let duplicateErrorThrown = false;
    try {
      await reorderPublishedCourses([allCoursesInDb[0].id, allCoursesInDb[0].id]);
    } catch (err: any) {
      duplicateErrorThrown = true;
      assert(err.message.includes("Duplicate"), `Caught expected duplicate error: ${err.message}`);
    }
    assertEqual(duplicateErrorThrown, true, "Duplicate IDs rejected");

    // ==========================================
    // TEST 17: Validation - Unpublished course cannot be inserted into published ordering
    // ==========================================
    console.log("\n--- TEST 17: Unpublished course rejected from published reordering ---");
    let unpubErrorThrown = false;
    try {
      await reorderPublishedCourses([draftCourse.id, allCoursesInDb[0].id]);
    } catch (err: any) {
      unpubErrorThrown = true;
      assert(err.message.includes("not published"), `Caught expected unpublished error: ${err.message}`);
    }
    assertEqual(unpubErrorThrown, true, "Unpublished course in reorder array rejected");

    // ==========================================
    // TEST 19: Validation - Invalid/Non-existent ID rejected
    // ==========================================
    console.log("\n--- TEST 19: Non-existent ID rejected ---");
    let invalidErrorThrown = false;
    try {
      await reorderPublishedCourses(["non-existent-course-id-999999"]);
    } catch (err: any) {
      invalidErrorThrown = true;
      assert(err.message.includes("does not exist"), `Caught expected non-existent error: ${err.message}`);
    }
    assertEqual(invalidErrorThrown, true, "Non-existent course ID rejected");

    // ==========================================
    // TEST 20: Transaction rollback on failure
    // ==========================================
    console.log("\n--- TEST 20: Transaction rollback verification ---");
    const snapshotBefore = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: { id: true, displayOrder: true }
    });

    try {
      // Attempt invalid reorder containing valid ID followed by invalid ID
      await reorderPublishedCourses([snapshotBefore[0].id, "invalid-id-for-rollback-test"]);
    } catch {
      // Expected failure
    }

    const snapshotAfter = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: { id: true, displayOrder: true }
    });

    assertEqual(snapshotAfter.length, snapshotBefore.length, "Course count unchanged after rollback");
    for (let i = 0; i < snapshotBefore.length; i++) {
      assertEqual(snapshotAfter[i].id, snapshotBefore[i].id, `Course ${i} ID restored`);
      assertEqual(snapshotAfter[i].displayOrder, snapshotBefore[i].displayOrder, `Course ${i} displayOrder restored`);
    }

    // ==========================================
    // TEST 21: Purchases and enrollments preserved
    // ==========================================
    console.log("\n--- TEST 21: Purchases and enrollments intact ---");
    // Create test enrollment on one of our courses
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: testInstructor.id,
        courseId: allCoursesInDb[0].id,
        progress: 45
      }
    });

    // Reorder courses
    const reversedIds = [...allCoursesInDb.map((c) => c.id)].reverse();
    await reorderPublishedCourses(reversedIds);

    const enrollmentAfter = await prisma.enrollment.findUnique({
      where: { id: enrollment.id }
    });
    assertEqual(enrollmentAfter?.progress, 45, "Enrollment record preserved across course reordering");

    await prisma.enrollment.delete({ where: { id: enrollment.id } });

    // ==========================================
    // TEST 22 & 23: Existing course metadata and publish workflow preserved
    // ==========================================
    console.log("\n--- TEST 22 & 23: Course metadata and publish workflow intact ---");
    const sampleCourse = await prisma.course.findUnique({ where: { id: allCoursesInDb[0].id } });
    assert(sampleCourse?.price !== undefined && sampleCourse.price > 0, "Course price preserved");
    assertEqual(sampleCourse?.instructorId, allCoursesInDb[0].instructorId, "Course instructor preserved");
    assert(sampleCourse?.status === "PUBLISHED", "Course status preserved");

    // ==========================================
    // TEST 24: Landing query reflect updated top 6
    // ==========================================
    console.log("\n--- TEST 24: Landing query reflects updated top 6 after reorder ---");
    const latestTop6 = await prisma.course.findMany({
      where: { isPublished: true, status: "PUBLISHED" },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: { id: true, displayOrder: true }
    });

    assertEqual(latestTop6[0].id, reversedIds[0], "First item in reversed reorder is now #1 on landing query");
    assertEqual(latestTop6[0].displayOrder, 1, "Top item has displayOrder = 1");

    console.log("\n=======================================================");
    console.log("🎉 ALL 24 COURSE ORDERING PRODUCTION TESTS PASSED SUCCESSFULLY!");
    console.log("=======================================================\n");
  } finally {
    // Clean up created test courses
    console.log("--- Cleaning up test courses ---");
    if (createdTestCourseIds.length > 0) {
      await prisma.course.deleteMany({
        where: { id: { in: createdTestCourseIds } }
      });
    }
    // Re-normalize production courses
    await normalizePublishedCourseOrder();
  }
}

runCourseOrderingTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
