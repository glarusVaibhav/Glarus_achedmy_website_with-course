import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDateForInput,
  formatTimeForInput,
  parseDate,
  parseTime,
  combineDateAndTime,
  validateTimeRange,
  validateDateRange,
} from "../dateTime";

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`FAIL: ${message} - Expected "${expected}", got "${actual}"`);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runTests() {
  console.log("=== Running Date/Time Standardization Unit Tests ===\n");

  // 1. Date Formatting Tests ("DD MMM YYYY")
  console.log("--- Test 1: Date Formatting ---");
  assertEqual(formatDate("2026-09-10"), "10 Sep 2026", "Standard date YYYY-MM-DD");
  assertEqual(formatDate("2026-01-05"), "05 Jan 2026", "Single digit day/month");
  assertEqual(formatDate("2026-12-31"), "31 Dec 2026", "Year end date");
  assertEqual(formatDate(new Date(2026, 8, 10)), "10 Sep 2026", "Date object (Sep 10, 2026)");
  assertEqual(formatDate(null, "TBA"), "TBA", "Null date fallback");
  assertEqual(formatDate("", "Not Set"), "Not Set", "Empty date fallback");

  // 2. Time Formatting Tests ("hh:mm AM/PM")
  console.log("\n--- Test 2: Time Formatting ---");
  assertEqual(formatTime("11:00"), "11:00 AM", "24h morning time 11:00");
  assertEqual(formatTime("21:00"), "09:00 PM", "24h evening time 21:00");
  assertEqual(formatTime("09:00"), "09:00 AM", "24h single-digit morning 09:00");
  assertEqual(formatTime("14:30"), "02:30 PM", "24h afternoon time 14:30");
  assertEqual(formatTime("00:00"), "12:00 AM", "Midnight 00:00 -> 12:00 AM");
  assertEqual(formatTime("12:00"), "12:00 PM", "Noon 12:00 -> 12:00 PM");
  assertEqual(formatTime("12:30"), "12:30 PM", "Afternoon 12:30 -> 12:30 PM");
  assertEqual(formatTime("23:59"), "11:59 PM", "Late night 23:59 -> 11:59 PM");
  assertEqual(formatTime("11:59"), "11:59 AM", "Morning end 11:59 -> 11:59 AM");
  assertEqual(formatTime("11:00 am"), "11:00 AM", "Lowercase 11:00 am -> 11:00 AM");
  assertEqual(formatTime("9:00 PM"), "09:00 PM", "Single-digit hour 9:00 PM -> 09:00 PM");
  assertEqual(formatTime("11am"), "11:00 AM", "Compact 11am -> 11:00 AM");

  // 3. DateTime Formatting Tests ("DD MMM YYYY, hh:mm AM/PM")
  console.log("\n--- Test 3: DateTime Formatting ---");
  assertEqual(
    formatDateTime(new Date(2026, 8, 10, 11, 0, 0)),
    "10 Sep 2026, 11:00 AM",
    "Combined Date object Sep 10, 2026 at 11:00"
  );
  assertEqual(
    formatDateTime(new Date(2026, 8, 10, 21, 0, 0)),
    "10 Sep 2026, 09:00 PM",
    "Combined Date object Sep 10, 2026 at 21:00"
  );

  // 4. Input Formatting Tests
  console.log("\n--- Test 4: Input Formatting ---");
  assertEqual(formatDateForInput("10 Sep 2026"), "2026-09-10", "Format for HTML date input");
  assertEqual(formatDateForInput("2026-09-10"), "2026-09-10", "Pass through standard date");
  assertEqual(formatTimeForInput("09:00 PM", "24h"), "21:00", "12h to 24h input");
  assertEqual(formatTimeForInput("11:00 AM", "24h"), "11:00", "12h morning to 24h input");
  assertEqual(formatTimeForInput("21:00", "12h"), "09:00 PM", "24h to 12h formatted");

  // 5. Time Range Validation
  console.log("\n--- Test 5: Time Range Validation ---");
  const validRange = validateTimeRange("11:00 AM", "09:00 PM");
  assertEqual(validRange.isValid, true, "11:00 AM to 09:00 PM is valid");

  const invalidRange = validateTimeRange("11:00 AM", "10:00 AM");
  assertEqual(invalidRange.isValid, false, "11:00 AM to 10:00 AM is invalid");
  assertEqual(invalidRange.error, "End time must be after start time", "Validation error message");

  const sameTime = validateTimeRange("11:00 AM", "11:00 AM");
  assertEqual(sameTime.isValid, false, "11:00 AM to 11:00 AM is invalid");

  // 6. Timezone Safety Test
  console.log("\n--- Test 6: Timezone Safety ---");
  const parsedLocal = parseDate("2026-09-10");
  assertEqual(parsedLocal?.getDate(), 10, "Parsed day must remain 10 without timezone shift");
  assertEqual(parsedLocal?.getMonth(), 8, "Parsed month must remain September (index 8)");
  assertEqual(parsedLocal?.getFullYear(), 2026, "Parsed year must remain 2026");

  console.log("\n==========================================");
  console.log("🎉 ALL DATE & TIME TESTS PASSED SUCCESSFULLY!");
  console.log("==========================================\n");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
