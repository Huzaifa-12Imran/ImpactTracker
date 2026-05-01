// GraphQL API queries — contribution calendar, dependency manifests
import type { Octokit } from "octokit";

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface DependencyNode {
  packageName: string;
  requirements: string;
  packageManager: string;
}

export interface DependencyManifest {
  filename: string;
  blobPath: string;
  dependencies: DependencyNode[];
}

/**
 * Fetch a user's contribution calendar for the past year.
 */
export async function getContributionCalendar(
  octokit: Octokit,
  username: string
): Promise<ContributionCalendar | null> {
  try {
    const query = `
      query($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const result: {
      user: {
        contributionsCollection: {
          contributionCalendar: ContributionCalendar;
        };
      };
    } = await octokit.graphql(query, { login: username });

    return result.user.contributionsCollection.contributionCalendar;
  } catch {
    return null;
  }
}

/**
 * Fetch dependency graph manifests for a repository.
 */
export async function getDependencyManifests(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<DependencyManifest[]> {
  try {
    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          dependencyGraphManifests(first: 10) {
            nodes {
              filename
              blobPath
              dependencies(first: 100) {
                nodes {
                  packageName
                  requirements
                  packageManager
                }
              }
            }
          }
        }
      }
    `;

    const result: {
      repository: {
        dependencyGraphManifests: {
          nodes: Array<{
            filename: string;
            blobPath: string;
            dependencies: {
              nodes: DependencyNode[];
            };
          }>;
        };
      };
    } = await octokit.graphql(query, { owner, repo });

    return result.repository.dependencyGraphManifests.nodes.map((m) => ({
      filename: m.filename,
      blobPath: m.blobPath,
      dependencies: m.dependencies.nodes,
    }));
  } catch {
    return [];
  }
}

/**
 * Check if a user is a first-time contributor to a specific repo.
 * Uses the search API to count PRs by this user in this repo.
 */
export async function isFirstTimeContributor(
  octokit: Octokit,
  owner: string,
  repo: string,
  username: string
): Promise<boolean> {
  try {
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} author:${username} type:pr is:merged`,
      per_page: 1,
    });
    return data.total_count <= 1;
  } catch {
    return false;
  }
}
