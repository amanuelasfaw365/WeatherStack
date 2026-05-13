import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, requireRole } from "@/lib/auth";
import { getUserHistory } from "@/lib/history";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authUser = getAuthUser();
    const denied = requireRole(authUser, "admin");
    if (denied) return denied;

    const { userId } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const history = await getUserHistory(userId);
    return NextResponse.json({ user: targetUser, history });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
