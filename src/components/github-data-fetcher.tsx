"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  GitPullRequest, 
  Rocket, 
  Clock, 
  Timer, 
  Users,
  RefreshCw,
  Loader2,
  AlertCircle,
  Settings
} from "lucide-react";
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
    changeFailureRate: number;
    totalCommits: number;
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    deployments: number;
    contributors: number;
  };
  selectedRepo: any;
}

export default function GitHubDataFetcher() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/github?days=30");
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || "Failed to fetch data");
        return;
      }
      
      setData(result);
      setError(null);
    } catch (err) {
      setError("Failed to fetch GitHub data");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">Fetching your GitHub data...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <p className="text-slate-400">Sign in with GitHub to see your metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { repos, metrics } = data;

  const getBenchmark = (value: number, type: "leadTime" | "cycleTime" | "reviewDelay" | "deployFreq") => {
    const thresholds = {
      leadTime: { elite: 1, high: 7, medium: 30 },
      cycleTime: { elite: 4, high: 24, medium: 168 },
      reviewDelay: { elite: 4, high: 24, medium: 48 },
      deployFreq: { elite: 1, high: 0.14, medium: 0.03 }
    };
    
    const t = thresholds[type];
    if (type === "deployFreq") {
      if (value >= t.elite) return "elite";
      if (value >= t.high) return "high";
      if (value >= t.medium) return "medium";
      return "low";
    }
    
    if (value <= t.elite) return "elite";
    if (value <= t.high) return "high";
    if (value <= t.medium) return "medium";
    return "low";
  };

  const benchmarkLabels: Record<string, string> = {
    elite: "Elite",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const benchmarkColors: Record<string, string> = {
    elite: "text-emerald-400 bg-emerald-500/20",
    high: "text-blue-400 bg-blue-500/20",
    medium: "text-amber-400 bg-amber-500/20",
    low: "text-red-400 bg-red-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">GitHub Metrics</h2>
            <p className="text-sm text-slate-400">
              {repos.length} repositories • Last 30 days
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData}
          disabled={refreshing}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Lead Time</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[getBenchmark(metrics.leadTime, "leadTime")])}>
                {benchmarkLabels[getBenchmark(metrics.leadTime, "leadTime")]}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.leadTime > 0 ? metrics.leadTime : "<1"} <span className="text-sm font-normal text-slate-400">days</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Cycle Time</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[getBenchmark(metrics.cycleTime, "cycleTime")])}>
                {benchmarkLabels[getBenchmark(metrics.cycleTime, "cycleTime")]}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.cycleTime > 0 ? metrics.cycleTime : "<1"} <span className="text-sm font-normal text-slate-400">hours</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <GitPullRequest className="w-4 h-4" />
                <span className="text-sm">PR Review Delay</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[getBenchmark(metrics.prReviewDelay, "reviewDelay")])}>
                {benchmarkLabels[getBenchmark(metrics.prReviewDelay, "reviewDelay")]}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.prReviewDelay > 0 ? metrics.prReviewDelay : "<1"} <span className="text-sm font-normal text-slate-400">hours</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Rocket className="w-4 h-4" />
                <span className="text-sm">Deploy Frequency</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[getBenchmark(metrics.deploymentFrequency, "deployFreq")])}>
                {benchmarkLabels[getBenchmark(metrics.deploymentFrequency, "deployFreq")]}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {metrics.deploymentFrequency} <span className="text-sm font-normal text-slate-400">/week</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <GitBranch className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.totalCommits}</p>
            <p className="text-xs text-slate-400">Commits</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.totalPRs}</p>
            <p className="text-xs text-slate-400">PRs</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.mergedPRs}</p>
            <p className="text-xs text-slate-400">Merged</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Rocket className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.deployments}</p>
            <p className="text-xs text-slate-400">Deploys</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.contributors}</p>
            <p className="text-xs text-slate-400">Contributors</p>
          </CardContent>
        </Card>
      </div>

      {repos.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Connected Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {repos.slice(0, 9).map((repo) => (
                <div 
                  key={repo.id} 
                  className="p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white truncate">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs text-slate-500">🔒</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {repo.language || "Unknown"} • {new Date(repo.pushed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {repos.length > 9 && (
              <p className="text-sm text-slate-400 mt-3 text-center">
                +{repos.length - 9} more repositories
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
