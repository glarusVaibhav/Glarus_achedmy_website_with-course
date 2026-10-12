import { execSync } from "child_process";
import ffmpegPath from "ffmpeg-static";
// @ts-ignore
import ffprobeStatic from "ffprobe-static";

console.log("FFmpeg binary path:", ffmpegPath);
console.log("FFprobe binary path:", ffprobeStatic.path);

if (ffmpegPath) {
  const ffmpegVer = execSync(`"${ffmpegPath}" -version`).toString().split("\n")[0];
  console.log("FFmpeg version:", ffmpegVer);
}

if (ffprobeStatic.path) {
  const ffprobeVer = execSync(`"${ffprobeStatic.path}" -version`).toString().split("\n")[0];
  console.log("FFprobe version:", ffprobeVer);
}
