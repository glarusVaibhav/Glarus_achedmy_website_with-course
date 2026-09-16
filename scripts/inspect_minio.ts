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

async function checkBucket() {
  const endpoint = process.env.MINIO_ENDPOINT || "192.168.1.24";
  const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
  const targetBucket = process.env.MINIO_BUCKET || "glarusacademy-course-content";

  console.log("Checking MinIO server:");
  console.log(`- Endpoint: ${endpoint}:${port}`);
  console.log(`- Target Bucket: "${targetBucket}"`);

  const client = new Minio.Client({
    endPoint: endpoint.replace(/^https?:\/\//, "").split(":")[0],
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  // Wrap with a 4-second timeout promise
  const checkPromise = async () => {
    const exists = await client.bucketExists(targetBucket);
    const buckets = await client.listBuckets();
    return { exists, buckets };
  };

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Connection to ${endpoint}:${port} timed out after 4000ms. Is the MinIO service running on that IP?`)), 4000)
  );

  try {
    const res: any = await Promise.race([checkPromise(), timeoutPromise]);
    console.log(`\nBucket "${targetBucket}" exists? ${res.exists ? "YES ✅" : "NO ❌"}`);
    console.log("All buckets found on MinIO server:", res.buckets.map((b: any) => b.name));

    if (!res.exists) {
      console.log(`Creating bucket "${targetBucket}" now...`);
      await client.makeBucket(targetBucket, process.env.MINIO_REGION || "us-east-1");
      console.log(`✅ Bucket "${targetBucket}" created successfully!`);
    }
  } catch (err: any) {
    console.log(`\n❌ Could not connect to MinIO at ${endpoint}:${port}`);
    console.log(`Reason: ${err.message}`);
  }
}

checkBucket();
