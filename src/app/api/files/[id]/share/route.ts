import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    
    const file = await db.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updated = await db.file.update({
      where: { id },
      data: { isPublic: !file.isPublic }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[SHARE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
