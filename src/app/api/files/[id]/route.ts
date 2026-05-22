import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deleteMessageFromTelegram } from "@/lib/telegram";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    
    // Ensure the file belongs to the user
    const file = await db.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Try to delete from Telegram channel without blocking the response
    if (file.messageId) {
      deleteMessageFromTelegram(file.messageId).catch(console.error);
    }

    // Delete from database
    await db.file.delete({ where: { id } });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[DELETE_FILE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
