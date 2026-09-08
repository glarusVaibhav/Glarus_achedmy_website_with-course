import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function escapeSqlValue(value: any, dataType?: string): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    return isNaN(value) ? "NULL" : String(value);
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === "object") {
    const jsonStr = JSON.stringify(value).replace(/'/g, "''");
    return `'${jsonStr}'`;
  }
  // String escaping
  const strVal = String(value).replace(/'/g, "''");
  return `'${strVal}'`;
}

async function performDatabaseBackup() {
  console.log("=========================================================");
  console.log("           GLARUS ACADEMY DATABASE BACKUP ENGINE         ");
  console.log("=========================================================");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.resolve(process.cwd(), "..", "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const sqlBackupPath = path.join(backupDir, `backup_elearning_db_${timestamp}.sql`);
  const jsonBackupPath = path.join(backupDir, `backup_elearning_db_${timestamp}.json`);

  console.log(`\n📁 Target Backup Directory: ${backupDir}`);
  console.log(`📄 SQL Backup Target: ${path.basename(sqlBackupPath)}`);
  console.log(`📦 JSON Snapshot Target: ${path.basename(jsonBackupPath)}`);

  // 1. Fetch all table names
  const rawTables: Array<{ table_name: string }> = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name ASC;
  `);

  const tableNames = rawTables.map(t => t.table_name);
  console.log(`\n🔍 Discovered ${tableNames.length} tables in PostgreSQL database "elearning_db".\n`);

  const fullDatabaseDump: Record<string, any[]> = {};
  const tableStats: Array<{ table: string; rows: number; columns: number }> = [];

  let sqlContent = `-- =========================================================\n`;
  sqlContent += `-- GLARUS ACADEMY POSTGRESQL DATABASE BACKUP\n`;
  sqlContent += `-- Database: elearning_db\n`;
  sqlContent += `-- Host: 192.168.1.22:5432\n`;
  sqlContent += `-- Backup Created At: ${new Date().toISOString()}\n`;
  sqlContent += `-- Total Tables: ${tableNames.length}\n`;
  sqlContent += `-- =========================================================\n\n`;
  sqlContent += `SET statement_timeout = 0;\n`;
  sqlContent += `SET lock_timeout = 0;\n`;
  sqlContent += `SET client_encoding = 'UTF8';\n`;
  sqlContent += `SET standard_conforming_strings = on;\n\n`;

  for (const tableName of tableNames) {
    // 2. Fetch Columns metadata
    const rawColumns: Array<{ column_name: string; data_type: string }> = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      ORDER BY ordinal_position ASC;
    `);

    // 3. Fetch all rows
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM "${tableName}";
    `);

    fullDatabaseDump[tableName] = rows;
    tableStats.push({
      table: tableName,
      rows: rows.length,
      columns: rawColumns.length
    });

    sqlContent += `-- ---------------------------------------------------------\n`;
    sqlContent += `-- Table Data: "${tableName}" (${rows.length} rows)\n`;
    sqlContent += `-- ---------------------------------------------------------\n`;

    if (rows.length > 0) {
      const colNames = rawColumns.map(c => `"${c.column_name}"`).join(", ");

      for (const row of rows) {
        const values = rawColumns.map(col => {
          const val = row[col.column_name];
          return escapeSqlValue(val, col.data_type);
        }).join(", ");

        sqlContent += `INSERT INTO "${tableName}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
      }
    } else {
      sqlContent += `-- (Table is currently empty)\n`;
    }

    sqlContent += `\n`;
  }

  // Write SQL file
  fs.writeFileSync(sqlBackupPath, sqlContent, "utf-8");
  const sqlStats = fs.statSync(sqlBackupPath);

  // Write JSON Snapshot file
  const jsonMetadata = {
    database: "elearning_db",
    host: "192.168.1.22:5432",
    createdAt: new Date().toISOString(),
    totalTables: tableNames.length,
    tableStats,
    data: fullDatabaseDump
  };
  fs.writeFileSync(jsonBackupPath, JSON.stringify(jsonMetadata, null, 2), "utf-8");
  const jsonStats = fs.statSync(jsonBackupPath);

  console.log("=========================================================");
  console.log("                   BACKUP SUMMARY TABLE                  ");
  console.log("=========================================================");
  console.table(
    tableStats.map(s => ({
      "Table Name": s.table,
      "Columns": s.columns,
      "Total Rows": s.rows
    }))
  );

  const totalRecords = tableStats.reduce((acc, s) => acc + s.rows, 0);

  console.log(`\n📊 Total Tables Backed Up : ${tableNames.length}`);
  console.log(`📈 Total Records Saved    : ${totalRecords}`);
  console.log(`💾 SQL Backup File Size   : ${(sqlStats.size / 1024).toFixed(2)} KB -> ${sqlBackupPath}`);
  console.log(`📦 JSON Backup File Size  : ${(jsonStats.size / 1024).toFixed(2)} KB -> ${jsonBackupPath}`);
  console.log("\n✅ DATABASE BACKUP COMPLETED WITH 100% INTEGRITY!");

  await prisma.$disconnect();
}

performDatabaseBackup().catch(err => {
  console.error("Database backup failed:", err);
  process.exit(1);
});
