import { z } from "zod";

const envSchema = z.object({
  // GitHub App
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_PRIVATE_KEY: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().min(1),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),

  // Admin
  ADMIN_API_KEY: z.string().min(1),

  // App
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("4000"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    for (const issue of result.error.issues) {
      console.error(`   ${issue.path.join(".")}: ${issue.message}`);
    }
    // In development, use permissive defaults
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Running in dev mode with permissive env validation");
      _env = envSchema.parse({
        ...process.env,
        GITHUB_APP_ID: process.env.GITHUB_APP_ID ?? "dev",
        GITHUB_PRIVATE_KEY: process.env.GITHUB_PRIVATE_KEY ?? "dev",
        GITHUB_WEBHOOK_SECRET: process.env.GITHUB_WEBHOOK_SECRET ?? "dev",
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "dev",
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "dev",
        DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://impact:impact_pass@localhost:5432/impact_tracker",
        REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
        ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? "dev-admin-key",
      });
      return _env;
    }
    throw new Error("Missing required environment variables");
  }

  _env = result.data;
  return _env;
}
