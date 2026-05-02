import { computeImpactScore } from "../packages/scorer/src/index.js";

const input = {
  sector: "General Tech",
  sectorConfidence: 0.9,
  sdgGoals: [9],
  sectorKeywords: ["tools"],
  contributors: [{ resolvedCountry: "PK", isFirstTimer: false }],
  readmeContent: "# Tool Repo\n" + "A".repeat(600),
  topics: ["tools"],
  hasContributing: false,
  hasCodeOfConduct: false,
  communityProfile: null,
  avgIssueResponseHours: null,
  prMergeRate: null,
  lastActivityDate: new Date(),
};

const result = computeImpactScore(input);
console.log("General Tech Score Result:", JSON.stringify(result, null, 2));
