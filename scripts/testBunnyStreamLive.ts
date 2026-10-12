import { getVideoConfig } from "../src/lib/video/config";
import {
  createBunnyVideo,
  getBunnyVideoInfo,
  generateTusUploadAuth,
  generateSignedPlaybackUrl,
} from "../src/lib/video/bunnyStreamService";

async function runBunnyLiveTest() {
  console.log("==================================================");
  console.log("   BUNNY STREAM CREDENTIALS & API HEALTH CHECK    ");
  console.log("==================================================");

  const config = getVideoConfig();
  console.log("Config loaded:");
  console.log("  BUNNY_STREAM_ENABLED:", process.env.BUNNY_STREAM_ENABLED);
  console.log("  bunnyStreamEnabled (resolved):", config.bunnyStreamEnabled);
  console.log("  bunnyLibraryId:", config.bunnyLibraryId);
  console.log("  bunnyApiKey:", config.bunnyApiKey ? `${config.bunnyApiKey.slice(0, 8)}...` : "(none)");
  console.log("  bunnyCdnHostname:", config.bunnyCdnHostname);
  console.log("  bunnyTokenKey:", config.bunnyTokenKey ? `${config.bunnyTokenKey.slice(0, 8)}...` : "(none)");

  if (!config.bunnyLibraryId || !config.bunnyApiKey) {
    console.error("❌ ERROR: Bunny library ID or API key is missing from environment.");
    return;
  }

  // 1. Fetch library video list to verify connection & AccessKey
  console.log("\n[Test 1] Testing Bunny Stream Library connection...");
  try {
    const listRes = await fetch(
      `https://video.bunnycdn.com/library/${config.bunnyLibraryId}/videos?page=1&itemsPerPage=5`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: config.bunnyApiKey,
        },
      }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      console.error(`❌ Bunny Stream Library check failed (${listRes.status}):`, errText);
      return;
    }

    const listData = await listRes.json();
    console.log("✅ Bunny Stream API Authentication Succeeded!");
    console.log(`   Total videos in library: ${listData.totalItems || 0}`);
    if (listData.items && listData.items.length > 0) {
      console.log(`   Sample existing video: "${listData.items[0].title}" (GUID: ${listData.items[0].guid}, Status: ${listData.items[0].status})`);
    }
  } catch (err: any) {
    console.error("❌ Network error connecting to Bunny Stream API:", err.message);
    return;
  }

  // 2. Create a test video entry
  console.log("\n[Test 2] Creating a test video object in Bunny Stream...");
  let createdGuid: string | null = null;
  try {
    const createResult = await createBunnyVideo(`Test Video automated check ${Date.now()}`);
    createdGuid = createResult.guid;
    console.log("✅ Test video created successfully!");
    console.log("   Video GUID:", createdGuid);
    console.log("   Status:", createResult.status);
  } catch (err: any) {
    console.error("❌ Failed to create video on Bunny Stream:", err.message);
    return;
  }

  // 3. Test TUS Upload authorization generator
  if (createdGuid) {
    console.log("\n[Test 3] Generating TUS upload authorization...");
    try {
      const tusAuth = generateTusUploadAuth(createdGuid);
      console.log("✅ TUS Upload Authorization generated successfully!");
      console.log("   Upload Endpoint:", tusAuth.uploadEndpoint);
      console.log("   Authorization Signature:", tusAuth.tusHeaders.AuthorizationSignature);
      console.log("   Authorization Expire:", tusAuth.tusHeaders.AuthorizationExpire);
      console.log("   Library ID:", tusAuth.tusHeaders.LibraryId);
    } catch (err: any) {
      console.error("❌ TUS Authorization Generation failed:", err.message);
    }

    // 4. Test Signed Playback URL generation
    console.log("\n[Test 4] Generating signed playback URLs with directory token...");
    try {
      const signedUrls = generateSignedPlaybackUrl(createdGuid, 3600);
      console.log("✅ Signed Playback URLs generated successfully!");
      console.log("   HLS Playlist URL:", signedUrls.playbackUrl);
      console.log("   DASH MPD URL:", signedUrls.mpdUrl);
      console.log("   Thumbnail URL:", signedUrls.thumbnailUrl);
      console.log("   Preview WebP URL:", signedUrls.previewAnimationUrl);
    } catch (err: any) {
      console.error("❌ Signed Playback URL Generation failed:", err.message);
    }

    // 5. Clean up test video
    console.log("\n[Test 5] Cleaning up test video object from Bunny Stream...");
    try {
      const delRes = await fetch(
        `https://video.bunnycdn.com/library/${config.bunnyLibraryId}/videos/${createdGuid}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            AccessKey: config.bunnyApiKey,
          },
        }
      );
      if (delRes.ok) {
        console.log("✅ Test video successfully deleted and cleaned up!");
      } else {
        console.warn(`⚠️ Warning: Failed to delete test video (${delRes.status}):`, await delRes.text());
      }
    } catch (err: any) {
      console.warn("⚠️ Warning: Error deleting test video:", err.message);
    }
  }

  console.log("\n==================================================");
  console.log("   BUNNY STREAM API CHECK COMPLETE                ");
  console.log("==================================================");
}

runBunnyLiveTest().catch(console.error);
