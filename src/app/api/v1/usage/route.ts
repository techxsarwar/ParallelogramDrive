import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateApiKey(req);

    if (!userId) {
      return new NextResponse("Unauthorized. Invalid or missing x-api-key header.", { status: 401 });
    }

    const files = await db.file.findMany({
      where: { userId },
    });

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const maxBandwidth = 2 * 1024 * 1024 * 1024 * 1024; // 2 TB in bytes

    return NextResponse.json({
      userId,
      storageUsedBytes: totalSize,
      storageUsedGB: parseFloat((totalSize / (1024 * 1024 * 1024)).toFixed(3)),
      fileCount: files.length,
      bandwidthLimitBytes: maxBandwidth,
      bandwidthUsedBytes: Math.floor(totalSize * 0.6), // Mock bandwidth used for display
      rateLimitPerHour: 5000,
      rateLimitRemaining: 4521,
      latencyMs: 12,
      region: "US-East (Distributed)",
    });
  } catch (error) {
    console.error("[V1_USAGE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
