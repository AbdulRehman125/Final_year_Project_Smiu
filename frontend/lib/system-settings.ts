import { db } from "@/lib/db";

export interface SettingItem {
  key: string;
  value: string;
  category: "backend_llm" | "frontend_features" | "general";
  description?: string | null;
  hasDbValue: boolean;
}

export const SETTING_DEFINITIONS: Record<
  string,
  { category: "backend_llm" | "frontend_features" | "general"; description: string }
> = {
  GROQ_API_KEY: {
    category: "backend_llm",
    description: "Groq API Key used for AI evaluation and test generation",
  },
  LLM_MODEL: {
    category: "backend_llm",
    description: "Groq LLM model name (e.g. llama-3.3-70b-versatile, llama3-70b-8192)",
  },
  LLM_MAX_TOKENS: {
    category: "backend_llm",
    description: "Maximum tokens allowed per completion",
  },
  LLM_TEMPERATURE: {
    category: "backend_llm",
    description: "Temperature for model creativity (0.0 to 1.0)",
  },
  NEXT_PUBLIC_GENERATE_READING_WITH_AI: {
    category: "frontend_features",
    description: "Enable live AI generation for Reading tests instead of DB tests",
  },
  NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI: {
    category: "frontend_features",
    description: "Enable live AI generation for Listening tests instead of DB tests",
  },
};

/**
 * Fetch ONLY what is currently saved in the database.
 * If a key is not in the database, it will NOT be in the returned object.
 */
export async function getStoredSystemSettings(): Promise<Record<string, string>> {
  try {
    const records = await db.systemSetting.findMany();
    const result: Record<string, string> = {};

    for (const record of records) {
      if (record.value !== undefined && record.value !== null) {
        result[record.key] = record.value;
      }
    }

    return result;
  } catch (error) {
    console.error("Error loading system settings from DB:", error);
    return {};
  }
}

/**
 * Fetch detailed settings list for Admin UI.
 * If a key has not been saved in the DB yet, its value is "" (empty).
 */
export async function getDetailedSystemSettings(): Promise<SettingItem[]> {
  try {
    const records = await db.systemSetting.findMany();
    const recordMap = new Map<string, string>();
    for (const r of records) {
      recordMap.set(r.key, r.value);
    }

    const items: SettingItem[] = [];

    for (const [key, def] of Object.entries(SETTING_DEFINITIONS)) {
      const hasDbValue = recordMap.has(key) && recordMap.get(key) !== "";
      items.push({
        key,
        value: hasDbValue ? recordMap.get(key)! : "",
        category: def.category,
        description: def.description,
        hasDbValue,
      });
    }

    return items;
  } catch (error) {
    console.error("Error loading detailed system settings:", error);
    return Object.entries(SETTING_DEFINITIONS).map(([key, def]) => ({
      key,
      value: "",
      category: def.category,
      description: def.description,
      hasDbValue: false,
    }));
  }
}

/**
 * Update system settings in DB.
 * If value is empty or deleted, removes it from DB so system uses .env fallback.
 */
export async function updateSystemSettings(
  settings: Record<string, string>
): Promise<boolean> {
  try {
    for (const [key, value] of Object.entries(settings)) {
      const trimmed = typeof value === "string" ? value.trim() : "";
      const def = SETTING_DEFINITIONS[key];

      if (trimmed === "") {
        // If empty, delete from DB so it falls back to .env
        await db.systemSetting.deleteMany({
          where: { key },
        });
      } else {
        await db.systemSetting.upsert({
          where: { key },
          update: {
            value: trimmed,
            updatedAt: new Date(),
          },
          create: {
            key,
            value: trimmed,
            category: def?.category || "general",
            description: def?.description || null,
          },
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating system settings in DB:", error);
    throw error;
  }
}
