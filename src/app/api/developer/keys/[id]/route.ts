import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

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

    const apiKey = await db.apiKey.findUnique({
      where: {
        id,
      },
    });

    if (!apiKey || apiKey.userId !== userId) {
      return new NextResponse("Key not found", { status: 404 });
    }

    await db.apiKey.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEVELOPER_KEY_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
