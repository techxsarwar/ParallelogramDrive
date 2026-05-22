import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadFileToTelegram } from "@/lib/telegram";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Telegram
    const { messageId, fileId } = await uploadFileToTelegram(buffer, file.name);

    // Save to database
    const savedFile = await db.file.create({
      data: {
        userId,
        fileName: file.name,
        telegramId: fileId,
        messageId,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });

    return NextResponse.json(savedFile);
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
