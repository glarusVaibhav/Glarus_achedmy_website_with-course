import prisma from '../src/lib/db';

async function main() {
  const tables: any = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log(`====================================================`);
  console.log(`📊 TOTAL NUMBER OF TABLES: ${tables.length}`);
  console.log(`====================================================\n`);

  const results: { "#": number; TableName: string; EstimatedRowCount: number }[] = [];

  for (let i = 0; i < tables.length; i++) {
    const tName = tables[i].table_name;
    try {
      const countRes: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${tName}"`);
      results.push({
        "#": i + 1,
        TableName: tName,
        EstimatedRowCount: countRes[0]?.count ?? 0,
      });
    } catch {
      results.push({
        "#": i + 1,
        TableName: tName,
        EstimatedRowCount: -1,
      });
    }
  }

  console.table(results);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
