import { getSessionResourceDetails, LiveCourseSession } from '../src/app/calendar/page';

function runTestSuite() {
  console.log("===============================================================");
  console.log("TESTING DYNAMIC COURSE NOTIFICATIONS COMPONENT LOGIC");
  console.log("===============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  // CASE 1: PDF ONLY
  console.log("--- Test Case 1: PDF ONLY ---");
  const case1: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    resources: [{ id: "r1", title: "Prompt Engineering Slides", type: "PDF", url: "https://example.com/slides.pdf" }]
  };
  const res1 = getSessionResourceDetails(case1);
  assert(res1.hasPdf === true, "PDF flag is true");
  assert(res1.hasVideo === false, "Video flag is false");
  assert(res1.hasQuiz === false, "Quiz flag is false");
  assert(res1.hasAssignment === false, "Assignment flag is false");
  assert(res1.resourceCount === 1, "Resource count is 1");
  assert(
    res1.description === "Access the downloadable PDF slides for Prompt Engineering Fundamentals.",
    `Description matches: "${res1.description}"`
  );

  // CASE 2: VIDEO ONLY
  console.log("\n--- Test Case 2: VIDEO ONLY ---");
  const case2: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    recordingUrl: "https://zoom.us/rec/play/12345"
  };
  const res2 = getSessionResourceDetails(case2);
  assert(res2.hasVideo === true, "Video flag is true");
  assert(res2.hasPdf === false, "PDF flag is false");
  assert(res2.hasQuiz === false, "Quiz flag is false");
  assert(res2.hasAssignment === false, "Assignment flag is false");
  assert(res2.resourceCount === 1, "Resource count is 1");
  assert(
    res2.description === "Access your recorded video lecture for Prompt Engineering Fundamentals.",
    `Description matches: "${res2.description}"`
  );

  // CASE 3: QUIZ ONLY
  console.log("\n--- Test Case 3: QUIZ ONLY ---");
  const case3: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    resources: [{ id: "r3", title: "Knowledge Quiz", type: "QUIZ", url: "https://example.com/quiz" }]
  };
  const res3 = getSessionResourceDetails(case3);
  assert(res3.hasQuiz === true, "Quiz flag is true");
  assert(res3.hasVideo === false, "Video flag is false");
  assert(res3.hasPdf === false, "PDF flag is false");
  assert(res3.hasAssignment === false, "Assignment flag is false");
  assert(res3.resourceCount === 1, "Resource count is 1");
  assert(
    res3.description === "Access the interactive quiz for Prompt Engineering Fundamentals.",
    `Description matches: "${res3.description}"`
  );

  // CASE 4: ASSIGNMENT ONLY
  console.log("\n--- Test Case 4: ASSIGNMENT ONLY ---");
  const case4: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    homework: [{ id: "h1", title: "Custom Agent Implementation Challenge", description: "Build an agent" }]
  };
  const res4 = getSessionResourceDetails(case4);
  assert(res4.hasAssignment === true, "Assignment flag is true");
  assert(res4.hasVideo === false, "Video flag is false");
  assert(res4.hasPdf === false, "PDF flag is false");
  assert(res4.hasQuiz === false, "Quiz flag is false");
  assert(res4.resourceCount === 1, "Resource count is 1");
  assert(
    res4.description === "Access the assignment for Prompt Engineering Fundamentals.",
    `Description matches: "${res4.description}"`
  );

  // CASE 5: PDF + QUIZ
  console.log("\n--- Test Case 5: PDF + QUIZ ---");
  const case5: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    resources: [
      { id: "r1", title: "Slides.pdf", type: "PDF", url: "https://example.com/slides.pdf" },
      { id: "r2", title: "Knowledge Quiz", type: "QUIZ", url: "https://example.com/quiz" }
    ]
  };
  const res5 = getSessionResourceDetails(case5);
  assert(res5.hasPdf === true && res5.hasQuiz === true, "PDF and Quiz are true");
  assert(res5.hasVideo === false && res5.hasAssignment === false, "Video and Assignment are false");
  assert(res5.resourceCount === 2, "Resource count is 2");
  assert(
    res5.description === "Access the downloadable PDF slides and interactive quiz for Prompt Engineering Fundamentals.",
    `Description matches: "${res5.description}"`
  );

  // CASE 6: VIDEO + PDF + ASSIGNMENT
  console.log("\n--- Test Case 6: VIDEO + PDF + ASSIGNMENT ---");
  const case6: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    recordingUrl: "https://example.com/video.mp4",
    resources: [{ id: "r1", title: "Deck.pdf", type: "PDF", url: "https://example.com/deck.pdf" }],
    homework: [{ id: "h1", title: "Capstone Project", description: "Submit github URL" }]
  };
  const res6 = getSessionResourceDetails(case6);
  assert(res6.hasVideo === true && res6.hasPdf === true && res6.hasAssignment === true, "Video, PDF, and Assignment are true");
  assert(res6.hasQuiz === false, "Quiz is false");
  assert(res6.resourceCount === 3, "Resource count is 3");
  assert(
    res6.description === "Access your recorded video lecture, downloadable PDF slides, and assignment for Prompt Engineering Fundamentals.",
    `Description matches: "${res6.description}"`
  );

  // CASE 7: ALL RESOURCES (VIDEO + PDF + QUIZ + ASSIGNMENT)
  console.log("\n--- Test Case 7: ALL RESOURCES ---");
  const case7: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    recordingUrl: "https://example.com/video.mp4",
    resources: [
      { id: "r1", title: "Deck.pdf", type: "PDF", url: "https://example.com/deck.pdf" },
      { id: "r2", title: "Check.quiz", type: "QUIZ", url: "https://example.com/quiz" }
    ],
    homework: [{ id: "h1", title: "Build Capstone", description: "Submit repo" }]
  };
  const res7 = getSessionResourceDetails(case7);
  assert(res7.hasVideo && res7.hasPdf && res7.hasQuiz && res7.hasAssignment, "All 4 resource flags are true");
  assert(res7.resourceCount === 4, "Resource count is 4");
  assert(
    res7.description === "Access your recorded video lecture, downloadable PDF slides, interactive quiz, and assignment for Prompt Engineering Fundamentals.",
    `Description matches: "${res7.description}"`
  );

  // CASE 8: NO RESOURCES
  console.log("\n--- Test Case 8: NO RESOURCES ---");
  const case8: Partial<LiveCourseSession> = {
    title: "Prompt Engineering Fundamentals",
    resources: [],
    homework: []
  };
  const res8 = getSessionResourceDetails(case8);
  assert(!res8.hasVideo && !res8.hasPdf && !res8.hasQuiz && !res8.hasAssignment, "All resource flags are false");
  assert(res8.hasAnyResource === false, "hasAnyResource is false");
  assert(res8.resourceCount === 0, "Resource count is 0");
  assert(
    res8.description === "Review completed session materials for Prompt Engineering Fundamentals.",
    `Description matches: "${res8.description}"`
  );

  console.log("\n===============================================================");
  console.log(`SUMMARY: ${passed} / ${total} tests passed!`);
  console.log("===============================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite();
