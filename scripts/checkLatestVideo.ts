import prisma from "../src/lib/db";
import { getBunnyVideoInfo } from "../src/lib/video/bunnyStreamService";

async function check() {
  const assets = await prisma.videoAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  console.log("Recent 5 Video Assets in DB:");
  for (const a of assets) {
    console.log({
      id: a.id,
      title: a.originalFilename,
      provider: a.provider,
      providerVideoId: a.providerVideoId,
      status: a.status,
      createdAt: a.createdAt,
    });

    if (a.provider === "BUNNY_STREAM" && a.providerVideoId) {
      try {
        const info = await getBunnyVideoInfo(a.providerVideoId);
        console.log(` -> Bunny Stream Video "${a.providerVideoId}":`, {
          title: info.title,
          status: info.status, // 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Transcoding, 4 = Finished, 5 = Error
          encodeProgress: info.encodeProgress,
          availableResolutions: info.availableResolutions,
          length: info.length,
          storageSize: info.storageSize,
        });
      } catch (err: any) {
        console.log(` -> Bunny Stream fetch error:`, err.message);
      }
    }
  }
}

check().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
