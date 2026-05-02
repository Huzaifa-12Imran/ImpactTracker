/**
 * Impact Tracker API — Express Entry Point
 *
 * Starts the Express server, registers routes, and boots BullMQ workers.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import webhookRoutes from "./routes/webhooks.js";
import repoRoutes from "./routes/repos.js";
import badgeRoutes from "./routes/badge.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { startAnalysisWorker } from "./workers/analysis.worker.js";
import { startScoringWorker } from "./workers/scoring.worker.js";

const app: express.Express = express();
const PORT = process.env.PORT ?? 4000;

// --- Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for now to ensure badges work everywhere
}));
app.use(cors({
  origin: process.env.APP_URL ?? "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

// --- Health Check ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/webhooks", webhookRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/badge", badgeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Start Server & Workers ---
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌍 Impact Tracker API                 ║
  ║   Running on port: ${PORT}                ║
  ║   Address: 0.0.0.0                      ║
  ║   Environment: ${process.env.NODE_ENV ?? "development"}          ║
  ╚══════════════════════════════════════════╝
  `);

  // Boot BullMQ workers
  try {
    startAnalysisWorker();
    console.log("  ✅ Analysis worker started");
    startScoringWorker();
    console.log("  ✅ Scoring worker started");
  } catch (error) {
    console.warn("  ⚠️  Workers failed to start (Redis may not be running):", (error as Error).message);
  }
});

export default app;
