"use client"

// components/writing/error-modal.tsx
//
// Same look-and-feel as the connection modal used on the Speaking test
// screen: a centered card over a blurred backdrop, with a clear icon,
// title, plain-English message, and one-tap retry.

import { useEffect } from "react"
import { AlertTriangle, WifiOff, X } from "lucide-react"
import type { Banner } from "@/lib/writing-network-utils"

export function ErrorModal({
  banner,
  onClose,
}: {
  banner: Banner | null
  onClose: () => void
}) {
  // Close on Escape.
  useEffect(() => {
    if (!banner) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [banner, onClose])

  if (!banner) return null

  const isOffline = banner.title.toLowerCase().includes("offline")

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="writing-error-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-[fadeIn_120ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 p-6 text-center animate-[popIn_150ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            banner.kind === "error"
              ? "bg-red-50"
              : banner.kind === "warning"
              ? "bg-amber-50"
              : "bg-blue-50"
          }`}
        >
          {isOffline ? (
            <WifiOff
              className={`w-6 h-6 ${banner.kind === "error" ? "text-red-500" : "text-amber-500"}`}
            />
          ) : (
            <AlertTriangle
              className={`w-6 h-6 ${
                banner.kind === "error"
                  ? "text-red-500"
                  : banner.kind === "warning"
                  ? "text-amber-500"
                  : "text-blue-500"
              }`}
            />
          )}
        </div>

        <h2 id="writing-error-title" className="text-base font-bold text-gray-900 mb-1.5">
          {banner.title}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{banner.message}</p>

        <div className="flex flex-col gap-2">
          {banner.action && (
            <button
              onClick={banner.action.run}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              {banner.action.label}
            </button>
          )}
          {banner.secondaryAction && (
            <button
              onClick={banner.secondaryAction.run}
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors border border-gray-200"
            >
              {banner.secondaryAction.label}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}

/** Small pill shown in headers so the candidate always knows their connection state. */
export function OfflinePill({ online }: { online: boolean }) {
  if (online) return null
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
      <WifiOff className="w-3 h-3" /> OFFLINE
    </span>
  )
}
