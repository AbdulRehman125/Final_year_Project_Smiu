import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDetailedSystemSettings, updateSystemSettings } from "@/lib/system-settings";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const settings = await getDetailedSystemSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Failed to fetch admin settings:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid payload: settings object required" },
        { status: 400 }
      );
    }

    await updateSystemSettings(settings);

    return NextResponse.json({
      success: true,
      message: "System settings updated successfully",
    });
  } catch (error: any) {
    console.error("Failed to save admin settings:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
