import prisma from '@/lib/db';
import { requireSessionEnrollment } from './studentAuthService';

export class AttendanceService {
  /**
   * Logs/updates student attendance for a live session.
   */
  static async recordAttendance(
    userId: string,
    sessionId: string,
    durationMinutes = 0,
    joinedLateMinutes = 0,
    notes?: string
  ) {
    // 1. Verify student enrollment
    await requireSessionEnrollment(userId, sessionId);

    const status = joinedLateMinutes > 15 ? 'LATE' : 'PRESENT';

    // 2. Upsert LiveSessionAttendance
    const attendance = await prisma.liveSessionAttendance.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: {
        status,
        durationMinutes: { increment: durationMinutes },
        joinedLateMinutes: joinedLateMinutes || undefined,
        leftAt: new Date(),
        notes: notes || undefined,
      },
      create: {
        sessionId,
        userId,
        status,
        durationMinutes,
        joinedLateMinutes,
        joinedAt: new Date(),
        notes,
      },
    });

    return attendance;
  }
}
