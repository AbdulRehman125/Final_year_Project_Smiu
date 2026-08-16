import { NextResponse } from "next/server";
import { getStoredSystemSettings } from "@/lib/system-settings";

// Public route to fetch client-side feature toggles dynamically
export async function GET() {
  try {
    const settings = await getStoredSystemSettings();

    const readingFlag =
      settings["NEXT_PUBLIC_GENERATE_READING_WITH_AI"] !== undefined
        ? settings["NEXT_PUBLIC_GENERATE_READING_WITH_AI"] === "true"
        : process.env.NEXT_PUBLIC_GENERATE_READING_WITH_AI === "true";

    const listeningFlag =
      settings["NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI"] !== undefined
        ? settings["NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI"] === "true"
        : process.env.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI === "true";

    return NextResponse.json(
      {
        NEXT_PUBLIC_GENERATE_READING_WITH_AI: readingFlag,
        NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI: listeningFlag,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch public settings, using .env fallback:", error);
    return NextResponse.json({
      NEXT_PUBLIC_GENERATE_READING_WITH_AI:
        process.env.NEXT_PUBLIC_GENERATE_READING_WITH_AI === "true",
      NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI:
        process.env.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI === "true",
    });
  }
}
