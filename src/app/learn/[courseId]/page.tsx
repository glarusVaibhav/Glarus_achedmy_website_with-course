import { LearningLayout } from '@/components/layout/LearningLayout';
import { notFound } from 'next/navigation';
import { getCourseData } from '@/lib/courses/course-loader';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnPage({ params }: PageProps) {
  const { courseId } = await params;
  const decodedCourseId = decodeURIComponent(courseId);

  const courseData = getCourseData(decodedCourseId);

  if (!courseData) {
    notFound();
  }

  return <LearningLayout courseData={courseData} />;
}
