// app/api/writing/task1-image/route.ts
// Returns a random Task1 image from DB by chart type

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const chartType = request.nextUrl.searchParams.get("chart_type")

  try {
    // Count matching images
    const count = await db.writingTask1Image.count({
      where: chartType ? { chartType } : {},
    })

    if (count === 0) {
      return NextResponse.json(
        { error: "No images found" },
        { status: 404 }
      )
    }

    // Pick random offset
    const randomSkip = Math.floor(Math.random() * count)

    // Fetch random image
    const image = await db.writingTask1Image.findFirst({
      where: chartType ? { chartType } : {},
      skip: randomSkip,
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Task1 image fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    )
  }
}