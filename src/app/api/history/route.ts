import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getUserHistory } from "@/lib/history";

export async function GET() {
  try {
    const authUser = getAuthUser();
    if (!authUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const history = await getUserHistory(authUser.sub);
    return NextResponse.json({ history });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
