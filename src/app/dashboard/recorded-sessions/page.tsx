import { redirect } from "next/navigation";

export default function DashboardRecordedSessionsRedirect() {
  redirect("/student/recorded-sessions");
}
