import { processVideoAsset } from "./videoProcessor";

interface QueueItem {
  videoAssetId: string;
  enqueuedAt: Date;
  attempts: number;
}

class VideoQueueManager {
  private queue: QueueItem[] = [];
  private activeJobs: Set<string> = new Set();
  private maxConcurrency = 2; // Process up to 2 videos concurrently to prevent system CPU starvation
  private isProcessing = false;

  public enqueue(videoAssetId: string): void {
    if (this.activeJobs.has(videoAssetId)) {
      console.log(`[Video Queue] Job ${videoAssetId} is already active.`);
      return;
    }

    if (this.queue.some(item => item.videoAssetId === videoAssetId)) {
      console.log(`[Video Queue] Job ${videoAssetId} is already in queue.`);
      return;
    }

    console.log(`[Video Queue] Enqueuing VideoAsset: ${videoAssetId}`);
    this.queue.push({
      videoAssetId,
      enqueuedAt: new Date(),
      attempts: 0
    });

    this.processNext();
  }

  public retry(videoAssetId: string): void {
    console.log(`[Video Queue] Retrying VideoAsset: ${videoAssetId}`);
    this.enqueue(videoAssetId);
  }

  public isJobRunning(videoAssetId: string): boolean {
    return this.activeJobs.has(videoAssetId);
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.activeJobs.size < this.maxConcurrency && this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) break;

        const { videoAssetId } = item;
        this.activeJobs.add(videoAssetId);

        // Run asynchronously in background without blocking
        (async () => {
          try {
            console.log(`[Video Queue] Starting background job for ${videoAssetId}...`);
            await processVideoAsset(videoAssetId);
            console.log(`[Video Queue] Completed background job for ${videoAssetId}.`);
          } catch (err: any) {
            console.error(`[Video Queue] Background job for ${videoAssetId} failed:`, err?.message);
          } finally {
            this.activeJobs.delete(videoAssetId);
            this.processNext();
          }
        })();
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Global Singleton in Node runtime
const globalForVideoQueue = global as unknown as { videoQueueManagerInstance?: VideoQueueManager };

export const videoQueue = globalForVideoQueue.videoQueueManagerInstance || new VideoQueueManager();

if (process.env.NODE_ENV !== "production") {
  globalForVideoQueue.videoQueueManagerInstance = videoQueue;
}

export function enqueueVideoProcessing(videoAssetId: string): void {
  videoQueue.enqueue(videoAssetId);
}

export function retryVideoProcessing(videoAssetId: string): void {
  videoQueue.retry(videoAssetId);
}
