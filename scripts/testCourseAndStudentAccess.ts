import { PrismaClient } from "@prisma/client";
import * as jose from "jose";
import { uploadCourseMaterial, getObjectStats } from "../src/lib/storage/minioClient";

const prisma = new PrismaClient();
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "glarus-academy-super-secret-key-for-jwt-2024"
);

async function createAuthCookie(payload: { id: string; email: string; role: string; name: string }) {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
  return `auth_token=${token}`;
}

async function run() {
  console.log("================================================================");
  console.log("🚀 GLARUSACADEMY END-TO-END COURSE CREATION & STUDENT ACCESS TEST");
  console.log("================================================================\n");

  const baseUrl = "http://localhost:3000";
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, msg: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  try {
    // 1. Find or create instructor and student users
    console.log("1. Setting up Test Users (Instructor & Student)...");
    let instructor = await prisma.user.findFirst({
      where: { role: "INSTRUCTOR" }
    });
    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          email: `test-instructor-${Date.now()}@glarus.ai`,
          name: "Dr. Sarah Lin (Test)",
          role: "INSTRUCTOR",
          status: "ACTIVE"
        }
      });
    }

    let student = await prisma.user.findFirst({
      where: { role: "STUDENT" }
    });
    if (!student) {
      student = await prisma.user.create({
        data: {
          email: `test-student-${Date.now()}@glarus.ai`,
          name: "Alex Johnson (Test Student)",
          role: "STUDENT",
          status: "ACTIVE"
        }
      });
    }

    assert(Boolean(instructor?.id), `Instructor user ready: ${instructor?.email} (${instructor?.id})`);
    assert(Boolean(student?.id), `Student user ready: ${student?.email} (${student?.id})`);

    // Ensure instructor has APPROVED course creation permissions
    await prisma.instructorCoursePermission.upsert({
      where: { instructorId: instructor.id },
      create: {
        instructorId: instructor.id,
        status: "APPROVED",
        canCreateCourse: true,
        canEditCourse: true
      },
      update: {
        status: "APPROVED",
        canCreateCourse: true,
        canEditCourse: true
      }
    });

    const instructorCookie = await createAuthCookie({
      id: instructor.id,
      email: instructor.email,
      role: instructor.role,
      name: instructor.name || "Instructor"
    });

    const studentCookie = await createAuthCookie({
      id: student.id,
      email: student.email,
      role: student.role,
      name: student.name || "Student"
    });

    // 2. Prepare mock HLS VideoAsset in MinIO and DB
    console.log("\n2. Preparing Video Asset with Transcoded HLS Streams in MinIO...");
    const sampleAssetId = `va-e2e-${Date.now()}`;
    const masterPlaylistKey = `video-assets/${sampleAssetId}/hls/master.m3u8`;
    const masterContent = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=1280x720
720p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1920x1080
1080p/index.m3u8
`;
    await uploadCourseMaterial(
      Buffer.from(masterContent, "utf-8"),
      masterPlaylistKey,
      "application/vnd.apple.mpegurl",
      "master.m3u8"
    );

    const videoAsset = await prisma.videoAsset.create({
      data: {
        id: sampleAssetId,
        status: "READY",
        masterPlaylistKey,
        originalKey: `video-assets/${sampleAssetId}/original.mp4`,
        originalFilename: "multi_agent_intro.mp4",
        durationSeconds: 934,
        width: 1920,
        height: 1080,
        resolutions: ["360p", "720p", "1080p"]
      }
    });

    assert(Boolean(videoAsset.id), `VideoAsset registered with HLS master playlist: ${masterPlaylistKey}`);

    // 3. Create Course with ALL Content Types
    console.log("\n3. Creating New Course with Video, Quiz, Sandbox, Resource & Assignment...");
    const coursePayload = {
      title: `Agentic AI Engineering Mastery (E2E Test ${Date.now()})`,
      subtitle: "Production-grade multi-agent architectures and workflow engines",
      description: "Comprehensive end-to-end curriculum testing all interactive content delivery types.",
      price: "199.00",
      originalPrice: "399.00",
      category: "Artificial Intelligence",
      level: "Advanced",
      duration: "40 Hours",
      status: "APPROVED",
      instructorId: instructor.id,
      modules: [
        {
          title: "Module 1: Production Agent Foundations",
          lessons: [
            {
              title: "Lesson 1.1: Multi-Agent Topology & State Graph",
              type: "video",
              duration: "15m 34s",
              description: "Deep dive into state graphs, cyclic flows, and distributed memory in agentic swarms.",
              videoUrl: `courses/ai-mastery/video1.mp4`,
              videoAssetId: videoAsset.id,
              notesContent: "Key takeaway: State reducers prevent concurrent node collisions.",
              articleContent: "State management in multi-agent systems requires deterministic reducer semantics."
            },
            {
              title: "Lesson 1.2: Agent State Knowledge Assessment",
              type: "quiz",
              duration: "10 min",
              description: "Test your understanding of agent state reducers and recursion guards.",
              quizQuestions: [
                {
                  id: 1,
                  question: "What is the primary function of state reducers like operator.add in graph nodes?",
                  options: [
                    { id: "A", text: "They overwrite and erase previous state variables." },
                    { id: "B", text: "They combine or append state deltas without collision across parallel agent nodes." },
                    { id: "C", text: "They convert Python code to binary machine instructions." },
                    { id: "D", text: "They reboot the GPU cluster." }
                  ],
                  correct: "B",
                  explanation: "Reducers govern how parallel node emissions merge safely into the shared global state."
                },
                {
                  id: 2,
                  question: "Why must recursion limits be enforced in autonomous reasoning loops?",
                  options: [
                    { id: "A", text: "To prevent infinite reflection loops and unbounded API compute costs." },
                    { id: "B", text: "Python cannot execute more than 10 functions." },
                    { id: "C", text: "To disable GPU CUDA caching." },
                    { id: "D", text: "To encrypt network packets." }
                  ],
                  correct: "A",
                  explanation: "Bounded recursion guards ensure autonomous agents never get caught in infinite critique loops."
                }
              ]
            },
            {
              title: "Lesson 1.3: Live State Graph Coding Sandbox",
              type: "code",
              duration: "20 min",
              description: "Interactive Python execution sandbox for testing graph routing.",
              sandboxLang: "python",
              sandboxCode: `def evaluate_agent():\n    state = {'query': 'Find AI papers', 'steps': ['search', 'summarize']}\n    print(f"Agent state processed: {len(state['steps'])} steps.")\n    return True\n\nevaluate_agent()`
            },
            {
              title: "Lesson 1.4: Architecture Blueprint & Reference Specs",
              type: "resource",
              duration: "15 min",
              description: "Downloadable high-resolution architecture diagrams and PDF whitepapers.",
              starterFileName: "Agentic_State_Blueprint_v2.pdf",
              starterFileUrl: "courses/blueprints/agentic_spec.pdf",
              resources: [
                {
                  id: "res-1",
                  title: "Multi-Agent System Specification.pdf",
                  url: "courses/blueprints/spec.pdf",
                  type: "PDF",
                  size: "4.8 MB"
                },
                {
                  id: "res-2",
                  title: "Docker Compose Deployment Template.yaml",
                  url: "courses/blueprints/docker-compose.yaml",
                  type: "YAML",
                  size: "12 KB"
                }
              ]
            },
            {
              title: "Lesson 1.5: Capstone Assignment: Multi-Agent Research Assistant",
              type: "assignment",
              duration: "45 min",
              description: "Build and submit an autonomous multi-agent research pipeline with citation verification.",
              assignmentBrief: "Design a 3-node graph with a Researcher, Fact-Checker, and Synthesizer. Submit your GitHub repository URL and deployment link.",
              starterFileName: "assignment_starter_repo.zip",
              starterFileUrl: "courses/assignments/starter.zip",
              deliverables: [
                "GitHub repository with unit tests",
                "Live demo URL or Loom video",
                "Architecture decision record (ADR)"
              ]
            }
          ]
        }
      ]
    };

    const createCourseRes = await fetch(`${baseUrl}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: instructorCookie
      },
      body: JSON.stringify(coursePayload)
    });

    const createCourseJson = await createCourseRes.json();
    assert(createCourseRes.ok && createCourseJson.success, `Course created successfully via /api/courses: ID = ${createCourseJson.course?.id}`);
    const createdCourse = createCourseJson.course;

    // 4. Publish Course
    console.log("\n4. Publishing Course for Student Enrollment...");
    const publishRes = await fetch(`${baseUrl}/api/courses/${createdCourse.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: instructorCookie
      },
      body: JSON.stringify({
        isPublished: true,
        status: "PUBLISHED"
      })
    });
    const publishJson = await publishRes.json();
    assert(publishRes.ok && publishJson.success, `Course published (isPublished=true, status=PUBLISHED)`);

    // 5. Enroll Student
    console.log("\n5. Enrolling Student in the Course...");
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: createdCourse.id
        }
      },
      update: {},
      create: {
        userId: student.id,
        courseId: createdCourse.id,
        progress: 0,
        isCompleted: false
      }
    });
    assert(Boolean(enrollment.id), `Student enrolled in course: enrollment ID = ${enrollment.id}`);

    // 6. Test Student Learn API (/api/student/courses/[id]/learn)
    console.log("\n6. Testing Student Learning Studio Data API (/api/student/courses/[id]/learn)...");
    const learnRes = await fetch(`${baseUrl}/api/student/courses/${createdCourse.id}/learn`, {
      method: "GET",
      headers: {
        Cookie: studentCookie
      }
    });

    const learnJson = await learnRes.json();
    assert(learnRes.ok && learnJson.success, "Student Learn API returned HTTP 200 OK");
    assert(learnJson.enrollment?.isEnrolled === true, "Enrollment flag isEnrolled is true");
    assert(learnJson.course?.modules?.length === 1, "Returned 1 module as expected");

    const returnedLectures = learnJson.course?.modules[0]?.lectures;
    assert(returnedLectures?.length === 5, `Module contains exactly 5 lessons (Found: ${returnedLectures?.length})`);

    // Verify Lesson 1: Video with VideoAsset
    const videoLec = returnedLectures[0];
    assert(videoLec.title.includes("Multi-Agent Topology"), `Lesson 1 title: "${videoLec.title}"`);
    assert(videoLec.type === "video", `Lesson 1 type is "video"`);
    assert(Boolean(videoLec.videoAsset), `Lesson 1 contains videoAsset object`);
    assert(videoLec.videoAsset?.masterPlaylistKey === masterPlaylistKey, `Lesson 1 videoAsset masterPlaylistKey matches HLS playlist`);
    assert(Array.isArray(videoLec.videoAsset?.resolutions) && videoLec.videoAsset.resolutions.includes("1080p"), `Lesson 1 videoAsset supports adaptive resolutions`);

    // Verify Lesson 2: Quiz with quizQuestions
    const quizLec = returnedLectures[1];
    assert(quizLec.type === "quiz", `Lesson 2 type is "quiz"`);
    assert(Array.isArray(quizLec.quizQuestions) && quizLec.quizQuestions.length === 2, `Lesson 2 contains 2 quiz questions`);
    assert(quizLec.quizQuestions[0].correct === "B", `Quiz Question 1 has correct answer "B"`);
    assert(quizLec.quizQuestions[0].options.length === 4, `Quiz Question 1 has 4 options`);

    // Verify Lesson 3: Code Sandbox
    const codeLec = returnedLectures[2];
    assert(codeLec.type === "code", `Lesson 3 type is "code"`);
    assert(codeLec.sandboxLang === "python", `Lesson 3 sandbox language is "python"`);
    assert(codeLec.sandboxCode.includes("evaluate_agent"), `Lesson 3 sandbox code is present`);

    // Verify Lesson 4: Resource with PDF & files
    const resourceLec = returnedLectures[3];
    assert(resourceLec.type === "resource", `Lesson 4 type is "resource"`);
    assert(resourceLec.starterFileName === "Agentic_State_Blueprint_v2.pdf", `Lesson 4 starterFileName is present`);
    assert(Array.isArray(resourceLec.resources) && resourceLec.resources.length === 2, `Lesson 4 has 2 downloadable resources`);
    assert(resourceLec.resources[0].type === "PDF", `Resource 1 is type "PDF"`);

    // Verify Lesson 5: Assignment with deliverables
    const assignmentLec = returnedLectures[4];
    assert(assignmentLec.type === "assignment", `Lesson 5 type is "assignment"`);
    assert(Boolean(assignmentLec.assignmentBrief), `Lesson 5 contains assignmentBrief`);
    assert(Array.isArray(assignmentLec.deliverables) && assignmentLec.deliverables.length === 3, `Lesson 5 has 3 deliverables`);
    assert(assignmentLec.deliverables[0].includes("GitHub"), `Deliverable 1 requires GitHub repository`);

    // 7. Test HLS Video Streaming Endpoint as Student
    console.log("\n7. Testing HLS Video Streaming Endpoint (/api/videos/hls/[...path])...");
    const hlsRes = await fetch(`${baseUrl}/api/videos/hls/${masterPlaylistKey}`, {
      method: "GET",
      headers: {
        Cookie: studentCookie
      }
    });

    assert(hlsRes.ok, `HLS master playlist stream returned HTTP ${hlsRes.status} OK`);
    const hlsText = await hlsRes.text();
    assert(hlsText.includes("#EXTM3U") && hlsText.includes("1080p/index.m3u8"), `HLS stream response contains valid multi-variant M3U8 payload`);

    // 8. Test Video Progress Autosave API (/api/video-progress)
    console.log("\n8. Testing Video Progress Autosave API (/api/video-progress)...");
    const progressRes = await fetch(`${baseUrl}/api/video-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie
      },
      body: JSON.stringify({
        lectureId: videoLec.id,
        progressSeconds: 840,
        isCompleted: true
      })
    });

    const progressJson = await progressRes.json();
    assert(progressRes.ok && progressJson.success, `Video progress saved: progressSeconds = 840, isCompleted = true`);

    const dbProgress = await prisma.videoProgress.findUnique({
      where: {
        userId_lectureId: {
          userId: student.id,
          lectureId: videoLec.id
        }
      }
    });
    assert(dbProgress?.isCompleted === true && dbProgress.progressSeconds === 840, `Database verified VideoProgress row for student`);

    // 9. Test Sandbox Code Execution API (/api/sandbox/execute)
    console.log("\n9. Testing Sandbox Code Execution API (/api/sandbox/execute)...");
    const sandboxRes = await fetch(`${baseUrl}/api/sandbox/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        language: "python",
        code: codeLec.sandboxCode
      })
    });

    const sandboxJson = await sandboxRes.json();
    assert(sandboxRes.ok && sandboxJson.success, `Sandbox code executed successfully: output = "${sandboxJson.output}"`);

    // 10. Test Course Sidebar API (/api/course/[courseId]/sidebar)
    console.log("\n10. Testing Course Sidebar API (/api/course/[courseId]/sidebar)...");
    const sidebarRes = await fetch(`${baseUrl}/api/course/${createdCourse.id}/sidebar`);
    const sidebarJson = await sidebarRes.json();
    assert(sidebarRes.ok && sidebarJson.success, `Sidebar API returned HTTP 200 OK`);
    assert(Array.isArray(sidebarJson.topics) && sidebarJson.topics.length >= 1, `Sidebar topics parsed from DB correctly`);

    // 11. Test Student Notes API (/api/student/notes)
    console.log("\n11. Testing Student Notes API (/api/student/notes)...");
    const createNoteRes = await fetch(`${baseUrl}/api/student/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie
      },
      body: JSON.stringify({
        lectureId: videoLec.id,
        timestampSeconds: 125,
        content: "Important note: Graph state reducers handle parallel updates."
      })
    });
    const createNoteJson = await createNoteRes.json();
    assert(createNoteRes.ok && createNoteJson.success, `Student note created successfully (Note ID: ${createNoteJson.note?.id})`);

    const getNotesRes = await fetch(`${baseUrl}/api/student/notes?lectureId=${videoLec.id}`, {
      method: "GET",
      headers: { Cookie: studentCookie }
    });
    const getNotesJson = await getNotesRes.json();
    assert(getNotesRes.ok && getNotesJson.notes?.length >= 1, `Student fetched notes for lecture: count = ${getNotesJson.notes?.length}`);

    // 12. Test Student Self-Paced Courses Dashboard API (/api/student/self-paced)
    console.log("\n12. Testing Student Self-Paced Dashboard API (/api/student/self-paced)...");
    const selfPacedRes = await fetch(`${baseUrl}/api/student/self-paced`, {
      method: "GET",
      headers: { Cookie: studentCookie }
    });
    const selfPacedJson = await selfPacedRes.json();
    assert(selfPacedRes.ok && Array.isArray(selfPacedJson.courses), `Student self-paced courses fetched successfully`);
    const foundInDashboard = selfPacedJson.courses.find((c: any) => c.id === createdCourse.id);
    assert(Boolean(foundInDashboard), `Created course appears on student self-paced dashboard with title: "${foundInDashboard?.title}"`);
    assert(foundInDashboard?.totalLectures === 5, `Student dashboard reports 5 total lectures`);

    // 13. Test Video Upload URL Generation API (/api/videos/upload-url)
    console.log("\n13. Testing Video Presigned Upload URL API (/api/videos/upload-url)...");
    const uploadUrlRes = await fetch(`${baseUrl}/api/videos/upload-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: instructorCookie
      },
      body: JSON.stringify({
        fileName: "test_lecture_upload.mp4",
        fileSize: 10485760,
        mimeType: "video/mp4"
      })
    });
    const uploadUrlJson = await uploadUrlRes.json();
    assert(uploadUrlRes.ok && Boolean(uploadUrlJson.uploadUrl), `Generated presigned upload URL for direct video upload`);
    assert(Boolean(uploadUrlJson.videoAssetId), `Registered pending VideoAsset ID: ${uploadUrlJson.videoAssetId}`);

    // Clean up temporary videoAsset from step 13
    if (uploadUrlJson.videoAssetId) {
      await prisma.videoAsset.deleteMany({ where: { id: uploadUrlJson.videoAssetId } });
    }

    // 14. Cleanup test course cleanly
    console.log("\n14. Cleaning up Test Course & Related Test Data...");
    await prisma.studentNote.deleteMany({
      where: { userId: student.id, lectureId: { in: returnedLectures.map((l: any) => l.id) } }
    });
    await prisma.videoProgress.deleteMany({
      where: { lectureId: { in: returnedLectures.map((l: any) => l.id) } }
    });
    await prisma.userActivity.deleteMany({
      where: { courseId: createdCourse.id }
    });
    await prisma.enrollment.deleteMany({
      where: { courseId: createdCourse.id }
    });
    await prisma.videoAsset.deleteMany({
      where: { id: sampleAssetId }
    });
    await prisma.lecture.deleteMany({
      where: { id: { in: returnedLectures.map((l: any) => l.id) } }
    });
    await prisma.module.deleteMany({
      where: { courseId: createdCourse.id }
    });
    await prisma.courseApproval.deleteMany({
      where: { courseId: createdCourse.id }
    });
    await prisma.course.delete({
      where: { id: createdCourse.id }
    });

    console.log("  ✅ Test course and records cleaned up cleanly.\n");

    console.log("================================================================");
    console.log(`🎉 ALL TESTS PASSED! (${passedCount}/${totalTests} Assertions Passed)`);
    console.log("================================================================");
  } catch (error: any) {
    console.error("\n❌ E2E TEST FAILED:", error?.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
