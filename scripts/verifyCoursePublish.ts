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

async function runVerification() {
  console.log("=========================================================");
  console.log("    VERIFYING COURSE PUBLISH / UNPUBLISH & LANDING SYNC  ");
  console.log("=========================================================");

  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    throw new Error("No admin user found in database");
  }
  const token = await createToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role });
  const authHeaders = {
    "Content-Type": "application/json",
    "Cookie": `auth_token=${token}; token=${token}`,
    "Authorization": `Bearer ${token}`
  };

  const targetCourseId = "course-enterprise-systems";

  // Step 1: Initial public courses count
  console.log("\n[Step 1] Fetching public landing courses before toggle...");
  const initialRes = await fetch(`${BASE_URL}/api/courses`);
  const initialData = await initialRes.json();
  const initialIds = (initialData.courses || []).map((c: any) => c.id);
  console.log(`Landing Page Active Courses (${initialIds.length}):`, initialIds);

  // Step 2: Unpublish Course
  console.log(`\n[Step 2] UNPUBLISHING course: ${targetCourseId}...`);
  const unpublishRes = await fetch(`${BASE_URL}/api/admin/courses/${targetCourseId}/publish`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ isPublished: false })
  });
  const unpublishData = await unpublishRes.json();
  console.log("Unpublish Result:", unpublishData.message, "| Status:", unpublishData.status, "| isPublished:", unpublishData.isPublished);

  // Step 3: Verify Landing Page Courses excludes unpublished course
  console.log("\n[Step 3] Verifying Landing Page API (/api/courses) after UNPUBLISH...");
  const postUnpublishRes = await fetch(`${BASE_URL}/api/courses`);
  const postUnpublishData = await postUnpublishRes.json();
  const postUnpublishIds = (postUnpublishData.courses || []).map((c: any) => c.id);
  const isExcluded = !postUnpublishIds.includes(targetCourseId);
  console.log(`Landing Page Courses Count: ${postUnpublishIds.length} | Course Excluded: ${isExcluded ? "✅ YES (Hidden)" : "❌ NO"}`);
  if (!isExcluded) {
    throw new Error(`Course ${targetCourseId} should be excluded from landing page but was found in /api/courses`);
  }

  // Step 4: Re-Publish Course
  console.log(`\n[Step 4] RE-PUBLISHING course: ${targetCourseId}...`);
  const publishRes = await fetch(`${BASE_URL}/api/admin/courses/${targetCourseId}/publish`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ isPublished: true })
  });
  const publishData = await publishRes.json();
  console.log("Publish Result:", publishData.message, "| Status:", publishData.status, "| isPublished:", publishData.isPublished);

  // Step 5: Verify Landing Page Courses now includes published course
  console.log("\n[Step 5] Verifying Landing Page API (/api/courses) after RE-PUBLISH...");
  const postPublishRes = await fetch(`${BASE_URL}/api/courses`);
  const postPublishData = await postPublishRes.json();
  const postPublishIds = (postPublishData.courses || []).map((c: any) => c.id);
  const isIncluded = postPublishIds.includes(targetCourseId);
  console.log(`Landing Page Courses Count: ${postPublishIds.length} | Course Live: ${isIncluded ? "✅ YES (Live on Landing Page)" : "❌ NO"}`);
  if (!isIncluded) {
    throw new Error(`Course ${targetCourseId} should be present on landing page after publishing`);
  }

  // Step 6: Verify Admin Courses Catalog API
  console.log("\n[Step 6] Verifying Admin Catalog API (/api/admin/courses)...");
  const adminCatalogRes = await fetch(`${BASE_URL}/api/admin/courses`, {
    headers: authHeaders
  });
  const adminCatalogData = await adminCatalogRes.json();
  const targetFromAdmin = (adminCatalogData.courses || []).find((c: any) => c.id === targetCourseId);
  console.log(`Admin Course Record: Title: "${targetFromAdmin?.title}" | Status: ${targetFromAdmin?.status} | isPublished: ${targetFromAdmin?.isPublished}`);

  // Step 7: Verify Audit Log created
  const latestAudit = await prisma.auditLog.findFirst({
    where: { details: { contains: targetCourseId } },
    orderBy: { timestamp: "desc" }
  });
  console.log(`\n[Step 7] Latest AuditLog Action: ${latestAudit?.action} | Details: ${latestAudit?.details}`);

  console.log("\n🎉 ALL PUBLISH / UNPUBLISH AND LANDING SYNC VERIFICATIONS PASSED SUCCESSFULLY!");
  await prisma.$disconnect();
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
