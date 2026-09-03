import prisma from '../lib/db';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function performDatabaseBackup() {
  console.log('\n===============================================================');
  console.log('💾 INITIATING FULL POSTGRESQL DATABASE BACKUP');
  console.log('===============================================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(process.cwd(), '..', 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. SQL Dump via pg_dump
  const sqlDumpFile = path.join(backupDir, `elearning_db_dump_${timestamp}.sql`);
  const latestSqlFile = path.join(backupDir, `elearning_db_latest.sql`);

  const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';

  try {
    console.log('⏳ Generating SQL Dump file with pg_dump...');
    execSync(
      `"${pgDumpPath}" -h 127.0.0.1 -p 5432 -U postgres -d elearning_db -F p -f "${sqlDumpFile}"`,
      {
        env: { ...process.env, PGPASSWORD: 'Gt@Ak@sh#1052' },
        stdio: 'inherit'
      }
    );
    // Also copy to latest
    fs.copyFileSync(sqlDumpFile, latestSqlFile);
    const sqlStats = fs.statSync(sqlDumpFile);
    console.log(`✅ [SQL DUMP CREATED] ${path.basename(sqlDumpFile)} (${(sqlStats.size / 1024).toFixed(2)} KB)`);
  } catch (err: any) {
    console.warn(`⚠️ Warning: pg_dump command failed: ${err.message}. Proceeding with JSON snapshot.`);
  }

  // 2. Comprehensive JSON Data Snapshot via Prisma
  console.log('⏳ Generating complete JSON Database Snapshot...');
  
  const [
    users,
    liveCourses,
    liveSessions,
    agendaItems,
    topics,
    learningOutcomes,
    resources,
    enrollments,
    attendances,
    assignments,
    submissions,
    certificates,
    purchases,
    invoices,
    notes,
    notifications
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.liveCourse.findMany(),
    prisma.liveSession.findMany(),
    prisma.sessionAgendaItem.findMany(),
    prisma.sessionTopic.findMany(),
    prisma.sessionLearningOutcome.findMany(),
    prisma.sessionResource.findMany(),
    prisma.liveCourseEnrollment.findMany(),
    prisma.liveSessionAttendance.findMany(),
    prisma.assignment.findMany(),
    prisma.assignmentSubmission.findMany(),
    prisma.certificate.findMany(),
    prisma.purchase.findMany(),
    prisma.invoice.findMany(),
    prisma.studentNote.findMany(),
    prisma.notification.findMany()
  ]);

  const databaseSnapshot = {
    metadata: {
      database: 'elearning_db',
      version: 'PostgreSQL 18 + Prisma ORM',
      backupTimestamp: new Date().toISOString(),
      counts: {
        users: users.length,
        liveCourses: liveCourses.length,
        liveSessions: liveSessions.length,
        agendaItems: agendaItems.length,
        topics: topics.length,
        learningOutcomes: learningOutcomes.length,
        resources: resources.length,
        enrollments: enrollments.length,
        attendances: attendances.length,
        assignments: assignments.length,
        submissions: submissions.length,
        certificates: certificates.length,
        purchases: purchases.length,
        invoices: invoices.length,
        notes: notes.length,
        notifications: notifications.length
      }
    },
    tables: {
      users,
      liveCourses,
      liveSessions,
      agendaItems,
      topics,
      learningOutcomes,
      resources,
      enrollments,
      attendances,
      assignments,
      submissions,
      certificates,
      purchases,
      invoices,
      notes,
      notifications
    }
  };

  const jsonDumpFile = path.join(backupDir, `elearning_db_snapshot_${timestamp}.json`);
  const latestJsonFile = path.join(backupDir, `elearning_db_latest.json`);

  fs.writeFileSync(jsonDumpFile, JSON.stringify(databaseSnapshot, null, 2), 'utf-8');
  fs.copyFileSync(jsonDumpFile, latestJsonFile);

  const jsonStats = fs.statSync(jsonDumpFile);
  console.log(`✅ [JSON SNAPSHOT CREATED] ${path.basename(jsonDumpFile)} (${(jsonStats.size / 1024).toFixed(2)} KB)`);

  console.log('\n===============================================================');
  console.log('🏁 BACKUP COMPLETED SUCCESSFULLY');
  console.log(`📁 Backup Folder: ${backupDir}`);
  console.log(`📄 SQL Dump: ${path.basename(sqlDumpFile)}`);
  console.log(`📄 JSON Snapshot: ${path.basename(jsonDumpFile)}`);
  console.log('===============================================================\n');
}

performDatabaseBackup()
  .catch((err) => {
    console.error('Fatal backup error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
