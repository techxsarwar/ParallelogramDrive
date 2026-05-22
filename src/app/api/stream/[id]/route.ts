import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getFileLinkFromTelegram } from "@/lib/telegram";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    // Also allow public files to be streamed without auth
    const file = await db.file.findUnique({ where: { id } });

    if (!file) return new NextResponse("Not found", { status: 404 });

    if (!file.isPublic && file.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the real CDN URL from storage
    const cdnUrl = await getFileLinkFromTelegram(file.telegramId);

    // Forward range header from client (enables video seeking)
    const rangeHeader = req.headers.get("range");

    const fetchHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    const upstream = await fetch(cdnUrl, { headers: fetchHeaders });

    const responseHeaders: Record<string, string> = {
      "Content-Type": file.mimeType || "application/octet-stream",
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
    };

    const contentLength = upstream.headers.get("Content-Length");
    const contentRange = upstream.headers.get("Content-Range");
    if (contentLength) responseHeaders["Content-Length"] = contentLength;
    if (contentRange) responseHeaders["Content-Range"] = contentRange;

    // Content-Disposition: inline so browser renders it (not download)
    const ext = file.fileName.split(".").pop();
    responseHeaders["Content-Disposition"] = `inline; filename="${file.fileName}"`;

    return new NextResponse(upstream.body, {
      status: rangeHeader ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[STREAM_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
