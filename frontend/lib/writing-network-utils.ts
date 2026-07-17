// lib/writing-network-utils.ts
//
// Shared error-handling / connectivity helpers for the Writing module.
// Mirrors the hardening already used in the Speaking test screen so both
// modules fail in the same predictable, user-friendly way.

export type BannerKind = "error" | "warning" | "info"

/** A user-facing message shown for errors, warnings and connection issues. */
export interface Banner {
  kind: BannerKind
  title: string
  message: string
  action?: { label: string; run: () => void }
  secondaryAction?: { label: string; run: () => void }
}

/**
 * Actively check whether the machine can actually reach the internet.
 *
 * `navigator.onLine` only tells you the network *interface* is up — it stays
 * true on a LAN with no real internet. We fire a tiny no-cors request at a
 * couple of well-known, rarely-blocked endpoints instead. Success on any of
 * them = online; all failing = offline.
 */
export async function isInternetReachable(timeoutMs = 2500): Promise<boolean> {
  const endpoints = [
    "https://www.gstatic.com/generate_204",
    "https://connectivitycheck.gstatic.com/generate_204",
    "https://www.cloudflare.com/cdn-cgi/trace",
  ]
  for (const url of endpoints) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), timeoutMs)
      await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal })
      clearTimeout(t)
      return true
    } catch {
      // try the next endpoint
    }
  }
  return false
}

/** Thrown by withTimeout() when a promise takes too long. */
export class TimeoutError extends Error {
  constructor(message = "The request timed out") {
    super(message)
    this.name = "TimeoutError"
  }
}

/**
 * Race any promise (e.g. a fetch call from lib/writing-types) against a
 * timeout so a hung/slow request can never leave the UI stuck on a spinner
 * forever. We can't cancel the underlying request (no AbortController is
 * threaded through), but we can stop waiting on it and let the user retry.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(message)), ms)
    promise
      .then((v) => {
        clearTimeout(timer)
        resolve(v)
      })
      .catch((e) => {
        clearTimeout(timer)
        reject(e)
      })
  })
}

/**
 * Turn any thrown value (network failure, timeout, HTTP error, parse error,
 * or something unexpected) into a short, calm, non-technical message so the
 * candidate never has to read a raw error/stack trace.
 */
export function describeError(
  err: unknown,
  opts?: { online?: boolean; context?: "load" | "submit" | "save" }
): { title: string; message: string } {
  const context = opts?.context ?? "load"
  const online = opts?.online ?? (typeof navigator !== "undefined" ? navigator.onLine : true)

  // Offline is the most common real-world cause — check it first.
  if (!online) {
    return context === "submit"
      ? {
          title: "You're offline",
          message:
            "Your internet connection dropped, so we couldn't submit your test. Your writing is still safe on this screen — reconnect and try submitting again.",
        }
      : {
          title: "You're offline",
          message: "You need an internet connection for this. Reconnect and try again.",
        }
  }

  if (err instanceof TimeoutError) {
    return context === "submit"
      ? {
          title: "This is taking too long",
          message:
            "The examiner is taking longer than usual to respond. Your writing hasn't been lost — you can try submitting again.",
        }
      : {
          title: "This is taking too long",
          message: "The server didn't respond in time. Please try again.",
        }
  }

  if (err instanceof SyntaxError) {
    return {
      title: "Something went wrong",
      message: "We received an unexpected response from the server. Please try again.",
    }
  }

  if (err instanceof TypeError) {
    // Most browsers throw a bare TypeError for fetch network failures.
    return {
      title: "Connection problem",
      message:
        "We couldn't reach the server. Check your internet connection and try again.",
    }
  }

  if (err instanceof Error && /5\d\d|server/i.test(err.message)) {
    return {
      title: "Server error",
      message: "Our server ran into a problem on its end. Please try again in a moment.",
    }
  }

  if (err instanceof Error && /4\d\d/.test(err.message)) {
    return {
      title: "Request failed",
      message: "That request couldn't be completed. Please try again.",
    }
  }

  return context === "submit"
    ? {
        title: "Couldn't submit your test",
        message:
          "Something unexpected went wrong while submitting. Your writing is still on this screen — please try again.",
      }
    : {
        title: "Something went wrong",
        message: "An unexpected error occurred. Please try again.",
      }
}

/** Safe wrapper around sessionStorage — never throws (private mode, quota, disabled storage). */
export const safeSessionStorage = {
  get(key: string): string | null {
    try {
      return typeof window === "undefined" ? null : sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string): boolean {
    try {
      if (typeof window === "undefined") return false
      sessionStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  clear(): void {
    try {
      sessionStorage.clear()
    } catch {
      /* noop */
    }
  },
}
