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

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;

    const file = await db.file.findUnique({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    if (file.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const downloadUrl = await getFileLinkFromTelegram(file.telegramId);

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("[DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
