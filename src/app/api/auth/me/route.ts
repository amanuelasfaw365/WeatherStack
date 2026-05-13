import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = getAuthUser();
    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: authUser.sub },
      select: { id: true, email: true, name: true, role: true, lastSession: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
