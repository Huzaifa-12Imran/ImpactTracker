import "dotenv/config";
import { startAnalysisWorker } from "../apps/api/src/workers/analysis.worker.js";
import { startScoringWorker } from "../apps/api/src/workers/scoring.worker.js";

console.log("--- Starting Manual Workers ---");

try {
  const analysisWorker = startAnalysisWorker();
  console.log("✅ Analysis worker started");
  
  const scoringWorker = startScoringWorker();
  console.log("✅ Scoring worker started");

  analysisWorker.on('active', (job) => console.log(`[Analysis] Job ${job.id} active`));
  analysisWorker.on('completed', (job) => console.log(`[Analysis] Job ${job.id} completed`));
  analysisWorker.on('failed', (job, err) => console.error(`[Analysis] Job ${job?.id} failed:`, err));

  scoringWorker.on('active', (job) => console.log(`[Scoring] Job ${job.id} active`));
  scoringWorker.on('completed', (job) => console.log(`[Scoring] Job ${job.id} completed`));
  scoringWorker.on('failed', (job, err) => console.error(`[Scoring] Job ${job?.id} failed:`, err));

} catch (error) {
  console.error("❌ Failed to start workers:", error);
}
