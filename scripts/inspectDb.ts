import prisma from '../src/lib/db';

async function main() {
  console.log('==============================================');
  console.log('🔍 DATABASE INSPECTION REPORT (PostgreSQL)');
  console.log('==============================================\n');

  // 1. SessionAssignment Columns
  console.log('📋 Columns in "SessionAssignment" Table:');
  const cols: any = await prisma.$queryRaw`
    SELECT column_name, data_type, column_default, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'SessionAssignment' 
    ORDER BY ordinal_position;
  `;
  console.table(cols);

  // 2. Indexes on SessionAssignment
  console.log('\n⚡ Indexes on "SessionAssignment" Table:');
  const indexes: any = await prisma.$queryRaw`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'SessionAssignment';
  `;
  console.table(indexes);

  // 3. Key Table Record Counts
  console.log('\n📊 Table Record Counts:');
  const [users, courses, liveCourses, sessions, assignments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.liveCourse.count(),
    prisma.liveSession.count(),
    prisma.sessionAssignment.count(),
  ]);

  console.table([
    { Table: 'User', TotalRecords: users },
    { Table: 'Course (Self-Paced)', TotalRecords: courses },
    { Table: 'LiveCourse', TotalRecords: liveCourses },
    { Table: 'LiveSession', TotalRecords: sessions },
    { Table: 'SessionAssignment', TotalRecords: assignments },
  ]);

  // 4. Sample SessionAssignment rows
  const sampleAssignments = await prisma.sessionAssignment.findMany({
    take: 3,
    select: {
      id: true,
      instructorId: true,
      liveCourseId: true,
      assignmentRole: true,
      isSubstitute: true,
      canEdit: true,
      canReschedule: true,
    }
  });

  console.log('\n🔍 Sample Data in "SessionAssignment":');
  console.table(sampleAssignments);
}

main()
  .catch(err => {
    console.error('Inspection Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
