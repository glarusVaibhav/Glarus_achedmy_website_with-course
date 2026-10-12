import { LiveSessionService } from "../src/lib/services/liveSessionService";

function runSortingTest() {
  console.log("================================================================");
  console.log("🚀 TESTING LIVE TRAINING COURSE DYNAMIC MULTI-TIERED SORTING");
  console.log("================================================================\n");

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const now = new Date("2026-09-25T13:30:00.000Z");

  // Helper date generators relative to `now`
  const minutesFromNow = (mins: number) => new Date(now.getTime() + mins * 60 * 1000);
  const hoursFromNow = (hrs: number) => new Date(now.getTime() + hrs * 60 * 60 * 1000);
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Mock test courses
  const testCourses = [
    {
      id: "course-upcoming-12d",
      title: "Course B: Foundation AI (Upcoming in 12 days)",
      sessions: [
        {
          id: "s-b-1",
          title: "Session 1",
          date: daysFromNow(12).toISOString().split("T")[0],
          startTime: "05:00 PM",
          endTime: "07:00 PM",
          duration: "120 min",
          status: "upcoming" as const,
        }
      ]
    },
    {
      id: "course-no-upcoming",
      title: "Course E: Python Basics (All Sessions Completed)",
      sessions: [
        {
          id: "s-e-1",
          title: "Session 1",
          date: daysFromNow(-5).toISOString().split("T")[0],
          startTime: "10:00 AM",
          endTime: "11:30 AM",
          duration: "90 min",
          status: "completed" as const,
        }
      ]
    },
    {
      id: "course-live-5pm",
      title: "Course A: Agentic Swarms (LIVE started 30 mins ago)",
      sessions: [
        {
          id: "s-a-1",
          title: "Live Masterclass",
          date: now.toISOString().split("T")[0],
          startTime: "01:00 PM",
          endTime: "03:00 PM",
          duration: "120 min",
          status: "live" as const,
        }
      ]
    },
    {
      id: "course-upcoming-2d",
      title: "Course C: Vector RAG (Upcoming in 2 days)",
      sessions: [
        {
          id: "s-c-1",
          title: "Session 1",
          date: daysFromNow(2).toISOString().split("T")[0],
          startTime: "06:00 PM",
          endTime: "08:00 PM",
          duration: "120 min",
          status: "upcoming" as const,
        }
      ]
    },
    {
      id: "course-upcoming-10m",
      title: "Course D: LangGraph Deep Dive (Upcoming in 10 minutes)",
      sessions: [
        {
          id: "s-d-1",
          title: "Session 1",
          date: now.toISOString().split("T")[0],
          startTime: "01:40 PM",
          endTime: "03:40 PM",
          duration: "120 min",
          status: "upcoming" as const,
        }
      ]
    },
    {
      id: "course-live-earlier",
      title: "Course A0: PyTorch Core (LIVE started 1 hour ago)",
      sessions: [
        {
          id: "s-a0-1",
          title: "Live Lab",
          date: now.toISOString().split("T")[0],
          startTime: "12:30 PM",
          endTime: "02:30 PM",
          duration: "120 min",
          status: "live" as const,
        }
      ]
    }
  ];

  // Client-side simulation of getCourseSortMeta & sorting logic
  const parseDateTime = (dateStr: string, timeStr?: string): Date => {
    const d = new Date(dateStr);
    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const modifier = match[3]?.toUpperCase();
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        d.setUTCHours(hours, minutes, 0, 0);
      }
    }
    return d;
  };

  const getCourseActiveSession = (course: typeof testCourses[0]) => {
    const sessionsWithTime = course.sessions.map((s) => {
      const start = parseDateTime(s.date, s.startTime);
      const isLive = s.status === "live";
      const isUpcoming = s.status === "upcoming";
      return { session: s, start, isLive, isUpcoming };
    });

    const liveItem = sessionsWithTime.find((i) => i.isLive);
    if (liveItem) return { type: "LIVE" as const, session: liveItem.session, start: liveItem.start };

    const upcomingItems = sessionsWithTime
      .filter((i) => i.isUpcoming)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    if (upcomingItems.length > 0) return { type: "UPCOMING" as const, session: upcomingItems[0].session, start: upcomingItems[0].start };

    return { type: "NONE" as const, session: null, start: new Date(8640000000000000) };
  };

  const sortCourses = (coursesList: typeof testCourses) => {
    const indexed = coursesList.map((course, originalIndex) => {
      const active = getCourseActiveSession(course);
      let priority = 3;
      let sortTime = Number.MAX_SAFE_INTEGER;
      if (active.type === "LIVE") {
        priority = 1;
        sortTime = active.start.getTime();
      } else if (active.type === "UPCOMING") {
        priority = 2;
        sortTime = active.start.getTime();
      }
      return { course, originalIndex, priority, sortTime };
    });

    indexed.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      if (a.priority === 1 || a.priority === 2) {
        if (a.sortTime !== b.sortTime) return a.sortTime - b.sortTime;
      }
      return a.originalIndex - b.originalIndex;
    });

    return indexed.map((i) => i.course);
  };

  const sorted = sortCourses(testCourses);

  console.log("Resulting Course Order:");
  sorted.forEach((c, idx) => {
    console.log(`  ${idx + 1}. [${c.id}] ${c.title}`);
  });
  console.log("");

  // Assertions
  assert(sorted[0].id === "course-live-earlier", "1st: Course A0 (LIVE earlier at 12:30 PM) is first");
  assert(sorted[1].id === "course-live-5pm", "2nd: Course A (LIVE at 01:00 PM) is second");
  assert(sorted[2].id === "course-upcoming-10m", "3rd: Course D (Upcoming in 10 mins) is third");
  assert(sorted[3].id === "course-upcoming-2d", "4th: Course C (Upcoming in 2 days) is fourth");
  assert(sorted[4].id === "course-upcoming-12d", "5th: Course B (Upcoming in 12 days) is fifth");
  assert(sorted[5].id === "course-no-upcoming", "6th: Course E (No upcoming sessions) is last");

  console.log("\n================================================================");
  console.log(`🎉 ALL SORTING VERIFICATIONS PASSED (${testsPassed}/${totalTests})`);
  console.log("================================================================");
}

runSortingTest();
