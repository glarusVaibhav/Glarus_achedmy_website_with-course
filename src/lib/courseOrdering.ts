import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CourseOrderItem {
  id: string;
  displayOrder: number;
  title?: string;
}

/**
 * Normalizes displayOrder across all published self-paced courses.
 * Rules:
 * - Published courses receive sequential contiguous positive integers starting at 1.
 * - Non-published courses receive displayOrder = null.
 * - Atomic transaction ensures consistency.
 */
export async function normalizePublishedCourseOrder(
  dbClient: Prisma.TransactionClient | typeof prisma = prisma
): Promise<CourseOrderItem[]> {
  // 1. Fetch all published self-paced courses
  const publishedCourses = await dbClient.course.findMany({
    where: {
      isPublished: true,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      displayOrder: true,
      publishedAt: true,
      createdAt: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { publishedAt: "asc" },
      { createdAt: "asc" },
    ],
  });

  // Separate courses that already have a valid positive displayOrder vs those needing assignment
  const withOrder = publishedCourses.filter(
    (c) => typeof c.displayOrder === "number" && c.displayOrder > 0
  );
  const withoutOrder = publishedCourses.filter(
    (c) => typeof c.displayOrder !== "number" || c.displayOrder <= 0
  );

  // Sort withOrder by displayOrder asc, then tie-break on createdAt
  withOrder.sort((a, b) => (a.displayOrder as number) - (b.displayOrder as number));

  // Combine: already ordered first, then append un-ordered
  const combined = [...withOrder, ...withoutOrder];

  const normalizedResults: CourseOrderItem[] = [];

  // Update in batch/transaction
  for (let i = 0; i < combined.length; i++) {
    const targetOrder = i + 1;
    const course = combined[i];

    if (course.displayOrder !== targetOrder) {
      await dbClient.course.update({
        where: { id: course.id },
        data: { displayOrder: targetOrder },
      });
    }

    normalizedResults.push({
      id: course.id,
      displayOrder: targetOrder,
      title: course.title,
    });
  }

  // Ensure non-published courses have displayOrder = null
  await dbClient.course.updateMany({
    where: {
      OR: [
        { isPublished: false },
        { status: { not: "PUBLISHED" } },
      ],
      displayOrder: { not: null },
    },
    data: {
      displayOrder: null,
    },
  });

  return normalizedResults;
}

/**
 * Reorders published courses based on a user-provided array of course IDs.
 * Performs true list insertion/reordering and assigns contiguous 1..N order.
 */
export async function reorderPublishedCourses(
  courseIds: string[]
): Promise<{ success: boolean; courses: CourseOrderItem[] }> {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    throw new Error("Course IDs array must be non-empty.");
  }

  // Check for duplicate IDs in request
  const uniqueIds = new Set(courseIds);
  if (uniqueIds.size !== courseIds.length) {
    throw new Error("Duplicate course IDs provided in reorder list.");
  }

  return await prisma.$transaction(async (tx) => {
    // Fetch all currently published courses
    const allPublished = await tx.course.findMany({
      where: {
        isPublished: true,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        displayOrder: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    const publishedMap = new Map(allPublished.map((c) => [c.id, c]));

    // Validate that every ID in the input exists and is currently published
    for (const id of courseIds) {
      if (!publishedMap.has(id)) {
        // Check if course exists at all to give precise error
        const existingAny = await tx.course.findUnique({
          where: { id },
          select: { id: true, title: true, isPublished: true, status: true },
        });

        if (!existingAny) {
          throw new Error(`Course with ID "${id}" does not exist.`);
        }

        if (!existingAny.isPublished || existingAny.status !== "PUBLISHED") {
          throw new Error(
            `Course "${existingAny.title}" is not published and cannot be ordered.`
          );
        }

        throw new Error(`Course with ID "${id}" is not an eligible published course.`);
      }
    }

    // Build the final complete ordered sequence:
    // 1. Specified courses in the requested order
    const finalOrderedIds: string[] = [...courseIds];

    // 2. Any published courses that weren't explicitly included (append deterministically)
    const remainingPublished = allPublished
      .filter((c) => !uniqueIds.has(c.id))
      .sort((a, b) => {
        if (a.displayOrder && b.displayOrder) return a.displayOrder - b.displayOrder;
        if (a.displayOrder) return -1;
        if (b.displayOrder) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    for (const rem of remainingPublished) {
      finalOrderedIds.push(rem.id);
    }

    // Assign sequential 1..N order
    const updatedCourses: CourseOrderItem[] = [];

    // Temporary offset to avoid any potential collision during concurrent updates
    // In PostgreSQL/Prisma, updating directly in sequence inside transaction is safe
    for (let index = 0; index < finalOrderedIds.length; index++) {
      const id = finalOrderedIds[index];
      const targetOrder = index + 1;
      const existing = publishedMap.get(id);

      await tx.course.update({
        where: { id },
        data: { displayOrder: targetOrder },
      });

      updatedCourses.push({
        id,
        displayOrder: targetOrder,
        title: existing?.title,
      });
    }

    // Ensure non-published courses have displayOrder = null
    await tx.course.updateMany({
      where: {
        OR: [
          { isPublished: false },
          { status: { not: "PUBLISHED" } },
        ],
        displayOrder: { not: null },
      },
      data: {
        displayOrder: null,
      },
    });

    return {
      success: true,
      courses: updatedCourses,
    };
  });
}

/**
 * Assigns the next available sequential displayOrder when a course is published.
 * Appends to the end of published courses.
 */
export async function assignNextPublishedCourseOrder(
  courseId: string,
  txOrPrisma: Prisma.TransactionClient | typeof prisma = prisma
): Promise<number> {
  // Find current max order among other published courses
  const maxRecord = await txOrPrisma.course.findFirst({
    where: {
      isPublished: true,
      status: "PUBLISHED",
      id: { not: courseId },
      displayOrder: { not: null },
    },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  const nextOrder = (maxRecord?.displayOrder || 0) + 1;

  await txOrPrisma.course.update({
    where: { id: courseId },
    data: {
      displayOrder: nextOrder,
    },
  });

  return nextOrder;
}

/**
 * Removes a course from the published ordering when unpublished and shifts
 * remaining courses sequentially to prevent gaps.
 */
export async function removeCourseFromPublishedOrder(
  courseId: string,
  txOrPrisma: Prisma.TransactionClient | typeof prisma = prisma
): Promise<void> {
  // 1. Clear displayOrder for this course
  await txOrPrisma.course.update({
    where: { id: courseId },
    data: {
      displayOrder: null,
    },
  });

  // 2. Normalize all remaining published courses
  await normalizePublishedCourseOrder(txOrPrisma);
}
