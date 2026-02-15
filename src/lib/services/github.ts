const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  default_branch: string;
  pushed_at: string;
  language: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  reviews: GitHubReview[];
}

export interface GitHubReview {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  state: string;
  submitted_at: string;
}

export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  created_at: string;
  updated_at: string;
}

export async function fetchWithAuth(token: string, endpoint: string) {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function getUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const repos = await fetchWithAuth(accessToken, "/user/repos?sort=pushed&per_page=100");
  return repos;
}

export async function getRepoCommits(accessToken: string, owner: string, repo: string, since?: string): Promise<GitHubCommit[]> {
  let endpoint = `/${owner}/${repo}/commits?per_page=100`;
  if (since) {
    endpoint += `&since=${since}`;
  }
  return fetchWithAuth(accessToken, endpoint);
}

export async function getRepoPRs(accessToken: string, owner: string, repo: string, state: "open" | "closed" | "all" = "all"): Promise<GitHubPR[]> {
  const prs = await fetchWithAuth(accessToken, `/${owner}/${repo}/pulls?state=${state}&per_page=100`);
  
  const prsWithDetails = await Promise.all(
    prs.map(async (pr: any) => {
      const reviews = await fetchWithAuth(accessToken, `/${owner}/${repo}/pulls/${pr.number}/reviews`);
      return { ...pr, reviews };
    })
  );
  
  return prsWithDetails;
}

export async function getRepoDeployments(accessToken: string, owner: string, repo: string): Promise<GitHubDeployment[]> {
  return fetchWithAuth(accessToken, `/${owner}/${repo}/deployments?per_page=30`);
}

export interface TeamMetrics {
  leadTime: number;
  cycleTime: number;
  prReviewDelay: number;
  deploymentFrequency: number;
  changeFailureRate: number;
  totalCommits: number;
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  deployments: number;
  contributors: number;
}

export async function calculateDoraMetrics(accessToken: string, repos: GitHubRepo[], days: number = 30): Promise<TeamMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  let totalCommits = 0;
  let totalPRs = 0;
  let mergedPRs = 0;
  let openPRs = 0;
  let prsWithLeadTime: { created: Date; merged: Date }[] = [];
  let prsWithCycleTime: { firstCommit: Date; merged: Date }[] = [];
  let prsWithReviewDelay: { created: Date; firstReview: Date | null }[] = [];
  let deployments = 0;
  const contributors = new Set<string>();

  for (const repo of repos) {
    try {
      const [commits, prs, deploys] = await Promise.all([
        getRepoCommits(accessToken, repo.owner, repo.name, sinceISO),
        getRepoPRs(accessToken, repo.owner, repo.name, "all"),
        getRepoDeployments(accessToken, repo.owner, repo.name).catch(() => [])
      ]);

      totalCommits += commits.length;
      totalPRs += prs.length;
      deployments += deploys.length;

      for (const commit of commits) {
        if (commit.author?.login) {
          contributors.add(commit.author.login);
        }
      }

      for (const pr of prs) {
        if (pr.state === "closed" && pr.merged_at) {
          mergedPRs++;
          const created = new Date(pr.created_at);
          const merged = new Date(pr.merged_at);
          const leadTime = (merged.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          prsWithLeadTime.push({ created, merged });

          const firstReview = pr.reviews?.[0];
          if (firstReview) {
            const reviewDate = new Date(firstReview.submitted_at);
            const reviewDelay = (reviewDate.getTime() - created.getTime()) / (1000 * 60 * 60);
            prsWithReviewDelay.push({ created, firstReview: reviewDate });
          }
        } else if (pr.state === "open") {
          openPRs++;
        }
      }
    } catch (error) {
      console.error(`Error fetching data for ${repo.full_name}:`, error);
    }
  }

  const avgLeadTime = prsWithLeadTime.length > 0
    ? prsWithLeadTime.reduce((sum, pr) => sum + (pr.merged.getTime() - pr.created.getTime()), 0) / prsWithLeadTime.length / (1000 * 60 * 60 * 24)
    : 0;

  const avgCycleTime = prsWithCycleTime.length > 0
    ? prsWithCycleTime.reduce((sum, pr) => sum + (pr.merged.getTime() - pr.firstCommit.getTime()), 0) / prsWithCycleTime.length / (1000 * 60 * 60)
    : avgLeadTime * 24;

  const avgReviewDelay = prsWithReviewDelay.length > 0
    ? prsWithReviewDelay.filter(pr => pr.firstReview).reduce((sum, pr) => sum + (pr.firstReview!.getTime() - pr.created.getTime()), 0) / prsWithReviewDelay.filter(pr => pr.firstReview).length / (1000 * 60 * 60)
    : 0;

  const deploysPerWeek = (deployments / days) * 7;
  const failureRate = 0;

  return {
    leadTime: Math.round(avgLeadTime * 10) / 10,
    cycleTime: Math.round(avgCycleTime * 10) / 10,
    prReviewDelay: Math.round(avgReviewDelay * 10) / 10,
    deploymentFrequency: Math.round(deploysPerWeek * 10) / 10,
    changeFailureRate: failureRate,
    totalCommits,
    totalPRs,
    mergedPRs,
    openPRs,
    deployments,
    contributors: contributors.size
  };
}
