"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, GitPullRequest, GitBranch, Users, Loader2, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface GitHubData {
  repos: {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    language: string;
    pushed_at: string;
  }[];
  metrics: {
    leadTime: number;
    cycleTime: number;
    prReviewDelay: number;
    deploymentFrequency: number;
    totalCommits: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    contributors: number;
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);

  useEffect(() => {
    if (session) {
      fetchGitHubData();
    }
  }, [session]);

  const fetchGitHubData = async () => {
    try {
      const res = await fetch("/api/github?days=30");
      const data = await res.json();
      setGithubData(data);
    } catch (e) {
      console.error("Error fetching GitHub data:", e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    if (!query || !githubData) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const q = query.toLowerCase();
      const searchResults: any[] = [];

      githubData.repos.forEach(repo => {
        if (repo.name.toLowerCase().includes(q) || repo.full_name.toLowerCase().includes(q)) {
          searchResults.push({
            type: "repo",
            ...repo
          });
        }
      });

      if (searchResults.length === 0) {
        searchResults.push({
          type: "no-results",
          message: `No results found for "${query}"`
        });
      }

      setResults(searchResults);
      setLoading(false);
    }, 300);
  }, [query, githubData]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-400">Search across your repositories and metrics</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result, index) => (
            result.type === "no-results" ? (
              <Card key="no-results" className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-8 text-center text-slate-400">
                  {result.message}
                </CardContent>
              </Card>
            ) : (
              <Card 
                key={result.id} 
                className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-700">
                      <GitBranch className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{result.name}</p>
                      <p className="text-sm text-slate-400">{result.full_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.private && <span className="text-xs">🔒</span>}
                      <span className="text-xs text-slate-500">{result.language || "Unknown"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}

      {githubData && !query && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <GitBranch className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubData.repos.length}</p>
              <p className="text-sm text-slate-400">Repositories</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <GitPullRequest className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubData.metrics.totalPRs}</p>
              <p className="text-sm text-slate-400">Pull Requests</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{githubData.metrics.contributors}</p>
              <p className="text-sm text-slate-400">Contributors</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
