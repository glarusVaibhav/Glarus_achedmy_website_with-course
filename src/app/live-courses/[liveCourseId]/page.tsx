import { redirect } from "next/navigation";

export default async function LiveCourseRedirect({
  params,
}: {
  params: Promise<{ liveCourseId: string }>;
}) {
  const { liveCourseId } = await params;
  redirect(`/student/live-courses/${encodeURIComponent(liveCourseId)}`);
}
