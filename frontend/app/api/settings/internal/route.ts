import { NextResponse } from "next/server";
import { getStoredSystemSettings } from "@/lib/system-settings";

// Route for backend FastAPI to fetch all dynamic configurations from DB
export async function GET() {
  try {
    const settings = await getStoredSystemSettings();
    return NextResponse.json({
      success: true,
      settings,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Failed to load internal settings for backend:", error);
    return NextResponse.json(
      { error: "Failed to load internal settings" },
      { status: 500 }
    );
  }
}
