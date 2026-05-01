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
      } catch {
        // User profile fetch failed — skip location
      }

      contributors.push({
        login: contrib.login,
        location,
        resolvedCountry: null, // Resolved by the shared utils
        commitCount: contrib.contributions ?? 0,
        isFirstTimer: false,   // Determined by analysis worker
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
