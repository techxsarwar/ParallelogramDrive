import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const files = await db.file.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("[FILES_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
