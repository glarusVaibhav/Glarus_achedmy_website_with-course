import prisma from '@/lib/db';

export class CertificateService {
  /**
   * Retrieves all verified certificates issued to the student.
   */
  static async getStudentCertificates(userId: string) {
    const certs = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          include: { instructor: { select: { name: true } } },
        },
        liveCourse: {
          include: { leadInstructor: { select: { name: true } } },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    const certificates = certs.map((c) => {
      const title = c.course?.title || c.liveCourse?.title || 'Generative AI Engineering Certification';
      const instructorName = c.course?.instructor?.name || c.liveCourse?.leadInstructor?.name || 'Dr. Alex Vance';
      const credentialId = c.credentialId || `GA-${c.id.slice(0, 8).toUpperCase()}`;

      return {
        id: c.id,
        courseId: c.courseId || c.liveCourseId || c.id,
        title,
        instructor: instructorName,
        issueDate: c.issueDate.toISOString(),
        issueDateFormatted: c.issueDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        credentialId,
        verificationUrl: `/verify/${credentialId}`,
        downloadUrl: c.certificateUrl || `/api/student/certificates/${c.id}/download`,
        skills: [
          'Large Language Models (LLMs)',
          'Retrieval-Augmented Generation (RAG)',
          'LangChain & LangGraph',
          'PyTorch Neural Networks',
          'Autonomous AI Agents',
        ],
      };
    });

    return { certificates };
  }

  /**
   * Evaluates course completion and issues certificate if 100% completed.
   */
  static async issueCertificateIfEligible(userId: string, courseId: string, isLive = false) {
    if (isLive) {
      const enrollment = await prisma.liveCourseEnrollment.findUnique({
        where: { userId_liveCourseId: { userId, liveCourseId: courseId } },
      });

      if (!enrollment || enrollment.progress < 100) {
        return null;
      }

      const existingCert = await prisma.certificate.findFirst({
        where: { userId, liveCourseId: courseId },
      });

      if (existingCert) return existingCert;

      const credentialId = `GA-LIVE-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      return await prisma.certificate.create({
        data: {
          userId,
          liveCourseId: courseId,
          credentialId,
          issueDate: new Date(),
        },
      });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment || enrollment.progress < 100) {
      return null;
    }

    const existingCert = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existingCert) return existingCert;

    const credentialId = `GA-CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    return await prisma.certificate.create({
      data: {
        userId,
        courseId,
        credentialId,
        issueDate: new Date(),
      },
    });
  }
}
