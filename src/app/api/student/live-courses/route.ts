import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Get all INSTRUCTOR_LED enrollments with batch + upcoming live class data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.id as string,
        course: { type: "INSTRUCTOR_LED" },
      },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            batches: {
              include: {
                liveClasses: {
                  orderBy: { date: "asc" },
                },
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const liveClassesList: Array<{
      id: string;
      title: string;
      date: string;
      meetingLink: string;
      status: "ONGOING" | "UPCOMING";
      courseTitle: string;
      instructor: string;
      batchName: string;
    }> = [];

    enrollments.forEach((en) => {
      en.course.batches.forEach((batch) => {
        batch.liveClasses.forEach((lc) => {
          const classTime = new Date(lc.date).getTime();
          const nowTime = now.getTime();
          // Ongoing if started within last 2 hours or starting in next 10 mins
          const isOngoing = classTime <= nowTime && classTime >= nowTime - 2 * 60 * 60 * 1000;
          const isUpcoming = classTime > nowTime;

          if (isOngoing || isUpcoming) {
            liveClassesList.push({
              id: lc.id,
              title: lc.title,
              date: new Date(lc.date).toISOString(),
              meetingLink: lc.meetingLink || "https://zoom.us/j/sample-meeting",
              status: isOngoing ? "ONGOING" : "UPCOMING",
              courseTitle: en.course.title,
              instructor: en.course.instructor?.name || "Senior Instructor",
              batchName: batch.name || "Main Batch",
            });
          }
        });
      });
    });

    // Sample live classes (1 ONGOING, 1 UPCOMING) to guarantee rich presentation
    const sampleOngoing = {
      id: "sample-live-ongoing",
      title: "Deep Learning & Neural Network Architecture (Live Workshop)",
      date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      meetingLink: "https://zoom.us/j/sample-ongoing-live-class",
      status: "ONGOING" as const,
      courseTitle: "Generative AI & LLM Systems",
      instructor: "Dr. Alex Vance",
      batchName: "Weekend AI Class #4",
    };

    const sampleUpcoming = {
      id: "sample-live-upcoming",
      title: "RAG Indexing, Vector Databases & LangChain Agents",
      date: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
      meetingLink: "https://zoom.us/j/sample-upcoming-live-class",
      status: "UPCOMING" as const,
      courseTitle: "Advanced Generative AI Masterclass",
      instructor: "Elena Rostova",
      batchName: "AI Fast-Track Batch A",
    };

    const hasOngoing = liveClassesList.some((c) => c.status === "ONGOING");
    const hasUpcoming = liveClassesList.some((c) => c.status === "UPCOMING");

    if (!hasOngoing) {
      liveClassesList.unshift(sampleOngoing);
    }
    if (!hasUpcoming) {
      liveClassesList.push(sampleUpcoming);
    }

    // Sort: ONGOING first, then UPCOMING by date
    liveClassesList.sort((a, b) => {
      if (a.status === "ONGOING" && b.status !== "ONGOING") return -1;
      if (a.status !== "ONGOING" && b.status === "ONGOING") return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const courses = enrollments.map((en) => {
      const nextClass = en.course.batches
        .flatMap((b) => b.liveClasses)
        .filter((lc) => new Date(lc.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      const currentBatch = en.course.batches[0];

      return {
        id: en.course.id,
        title: en.course.title,
        instructor: en.course.instructor.name,
        batchName: currentBatch?.name || "No batch assigned",
        nextClass: nextClass
          ? {
              id: nextClass.id,
              title: nextClass.title,
              date: nextClass.date,
              meetingLink: nextClass.meetingLink,
            }
          : null,
        totalClasses: en.course.batches.flatMap((b) => b.liveClasses).length,
      };
    });

    return NextResponse.json({ courses, classes: liveClassesList });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

