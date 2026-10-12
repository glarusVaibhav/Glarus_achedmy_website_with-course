import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import prisma from "@/lib/db";
import {
  getMinioClient,
  getCourseBucketName,
  ensureCourseBucketExists,
  getObjectStats,
  getObjectStream
} from "@/lib/storage/minioClient";
import {
  getFfmpegBinary,
  getFfprobeBinary,
  extractVideoMetadata,
  generateVideoThumbnail,
  getEligibleHlsVariants,
  processVideoAsset
} from "@/lib/video/videoProcessor";

const execFileAsync = promisify(execFile);

async function runFullVideoPipelineTest() {
  console.log("==========================================================");
  console.log("🎬 GLARUS ACADEMY - VIDEO PIPELINE & BACKWARD COMPATIBILITY TEST");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ""}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  try {
    // ── TEST 1: Database & Table Integrity Check ──
    console.log("--- 1. Database & Table Integrity Check ---");
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const lectureCount = await prisma.lecture.count();
    const enrollmentCount = await prisma.enrollment.count();

    assert(userCount >= 20, "User records preserved", `Count: ${userCount}`);
    assert(courseCount >= 20, "Course records preserved", `Count: ${courseCount}`);
    assert(lectureCount >= 40, "Lecture records preserved", `Count: ${lectureCount}`);
    assert(enrollmentCount >= 10, "Enrollment records preserved", `Count: ${enrollmentCount}`);

    // ── TEST 2: MinIO Bucket & Existing Objects Preservation ──
    console.log("\n--- 2. MinIO Bucket Preservation Check ---");
    const bucket = getCourseBucketName();
    const minioClient = getMinioClient();
    const bucketExists = await minioClient.bucketExists(bucket);
    assert(bucketExists, `Target bucket "${bucket}" exists and is preserved`);

    // ── TEST 3: Existing Video & Lecture.videoUrl Backward Compatibility ──
    console.log("\n--- 3. Existing Video Playback Backward Compatibility ---");
    const existingLectureWithVideo = await prisma.lecture.findFirst({
      where: {
        videoUrl: { not: null }
      }
    });

    assert(
      Boolean(existingLectureWithVideo && existingLectureWithVideo.videoUrl),
      "Existing lecture with videoUrl exists",
      `Lecture ID: ${existingLectureWithVideo?.id}, URL: ${existingLectureWithVideo?.videoUrl?.slice(0, 45)}...`
    );

    // ── TEST 4: FFmpeg & FFprobe Binary Validation ──
    console.log("\n--- 4. FFmpeg & FFprobe Binary Validation ---");
    const ffmpegBin = getFfmpegBinary();
    const ffprobeBin = getFfprobeBinary();

    assert(fs.existsSync(ffmpegBin), "FFmpeg binary found", ffmpegBin);
    assert(fs.existsSync(ffprobeBin), "FFprobe binary found", ffprobeBin);

    // ── TEST 5: Create a Test Video Clip with FFmpeg ──
    console.log("\n--- 5. Synthetic Video Generation & Metadata Extraction ---");
    const tempDir = path.join(__dirname, "..", "..", "scratch", "test_video_flow");
    await fs.promises.mkdir(tempDir, { recursive: true });
    const sampleVideoPath = path.join(tempDir, "sample_clip_720p.mp4");

    // Generate a 4-second 720p test video with test patterns and tone
    console.log("Generating 4-second 720p test video with FFmpeg...");
    const genArgs = [
      "-y",
      "-f", "lavfi",
      "-i", "testsrc=duration=4:size=1280x720:rate=30",
      "-f", "lavfi",
      "-i", "sine=frequency=440:duration=4",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-shortest",
      sampleVideoPath
    ];

    await execFileAsync(ffmpegBin, genArgs);
    assert(fs.existsSync(sampleVideoPath), "Sample test video generated successfully", `${(fs.statSync(sampleVideoPath).size / 1024).toFixed(1)} KB`);

    // ── TEST 6: FFprobe Metadata Extraction ──
    console.log("\n--- 6. FFprobe Metadata Inspection ---");
    const metadata = await extractVideoMetadata(sampleVideoPath);
    assert(metadata.width === 1280, "Extracted width is 1280", `${metadata.width}px`);
    assert(metadata.height === 720, "Extracted height is 720", `${metadata.height}px`);
    assert(metadata.durationSeconds >= 3, "Extracted duration >= 3s", `${metadata.durationSeconds}s`);
    assert(metadata.videoCodec.toLowerCase().includes("264") || metadata.videoCodec === "h264", "Detected H.264 codec", metadata.videoCodec);

    // ── TEST 7: Poster Thumbnail Generation ──
    console.log("\n--- 7. Poster Thumbnail Generation ---");
    const testPosterPath = path.join(tempDir, "poster.jpg");
    await generateVideoThumbnail(sampleVideoPath, testPosterPath, 1);
    assert(fs.existsSync(testPosterPath), "Poster thumbnail generated", `Size: ${(fs.statSync(testPosterPath).size / 1024).toFixed(1)} KB`);

    // ── TEST 8: End-to-End MinIO VideoAsset Processing Pipeline ──
    console.log("\n--- 8. VideoAsset Creation & End-to-End Transcoding Job ---");
    // Create new VideoAsset record in database
    const testAsset = await prisma.videoAsset.create({
      data: {
        originalFilename: "sample_clip_720p.mp4",
        status: "UPLOADING"
      }
    });

    const testObjectKey = `video-assets/${testAsset.id}/original/sample_clip_720p.mp4`;

    // Upload raw video buffer to MinIO
    const fileBuffer = await fs.promises.readFile(sampleVideoPath);
    await minioClient.putObject(bucket, testObjectKey, fileBuffer, fileBuffer.length, {
      "Content-Type": "video/mp4",
      "x-amz-meta-original-filename": "sample_clip_720p.mp4"
    });

    await prisma.videoAsset.update({
      where: { id: testAsset.id },
      data: {
        originalKey: testObjectKey,
        status: "UPLOADED"
      }
    });

    console.log(`Original test video uploaded to MinIO at: ${testObjectKey}`);
    console.log(`Executing processVideoAsset("${testAsset.id}")...`);

    // Run processing job
    await processVideoAsset(testAsset.id);

    // Fetch updated asset from database
    const updatedAsset = await prisma.videoAsset.findUnique({
      where: { id: testAsset.id }
    });

    assert(updatedAsset?.status === "READY", "VideoAsset status transitioned to READY", updatedAsset?.status);
    assert(Boolean(updatedAsset?.masterPlaylistKey), "masterPlaylistKey is populated", updatedAsset?.masterPlaylistKey || "");
    assert(Boolean(updatedAsset?.thumbnailKey), "thumbnailKey is populated", updatedAsset?.thumbnailKey || "");
    assert(Number(updatedAsset?.width) === 1280, "Stored width matches 1280");
    assert(Number(updatedAsset?.height) === 720, "Stored height matches 720");

    // ── TEST 9: Verify HLS Files in MinIO ──
    console.log("\n--- 9. Verifying HLS Files in MinIO ---");
    if (updatedAsset?.masterPlaylistKey) {
      const masterStats = await getObjectStats(updatedAsset.masterPlaylistKey);
      assert(Number(masterStats.size) > 0, "Master playlist exists in MinIO", `Size: ${masterStats.size} bytes`);

      const variantPlaylistKey = `video-assets/${testAsset.id}/hls/720p/playlist.m3u8`;
      const variantStats = await getObjectStats(variantPlaylistKey);
      assert(Number(variantStats.size) > 0, "720p variant playlist exists in MinIO", `Size: ${variantStats.size} bytes`);

      const segmentKey = `video-assets/${testAsset.id}/hls/720p/segment_000.ts`;
      const segmentStats = await getObjectStats(segmentKey);
      assert(Number(segmentStats.size) > 0, "HLS segment chunk exists in MinIO", `Size: ${segmentStats.size} bytes`);
    }

    // Clean up temporary local test files
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch {}

    console.log("\n==========================================================");
    console.log(`🏁 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error("❌ Test suite encountered fatal error:", err);
    process.exit(1);
  }
}

runFullVideoPipelineTest();
