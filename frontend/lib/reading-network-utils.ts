// frontend/lib/reading-network-utils.ts — Network & Storage resilience for Reading module

export interface Banner {
  kind: "warning" | "error" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    run: () => void;
  };
}

export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Operation timed out. Please check your internet connection."
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(message)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export const safeSessionStorage = {
  getItem<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const val = sessionStorage.getItem(key);
      return val ? (JSON.parse(val) as T) : null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: unknown): boolean {
    if (typeof window === "undefined") return false;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export function describeError(
  err: unknown,
  context: "load" | "submit" | "save" = "submit"
): Banner {
  if (err instanceof TimeoutError) {
    return {
      kind: "warning",
      title: "Network Request Timed Out",
      message:
        context === "load"
          ? "Generating your reading test took longer than expected. Please retry."
          : "Submitting your reading test timed out. Your answers are saved locally — please click Retry.",
    };
  }

  if (err instanceof TypeError || (err instanceof Error && err.message.includes("fetch"))) {
    return {
      kind: "error",
      title: "Connection Lost",
      message: "Unable to connect to the server. Please verify your internet connection and retry.",
    };
  }

  return {
    kind: "error",
    title: "Something Went Wrong",
    message: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
  };
}
