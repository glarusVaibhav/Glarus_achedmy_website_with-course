import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("--- Testing Live Course Creation & Assignment to Instructor ---");

  // Find an admin and an instructor
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const instructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });

  if (!admin) {
    console.error("No admin user found");
    return;
  }
  if (!instructor) {
    console.error("No instructor user found");
    return;
  }

  console.log(`Using Admin: ${admin.name} (${admin.id})`);
  console.log(`Using Instructor: ${instructor.name} (${instructor.id})`);

  const mockPayload = {
    title: "Test AI Cohort Course",
    slug: "test-ai-cohort-course-" + Date.now(),
    shortDescription: "Master AI pipelines with hands-on labs",
    description: "Deep dive into production GenAI pipelines and agent swarms.",
    price: 19999,
    originalPrice: 29999,
    category: "Generative AI",
    level: "Intermediate",
    duration: "4 Live Sessions",
    startDate: new Date(),
    maxStudents: 50,
    status: "ASSIGNED",
    leadInstructorId: instructor.id,
    createdById: admin.id,
    meetingPlatform: "Zoom Enterprise",
    targetAudience: ["Senior Engineers", "AI Developers", "Technical Leads"], // Array test!
    prerequisites: ["Python", "Docker"],
    objectives: ["Build LangGraph agents", "Deploy to Kubernetes"],
    tags: ["GenerativeAI", "Agents"],
    sessions: [
      {
        sessionNumber: 1,
        title: "Session 1: Agentic Architectures",
        description: "Building autonomous stateful agents.",
        startTime: "07:00 PM",
        endTime: "09:00 PM",
        duration: "120 min",
        agenda: [
          { title: "Introduction", duration: "15 min", order: 1 },
          { title: "Core Architecture", duration: "45 min", order: 2 }
        ]
      }
    ]
  };

  const normalizedTargetAudience = Array.isArray(mockPayload.targetAudience)
    ? mockPayload.targetAudience.join(", ")
    : typeof mockPayload.targetAudience === "object" && mockPayload.targetAudience !== null
    ? JSON.stringify(mockPayload.targetAudience)
    : mockPayload.targetAudience || null;

  const course = await prisma.liveCourse.create({
    data: {
      title: mockPayload.title,
      slug: mockPayload.slug,
      shortDescription: mockPayload.shortDescription,
      description: mockPayload.description,
      price: mockPayload.price,
      originalPrice: mockPayload.originalPrice,
      category: mockPayload.category,
      level: mockPayload.level,
      duration: mockPayload.duration,
      startDate: mockPayload.startDate,
      maxStudents: mockPayload.maxStudents,
      status: mockPayload.status as any,
      leadInstructorId: mockPayload.leadInstructorId,
      createdById: mockPayload.createdById,
      meetingPlatform: mockPayload.meetingPlatform,
      targetAudience: normalizedTargetAudience,
      prerequisites: JSON.stringify(mockPayload.prerequisites),
      objectives: JSON.stringify(mockPayload.objectives),
      tags: JSON.stringify(mockPayload.tags),
      totalSessions: mockPayload.sessions.length,
      sessions: {
        create: mockPayload.sessions.map((s, idx) => ({
          sessionNumber: s.sessionNumber || idx + 1,
          title: s.title,
          description: s.description,
          startTime: s.startTime,
          endTime: s.endTime,
          duration: s.duration,
          status: "SCHEDULED" as any,
          agenda: {
            create: s.agenda.map((ag) => ({
              title: ag.title,
              duration: ag.duration,
              order: ag.order
            }))
          }
        }))
      }
    },
    include: {
      sessions: true,
      leadInstructor: { select: { id: true, name: true, email: true } }
    }
  });

  console.log(`✅ Live Course Created: ${course.id} (${course.title})`);
  console.log(`✅ Lead Instructor: ${course.leadInstructor?.name} (${course.leadInstructorId})`);
  console.log(`✅ Target Audience Normalized: "${course.targetAudience}"`);

  // Create course assignment and session assignment
  const assignment = await prisma.sessionAssignment.create({
    data: {
      liveCourseId: course.id,
      instructorId: instructor.id,
      canView: true,
      canEdit: true,
      canManageAttendance: true,
      canManageRecording: true,
      assignedBy: admin.name || "Admin"
    }
  });

  console.log(`✅ Course Assignment Record Created: ${assignment.id}`);

  // Cleanup test course
  await prisma.liveCourse.delete({ where: { id: course.id } });
  console.log(`✅ Test cleanup complete.`);
}

main()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
