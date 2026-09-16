import fs from "fs";
import path from "path";
import * as Minio from "minio";

// Load .env manually
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

async function checkAssignmentMinio() {
  const endpoint = process.env.MINIO_ENDPOINT || "192.168.1.24";
  const port = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000;
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
  const secretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
  const bucketName = process.env.MINIO_BUCKET || "glarusacademy-course-content";

  console.log("=================================================");
  console.log("   MINIO ASSIGNMENT STORAGE VERIFICATION");
  console.log("=================================================");
  console.log(`Endpoint:   ${endpoint}:${port}`);
  console.log(`Bucket:     ${bucketName}`);
  console.log(`Access Key: ${accessKey}`);

  const client = new Minio.Client({
    endPoint: endpoint.replace(/^https?:\/\//, "").split(":")[0],
    port,
    useSSL,
    accessKey,
    secretKey,
  });

  try {
    // 1. Test MinIO Connection & Bucket Existence
    console.log(`\n1. Checking if bucket "${bucketName}" exists...`);
    const bucketExists = await client.bucketExists(bucketName);
    console.log(`Bucket "${bucketName}" status: ${bucketExists ? "✅ EXISTS" : "❌ DOES NOT EXIST"}`);

    if (!bucketExists) {
      console.log(`Creating bucket "${bucketName}"...`);
      await client.makeBucket(bucketName, process.env.MINIO_REGION || "us-east-1");
      console.log(`✅ Bucket "${bucketName}" created successfully!`);
    }

    // 2. Test Storing an Assignment Object in MinIO
    const testObjectKey = `assignments/student_test_sub_${Date.now()}_project.zip`;
    const testBuffer = Buffer.from("SAMPLE_ASSIGNMENT_SOURCE_CODE_ZIP_PAYLOAD_FOR_TESTING");

    console.log(`\n2. Uploading test assignment deliverable: "${testObjectKey}"...`);
    await client.putObject(bucketName, testObjectKey, testBuffer, testBuffer.length, {
      "Content-Type": "application/zip",
      "x-amz-meta-original-filename": "project_source_archive.zip",
    });
    console.log(`✅ Test assignment file uploaded to MinIO bucket "${bucketName}" successfully!`);

    // 3. Verify Reading the Assignment Object from MinIO
    console.log(`\n3. Verifying stored assignment in MinIO...`);
    const stat = await client.statObject(bucketName, testObjectKey);
    console.log(`✅ Object verified! Size: ${stat.size} bytes, ETag: ${stat.etag}, Content-Type: ${stat.metaData?.["content-type"] || "application/zip"}`);

    // 4. List items currently in bucket under assignments/
    console.log(`\n4. Listing recent assignment objects in bucket "${bucketName}"...`);
    const stream = client.listObjectsV2(bucketName, "assignments/", true);
    let count = 0;
    for await (const item of stream) {
      count++;
      if (count <= 10) {
        console.log(`   - ${item.name} (${item.size} bytes)`);
      }
    }
    console.log(`Total assignment objects in bucket: ${count}`);

    console.log("\n=================================================");
    console.log("🎉 SUCCESS: MinIO is properly connected and saving assignments!");
    console.log("=================================================");
  } catch (err: any) {
    console.error("\n❌ MinIO connection/upload error:", err.message);
    if (err.code) console.error("Error Code:", err.code);
  }
}

checkAssignmentMinio();
