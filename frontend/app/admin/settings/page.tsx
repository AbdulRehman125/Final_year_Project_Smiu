"use client";

// app/admin/settings/page.tsx
// Production-ready Admin System Settings page for dynamic backend LLM & frontend AI feature configs

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const POPULAR_MODELS = [
  { value: "", label: "Default (Use backend .env)" },
  { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile" },
  { value: "llama3-70b-8192", label: "Llama 3 70B 8192" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B (32k Context)" },
  { value: "custom", label: "Custom Model..." },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State (empty by default if not set in DB)
  const [groqApiKey, setGroqApiKey] = useState("");
  const [llmModel, setLlmModel] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [llmMaxTokens, setLlmMaxTokens] = useState("");
  const [llmTemperature, setLlmTemperature] = useState("");
  const [generateReadingWithAI, setGenerateReadingWithAI] = useState(false);
  const [generateListeningWithAI, setGenerateListeningWithAI] = useState(false);

  // Check admin role
  useEffect(() => {
    if (!isPending) {
      const role = (session?.user as any)?.role;
      if (!session?.user) {
        router.replace("/auth/sign-in");
      } else if (role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [session, isPending, router]);

  // Load existing settings from DB
  const loadSettings = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (res.ok && data.settings) {
        const map: Record<string, string> = {};
        for (const item of data.settings) {
          map[item.key] = item.value;
        }

        // Only set values that actually exist in DB
        setGroqApiKey(map["GROQ_API_KEY"] || "");

        const modelVal = map["LLM_MODEL"] || "";
        if (!modelVal) {
          setLlmModel("");
          setIsCustomModel(false);
        } else {
          const isPreset = POPULAR_MODELS.some((m) => m.value === modelVal);
          if (isPreset) {
            setLlmModel(modelVal);
            setIsCustomModel(false);
          } else {
            setLlmModel("custom");
            setCustomModel(modelVal);
            setIsCustomModel(true);
          }
        }

        setLlmMaxTokens(map["LLM_MAX_TOKENS"] || "");
        setLlmTemperature(map["LLM_TEMPERATURE"] || "");
        setGenerateReadingWithAI(map["NEXT_PUBLIC_GENERATE_READING_WITH_AI"] === "true");
        setGenerateListeningWithAI(map["NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI"] === "true");
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to load settings from database.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Could not connect to settings API.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = (session?.user as any)?.role;
    if (session?.user && role === "admin") {
      loadSettings();
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);

    const finalModel = isCustomModel ? customModel.trim() : llmModel;

    const payload = {
      settings: {
        GROQ_API_KEY: groqApiKey.trim(),
        LLM_MODEL: finalModel.trim(),
        LLM_MAX_TOKENS: llmMaxTokens.trim(),
        LLM_TEMPERATURE: llmTemperature.trim(),
        NEXT_PUBLIC_GENERATE_READING_WITH_AI: generateReadingWithAI ? "true" : "false",
        NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI: generateListeningWithAI ? "true" : "false",
      },
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "Settings saved successfully! Empty fields will dynamically fall back to .env values.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Failed to save settings.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Network error saving settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isPending || (!session && loading)) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] dark:bg-background flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if ((session?.user as any)?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-4xl mx-auto flex-1 px-4 py-8 sm:py-12">
        {/* Top Back Navigation & Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-3 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                System & AI Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Customize database settings. Unconfigured (empty) fields automatically fall back to your backend/frontend .env files.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-md h-11 px-6 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Toast / Alert */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 text-sm font-medium ${
              statusMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-3xl p-12 text-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading current configuration from database...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Backend Groq & LLM Config */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Cpu className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    Backend Groq LLM Configuration
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Powers Writing evaluation, Speaking conversation, and question generation.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Groq API Key */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Groq API Key (GROQ_API_KEY)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="Leave empty to use backend .env default (gsk_...)"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    If empty, the backend uses the <code className="font-mono text-sky-600">GROQ_API_KEY</code> from <code className="font-mono text-sky-600">backend/.env</code>.
                  </p>
                </div>

                {/* LLM Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      LLM Model (LLM_MODEL)
                    </label>
                    <select
                      value={isCustomModel ? "custom" : llmModel}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setIsCustomModel(true);
                        } else {
                          setIsCustomModel(false);
                          setLlmModel(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    >
                      {POPULAR_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isCustomModel && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                        Custom Model Identifier
                      </label>
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="e.g. llama-3.3-70b-specdec"
                        className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                  )}
                </div>

                {/* Tokens & Temperature */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Max Tokens (LLM_MAX_TOKENS)
                    </label>
                    <input
                      type="number"
                      min={500}
                      max={16384}
                      value={llmMaxTokens}
                      onChange={(e) => setLlmMaxTokens(e.target.value)}
                      placeholder="Leave empty for .env default (2000)"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">If blank, defaults to backend .env value.</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Temperature (LLM_TEMPERATURE)
                      </label>
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-800">
                        {llmTemperature || "Default (.env)"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={llmTemperature}
                      onChange={(e) => setLlmTemperature(e.target.value)}
                      placeholder="e.g. 0.2 (leave empty for .env default)"
                      className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Between 0.0 and 1.0. Lower values are stricter.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Frontend AI Feature Flags */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    Frontend AI Test Generation Flags
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Toggle whether candidate tests are generated live by Groq AI or pulled from pre-built DB tests.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Reading Test Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Reading AI Generation
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        NEXT_PUBLIC_GENERATE_READING_WITH_AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      When enabled, generates 3 full IELTS passages with 40 questions via LLM on demand.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGenerateReadingWithAI(!generateReadingWithAI)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      generateReadingWithAI ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        generateReadingWithAI ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Listening Test Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Listening AI Generation
                      </span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      When enabled, generates 4 listening audio transcripts and voice synthesis via EdgeTTS on demand.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGenerateListeningWithAI(!generateListeningWithAI)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      generateListeningWithAI ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        generateListeningWithAI ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={loadSettings}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload from Database
              </button>

              <Button
                onClick={handleSave}
                disabled={saving || loading}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl shadow-md h-11 px-8 transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
