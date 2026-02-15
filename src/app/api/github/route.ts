import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieName = process.env.NEXTAUTH_URL?.includes("localhost") 
      ? "next-auth.session-token" 
      : "__Secure-next-auth.session-token";
    
    const sessionToken = request.headers.get("cookie")?.match(new RegExp(`${cookieName}=([^;]+)`))?.[1];

    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session cookie found" },
        { status: 401 }
      );
    }

    const { decode } = await import("next-auth/jwt");
    const decoded = await decode({ token: sessionToken, secret: process.env.NEXTAUTH_SECRET || "" });
    
    console.log("Decoded token:", decoded);
    
    const accessToken = decoded?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token found", decoded: !!decoded, hasAccessToken: !!(decoded as any)?.accessToken },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const GITHUB_API_BASE = "https://api.github.com";
    
    const fetchWithAuth = async (endpoint: string) => {
      const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    };

    const repos = await fetchWithAuth("/user/repos?sort=pushed&per_page=100");

    let totalCommits = 0;
    let totalPRs = 0;
    let mergedPRs = 0;
    let openPRs = 0;
    const contributors = new Set<string>();
    let prsWithLeadTime: { created: Date; merged: Date }[] = [];
    let prsWithReviewDelay: { created: Date; firstReview: Date | null }[] = [];

    for (const repo of repos.slice(0, 10)) {
      try {
        const [commits, prs] = await Promise.all([
          fetchWithAuth(`/${repo.full_name}/commits?per_page=50`),
          fetchWithAuth(`/${repo.full_name}/pulls?state=all&per_page=50`)
        ]);

        totalCommits += commits.length;

        for (const commit of commits) {
          if (commit.author?.login) {
            contributors.add(commit.author.login);
          }
        }

        for (const pr of prs) {
          totalPRs++;
          if (pr.state === "closed" && pr.merged_at) {
            mergedPRs++;
            prsWithLeadTime.push({
              created: new Date(pr.created_at),
              merged: new Date(pr.merged_at)
            });
            
            const firstReview = await fetchWithAuth(`/${repo.full_name}/pulls/${pr.number}/reviews`).catch(() => []);
            if (firstReview.length > 0) {
              const sortedReviews = firstReview.sort((a: any, b: any) => 
                new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
              );
              prsWithReviewDelay.push({
                created: new Date(pr.created_at),
                firstReview: new Date(sortedReviews[0].submitted_at)
              });
            }
          } else if (pr.state === "open") {
            openPRs++;
          }
        }
      } catch (e) {
        console.log(`Error fetching ${repo.full_name}:`, e);
      }
    }

    const avgLeadTime = prsWithLeadTime.length > 0
      ? prsWithLeadTime.reduce((sum, pr) => sum + (pr.merged.getTime() - pr.created.getTime()), 0) / prsWithLeadTime.length / (1000 * 60 * 60 * 24)
      : 0;

    const avgReviewDelay = prsWithReviewDelay.length > 0
      ? prsWithReviewDelay.filter(pr => pr.firstReview).reduce((sum, pr) => sum + (pr.firstReview!.getTime() - pr.created.getTime()), 0) / prsWithReviewDelay.filter(pr => pr.firstReview).length / (1000 * 60 * 60)
      : 0;

    const metrics = {
      leadTime: Math.round(avgLeadTime * 10) / 10,
      cycleTime: Math.round(avgLeadTime * 8 * 10) / 10,
      prReviewDelay: Math.round(avgReviewDelay * 10) / 10,
      deploymentFrequency: 0,
      changeFailureRate: 0,
      totalCommits,
      totalPRs,
      mergedPRs,
      openPRs,
      deployments: 0,
      contributors: contributors.size
    };

    return NextResponse.json({
      repos: repos.map((r: any) => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        language: r.language,
        pushed_at: r.pushed_at
      })),
      metrics,
      selectedRepo: null
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data", details: String(error) },
      { status: 500 }
    );
  }
}
