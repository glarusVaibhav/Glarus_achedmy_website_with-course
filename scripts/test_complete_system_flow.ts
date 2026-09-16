import prisma from "../src/lib/db";
import { signToken } from "../src/lib/auth";

const BASE_URL = "http://localhost:3000";

async function runCompleteSystemFlow() {
  console.log("==================================================================");
  console.log("   GLARUS ACADEMY - END-TO-END SYSTEM FLOW & BACKEND VALIDATION   ");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string, detail?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title}`, detail || "");
      failed++;
    }
  }

  // 1. Get or Create Test Users
  let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  let instructor = await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });
  let student = await prisma.user.findFirst({ where: { role: "STUDENT" } });

  assert(Boolean(admin), "Admin User Present in Database", admin?.email);
  assert(Boolean(instructor), "Instructor User Present in Database", instructor?.email);
  assert(Boolean(student), "Student User Present in Database", student?.email);

  if (!admin || !instructor || !student) {
    console.error("Missing necessary users for full workflow testing.");
    return;
  }

  // Ensure test student is enrolled in at least one course taught by instructor
  let targetCourse = await prisma.course.findFirst({
    where: { instructorId: instructor.id }
  });
  if (!targetCourse) {
    targetCourse = await prisma.course.findFirst();
  }

  if (targetCourse) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: student.id, courseId: targetCourse.id } },
      update: {},
      create: { userId: student.id, courseId: targetCourse.id }
    });
  }

  const adminToken = await signToken({ id: admin.id, email: admin.email, role: "ADMIN", name: admin.name });
  const instructorToken = await signToken({ id: instructor.id, email: instructor.email, role: "INSTRUCTOR", name: instructor.name });
  const studentToken = await signToken({ id: student.id, email: student.email, role: "STUDENT", name: student.name });

  const adminHeaders = { Cookie: `auth_token=${adminToken}`, "Content-Type": "application/json" };
  const instructorHeaders = { Cookie: `auth_token=${instructorToken}`, "Content-Type": "application/json" };
  const studentHeaders = { Cookie: `auth_token=${studentToken}`, "Content-Type": "application/json" };

  // 2. Instructor Creates an Assessment via API
  let createdAssignmentId = "";
  try {
    const createRes = await fetch(`${BASE_URL}/api/instructor/assignments`, {
      method: "POST",
      headers: instructorHeaders,
      body: JSON.stringify({
        title: `AI Capstone Project Assessment ${Date.now()}`,
        description: "Build an autonomous agent with LangGraph and submit source archive + live URL.",
        moduleName: "Module 5: Multi-Agent Systems",
        courseId: targetCourse?.id,
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        totalMarks: 100,
        pointsLabel: "100 Pts",
        instructions: ["Code Quality: 40 pts", "State Management: 30 pts", "Documentation: 30 pts"]
      })
    });
    const createData = await createRes.json();
    assert(createRes.ok && Boolean(createData.assignment?.id), "Instructor Assessment Creation (POST /api/instructor/assignments)", createData);
    createdAssignmentId = createData.assignment?.id;
  } catch (e: any) {
    assert(false, "Instructor Assessment Creation", e.message);
  }

  // 3. Student Uploads Deliverable to MinIO Storage
  let uploadedFileUrl = "";
  try {
    const fileBuffer = Buffer.from("%PDF-1.4 PDF_AND_SOURCE_CODE_BINARY_DELIVERABLE_FOR_CAPSTONE");
    const form = new FormData();
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    form.append("file", blob, "Autonomous_Agent_Architecture.pdf");
    form.append("category", "assignment");
    if (targetCourse?.id) form.append("courseId", targetCourse.id);

    const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: { Cookie: `auth_token=${studentToken}` },
      body: form
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.ok && uploadData.storage === "minio", "Student MinIO File Upload (POST /api/upload -> MinIO: 192.168.1.3:9000)", uploadData);
    uploadedFileUrl = uploadData.url;
  } catch (e: any) {
    assert(false, "Student MinIO Upload", e.message);
  }

  // 4. Student Submits Solution
  let submissionId = "";
  try {
    const submitRes = await fetch(`${BASE_URL}/api/student/assignments/${createdAssignmentId}/submit`, {
      method: "POST",
      headers: studentHeaders,
      body: JSON.stringify({
        githubUrl: "https://github.com/student/autonomous-agent-langgraph",
        liveUrl: "https://agent-demo.glarusacademy.ai",
        fileName: "Autonomous_Agent_Architecture.pdf",
        fileUrl: uploadedFileUrl,
        notes: "Implemented persistent SQLite checkpoints and Tavily tool calling."
      })
    });
    const submitData = await submitRes.json();
    assert(submitRes.ok && submitData.success, "Student Assignment Submission (POST /api/student/assignments/[id]/submit)", submitData);
    submissionId = submitData.submission?.id;
  } catch (e: any) {
    assert(false, "Student Assignment Submission", e.message);
  }

  // 5. Instructor Fetches Assignments & Submissions
  try {
    const listRes = await fetch(`${BASE_URL}/api/instructor/assignments`, {
      method: "GET",
      headers: instructorHeaders
    });
    const listData = await listRes.json();
    const foundAsg = listData.assignments?.find((a: any) => a.id === createdAssignmentId);
    const foundSub = foundAsg?.submissions?.find((s: any) => s.id === submissionId || s.studentId === student?.id);
    assert(listRes.ok && Boolean(foundAsg), "Instructor Retrieves New Assignment from Database (GET /api/instructor/assignments)");
    assert(Boolean(foundSub) && foundSub.status === "Pending Review", "Instructor Sees Student Submission Marked 'Pending Review'");
  } catch (e: any) {
    assert(false, "Instructor Assignment Fetch", e.message);
  }

  // 6. Instructor Grades Submission
  try {
    const gradeRes = await fetch(`${BASE_URL}/api/instructor/assignments/submissions/${submissionId}`, {
      method: "PATCH",
      headers: instructorHeaders,
      body: JSON.stringify({
        score: 96,
        feedback: "Outstanding multi-agent architecture and clean vector caching implementation!"
      })
    });
    const gradeData = await gradeRes.json();
    assert(gradeRes.ok && gradeData.submission?.status === "GRADED" && gradeData.submission?.scoreNumeric === 96, "Instructor Grades Submission (PATCH /api/instructor/assignments/submissions/[id])", gradeData);
  } catch (e: any) {
    assert(false, "Instructor Grading Submission", e.message);
  }

  // 7. Student Sees Graded Result
  try {
    const studentAsgRes = await fetch(`${BASE_URL}/api/student/assignments`, {
      method: "GET",
      headers: studentHeaders
    });
    const studentAsgData = await studentAsgRes.json();
    const mySub = studentAsgData.assignments?.find((a: any) => a.id === createdAssignmentId);
    assert(studentAsgRes.ok && mySub?.status === "GRADED" && mySub?.scoreNumeric === 96, "Student Receives Published Score & Feedback (GET /api/student/assignments)");
  } catch (e: any) {
    assert(false, "Student Verification of Graded Assessment", e.message);
  }

  // 8. Admin Audit & Stats
  try {
    const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      method: "GET",
      headers: adminHeaders
    });
    assert(adminStatsRes.ok, "Admin Analytics & Platform Stats Verification (GET /api/admin/stats)");
  } catch (e: any) {
    assert(false, "Admin Stats Verification", e.message);
  }

  // Clean up test assignment
  try {
    await prisma.assignmentSubmission.deleteMany({ where: { assignmentId: createdAssignmentId } });
    await prisma.assignment.delete({ where: { id: createdAssignmentId } });
    console.log(`🧹 Cleaned up temporary test assignment (${createdAssignmentId})`);
  } catch (cleanupErr) {
    // ignore
  }

  console.log("==================================================================");
  console.log(`TOTAL WORKFLOW CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================================");

  if (failed === 0) {
    console.log("🎉 FULL SYSTEM END-TO-END WORKFLOW 100% OPERATIONAL!");
  }
}

runCompleteSystemFlow()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
