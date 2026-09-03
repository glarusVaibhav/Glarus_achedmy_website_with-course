import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const totalUsers = await prisma.user.count();
    const activeCourses = await prisma.course.count({ where: { status: 'APPROVED' } });

    const purchases = await prisma.purchase.findMany({
      include: { course: true, liveCourse: true },
    });
    const totalRevenue = purchases.reduce(
      (acc, p) => acc + (p.amount || p.course?.price || p.liveCourse?.price || 0),
      0
    );

    return NextResponse.json({
      totalUsers,
      activeCourses,
      totalRevenue,
      systemHealth: 99.9,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
