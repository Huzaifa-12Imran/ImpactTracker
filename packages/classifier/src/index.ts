/**
 * AI Sector Classifier
 *
 * Three-tier classification strategy:
 *   1. Primary: Google Gemini (gemini-2.0-flash, free tier)
 *   2. Fallback: OpenRouter (Llama 3.1 8B, free tier)
 *   3. Last resort: Rule-based keyword classifier
 *
 * If all fail: returns null (caller marks as "pending" and retries in 1 hour)
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  type ClassificationResult,
  type Sector,
  type SDGGoal,
  classifyByKeywords,
  SECTOR_SDG_MAP,
} from "@impact/shared";
import { buildClassificationPrompt } from "./prompt.js";

interface ClassifyInput {
  fullName: string;
  description: string | null;
  topics: string[];
  language: string | null;
  readmeExcerpt: string | null;
}

interface RawClassification {
  sector: string;
  confidence: number;
  sdg_goals: number[];
  keywords: string[];
}

const VALID_SECTORS: Sector[] = [
  "Health", "Education", "Climate", "Humanitarian",
  "Civic Tech", "Accessibility", "General Tech",
];

/**
 * Classify a repository's social impact sector.
 * Tries Gemini → OpenRouter → Rule-based in sequence.
 */
export async function classifyRepo(input: ClassifyInput): Promise<ClassificationResult | null> {
  const prompt = buildClassificationPrompt(input);

  // Tier 1: Gemini
  const geminiResult = await tryGemini(prompt);
  if (geminiResult) return { ...geminiResult, source: "gemini" };

  // Tier 2: OpenRouter
  const openRouterResult = await tryOpenRouter(prompt);
  if (openRouterResult) return { ...openRouterResult, source: "openrouter" };

  // Tier 3: Rule-based
  const ruleResult = classifyByKeywords(input.topics, input.readmeExcerpt);
  if (ruleResult.matchedKeywords.length > 0) {
    const sector = ruleResult.sector;
    return {
      sector,
      confidence: ruleResult.confidence,
      sdgGoals: SECTOR_SDG_MAP[sector] ?? [9],
      keywords: ruleResult.matchedKeywords,
      source: "rule-based",
    };
  }

  // All methods failed
  return null;
}

// --- Gemini (Primary) ---

async function tryGemini(prompt: string): Promise<Omit<ClassificationResult, "source"> | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
        maxOutputTokens: 256,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseClassificationResponse(text);
  } catch (error) {
    console.error("[Classifier] Gemini failed:", (error as Error).message);
    return null;
  }
}

// --- OpenRouter (Fallback) ---

async function tryOpenRouter(prompt: string): Promise<Omit<ClassificationResult, "source"> | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL ?? "https://impact-tracker.dev",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content: "You are a JSON-only responder. Output valid JSON with no markdown fencing.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 256,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;

    return parseClassificationResponse(text);
  } catch (error) {
    console.error("[Classifier] OpenRouter failed:", (error as Error).message);
    return null;
  }
}

// --- Response Parsing ---

function parseClassificationResponse(text: string): Omit<ClassificationResult, "source"> | null {
  try {
    // Strip markdown fencing if present
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned) as RawClassification;

    // Validate sector
    const sector = VALID_SECTORS.includes(parsed.sector as Sector)
      ? (parsed.sector as Sector)
      : "General Tech";

    // Validate confidence
    const confidence = typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5;

    // Validate SDG goals
    const sdgGoals = (Array.isArray(parsed.sdg_goals)
      ? parsed.sdg_goals.filter((g) => typeof g === "number" && g >= 1 && g <= 17)
      : SECTOR_SDG_MAP[sector] ?? [9]
    ) as SDGGoal[];

    // Validate keywords
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k): k is string => typeof k === "string").slice(0, 10)
      : [];

    return { sector, confidence, sdgGoals, keywords };
  } catch (error) {
    console.error("[Classifier] Failed to parse response:", (error as Error).message);
    return null;
  }
}

export { buildClassificationPrompt } from "./prompt.js";
