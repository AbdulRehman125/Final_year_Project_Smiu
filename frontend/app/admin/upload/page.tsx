"use client"

// app/admin/upload/page.tsx
// Admin page to upload IELTS chart images
// Upload → Cloudinary → DB automatically

import { useState } from "react"
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const CHART_TYPES = [
  { value: "bar_chart",       label: "Bar Chart" },
  { value: "line_graph",      label: "Line Graph" },
  { value: "pie_chart",       label: "Pie Chart" },
  { value: "table",           label: "Table" },
  { value: "process_diagram", label: "Process Diagram" },
  { value: "map",             label: "Map" },
]

const DIFFICULTIES = ["easy", "medium", "hard"]

interface UploadResult {
  success: boolean
  title?: string
  imageUrl?: string
  error?: string
}

export default function AdminUploadPage() {
  const [file, setFile]             = useState<File | null>(null)
  const [chartType, setChartType]   = useState("bar_chart")
  const [title, setTitle]           = useState("")
  const [dataPoints, setDataPoints] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<UploadResult | null>(null)
  const [preview, setPreview]       = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file || !title) return
    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("chartType", chartType)
    formData.append("title", title)
    formData.append("dataPoints", dataPoints)
    formData.append("difficulty", difficulty)

    try {
      const res = await fetch("/api/admin/upload-chart", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, title: data.title, imageUrl: data.imageUrl })
        // Reset form
        setFile(null)
        setTitle("")
        setDataPoints("")
        setPreview(null)
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch {
      setResult({ success: false, error: "Upload failed. Try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Upload Chart Image</h1>
          <p className="text-muted-foreground mt-1">
            Upload IELTS Task 1 chart images. They will be saved to Cloudinary and DB automatically.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chart Image *
            </label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Click to select image</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG supported</p>
                </div>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chart Type *
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CHART_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chart Title * <span className="text-muted-foreground font-normal">(e.g. "Energy consumption in UK 1990-2020")</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter descriptive title..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Data Points */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Key Data Points <span className="text-muted-foreground font-normal">(helps AI generate accurate questions)</span>
            </label>
            <textarea
              value={dataPoints}
              onChange={(e) => setDataPoints(e.target.value)}
              placeholder="e.g. In 1990, coal was 40%. By 2020, renewables reached 35%..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                    difficulty === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-xl px-4 py-3 flex items-start gap-3 ${
              result.success
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}>
              {result.success
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-medium ${result.success ? "text-emerald-600" : "text-red-600"}`}>
                  {result.success ? `✓ Uploaded: ${result.title}` : result.error}
                </p>
                {result.imageUrl && (
                  <p className="text-xs text-muted-foreground mt-1 break-all">{result.imageUrl}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            className="w-full h-12 rounded-xl"
            disabled={!file || !title || loading}
            onClick={handleUpload}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" /> Upload to Cloudinary & Save to DB</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
