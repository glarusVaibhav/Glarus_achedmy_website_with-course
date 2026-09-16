import fs from "fs";
import path from "path";
import * as Minio from "minio";

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}
loadEnv();

async function sampleBucketObjects(client: Minio.Client, bucketName: string, maxItems = 5) {
  return new Promise<{ samples: { name: string; size: number }[]; hasMore: boolean }>((resolve) => {
    const samples: { name: string; size: number }[] = [];
    let hasMore = false;
    let completed = false;

    const timeout = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve({ samples, hasMore: true });
      }
    }, 1500);

    const stream = client.listObjectsV2(bucketName, "", true);
    
    stream.on("data", (obj) => {
      if (samples.length < maxItems) {
        samples.push({
          name: obj.name || "unknown",
          size: obj.size || 0
        });
      } else {
        hasMore = true;
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          try { stream.destroy(); } catch {}
          resolve({ samples, hasMore: true });
        }
      }
    });

    stream.on("error", () => {
      if (!completed) {
        completed = true;
        clearTimeout(timeout);
        resolve({ samples, hasMore });
      }
    });

    stream.on("end", () => {
      if (!completed) {
        completed = true;
        clearTimeout(timeout);
        resolve({ samples, hasMore });
      }
    });
  });
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

async function inspectMinioFull() {
  console.log("===============================================================");
  console.log("             GLARUS ACADEMY - MINIO HEALTH CHECK               ");
  console.log("===============================================================");

  const endpoint = process.env.MINIO_ENDPOINT || "192.168.1.24";
  const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
  const targetBucket = process.env.MINIO_BUCKET || "glarusacademy-course-content";
  const region = process.env.MINIO_REGION || "us-east-1";

  console.log(`📌 Configuration from .env:`);
  console.log(`   - Endpoint       : ${endpoint}:${port}`);
  console.log(`   - SSL Enabled    : ${useSSL}`);
  console.log(`   - Access Key     : ${accessKey}`);
  console.log(`   - Target Bucket  : ${targetBucket}`);
  console.log(`   - Region         : ${region}`);
  console.log("---------------------------------------------------------------");

  const client = new Minio.Client({
    endPoint: endpoint.replace(/^https?:\/\//, "").split(":")[0],
    port,
    useSSL,
    accessKey,
    secretKey,
    region
  });

  try {
    // 1. Check list of buckets
    console.log(`⏳ Connecting to MinIO server at ${endpoint}:${port}...`);
    const startConn = Date.now();
    const buckets = await client.listBuckets();
    const connLatency = Date.now() - startConn;
    console.log(`✅ Connected successfully! (Latency: ${connLatency}ms)`);
    console.log(`📦 Found ${buckets.length} total bucket(s) on server:\n`);

    for (const b of buckets) {
      console.log(`  📁 Bucket: [${b.name}] (Created: ${new Date(b.creationDate).toLocaleString()})`);
      try {
        const stats = await sampleBucketObjects(client, b.name, 3);
        if (stats.samples.length > 0) {
          console.log(`     Sample Objects:`);
          for (const s of stats.samples) {
            console.log(`       • ${s.name} (${formatBytes(s.size)})`);
          }
          if (stats.hasMore) {
            console.log(`       • ... [more items exist]`);
          }
        } else {
          console.log(`     (Bucket is currently empty)`);
        }
      } catch (e: any) {
        console.log(`     Could not inspect: ${e.message}`);
      }
      console.log("");
    }

    // 2. Check Target Bucket
    console.log("---------------------------------------------------------------");
    console.log(`🔍 Checking dedicated course bucket: "${targetBucket}"...`);
    const targetExists = await client.bucketExists(targetBucket);

    if (targetExists) {
      console.log(`✅ Target bucket "${targetBucket}" is ACTIVE and READY!`);
    } else {
      console.log(`⚠️ Target bucket "${targetBucket}" does not exist yet.`);
      console.log(`🔨 Creating bucket "${targetBucket}" in region "${region}"...`);
      await client.makeBucket(targetBucket, region);
      console.log(`✅ Target bucket "${targetBucket}" created successfully!`);
    }

    // 3. Test Read/Write/Delete/Presigned Operations on Target Bucket
    console.log("\n🧪 Running Read / Write / Presign / Delete Operations...");
    const testKey = `health-check/test_${Date.now()}.txt`;
    const testContent = `MinIO Health Check verification at ${new Date().toISOString()} for GlarusAcademy`;
    const buffer = Buffer.from(testContent, "utf-8");

    // Upload
    const tUpload = Date.now();
    await client.putObject(targetBucket, testKey, buffer, buffer.length, {
      "Content-Type": "text/plain",
      "x-amz-meta-test": "health-check"
    });
    console.log(`  ✅ Upload Operation        : SUCCESS (${Date.now() - tUpload}ms) [Key: ${testKey}]`);

    // Stat
    const stat = await client.statObject(targetBucket, testKey);
    console.log(`  ✅ Metadata Stat Operation : SUCCESS (${stat.size} bytes, ETag: ${stat.etag})`);

    // Presigned GET URL
    const presignedUrl = await client.presignedGetObject(targetBucket, testKey, 300);
    console.log(`  ✅ Presigned URL Generation: SUCCESS`);
    console.log(`     URL: ${presignedUrl.slice(0, 85)}...`);

    // Delete
    await client.removeObject(targetBucket, testKey);
    console.log(`  ✅ Cleanup / Delete Test   : SUCCESS`);

    console.log("\n===============================================================");
    console.log("🎉 MINIO STORAGE STATUS: 100% OPERATIONAL & HEALTHY! ✅");
    console.log("===============================================================");

  } catch (err: any) {
    console.error("\n❌ MinIO Health Check Failed!");
    console.error("Error details:", err);
  }
}

inspectMinioFull();
