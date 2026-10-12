import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, language = "python" } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({
        success: false,
        output: "Error: No code provided to execute.",
        executionTimeMs: 0,
      });
    }

    const startTime = Date.now();
    const cleanLang = (language || "python").toLowerCase();

    // Create a temporary script file in OS temp dir
    const tempDir = os.tmpdir();
    const fileExt = cleanLang === "javascript" || cleanLang === "js" ? "js" : "py";
    const tempFileName = `sandbox_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.promises.writeFile(tempFilePath, code, "utf-8");

    const execResult = await new Promise<{ stdout: string; stderr: string; code: number }>(
      (resolve) => {
        const cmd = fileExt === "js" ? "node" : "python";
        const args = fileExt === "js" ? [tempFilePath] : ["-u", tempFilePath];

        const proc = spawn(cmd, args, {
          timeout: 5000,
          env: { ...process.env, PYTHONUNBUFFERED: "1" },
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        proc.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        proc.on("error", (err) => {
          stderr += `Execution error: ${err.message}`;
          resolve({ stdout, stderr, code: 1 });
        });

        proc.on("close", (exitCode) => {
          resolve({ stdout, stderr, code: exitCode ?? 0 });
        });
      }
    );

    // Clean up temporary script file
    try {
      if (fs.existsSync(tempFilePath)) {
        await fs.promises.unlink(tempFilePath);
      }
    } catch (_) {}

    const executionTimeMs = Date.now() - startTime;

    let output = "";
    if (execResult.stdout) {
      output += execResult.stdout;
    }
    if (execResult.stderr) {
      if (output) output += "\n";
      output += `⚠️ ${execResult.stderr}`;
    }

    if (!output.trim()) {
      output = "(Program finished with no output)";
    }

    return NextResponse.json({
      success: execResult.code === 0,
      output: output.trim(),
      exitCode: execResult.code,
      executionTimeMs,
    });
  } catch (err: any) {
    console.error("[Sandbox Execute Error]:", err);
    return NextResponse.json({
      success: false,
      output: `Runtime execution error: ${err?.message || "Unknown error"}`,
      executionTimeMs: 0,
    });
  }
}
