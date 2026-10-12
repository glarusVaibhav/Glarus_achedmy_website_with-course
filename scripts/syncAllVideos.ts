import prisma from "../src/lib/db";
import { syncBunnyAsset } from "../src/lib/video/bunnySync";

async function main() {
  const assets = await prisma.videoAsset.findMany({
    where: { provider: "BUNNY_STREAM" },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${assets.length} Bunny Stream assets in database:`);
  for (const asset of assets) {
    console.log(`\nSyncing asset ${asset.id} (${asset.originalFilename || asset.id})...`);
    console.log(`  Initial DB Status: ${asset.status}`);
    const { asset: synced, encodeProgress } = await syncBunnyAsset(asset);
    console.log(`  Synced Status: ${synced.status}, Progress: ${encodeProgress}%, Duration: ${synced.durationSeconds}s, Resolutions: ${JSON.stringify(synced.resolutions)}`);
  }
}

main().then(() => {
  console.log("\nSync complete!");
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
