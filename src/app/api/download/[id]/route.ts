import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getFileLinkFromTelegram } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const file = await db.file.findUnique({
      where: {
        id: resolvedParams.id,
      },
      include: {
        shards: {
          orderBy: {
            shardIndex: "asc",
          },
        },
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    if (file.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fallback: If no shards exist (backward compatibility for older files), redirect directly
    if (!file.shards || file.shards.length === 0) {
      const downloadUrl = await getFileLinkFromTelegram(file.telegramId);
      return NextResponse.redirect(downloadUrl);
    }

    const shards = file.shards;

    // Create a high-performance Web ReadableStream to pipe shards sequentially
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (const shard of shards) {
            // Get temporary secure download URL for this shard
            const shardUrl = await getFileLinkFromTelegram(shard.telegramId);

            // Fetch the bytes of this shard from Telegram
            const shardResponse = await fetch(shardUrl);
            if (!shardResponse.ok) {
              throw new Error(`Failed to fetch shard ${shard.shardIndex}`);
            }

            const reader = shardResponse.body?.getReader();
            if (!reader) {
              throw new Error(`No reader available for shard ${shard.shardIndex}`);
            }

            // Stream the chunk bytes
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          }
          controller.close();
        } catch (err) {
          console.error("[STREAMING_DOWNLOAD_ERROR]", err);
          controller.error(err);
        }
      },
    });

    // Return the stream response with high-tech diagnostic headers
    return new NextResponse(stream, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
        "Content-Length": String(file.size), // Essential for showing exact browser download progress
        "Cache-Control": "no-cache",
        "X-Shards-Assembled": String(shards.length),
      },
    });
  } catch (error) {
    console.error("[DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
