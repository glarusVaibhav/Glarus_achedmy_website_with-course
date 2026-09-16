import fs from "fs";
import path from "path";
import {
  getMinioClient,
  getCourseBucketName,
  ensureCourseBucketExists,
  generateObjectKey,
  uploadCourseMaterial,
  getObjectStats,
  getObjectStream,
  getPresignedDownloadUrl,
  getPresignedUploadUrl,
  deleteCourseMaterial
} from "../src/lib/storage/minioClient";

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

async function runDirectMinioTests() {
  console.log("===============================================================");
  console.log("      GLARUS ACADEMY - MINIO CLIENT FUNCTIONAL VERIFICATION    ");
  console.log("===============================================================");

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

  // Test 1: Bucket Initializer
  try {
    const bucketOk = await ensureCourseBucketExists();
    assert(bucketOk === true, "ensureCourseBucketExists() succeeds");
  } catch (e: any) {
    assert(false, "ensureCourseBucketExists() failed", e.message);
  }

  // Test 2: Key Generator
  try {
    const k1 = generateObjectKey("videos", "Lecture1.mp4", "course_123");
    const k2 = generateObjectKey("pdfs", "Notes.pdf", "course_123");
    const k3 = generateObjectKey("temporary", "sample.png");
    assert(k1.startsWith("courses/course_123/videos/") && k1.endsWith(".mp4"), "generateObjectKey for course video");
    assert(k2.startsWith("courses/course_123/pdfs/") && k2.endsWith(".pdf"), "generateObjectKey for course PDF");
    assert(k3.startsWith("temporary/") && k3.endsWith(".png"), "generateObjectKey for temporary file");
  } catch (e: any) {
    assert(false, "generateObjectKey failed", e.message);
  }

  // Test 3: Upload Course Material (Image)
  const testImgKey = generateObjectKey("images", "test_banner.png", "course_demo_test");
  const testImgBuffer = Buffer.from("PNG_SAMPLE_DATA_BANNER_TEST_12345");
  try {
    const uploadRes = await uploadCourseMaterial(testImgBuffer, testImgKey, "image/png", "test_banner.png");
    assert(
      uploadRes.storage === "minio" &&
      uploadRes.objectKey === testImgKey &&
      uploadRes.size === testImgBuffer.length,
      "uploadCourseMaterial() Image upload",
      uploadRes
    );
  } catch (e: any) {
    assert(false, "uploadCourseMaterial() Image upload", e.message);
  }

  // Test 4: Get Object Stats
  try {
    const stats = await getObjectStats(testImgKey);
    assert(stats.size === testImgBuffer.length, "getObjectStats() retrieved accurate metadata", stats);
  } catch (e: any) {
    assert(false, "getObjectStats() failed", e.message);
  }

  // Test 5: Get Object Stream & Read Content
  try {
    const stream = await getObjectStream(testImgKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const retrievedContent = Buffer.concat(chunks).toString("utf-8");
    assert(retrievedContent === "PNG_SAMPLE_DATA_BANNER_TEST_12345", "getObjectStream() retrieved exact file contents");
  } catch (e: any) {
    assert(false, "getObjectStream() failed", e.message);
  }

  // Test 6: Presigned Download URL
  try {
    const downloadUrl = await getPresignedDownloadUrl(testImgKey, 1800);
    assert(typeof downloadUrl === "string" && downloadUrl.includes(getCourseBucketName()), "getPresignedDownloadUrl() generated valid signed URL");
  } catch (e: any) {
    assert(false, "getPresignedDownloadUrl() failed", e.message);
  }

  // Test 7: Presigned Upload URL
  try {
    const uploadUrlKey = generateObjectKey("videos", "direct_upload.mp4", "course_demo_test");
    const uploadUrl = await getPresignedUploadUrl(uploadUrlKey, 1800);
    assert(typeof uploadUrl === "string" && uploadUrl.includes(getCourseBucketName()), "getPresignedUploadUrl() generated valid signed PUT URL");
  } catch (e: any) {
    assert(false, "getPresignedUploadUrl() failed", e.message);
  }

  // Test 8: Cleanup / Delete
  try {
    const delOk = await deleteCourseMaterial(testImgKey);
    assert(delOk === true, "deleteCourseMaterial() deleted test object cleanly");
  } catch (e: any) {
    assert(false, "deleteCourseMaterial() failed", e.message);
  }

  console.log("===============================================================");
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("===============================================================");
}

runDirectMinioTests();
