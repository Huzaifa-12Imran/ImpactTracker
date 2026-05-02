import { computeImpactScore } from "../packages/scorer/src/index.js";
import { SECTORS } from "../packages/shared/src/constants.js";

const input = {
  sector: "Climate",
  sectorConfidence: 0.6,
  sdgGoals: [7, 13, 14, 15],
  sectorKeywords: ["wind"],
  contributors: [{ resolvedCountry: "PK", isFirstTimer: false }],
  readmeContent: "# Test Repo\nThis is a long readme for testing purposes. " + "A".repeat(600),
  topics: ["climate"],
  hasContributing: false,
  hasCodeOfConduct: false,
  communityProfile: null,
  avgIssueResponseHours: null,
  prMergeRate: null,
  lastActivityDate: new Date(),
};

const result = computeImpactScore(input);
console.log("New Score Result:", JSON.stringify(result, null, 2));
