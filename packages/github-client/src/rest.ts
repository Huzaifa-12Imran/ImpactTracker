// REST API helpers — wraps common GitHub REST endpoints
import type { Octokit } from "octokit";
import type { RepoMetadata, ContributorData, CommunityProfile } from "@impact/shared";

/**
 * Fetch repository metadata including topics.
 */
export async function getRepo(octokit: Octokit, owner: string, repo: string): Promise<RepoMetadata> {
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return {
    githubId: data.id,
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    topics: data.topics ?? [],
    language: data.language,
    stars: data.stargazers_count,
    license: data.license?.spdx_id ?? null,
  };
}

/**
 * Fetch all contributors with pagination.
 */
export async function getContributors(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<ContributorData[]> {
  const contributors: ContributorData[] = [];

  const iterator = octokit.paginate.iterator(octokit.rest.repos.listContributors, {
    owner,
    repo,
    per_page: 100,
    anon: "false",
  });

  for await (const response of iterator) {
    for (const contrib of response.data) {
      if (!contrib.login) continue;

      // Fetch user profile for location
      let location: string | null = null;
      try {
        const { data: user } = await octokit.rest.users.getByUsername({
          username: contrib.login,
        });
        location = user.location;
        console.log(`[GitHub API] User: ${contrib.login}, Raw Profile Location: "${location}"`);
      } catch {
        // User profile fetch failed — skip location
      }

      contributors.push({
        login: contrib.login,
        location,
        resolvedCountry: null, // Resolved by the shared utils
        commitCount: contrib.contributions ?? 0,
        isFirstTimer: false,   // Will be resolved after PR fetch
        firstContribAt: null,
      });
    }
  }

  return contributors;
}

/**
 * Fetch repository README content (decoded from base64).
 */
export async function getReadme(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const { data } = await octokit.rest.repos.getReadme({ owner, repo });
    if (data.content && data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return data.content ?? null;
  } catch {
    return null; // No README
  }
}

/**
 * Check if specific files exist in the repo root.
 */
export async function checkFileExists(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string
): Promise<boolean> {
  try {
    await octokit.rest.repos.getContent({ owner, repo, path });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get community profile (code of conduct, contributing, etc.)
 */
export async function getCommunityProfile(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<CommunityProfile | null> {
  try {
    const { data } = await octokit.rest.repos.getCommunityProfileMetrics({ owner, repo });
    return {
      hasCodeOfConduct: data.files?.code_of_conduct !== null && data.files?.code_of_conduct !== undefined,
      hasContributing: data.files?.contributing !== null && data.files?.contributing !== undefined,
      hasIssueTemplate: data.files?.issue_template !== null && data.files?.issue_template !== undefined,
      hasPullRequestTemplate: data.files?.pull_request_template !== null && data.files?.pull_request_template !== undefined,
      hasLicense: data.files?.license !== null && data.files?.license !== undefined,
      healthPercentage: data.health_percentage ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Get the set of contributor logins who opened their first-ever PR to this repo.
 * GitHub marks these with author_association = "FIRST_TIME_CONTRIBUTOR".
 */
export async function getFirstTimerLogins(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Set<string>> {
  const firstTimers = new Set<string>();
  try {
    const iterator = octokit.paginate.iterator(octokit.rest.pulls.list, {
      owner,
      repo,
      state: "all",
      per_page: 100,
    });
    for await (const response of iterator) {
      for (const pr of response.data) {
        if (pr.author_association === "FIRST_TIME_CONTRIBUTOR" && pr.user?.login) {
          firstTimers.add(pr.user.login);
        }
      }
    }
  } catch {
    // Swallow — repos with no PRs return empty set
  }
  return firstTimers;
}

/**
 * Calculates community activity stats like PR merge rate and issue response time.
 */
export async function getCommunityActivityStats(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ avgIssueResponseHours: number | null; prMergeRate: number | null }> {
  let avgIssueResponseHours: number | null = null;
  let prMergeRate: number | null = null;

  try {
    // 1. Calculate PR Merge Rate (last 50 PRs)
    const { data: pulls } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
      per_page: 50,
    });

    if (pulls.length > 0) {
      const closedPulls = pulls.filter(p => p.state === "closed");
      if (closedPulls.length > 0) {
        const mergedPulls = closedPulls.filter(p => p.merged_at !== null);
        prMergeRate = mergedPulls.length / closedPulls.length;
      } else {
        prMergeRate = 1.0; // All open = optimistic
      }
    }

    // 2. Calculate Avg Issue Response Time (last 30 issues)
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: "all",
      per_page: 30,
    });

    const actualIssues = issues.filter(i => !i.pull_request);
    let totalResponseTimeMs = 0;
    let respondedIssuesCount = 0;

    for (const issue of actualIssues) {
      if (issue.comments > 0) {
        const { data: comments } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: issue.number,
          per_page: 1,
        });

        if (comments.length > 0) {
          const createdAt = new Date(issue.created_at).getTime();
          const respondedAt = new Date(comments[0].created_at).getTime();
          totalResponseTimeMs += Math.max(0, respondedAt - createdAt);
          respondedIssuesCount++;
        }
      }
    }

    if (respondedIssuesCount > 0) {
      avgIssueResponseHours = (totalResponseTimeMs / respondedIssuesCount) / (1000 * 60 * 60);
    } else if (actualIssues.length > 0 && actualIssues.some(i => i.state === 'closed')) {
      avgIssueResponseHours = 12; // If closed without comments, assume 12 hours
    } else if (actualIssues.length === 0) {
      avgIssueResponseHours = 12; // Optimistic if no issues
    }

  } catch (error) {
    console.error(`[GitHub API] Failed to fetch community stats for ${owner}/${repo}`);
  }

  return { avgIssueResponseHours, prMergeRate };
}
