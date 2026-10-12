

import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import PremiumLearningStudio, { StudioCourse, StudioLecture } from "@/components/studio/PremiumLearningStudio";
import { LearningLayout } from "@/components/layout/LearningLayout";
import { getCourseData, getCourseDataAsync } from "@/lib/courses/course-loader";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

function generateFallbackLecturesForModule(
  moduleId: string,
  moduleTitle: string,
  moduleIndex: number,
  courseTitle: string,
  courseCategory?: string | null
): StudioLecture[] {
  const modNum = moduleIndex + 1;
  return [
    {
      id: `${moduleId}-lec-1`,
      title: `${modNum}.1 Foundations & Architectural Concepts`,
      type: "video",
      duration: "24 min",
      videoUrl: "/uploads/sample-video.mp4",
      description: `Comprehensive architectural masterclass on ${moduleTitle}. Learn core abstractions, state isolation models, and production scaling practices.`,
      notesContent: `# ${moduleTitle}: Core Engineering Principles\n\nIn this session, we examine the structural blueprints and execution flow required to build robust ${courseCategory || "enterprise cloud"} systems.\n\n### Key Principles:\n- Deterministic state machine contracts\n- Real-time telemetry, trace latency, and observability\n- Automated failover and circuit breaker patterns`,
      articleContent: `Production reference guide for ${moduleTitle}. Ensure all services adhere to strict schema contracts and latency budgets.`,
      sandboxLang: "python",
      sandboxCode: `# Production ${courseTitle} Runner\nfrom typing import Dict, Any\n\nclass ExecutionNode:\n    def __init__(self, name: str):\n        self.name = name\n        self.is_active = True\n\n    def process(self, payload: Dict[str, Any]) -> Dict[str, Any]:\n        print(f"⚡ Processing task on [{self.name}] with event:", payload)\n        return {\n            "status": "SUCCESS",\n            "node": self.name,\n            "latency_ms": 14.2\n        }\n\nrunner = ExecutionNode("node-master-01")\nresult = runner.process({"action": "INITIALIZE_GRAPH", "module": "${moduleTitle}"})\nprint("Output:", result)\n`,
      quizQuestions: [
        {
          id: 1,
          question: `What is the primary architectural advantage of decoupled state models in ${courseCategory || "distributed applications"}?`,
          options: [
            { id: "A", text: "Predictable fault isolation and idempotent recovery under heavy traffic" },
            { id: "B", text: "Synchronous blocking thread pools" },
            { id: "C", text: "Direct unverified memory access" },
            { id: "D", text: "Single point of failure bottlenecks" },
          ],
          correct: "A",
          explanation: "Decoupled state architectures isolate errors and guarantee deterministic recovery during distributed network spikes.",
        },
        {
          id: 2,
          question: "How do you guarantee exactly-once message semantics in high-throughput workflows?",
          options: [
            { id: "A", text: "By using idempotent message keys verified against an atomic deduplication store" },
            { id: "B", text: "By discarding duplicate packets silently" },
            { id: "C", text: "By running single-threaded execution" },
            { id: "D", text: "By increasing CPU frequency" },
          ],
          correct: "A",
          explanation: "Atomic deduplication keys prevent repeated state mutations across distributed consumer nodes.",
        },
      ],
      resources: [
        { title: `${moduleTitle} - Technical Architecture Blueprint.pdf`, url: "#", type: "PDF", size: "3.4 MB" },
        { title: `${moduleTitle} - Production Starter Template.zip`, url: "#", type: "ZIP", size: "1.2 MB" },
      ],
      order: 1,
      isCompleted: false,
      progressSeconds: 0,
    },
    {
      id: `${moduleId}-lec-2`,
      title: `${modNum}.2 System Blueprint & Architecture Deep Dive`,
      type: "concept",
      duration: "14 min",
      description: `In-depth breakdown of network topology, caching strategies, and resilience metrics for ${moduleTitle}.`,
      notesContent: `# ${moduleTitle}: Architecture Deep Dive\n\n- Zero-trust service mesh\n- Sub-millisecond distributed cache invalidation\n- Health check monitors & dynamic load balancing`,
      starterFileName: `${moduleTitle} - Architecture Blueprint.pdf`,
      starterFileUrl: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf",
      resources: [
        { title: `${moduleTitle} - Blueprint Reference.pdf`, url: "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf", type: "PDF", size: "2.1 MB" },
      ],
      order: 2,
      isCompleted: false,
      progressSeconds: 0,
    },
    {
      id: `${moduleId}-lec-3`,
      title: `${modNum}.3 Knowledge Checkpoint & Skill Validation`,
      type: "quiz",
      duration: "10 min",
      description: `Test your mastery of ${moduleTitle} with interactive scenario-based challenges.`,
      quizQuestions: [
        {
          id: 1,
          question: `Which deployment strategy guarantees zero downtime during continuous service upgrades?`,
          options: [
            { id: "A", text: "Blue/Green deployment with automated traffic shifting and health probes" },
            { id: "B", text: "Hard server restart during peak usage hours" },
            { id: "C", text: "Direct live database schema destruction" },
            { id: "D", text: "Manual file copy over SSH without replication" },
          ],
          correct: "A",
          explanation: "Blue/Green environments allow instant traffic cutover only after synthetic health checks pass 100%.",
        },
      ],
      order: 3,
      isCompleted: false,
      progressSeconds: 0,
    },
    {
      id: `${moduleId}-lec-4`,
      title: `${modNum}.4 Live Code Sandbox & Hands-On Lab`,
      type: "code",
      duration: "20 min",
      description: `Hands-on interactive lab: Write, compile, and execute live code against simulated workloads.`,
      sandboxLang: "python",
      sandboxCode: `# Production ${moduleTitle} Sandbox Exercise\ndef run_pipeline():\n    steps = ["Ingest", "Transform", "Validate", "Persist"]\n    for i, step in enumerate(steps, 1):\n        print(f"[{i}/{len(steps)}] Executing: {step}...")\n    return {"status": "SUCCESS", "records_processed": 10000}\n\noutput = run_pipeline()\nprint("Pipeline Result:", output)\n`,
      order: 4,
      isCompleted: false,
      progressSeconds: 0,
    },
  ];
}

export default async function LearnPage({ params }: PageProps) {
  const { courseId } = await params;
  const decodedCourseId = decodeURIComponent(courseId);

  // =========================================================================
  // 1. CHECK DATABASE FOR COURSE & TYPE DETERMINATION
  // =========================================================================
  try {
    const dbCourse = await prisma.course.findFirst({
      where: {
        OR: [{ id: decodedCourseId }, { title: decodedCourseId }],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lectures: {
              orderBy: { order: "asc" },
              include: { videoAsset: true },
            },
          },
        },
      },
    });

    if (dbCourse) {
      // If course is explicitly marked as INTERACTIVE_LAB in database
      if (dbCourse.courseFormat === "INTERACTIVE_LAB") {
        const dbJsonData = getCourseData(dbCourse.id) || getCourseData(dbCourse.title);
        if (dbJsonData && Array.isArray(dbJsonData.lessons) && dbJsonData.lessons.length > 0) {
          return <LearningLayout courseData={dbJsonData} />;
        }
      }

      const hasDbLectures = dbCourse.modules.some((m) => m.lectures && m.lectures.length > 0);

      // Only fallback to legacy JSON interactive course if DB has zero lectures AND an exact JSON course exists
      if (!hasDbLectures) {
        const dbJsonData = getCourseData(dbCourse.id) || getCourseData(dbCourse.title);
        if (dbJsonData && Array.isArray(dbJsonData.lessons) && dbJsonData.lessons.length > 0) {
          return <LearningLayout courseData={dbJsonData} />;
        }
      }

      // =========================================================================
      // TYPE 2: VIDEO-BASED / ON-DEMAND STUDIO COURSE
      // =========================================================================
      const session = await getSession();

      // Fetch user's video progress
      const allLectureIds = dbCourse.modules.flatMap((m) => m.lectures.map((l) => l.id));
      let progressMap: Record<string, { progressSeconds: number; isCompleted: boolean }> = {};
      let userNotes: any[] = [];
      let lastActivity: any = null;

      if (session) {
        if (allLectureIds.length > 0) {
          const progressList = await prisma.videoProgress.findMany({
            where: {
              userId: session.id,
              lectureId: { in: allLectureIds },
            },
          });

          progressList.forEach((p) => {
            progressMap[p.lectureId] = {
              progressSeconds: p.progressSeconds,
              isCompleted: p.isCompleted,
            };
          });

          userNotes = await prisma.studentNote.findMany({
            where: {
              userId: session.id,
              lectureId: { in: allLectureIds },
            },
            orderBy: { createdAt: "desc" },
          });
        }

        try {
          const firstLectureTitle = dbCourse.modules[0]?.lectures[0]?.title || "Course Foundations";
          lastActivity = await prisma.userActivity.upsert({
            where: {
              userId_courseId: {
                userId: session.id,
                courseId: dbCourse.id,
              },
            },
            update: {
              updatedAt: new Date(),
              accessedAt: new Date(),
            },
            create: {
              userId: session.id,
              courseId: dbCourse.id,
              lastLectureTitle: firstLectureTitle,
              lastTimestamp: 0,
              totalSeconds: 0,
            },
          });
        } catch {
          lastActivity = await prisma.userActivity.findFirst({
            where: {
              userId: session.id,
              OR: [{ courseId: dbCourse.id }, { courseId: decodedCourseId }],
            },
            orderBy: { updatedAt: "desc" },
          }).catch(() => null);
        }
      }

      const safeJsonParse = (val: any, fallback: any = null) => {
        if (!val) return fallback;
        if (typeof val === "object") return val;
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      };

      // Prepare modules: if empty, create structured default modules
      let rawModules = dbCourse.modules;
      if (!rawModules || rawModules.length === 0) {
        rawModules = [
          { id: `${dbCourse.id}-mod-1`, title: "Module 1: Foundations & Architecture", order: 1, lectures: [] } as any,
          { id: `${dbCourse.id}-mod-2`, title: "Module 2: Advanced Implementation & Graph Systems", order: 2, lectures: [] } as any,
          { id: `${dbCourse.id}-mod-3`, title: "Module 3: Production Deployment & Observability", order: 3, lectures: [] } as any,
        ];
      }

      const formattedModules = rawModules.map((m, mIdx) => {
        let lectures: StudioLecture[] = [];

        if (m.lectures && m.lectures.length > 0) {
          lectures = m.lectures.map((l) => {
            const prog = progressMap[l.id];
            return {
              id: l.id,
              title: l.title,
              type: l.type || "video",
              duration: l.duration || "15 min",
              videoUrl: l.videoUrl || null,
              description: l.description || null,
              notesContent: l.notesContent || null,
              articleContent: l.articleContent || null,
              imageUrl1: l.imageUrl1 || null,
              imageUrl2: l.imageUrl2 || null,
              imageCaption: l.imageCaption || null,
              sandboxLang: l.sandboxLang || "python",
              sandboxCode: l.sandboxCode || null,
              quizQuestions: safeJsonParse(l.quizQuestions, []),
              resources: safeJsonParse(l.resources, []),
              starterFileName: l.starterFileName || null,
              starterFileUrl: l.starterFileUrl || null,
              assignmentBrief: l.assignmentBrief || null,
              order: l.order,
              isCompleted: Boolean(prog?.isCompleted),
              progressSeconds: prog?.progressSeconds || 0,
              videoAsset: (l as any).videoAsset || null,
            };
          });
        } else {
          // Enrich empty module with structured masterclass lessons
          lectures = generateFallbackLecturesForModule(
            m.id,
            m.title,
            mIdx,
            dbCourse.title,
            dbCourse.category
          );
        }

        return {
          id: m.id,
          title: m.title,
          order: m.order,
          lectures,
        };
      });

      const formattedCourse: StudioCourse = {
        id: dbCourse.id,
        title: dbCourse.title,
        subtitle: dbCourse.subtitle,
        description: dbCourse.description,
        category: dbCourse.category,
        level: dbCourse.level,
        duration: dbCourse.duration,
        price: dbCourse.price,
        instructor: {
          id: dbCourse.instructor?.id,
          name: dbCourse.instructor?.name || "Glarus Instructor",
          email: dbCourse.instructor?.email,
          avatar: dbCourse.instructor?.avatar,
        },
        learningOutcomes: safeJsonParse(dbCourse.learningOutcomes, []),
        projects: safeJsonParse(dbCourse.projects, []),
        faqs: safeJsonParse(dbCourse.faqs, []),
        features: safeJsonParse(dbCourse.features, []),
        modules: formattedModules,
      };

      return (
        <PremiumLearningStudio
          course={formattedCourse}
          user={
            session
              ? {
                  id: session.id,
                  name: session.name || "Student",
                  email: session.email,
                  role: session.role,
                }
              : undefined
          }
          initialNotes={userNotes.map((n) => ({
            id: n.id,
            lectureId: n.lectureId,
            timestampSeconds: n.timestampSeconds,
            content: n.content,
            createdAt: n.createdAt.toISOString(),
          }))}
          lastLectureId={lastActivity?.lastLectureId || null}
          lastTimestamp={lastActivity?.lastTimestamp || 0}
        />
      );
    }

    // =========================================================================
    // 3. TYPE 1: LIVE COURSE
    // =========================================================================
    const liveCourse = await prisma.liveCourse.findFirst({
      where: {
        OR: [{ id: decodedCourseId }, { slug: decodedCourseId }, { title: decodedCourseId }],
      },
    });

    if (liveCourse) {
      redirect(`/live-classes/${liveCourse.slug || liveCourse.id}`);
    }
  } catch (err) {
    console.error("[Learn Page DB Lookup Notice]:", err);
  }

  // =========================================================================
  // 4. FALLBACK TO ASYNC JSON LOADER
  // =========================================================================
  const legacyCourseData = await getCourseDataAsync(decodedCourseId);

  if (!legacyCourseData) {
    notFound();
  }

  return <LearningLayout courseData={legacyCourseData} />;
}
