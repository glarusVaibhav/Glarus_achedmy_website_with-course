import prisma from '../src/lib/db';

async function main() {
  const perms = await prisma.instructorCoursePermission.findMany({
    include: {
      instructor: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  console.log('Current instructorCoursePermission records:');
  console.table(perms.map(p => ({
    id: p.id,
    instructorId: p.instructorId,
    instructorName: p.instructor?.name,
    instructorEmail: p.instructor?.email,
    status: p.status,
    canCreateCourse: p.canCreateCourse,
    requestedAt: p.requestedAt,
  })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
