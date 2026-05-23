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
    const fileId = formData.get("fileId") as string;
    const chunkIndexStr = formData.get("chunkIndex") as string;
    const totalChunksStr = formData.get("totalChunks") as string;
    const fileName = (formData.get("fileName") as string) || file?.name || "unnamed";
    const fileSizeStr = formData.get("fileSize") as string;
    const mimeType = (formData.get("mimeType") as string) || file?.type || "application/octet-stream";

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If chunked upload (up to 1.8GB divided into 10MB shards)
    if (chunkIndexStr !== null && totalChunksStr !== null && fileId) {
      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);
      const fileSize = parseInt(fileSizeStr, 10) || file.size;

      // Upload this specific chunk to Telegram
      const shardFileName = `${fileName}.part_${chunkIndex + 1}`;
      const { messageId, fileId: tgFileId } = await uploadFileToTelegram(buffer, shardFileName);

      // Virtual Datacenter mapping for the simulator/telemetry
      const dcs = [
        "DC-1 (Miami, US)",
        "DC-2 (Amsterdam, NL)",
        "DC-3 (Singapore, SG)",
        "DC-4 (Tokyo, JP)",
        "DC-5 (Frankfurt, DE)"
      ];
      const dcName = dcs[chunkIndex % dcs.length];

      // Check if the File record exists, if not create it
      let dbFile = await db.file.findUnique({
        where: { id: fileId }
      });

      if (!dbFile) {
        dbFile = await db.file.create({
          data: {
            id: fileId,
            userId,
            fileName: fileName,
            telegramId: tgFileId, // Store first shard as fallback
            messageId: messageId,
            size: fileSize,
            mimeType: mimeType,
          }
        });
      } else {
        // If it's the last chunk, or as we go, update the size if it was initialized differently
        await db.file.update({
          where: { id: fileId },
          data: { size: fileSize }
        });
      }

      // Create the Shard record
      const shard = await db.shard.create({
        data: {
          fileId: fileId,
          shardIndex: chunkIndex,
          telegramId: tgFileId,
          messageId: messageId,
          size: file.size,
          dcName: dcName,
        }
      });

      return NextResponse.json({ success: true, shardId: shard.id, fileId });
    }

    // Standard single-file upload fallback (<50MB directly to Telegram in one go)
    const { messageId, fileId: tgFileId } = await uploadFileToTelegram(buffer, file.name);

    const savedFile = await db.file.create({
      data: {
        userId,
        fileName: file.name,
        telegramId: tgFileId,
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
