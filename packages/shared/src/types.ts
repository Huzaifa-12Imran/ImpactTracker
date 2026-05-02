// =============================================
// Impact Tracker — Shared Type Definitions
// =============================================

// --- Sectors & SDG ---

export type Sector =
  | "Health"
  | "Education"
  | "Climate"
  | "Humanitarian"
  | "Civic Tech"
  | "Accessibility"
  | "General Tech";

export type SDGGoal = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;

// --- Analysis Status ---

export type AnalysisStatus = "PENDING" | "IN_PROGRESS" | "COMPLETE" | "FAILED";

// --- Classification ---

export interface ClassificationResult {
  sector: Sector;
  confidence: number;
  sdgGoals: SDGGoal[];
  keywords: string[];
  source: "gemini" | "openrouter" | "rule-based";
}

// --- Scoring ---

export interface ScoreDimensions {
  sectorRelevance: number;       // 0-30
  contributorGeography: number;  // 0-25
  firstTimerOnboarding: number;  // 0-20
  docsAccessibility: number;     // 0-15
  communityHealth: number;       // 0-10
}

export interface ImpactScoreResult extends ScoreDimensions {
  totalScore: number;            // 0-100
  sector: Sector;
  sectorConfidence: number;
  sdgGoals: SDGGoal[];
  sectorKeywords: string[];
  contentHash: string;
  source: "gemini" | "openrouter" | "rule-based";
}

// --- Repository Data ---

export interface RepoMetadata {
  githubId: number;
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  topics: string[];
  language: string | null;
  stars: number;
  license: string | null;
}

export interface RepoAnalysisData {
  metadata: RepoMetadata;
  readmeContent: string | null;
  contributors: ContributorData[];
  hasContributing: boolean;
  hasCodeOfConduct: boolean;
  communityProfile: CommunityProfile | null;
}

export interface ContributorData {
  login: string;
  location: string | null;
  resolvedCountry: string | null;
  commitCount: number;
  isFirstTimer: boolean;
  firstContribAt: string | null;
}

export interface CommunityProfile {
  hasCodeOfConduct: boolean;
  hasContributing: boolean;
  hasIssueTemplate: boolean;
  hasPullRequestTemplate: boolean;
  hasLicense: boolean;
  healthPercentage: number;
}

// --- Contributor Geography ---

export interface ContributorCountryMap {
  [countryCode: string]: number;  // e.g. { "US": 12, "IN": 8 }
}

// --- Badge ---

export type BadgeStyle = "default" | "flat" | "sdg";

export interface BadgeOptions {
  owner: string;
  repo: string;
  style: BadgeStyle;
  score: number | null;
  sector: Sector | null;
}

// --- API Responses ---

export interface ScoreResponse {
  repository: {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    stars: number;
    language: string | null;
    status: AnalysisStatus;
    statusMessage: string | null;
    readmeLength: number;
    hasContributing: boolean;
    hasCodeOfConduct: boolean;
  };
  score: {
    totalScore: number;
    dimensions: ScoreDimensions;
    sector: Sector | null;
    sectorConfidence: number | null;
    sdgGoals: number[];
    sectorKeywords: string[];
    contributorCountries: ContributorCountryMap;
    firstTimerCount: number | null;
    totalContributors: number | null;
    lastAnalyzedAt: string | null;
  } | null;
}

export interface ScoreHistoryEntry {
  totalScore: number;
  dimensions: ScoreDimensions;
  createdAt: string;
}

export interface RepoStatusResponse {
  status: AnalysisStatus;
  statusMessage: string | null;
  queuedAt: string | null;
  lastAnalyzedAt: string | null;
}

// --- Admin ---

export interface SDGWeightUpdate {
  [sdgGoal: string]: number;
}

// --- Webhook Events ---

export type WebhookEventType =
  | "installation"
  | "push"
  | "pull_request"
  | "issues"
  | "star"
  | "create";
