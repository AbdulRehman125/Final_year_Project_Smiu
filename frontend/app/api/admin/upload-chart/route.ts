// app/api/admin/upload-chart/route.ts
// Receives image → uploads to Cloudinary → saves to DB

import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { db } from "@/lib/db"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData()
    const file      = formData.get("file") as File
    const chartType = formData.get("chartType") as string
    const title     = formData.get("title") as string
    const dataPoints = formData.get("dataPoints") as string
    const difficulty = formData.get("difficulty") as string

    if (!file || !chartType || !title) {
      return NextResponse.json(
        { error: "file, chartType and title are required" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:       "ielts/charts",
          public_id:    `${chartType}_${Date.now()}`,
          overwrite:    true,
          quality:      "auto",
          fetch_format: "auto",
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result.secure_url)
        }
      ).end(buffer)
    })

    // Save to DB
    const image = await db.writingTask1Image.create({
      data: {
        chartType,
        imageUrl:   cloudinaryUrl,
        title,
        dataPoints: dataPoints || "{}",
        difficulty: difficulty || "medium",
      },
    })

    return NextResponse.json({
      success:  true,
      id:       image.id,
      title:    image.title,
      imageUrl: image.imageUrl,
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}