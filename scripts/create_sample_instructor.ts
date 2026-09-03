import bcrypt from "bcryptjs";
import prisma from "../src/lib/db";

async function main() {
  const email = "abc@gmail.com";
  const rawPassword = "abc";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const name = "abc";

  console.log(`Setting up sample instructor profile for ${email}...`);

  // Delete pending registrations if any
  await prisma.pendingRegistration.deleteMany({
    where: { email },
  }).catch(() => {});

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "INSTRUCTOR",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: "INSTRUCTOR",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`User created/updated with ID: ${user.id}`);

  // Upsert InstructorProfile
  const profile = await prisma.instructorProfile.upsert({
    where: { userId: user.id },
    update: {
      totalRevenue: 185000.0,
      rating: 4.9,
      totalStudents: 342,
    },
    create: {
      userId: user.id,
      totalRevenue: 185000.0,
      rating: 4.9,
      totalStudents: 342,
    },
  });
  console.log(`InstructorProfile linked: ${profile.id}`);

  // Upsert InstructorApproval
  const approval = await prisma.instructorApproval.upsert({
    where: { userId: user.id },
    update: {
      firstName: "Abc",
      lastName: "Instructor",
      email,
      phone: "+91 98765 43210",
      experience: "8+ Years Lead AI & Full-Stack Architect",
      teachingLanguages: "English, Hindi",
      skills: "Generative AI, LangGraph, Next.js, System Design, Python, React",
      opportunitySource: "Direct Application",
      areasOfExpertise: "Generative AI & LLM Systems, Advanced Full-Stack Architecture",
      aboutInstructor: "Principal AI Engineer and Instructor specializing in production-grade LLMs, autonomous agents, and cloud distributed systems.",
      courseTeachingPlan: "Comprehensive hands-on curriculum covering real-world architecture, agentic workflows, and production deployments.",
      whyGlarusAcademy: "To empower students with practical, industry-grade live coding sessions and production architectures.",
      status: "APPROVED",
      bio: "Lead AI & Full-Stack Architect with 8+ years of production experience.",
      feedback: "Verified and approved as premier instructor.",
      reviewedBy: "Academic Director",
      reviewedAt: new Date(),
    },
    create: {
      userId: user.id,
      firstName: "Abc",
      lastName: "Instructor",
      email,
      phone: "+91 98765 43210",
      experience: "8+ Years Lead AI & Full-Stack Architect",
      teachingLanguages: "English, Hindi",
      skills: "Generative AI, LangGraph, Next.js, System Design, Python, React",
      opportunitySource: "Direct Application",
      areasOfExpertise: "Generative AI & LLM Systems, Advanced Full-Stack Architecture",
      aboutInstructor: "Principal AI Engineer and Instructor specializing in production-grade LLMs, autonomous agents, and cloud distributed systems.",
      courseTeachingPlan: "Comprehensive hands-on curriculum covering real-world architecture, agentic workflows, and production deployments.",
      whyGlarusAcademy: "To empower students with practical, industry-grade live coding sessions and production deployments.",
      status: "APPROVED",
      bio: "Lead AI & Full-Stack Architect with 8+ years of production experience.",
      feedback: "Verified and approved as premier instructor.",
      reviewedBy: "Academic Director",
      reviewedAt: new Date(),
    },
  });
  console.log(`InstructorApproval created/updated: ${approval.id}`);

  console.log(`\n✅ Sample Instructor Account Successfully Ready!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${rawPassword}`);
  console.log(`Role: INSTRUCTOR`);
  console.log(`Status: APPROVED & VERIFIED`);
}

main()
  .catch((err) => {
    console.error("Error creating sample instructor:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
