import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface CalendarEvent {
  id: string;
  title: string;
  instructor: string;
  courseTitle: string;
  batchName: string;
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
  duration: string;
  status: "live" | "upcoming" | "completed" | "rescheduled";
  meetingLink: string;
  recordingUrl?: string;
  description?: string;
}

export async function GET() {
  try {
    const session = await getSession();
    // Allow viewing for authenticated student or guest preview
    const userId = session?.id as string | undefined;

    let dbEvents: CalendarEvent[] = [];

    if (userId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          course: { type: "INSTRUCTOR_LED" },
        },
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              batches: {
                include: {
                  liveClasses: true,
                },
              },
            },
          },
        },
      });

      const now = new Date();

      enrollments.forEach((en) => {
        en.course.batches.forEach((batch) => {
          batch.liveClasses.forEach((lc) => {
            const classDate = new Date(lc.date);
            const dateStr = classDate.toISOString().split("T")[0];
            const nowTime = now.getTime();
            const classTime = classDate.getTime();

            let status: "live" | "upcoming" | "completed" | "rescheduled" = "upcoming";
            if (classTime <= nowTime && classTime >= nowTime - 2 * 60 * 60 * 1000) {
              status = "live";
            } else if (classTime < nowTime - 2 * 60 * 60 * 1000) {
              status = "completed";
            }

            dbEvents.push({
              id: lc.id,
              title: lc.title,
              instructor: en.course.instructor?.name || "Senior AI Instructor",
              courseTitle: en.course.title,
              batchName: batch.name || "Main Batch",
              date: dateStr,
              startTime: classDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              endTime: new Date(classTime + 90 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              duration: "90 Minutes",
              status,
              meetingLink: lc.meetingLink || "https://zoom.us/j/sample-meeting",
            });
          });
        });
      });
    }

    // Default sample events for August 2026 to guarantee rich calendar demonstration
    const sampleEvents: CalendarEvent[] = [
      {
        id: "ev-live-1",
        title: "Deep Learning & Neural Network Architecture (Live Workshop)",
        courseTitle: "Generative AI & LLM Systems",
        instructor: "Dr. Alex Vance",
        batchName: "Weekend AI Class #4",
        date: "2026-08-04",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 Hours",
        status: "live",
        meetingLink: "https://zoom.us/j/sample-ongoing-live-class",
        description: "Hands-on deep dive into transformer attention mechanisms and custom PyTorch neural networks."
      },
      {
        id: "ev-upcoming-1",
        title: "RAG Indexing, Vector Databases & LangChain Agents",
        courseTitle: "Advanced Generative AI Masterclass",
        instructor: "Elena Rostova",
        batchName: "AI Fast-Track Batch A",
        date: "2026-08-04",
        startTime: "12:45 PM",
        endTime: "02:15 PM",
        duration: "90 Minutes",
        status: "upcoming",
        meetingLink: "https://zoom.us/j/sample-upcoming-live-class",
        description: "Implementing hierarchical vector chunking and hybrid search using Pinecone and ChromaDB."
      },
      {
        id: "ev-upcoming-2",
        title: "Prompt Engineering & Advanced Few-Shot Prompting",
        courseTitle: "Generative AI & LLM Systems",
        instructor: "Dr. Alex Vance",
        batchName: "Weekend AI Class #4",
        date: "2026-08-06",
        startTime: "04:00 PM",
        endTime: "05:30 PM",
        duration: "90 Minutes",
        status: "upcoming",
        meetingLink: "https://zoom.us/j/sample-aug6",
        description: "Chain-of-thought, tree-of-thoughts, and automated prompt optimization algorithms."
      },
      {
        id: "ev-upcoming-3",
        title: "Fine-Tuning Llama 3 & QLoRA Models on Custom Datasets",
        courseTitle: "Full Stack AI Development",
        instructor: "Prof. Marcus Thorne",
        batchName: "Enterprise AI Batch #2",
        date: "2026-08-10",
        startTime: "11:00 AM",
        endTime: "01:00 PM",
        duration: "2 Hours",
        status: "upcoming",
        meetingLink: "https://zoom.us/j/sample-aug10",
        description: "PEFT, LoRA adapters, quantization, and deploying fine-tuned models to production endpoints."
      },
      {
        id: "ev-upcoming-4",
        title: "Building Multi-Agent Systems with CrewAI and AutoGen",
        courseTitle: "Advanced Generative AI Masterclass",
        instructor: "Elena Rostova",
        batchName: "AI Fast-Track Batch A",
        date: "2026-08-15",
        startTime: "02:00 PM",
        endTime: "04:00 PM",
        duration: "2 Hours",
        status: "upcoming",
        meetingLink: "https://zoom.us/j/sample-aug15",
        description: "Designing autonomous multi-agent systems with tool calling, memory state, and human-in-the-loop fallback."
      },
      {
        id: "ev-rescheduled-1",
        title: "LLM Evaluation & Benchmarking Frameworks",
        courseTitle: "Generative AI & LLM Systems",
        instructor: "Dr. Alex Vance",
        batchName: "Weekend AI Class #4",
        date: "2026-08-18",
        startTime: "06:00 PM",
        endTime: "07:30 PM",
        duration: "90 Minutes",
        status: "rescheduled",
        meetingLink: "https://zoom.us/j/sample-aug18",
        description: "Ragas, DeepEval, and automated LLM-as-a-judge evaluation pipelines."
      },
      {
        id: "ev-upcoming-5",
        title: "Deploying AI Apps to Kubernetes & Serverless GPU Infrastructure",
        courseTitle: "Full Stack AI Development",
        instructor: "Prof. Marcus Thorne",
        batchName: "Enterprise AI Batch #2",
        date: "2026-08-22",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 Hours",
        status: "upcoming",
        meetingLink: "https://zoom.us/j/sample-aug22",
        description: "vLLM, Ray Serve, Modal, and autoscaling GPU inference clusters."
      },
      {
        id: "ev-completed-1",
        title: "Introduction to Transformer Architectures & Attention",
        courseTitle: "Generative AI & LLM Systems",
        instructor: "Dr. Alex Vance",
        batchName: "Weekend AI Class #4",
        date: "2026-08-01",
        startTime: "10:00 AM",
        endTime: "12:00 PM",
        duration: "2 Hours",
        status: "completed",
        meetingLink: "https://zoom.us/j/sample-aug1",
        recordingUrl: "https://example.com/recordings/aug-1-transformers",
        description: "Math and implementation of Scaled Dot-Product Attention and Multi-Head Attention."
      },
      {
        id: "ev-completed-2",
        title: "Embeddings, Vector Spaces & Cosine Similarity",
        courseTitle: "Advanced Generative AI Masterclass",
        instructor: "Elena Rostova",
        batchName: "AI Fast-Track Batch A",
        date: "2026-08-02",
        startTime: "02:00 PM",
        endTime: "03:30 PM",
        duration: "90 Minutes",
        status: "completed",
        meetingLink: "https://zoom.us/j/sample-aug2",
        recordingUrl: "https://example.com/recordings/aug-2-embeddings",
        description: "Generating text & multimodal embeddings and calculating vector distance metrics."
      }
    ];

    // Merge database events with sample events (prevent duplicates by ID or title+date)
    const allEvents = [...dbEvents];
    sampleEvents.forEach((se) => {
      const exists = allEvents.some(
        (e) => e.id === se.id || (e.title === se.title && e.date === se.date)
      );
      if (!exists) {
        allEvents.push(se);
      }
    });

    return NextResponse.json({ events: allEvents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
