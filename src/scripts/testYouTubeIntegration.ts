import prisma from "@/lib/db";
import {
  parseYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  fetchYouTubeOEmbed,
} from "@/lib/video/youtubeService";
import { canAccessVideoAsset } from "@/lib/video/entitlement";

async function runYouTubeIntegrationTests() {
  console.log("==========================================================");
  console.log("▶️ GLARUS ACADEMY — YOUTUBE SECOND PROVIDER INTEGRATION TEST");
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
    // ── 1. URL & ID PARSING TESTS ──
    console.log("--- 1. YouTube URL & ID Parser Tests ---");
    const testCases = [
      { input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Standard watch URL" },
      { input: "https://youtu.be/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Short youtu.be URL" },
      { input: "https://youtube.com/embed/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Embed URL" },
      { input: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Privacy nocookie URL" },
      { input: "https://www.youtube.com/shorts/dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Shorts URL" },
      { input: "dQw4w9WgXcQ", expected: "dQw4w9WgXcQ", name: "Raw 11-char ID" },
      { input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120s&feature=share", expected: "dQw4w9WgXcQ", name: "Watch URL with extra query params" },
      { input: "https://vimeo.com/123456789", expected: null, name: "Non-YouTube URL (Vimeo)" },
      { input: "javascript:alert(1)", expected: null, name: "Malicious javascript URI" },
      { input: "", expected: null, name: "Empty string" },
    ];

    for (const tc of testCases) {
      const parsed = parseYouTubeVideoId(tc.input);
      assert(parsed === tc.expected, tc.name, `got: ${parsed}`);
    }

    // ── 2. PRIVACY-ENHANCED EMBED URL GENERATION ──
    console.log("\n--- 2. Privacy-Enhanced Embed URL Generation ---");
    const embedUrl = getYouTubeEmbedUrl("dQw4w9WgXcQ", {
      enableJsApi: true,
      startTime: 30,
    });
    assert(
      embedUrl.includes("youtube-nocookie.com/embed/dQw4w9WgXcQ"),
      "Uses privacy-enhanced nocookie domain",
      embedUrl
    );
    assert(embedUrl.includes("enablejsapi=1"), "Enables JS API for progress tracking", embedUrl);
    assert(embedUrl.includes("start=30"), "Includes starting timestamp", embedUrl);
    assert(embedUrl.includes("modestbranding=1"), "Includes modestbranding", embedUrl);

    // ── 3. THUMBNAIL URL GENERATION ──
    console.log("\n--- 3. Thumbnail URL Generation ---");
    const thumbHq = getYouTubeThumbnailUrl("dQw4w9WgXcQ", "hq");
    const thumbMax = getYouTubeThumbnailUrl("dQw4w9WgXcQ", "maxres");
    assert(thumbHq === "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "HQ thumbnail URL correct");
    assert(thumbMax === "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", "MaxRes thumbnail URL correct");

    // ── 4. OEMBED METADATA FETCHING ──
    console.log("\n--- 4. Public oEmbed Metadata Retrieval ---");
    const metadata = await fetchYouTubeOEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    assert(metadata !== null, "oEmbed returned metadata");
    assert(metadata?.videoId === "dQw4w9WgXcQ", "Metadata contains correct videoId");
    assert(Boolean(metadata?.title), "Metadata contains video title", metadata?.title);
    assert(metadata?.provider === "YOUTUBE", "Metadata sets provider to YOUTUBE");

    // ── 5. DATABASE TABLE INTEGRITY & ZERO LOSS ──
    console.log("\n--- 5. Database Schema & Table Integrity ---");
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const lectureCount = await prisma.lecture.count();
    const assetCount = await prisma.videoAsset.count();

    assert(userCount > 0, "Users table intact", `Count: ${userCount}`);
    assert(courseCount > 0, "Courses table intact", `Count: ${courseCount}`);
    assert(lectureCount > 0, "Lectures table intact", `Count: ${lectureCount}`);
    assert(assetCount >= 0, "VideoAsset table intact", `Count: ${assetCount}`);

    // ── 6. END-TO-END YOUTUBE ATTACHMENT & PLAYBACK TOKEN FLOW ──
    console.log("\n--- 6. End-to-End YouTube Video Attachment & Entitlement Flow ---");
    const testAdmin = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "INSTRUCTOR"] } },
    }) || await prisma.user.findFirst();

    if (!testAdmin) {
      throw new Error("No admin or instructor found for testing");
    }

    // 6a. Create temporary course & lecture
    const testCourse = await prisma.course.create({
      data: {
        title: "Test YouTube Masterclass Integration",
        description: "Automated test for YouTube video provider",
        instructorId: testAdmin.id,
        category: "AI Engineering",
        level: "All Levels",
        price: 0,
        status: "APPROVED",
        isPublished: true,
        modules: {
          create: [
            {
              title: "Module 1: YouTube Streaming Test",
              order: 1,
              lectures: {
                create: [
                  {
                    title: "Lecture 1.1: YouTube Unlisted Stream",
                    type: "video",
                    order: 1,
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        modules: {
          include: { lectures: true },
        },
      },
    });

    const testLecture = testCourse.modules[0].lectures[0];
    assert(Boolean(testLecture), "Test lecture created with YouTube URL");

    // 6b. Persist VideoAsset with provider: YOUTUBE
    const ytVideoAsset = await prisma.videoAsset.create({
      data: {
        provider: "YOUTUBE",
        providerVideoId: "dQw4w9WgXcQ",
        status: "READY",
        lectureId: testLecture.id,
        courseId: testCourse.id,
        thumbnailKey: getYouTubeThumbnailUrl("dQw4w9WgXcQ", "hq"),
        durationSeconds: 213,
      },
    });

    assert(ytVideoAsset.provider === "YOUTUBE", "VideoAsset created with provider=YOUTUBE");
    assert(ytVideoAsset.providerVideoId === "dQw4w9WgXcQ", "VideoAsset has correct providerVideoId");
    assert(ytVideoAsset.status === "READY", "VideoAsset is READY immediately");

    // 6c. Verify Entitlement Check
    const entitlement = await canAccessVideoAsset(testAdmin.id, testAdmin.role || "ADMIN", ytVideoAsset.id);
    assert(entitlement.allowed, "Admin/Instructor has access to video asset", entitlement.reason);

    // 6d. Clean up temporary test data
    await prisma.videoAsset.delete({ where: { id: ytVideoAsset.id } });
    await prisma.lecture.delete({ where: { id: testLecture.id } });
    await prisma.module.delete({ where: { id: testCourse.modules[0].id } });
    await prisma.course.delete({ where: { id: testCourse.id } });
    console.log("🧹 Test course and asset cleaned up successfully.");

    console.log("\n==========================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==========================================================");
  } catch (error: any) {
    console.error("❌ Test suite encountered an error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runYouTubeIntegrationTests();
