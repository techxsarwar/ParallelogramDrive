import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { db } from "@/lib/db";
import { getFileLinkFromTelegram, deleteMessageFromTelegram } from "@/lib/telegram";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateApiKey(req);

    if (!userId) {
      return new NextResponse("Unauthorized. Invalid or missing x-api-key header.", { status: 401 });
    }

    const { id } = await params;

    const file = await db.file.findUnique({
      where: { id },
    });

    if (!file || file.userId !== userId) {
      return new NextResponse("File not found", { status: 404 });
    }

    const downloadUrl = await getFileLinkFromTelegram(file.telegramId);
    const origin = req.nextUrl.origin;

    return NextResponse.json({
      id: file.id,
      fileName: file.fileName,
      size: file.size,
      mimeType: file.mimeType,
      isPublic: file.isPublic,
      createdAt: file.createdAt,
      downloadUrl,
      streamUrl: `${origin}/api/stream/${file.id}`,
    });
  } catch (error) {
    console.error("[V1_FILE_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await authenticateApiKey(req);

    if (!userId) {
      return new NextResponse("Unauthorized. Invalid or missing x-api-key header.", { status: 401 });
    }

    const { id } = await params;

    const file = await db.file.findUnique({
      where: { id },
    });

    if (!file || file.userId !== userId) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Try to delete from Telegram channel
    if (file.messageId) {
      deleteMessageFromTelegram(file.messageId).catch(console.error);
    }

    // Delete from database
    await db.file.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "File successfully deleted from distributed network.",
      deletedId: id,
    });
  } catch (error) {
    console.error("[V1_FILE_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
