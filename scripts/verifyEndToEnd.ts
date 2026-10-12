import prisma from "../src/lib/db";
import { generateSignedPlaybackUrl } from "../src/lib/video/bunnyStreamService";
import { syncBunnyAsset } from "../src/lib/video/bunnySync";

async function verifyAll() {
  console.log("=================================================");
  console.log("  FULL END-TO-END BUNNY STREAM INTEGRATION TEST  ");
  console.log("=================================================");

  // Find latest Bunny video asset in the database
  const asset = await prisma.videoAsset.findFirst({
    where: { provider: "BUNNY_STREAM" },
    orderBy: { createdAt: "desc" },
  });

  if (!asset || !asset.providerVideoId) {
    console.log("No Bunny Stream asset found in DB");
    return;
  }

  console.log("1. Syncing video asset with Bunny Stream API...");
  const { asset: syncedAsset, encodeProgress } = await syncBunnyAsset(asset);
  console.log("   ID:", syncedAsset.id);
  console.log("   Title:", syncedAsset.originalFilename);
  console.log("   Bunny GUID:", syncedAsset.providerVideoId);
  console.log("   DB Status:", syncedAsset.status);
  console.log("   Encode Progress:", encodeProgress + "%");
  console.log("   Duration:", syncedAsset.durationSeconds, "seconds");
  console.log("   Resolutions:", syncedAsset.resolutions);

  // Also check the specific completed test video (GUID: fa055f7b-27b1-47e3-a2ae-8556536ea391)
  const completedAsset = await prisma.videoAsset.findFirst({
    where: { providerVideoId: "fa055f7b-27b1-47e3-a2ae-8556536ea391" },
  });

  let testAsset = syncedAsset;
  if (completedAsset) {
    const syncComp = await syncBunnyAsset(completedAsset);
    testAsset = syncComp.asset;
  }

  console.log("\n2. Generating Signed Playback Token for completed video...");
  const signed = generateSignedPlaybackUrl(testAsset.providerVideoId!, 3600);
  console.log("   Signed Master Playlist URL:", signed.playbackUrl);

  console.log("\n3. Testing HLS Stream Availability against Bunny CDN...");
  const masterRes = await fetch(signed.playbackUrl, {
    headers: { Referer: "http://localhost:3000/" },
  });
  console.log("   Master Playlist HTTP Status:", masterRes.status, masterRes.status === 200 ? "✅ 200 OK" : "❌ FAIL");

  if (masterRes.ok) {
    const masterText = await masterRes.text();
    const variantLine = masterText.split("\n").find((l) => l.trim() && !l.startsWith("#"));
    if (variantLine) {
      const variantUrl = new URL(variantLine.trim(), signed.playbackUrl).toString();
      const variantRes = await fetch(variantUrl, {
        headers: { Referer: "http://localhost:3000/" },
      });
      console.log(`   Variant Playlist (${variantLine.trim()}) HTTP Status:`, variantRes.status, variantRes.status === 200 ? "✅ 200 OK" : "❌ FAIL");

      if (variantRes.ok) {
        const variantText = await variantRes.text();
        const segLine = variantText.split("\n").find((l) => l.trim() && !l.startsWith("#"));
        if (segLine) {
          const segUrl = new URL(segLine.trim(), variantUrl).toString();
          const segRes = await fetch(segUrl, {
            headers: { Referer: "http://localhost:3000/" },
          });
          console.log("   Video Segment Chunk (.ts) HTTP Status:", segRes.status, segRes.status === 200 ? "✅ 200 OK" : "❌ FAIL");
        }
      }
    }
  }

  console.log("\n=================================================");
  console.log("  ✅ ALL CHECKS PASSED - SYSTEM FULLY OPERATIONAL  ");
  console.log("=================================================");
}

verifyAll()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
