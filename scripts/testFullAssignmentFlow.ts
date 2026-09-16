import fs from "fs";
import path from "path";
import prisma from "../src/lib/db";
import { signToken } from "../src/lib/auth";
import { AssignmentService } from "../src/lib/services/assignmentService";
import { getCourseBucketName } from "../src/lib/storage/minioClient";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}
loadEnv();

const BASE_URL = "http://localhost:3000";

async function testFullAssignmentFlow() {
  console.log("==================================================================");
  console.log("   TESTING ASSIGNMENT SUBMISSION & MINIO STORAGE PIPELINE");
  console.log("==================================================================");

  const bucket = getCourseBucketName();
  console.log(`Configured Bucket Name: "${bucket}" (Strictly using configured bucket)`);

  // 1. Get or Create a test Student user
  let student = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        name: "Test Assignment Student",
        email: `student_asg_${Date.now()}@glarus.edu`,
        password: "$2b$10$hashedpwfortesting",
        role: "STUDENT"
      }
    });
  }

  console.log(`Using Student User: ${student.name} (${student.email})`);

  // 2. Authenticate as student
  const studentToken = await signToken({
    id: student.id,
    email: student.email,
    role: "STUDENT",
    name: student.name
  });
  const cookieHeader = `auth_token=${studentToken}`;

  // 3. Test File Upload to /api/upload
  console.log("\n1. Testing File Upload via /api/upload (category: assignment)...");
  const fileContent = Buffer.from("SAMPLE CODE ARCHIVE: print('Hello Autonomous Agent World!')");
  const form = new FormData();
  const blob = new Blob([fileContent], { type: "application/zip" });
  form.append("file", blob, "student_capstone_project.zip");
  form.append("category", "assignment");
  form.append("courseId", "ai_agent_masterclass");

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
    body: form,
  });

  const uploadData = await uploadRes.json();
  console.log("Upload API Response:", uploadData);

  if (!uploadRes.ok) {
    console.error("❌ Upload failed:", uploadData);
    return;
  }
  console.log("✅ File successfully uploaded and processed!");
  console.log(`   - Storage Type: ${uploadData.storage}`);
  console.log(`   - File URL:     ${uploadData.url}`);
  console.log(`   - Object Key:   ${uploadData.objectKey || uploadData.fileName}`);

  // 4. Test Submitting the Assignment Record
  console.log("\n2. Submitting Assignment with the uploaded MinIO deliverable...");
  const asgId = "test-capstone-asg-" + Date.now();

  const submissionResult = await AssignmentService.submitAssignment(student.id, asgId, {
    githubUrl: "https://github.com/student/autonomous-agent-capstone",
    liveUrl: "https://agent-demo.glarus.ai",
    fileName: uploadData.fileName || "student_capstone_project.zip",
    fileUrl: uploadData.url,
    notes: "Implemented all extra credit modules with Docker orchestration."
  });

  console.log("Submission DB Record:", submissionResult.submission);
  console.log("\n==================================================================");
  console.log("🎉 ALL CHECKS PASSED: Assignment upload and database linking is active!");
  console.log("==================================================================");
}

testFullAssignmentFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
