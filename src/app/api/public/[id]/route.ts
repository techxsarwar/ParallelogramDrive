import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getFileLinkFromTelegram } from "@/lib/telegram";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await db.file.findUnique({
      where: { id },
    });

    if (!file || !file.isPublic) {
      return new NextResponse("File not found or not public", { status: 404 });
    }

    const downloadUrl = await getFileLinkFromTelegram(file.telegramId);

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("[PUBLIC_DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
