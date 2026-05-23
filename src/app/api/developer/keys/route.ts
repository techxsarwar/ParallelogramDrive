import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const keys = await db.apiKey.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(keys);
  } catch (error) {
    console.error("[DEVELOPER_KEYS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, type } = body;

    if (!name || !type || (type !== "production" && type !== "test")) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    // Generate prefix-based professional key
    const prefix = type === "production" ? "pd_live" : "pd_test";
    const secureToken = crypto.randomBytes(24).toString("hex");
    const key = `${prefix}_${secureToken}`;

    const apiKey = await db.apiKey.create({
      data: {
        userId,
        name,
        type,
        key,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error("[DEVELOPER_KEYS_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
