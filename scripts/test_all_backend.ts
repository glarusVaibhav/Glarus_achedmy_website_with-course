import prisma from "../src/lib/db";
import { signToken } from "../src/lib/auth";

const BASE_URL = "http://localhost:3000";

async function runBackendChecks() {
  console.log("==================================================");
  console.log("   GLARUS ACADEMY - BACKEND PROCESSES INTEGRATION TEST");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ""}`);
      failed++;
    }
  }

  // 1. Database Connection Check
  try {
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const lectureCount = await prisma.lecture.count();
    assert(true, `Database Connected (Users: ${userCount}, Courses: ${courseCount}, Lectures: ${lectureCount})`);
  } catch (err: any) {
    assert(false, "Database Connection", err.message);
  }

  // Find Admin & Instructor users in DB
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const instructorUser = await prisma.user.findFirst({ where: { email: "abc@gmail.com" } }) || await prisma.user.findFirst({ where: { role: "INSTRUCTOR" } });

  assert(Boolean(adminUser), "Admin User Present in Database", adminUser?.email);
  assert(Boolean(instructorUser), "Instructor User Present in Database (abc@gmail.com)", instructorUser?.email);

  // Generate valid signed JWT cookies
  const adminToken = adminUser ? await signToken({ id: adminUser.id, email: adminUser.email, role: "ADMIN", name: adminUser.name }) : "";
  const instructorToken = instructorUser ? await signToken({ id: instructorUser.id, email: instructorUser.email, role: "INSTRUCTOR", name: instructorUser.name }) : "";

  const adminCookie = `auth_token=${adminToken}`;
  const instructorCookie = `auth_token=${instructorToken}`;

  // 5. Ensure Instructor Has Course Creation Permission
  try {
    if (instructorUser) {
      await prisma.instructorCoursePermission.upsert({
        where: { instructorId: instructorUser.id },
        update: { canCreateCourse: true, status: "APPROVED" },
        create: {
          instructorId: instructorUser.id,
          canCreateCourse: true,
          status: "APPROVED",
          requestedAt: new Date(),
          reviewedAt: new Date()
        }
      });
      assert(true, "Instructor Course-Creation Permission in DB (APPROVED)");
    }
  } catch (e: any) {
    assert(false, "Instructor Course-Creation Permission in DB", e.message);
  }

  // 6. Test Instructor Course Creation Permission API
  try {
    const permRes = await fetch(`${BASE_URL}/api/instructor/course-creation-permission`, {
      headers: { Cookie: instructorCookie }
    });
    const permData = await permRes.json();
    assert(permRes.ok && permData.canCreateCourse === true, "GET /api/instructor/course-creation-permission (Allowed)");
  } catch (e: any) {
    assert(false, "GET /api/instructor/course-creation-permission", e.message);
  }

  // 7. Test Instructor Creating Course with ALL Multimedia Types (Video + Photos + MCQs + Sandbox + Resources)
  let createdCourseId = "";
  try {
    const coursePayload = {
      title: `Full Multimedia Test Course - ${Date.now()}`,
      subtitle: "Comprehensive test with videos, photos, MCQs, code sandbox, and files",
      description: "A test course demonstrating full multi-material support.",
      category: "Generative AI",
      level: "Intermediate",
      duration: "10 Hours VOD",
      price: 3499,
      originalPrice: 6999,
      previewVideoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      learningOutcomes: ["Understand Agent Architecture", "Build Multi-Modal RAG Pipelines"],
      modules: [
        {
          title: "Module 1: Architecture & Diagram Analysis",
          order: 1,
          lessons: [
            {
              title: "Lesson 1.1: System Architecture & Visual Diagram",
              type: "image",
              duration: "12m 00s",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              imageUrl1: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
              imageUrl2: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
              imageCaption: "Figure 1: High-Level System Architecture and Microservices",
              description: "Detailed walkthrough of the architectural diagram and state diagrams.",
              notesContent: "Instructor notes: Focus on the message broker decoupling."
            },
            {
              title: "Lesson 1.2: Knowledge Check & MCQ Assessment",
              type: "quiz",
              duration: "15m 00s",
              description: "Interactive assessment covering architecture fundamentals.",
              quizQuestions: [
                {
                  question: "What is the primary role of the supervisor agent in a hierarchical swarm?",
                  options: [
                    "Routing sub-tasks and synthesizing worker outputs",
                    "Directly querying the user with raw SQL",
                    "Rendering frontend React components",
                    "Disabling database migrations"
                  ],
                  correctAnswerIndex: 0,
                  explanation: "The supervisor evaluates the user goal, delegates sub-tasks to specialized agents, and aggregates results."
                },
                {
                  question: "Which database index strategy optimizes vector similarity search?",
                  options: ["HNSW (Hierarchical Navigable Small World)", "B-Tree standard index", "Hash index", "Full text search only"],
                  correctAnswerIndex: 0,
                  explanation: "HNSW provides high recall and low latency vector similarity search."
                }
              ]
            },
            {
              title: "Lesson 1.3: Interactive LangGraph Code Sandbox",
              type: "sandbox",
              duration: "20m 00s",
              sandboxLang: "python",
              sandboxCode: "from typing import TypedDict\n\nclass AgentState(TypedDict):\n    messages: list\n    next_step: str\n\ndef plan_step(state: AgentState):\n    print('Executing planning step...')\n    return {'next_step': 'execute'}\n",
              description: "Hands-on coding playground for stateful multi-agent workflows."
            },
            {
              title: "Lesson 1.4: Starter Code & Downloadable Assets",
              type: "resource",
              duration: "5m 00s",
              resources: [
                { id: "res-1", title: "Architecture_Cheatsheet.pdf", url: "https://example.com/cheatsheet.pdf", type: "PDF", size: "2.4 MB" },
                { id: "res-2", title: "Starter_Repository.zip", url: "https://example.com/starter.zip", type: "ZIP", size: "14.8 MB" }
              ],
              description: "Downloadable supplementary cheatsheets, diagrams, and starter repo."
            }
          ]
        }
      ]
    };

    const createRes = await fetch(`${BASE_URL}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: instructorCookie
      },
      body: JSON.stringify(coursePayload)
    });

    const createData = await createRes.json();
    assert(createRes.ok && createData.course && createData.course.id, "POST /api/courses (Create Course with Multi-Materials)", createData.error || "");
    if (createData.course) {
      createdCourseId = createData.course.id;
    }
  } catch (e: any) {
    assert(false, "POST /api/courses", e.message);
  }

  // 8. Test Admin Course Fetching (`GET /api/admin/courses/[id]`) - MUST return all photos, quizzes, sandboxes, and videos
  try {
    if (createdCourseId) {
      const getRes = await fetch(`${BASE_URL}/api/admin/courses/${createdCourseId}`, {
        headers: { Cookie: adminCookie }
      });
      const getData = await getRes.json();
      assert(getRes.ok && getData.course, "GET /api/admin/courses/[id] (Admin Course Retrieval)");

      const course = getData.course;
      const mod1 = course.modules?.[0];
      assert(Boolean(mod1 && mod1.lectures?.length === 4), "Modules & Lectures Structure Intact (4 Lectures in Module 1)");

      // Check Lesson 1 (Photo / Diagram)
      const l1 = mod1?.lectures?.[0];
      assert(
        Boolean(l1?.imageUrl1 && l1?.imageUrl2 && l1?.imageCaption && l1?.videoUrl),
        "Lesson 1: Photos & Video Preserved in DB",
        `imageUrl1: ${l1?.imageUrl1}, imageUrl2: ${l1?.imageUrl2}`
      );

      // Check Lesson 2 (MCQ / Quiz)
      const l2 = mod1?.lectures?.[1];
      const quizQs = typeof l2?.quizQuestions === "string" ? JSON.parse(l2.quizQuestions) : l2?.quizQuestions;
      assert(
        Boolean(quizQs && Array.isArray(quizQs) && quizQs.length === 2 && quizQs[0].question.includes("supervisor")),
        "Lesson 2: MCQs & Quiz Questions Preserved in DB",
        `Questions: ${quizQs?.length}`
      );

      // Check Lesson 3 (Code Sandbox)
      const l3 = mod1?.lectures?.[2];
      assert(
        Boolean(l3?.sandboxCode && l3?.sandboxLang === "python"),
        "Lesson 3: Code Sandbox Preserved in DB",
        `Lang: ${l3?.sandboxLang}, Code length: ${l3?.sandboxCode?.length}`
      );

      // Check Lesson 4 (Downloadable Resources)
      const l4 = mod1?.lectures?.[3];
      const resList = typeof l4?.resources === "string" ? JSON.parse(l4.resources) : l4?.resources;
      assert(
        Boolean(resList && Array.isArray(resList) && resList.length === 2),
        "Lesson 4: Downloadable Resources Preserved in DB",
        `Resources: ${resList?.length}`
      );
    }
  } catch (e: any) {
    assert(false, "GET /api/admin/courses/[id] Verification", e.message);
  }

  // 9. Test Admin Course Edit (`PUT /api/admin/courses/[id]`) - Admin modifies course and lecture contents
  try {
    if (createdCourseId) {
      const updatePayload = {
        title: "MODIFIED BY ADMIN: Enterprise Multi-Agent Masterclass",
        price: 4999,
        description: "Updated by administrator with extra evaluation metrics.",
        modules: [
          {
            title: "Module 1: Enhanced Architecture & System Engineering",
            order: 1,
            lessons: [
              {
                title: "Lesson 1.1: Updated Visual Architecture",
                type: "image",
                duration: "18m 00s",
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                imageUrl1: "https://images.unsplash.com/photo-1518770660439-4636190af475",
                imageUrl2: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
                imageCaption: "Figure 1: Admin Updated Architecture Blueprint",
                description: "Updated description by Admin.",
                quizQuestions: [
                  {
                    question: "Admin added question: What is the main security rule for agent tool execution?",
                    options: ["Sandboxing and strict schema validation", "Running with root privileges", "Ignoring API timeouts", "Hardcoding keys"],
                    correctAnswerIndex: 0,
                    explanation: "Sandboxing ensures unverified agent tool invocations cannot compromise host infrastructure."
                  }
                ]
              }
            ]
          }
        ]
      };

      const putRes = await fetch(`${BASE_URL}/api/admin/courses/${createdCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie
        },
        body: JSON.stringify(updatePayload)
      });

      const putData = await putRes.json();
      assert(putRes.ok && putData.success, "PUT /api/admin/courses/[id] (Admin Course Edit Authority)");

      // Fetch and verify database updated
      const verifyRes = await fetch(`${BASE_URL}/api/admin/courses/${createdCourseId}`, {
        headers: { Cookie: adminCookie }
      });
      const verifyData = await verifyRes.json();
      const updatedCourse = verifyData.course;

      assert(
        updatedCourse.title === "MODIFIED BY ADMIN: Enterprise Multi-Agent Masterclass",
        "Admin Title Update Persisted in DB",
        updatedCourse.title
      );
      assert(
        updatedCourse.price === 4999,
        "Admin Price Update Persisted in DB (₹4,999)",
        String(updatedCourse.price)
      );
      assert(
        updatedCourse.modules?.[0]?.lectures?.[0]?.imageCaption === "Figure 1: Admin Updated Architecture Blueprint",
        "Admin Lecture Image Caption Persisted in DB"
      );
    }
  } catch (e: any) {
    assert(false, "PUT /api/admin/courses/[id]", e.message);
  }

  // 10. Test Course Publish / Unpublish Toggle by Admin
  try {
    if (createdCourseId) {
      const pubRes = await fetch(`${BASE_URL}/api/admin/courses/${createdCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: adminCookie
        },
        body: JSON.stringify({ isPublished: true, status: "PUBLISHED" })
      });
      const pubData = await pubRes.json();
      assert(pubRes.ok && pubData.course.isPublished === true, "Admin Course Publishing (isPublished=true, status=PUBLISHED)");
    }
  } catch (e: any) {
    assert(false, "Admin Course Publishing", e.message);
  }

  // 11. Test Admin Notifications API
  try {
    const notifRes = await fetch(`${BASE_URL}/api/admin/notifications?limit=10`, {
      headers: { Cookie: adminCookie }
    });
    const notifData = await notifRes.json();
    assert(notifRes.ok && Array.isArray(notifData.notifications), `GET /api/admin/notifications (Returned ${notifData.notifications?.length} notifications)`);
  } catch (e: any) {
    assert(false, "GET /api/admin/notifications", e.message);
  }

  // 12. Test Instructor Notifications API
  try {
    const instNotifRes = await fetch(`${BASE_URL}/api/instructor/notifications?limit=10`, {
      headers: { Cookie: instructorCookie }
    });
    const instNotifData = await instNotifRes.json();
    assert(instNotifRes.ok && Array.isArray(instNotifData.notifications), `GET /api/instructor/notifications (Returned ${instNotifData.notifications?.length} notifications)`);
  } catch (e: any) {
    assert(false, "GET /api/instructor/notifications", e.message);
  }

  // Clean up created test course
  try {
    if (createdCourseId) {
      await prisma.course.delete({ where: { id: createdCourseId } });
      console.log(`🧹 Cleaned up temporary test course ${createdCourseId}`);
    }
  } catch {
    /* ignore */
  }

  console.log("==================================================");
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==================================================");

  if (failed === 0) {
    console.log("🎉 ALL BACKEND PROCESSES ARE WORKING PROPERLY!");
  } else {
    console.error("⚠️ SOME BACKEND TESTS FAILED.");
  }
}

runBackendChecks()
  .catch((e) => {
    console.error("Fatal test runner error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
