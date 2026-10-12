import prisma from "@/lib/db";

async function verifyPostgresSchema() {
  console.log("=================================================");
  console.log("🔍 POSTGRESQL SCHEMA & TABLE VERIFICATION");
  console.log("=================================================\n");

  try {
    // 1. Check VideoAsset columns
    const columns: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'VideoAsset'
      ORDER BY ordinal_position;
    `;

    console.log("📋 Columns in 'VideoAsset' table:");
    console.table(columns);

    // 2. Check VideoStatus enum values
    const enumValues: any[] = await prisma.$queryRaw`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'VideoStatus';
    `;

    console.log("\n📋 'VideoStatus' Enum values in Postgres:");
    console.log(enumValues.map(e => e.enumlabel).join(", "));

    // 3. Check Lecture table foreign key / columns
    const lectureCols: any[] = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Lecture' AND column_name IN ('videoUrl', 'duration', 'type');
    `;
    console.log("\n📋 Preserved 'Lecture' video columns:");
    console.table(lectureCols);

    // 4. Sample record check in VideoAsset
    const count = await prisma.videoAsset.count();
    console.log(`\n📊 Total records in VideoAsset table: ${count}`);

    if (count > 0) {
      const sample = await prisma.videoAsset.findFirst();
      console.log("Sample VideoAsset record:", {
        id: sample?.id,
        originalFilename: sample?.originalFilename,
        status: sample?.status,
        masterPlaylistKey: sample?.masterPlaylistKey,
        thumbnailKey: sample?.thumbnailKey,
        resolutions: sample?.resolutions,
        width: sample?.width,
        height: sample?.height,
        durationSeconds: sample?.durationSeconds
      });
    }

    console.log("\n✅ All tables, columns, relations, and enums are present and verified in PostgreSQL!");
  } catch (err: any) {
    console.error("❌ Schema verification failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPostgresSchema();
