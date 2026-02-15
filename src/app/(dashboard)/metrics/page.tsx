"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Timer, GitPullRequest, Rocket, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GitHubData {
  repos: any[];
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
}

export default function MetricsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/github?days=30");
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error("Error fetching data:", e);
    }
    setLoading(false);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!data?.metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  const { metrics } = data;

  const getBenchmark = (value: number, type: string) => {
    if (type === "leadTime") {
      if (value <= 1) return "elite";
      if (value <= 7) return "high";
      if (value <= 30) return "medium";
      return "low";
    }
    if (type === "cycleTime") {
      if (value <= 4) return "elite";
      if (value <= 24) return "high";
      if (value <= 168) return "medium";
      return "low";
    }
    if (type === "prReviewDelay") {
      if (value <= 4) return "elite";
      if (value <= 24) return "high";
      if (value <= 48) return "medium";
      return "low";
    }
    if (type === "deployFreq") {
      if (value >= 1) return "elite";
      if (value >= 0.14) return "high";
      if (value >= 0.03) return "medium";
      return "low";
    }
    return "medium";
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

  const leadTimeBenchmark = getBenchmark(metrics.leadTime, "leadTime");
  const cycleTimeBenchmark = getBenchmark(metrics.cycleTime, "cycleTime");
  const reviewDelayBenchmark = getBenchmark(metrics.prReviewDelay, "prReviewDelay");
  const deployBenchmark = getBenchmark(metrics.deploymentFrequency, "deployFreq");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Metrics</h1>
        <p className="text-slate-400">Detailed DORA metrics from your GitHub repositories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Lead Time</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[leadTimeBenchmark])}>
                {benchmarkLabels[leadTimeBenchmark]}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {metrics.leadTime > 0 ? metrics.leadTime : "<1"} <span className="text-lg text-slate-400">days</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">Time from issue to deploy</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Cycle Time</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[cycleTimeBenchmark])}>
                {benchmarkLabels[cycleTimeBenchmark]}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {metrics.cycleTime > 0 ? metrics.cycleTime : "<1"} <span className="text-lg text-slate-400">hours</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">Time from first commit to merge</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <GitPullRequest className="w-4 h-4" />
                <span className="text-sm">PR Review Delay</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[reviewDelayBenchmark])}>
                {benchmarkLabels[reviewDelayBenchmark]}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {metrics.prReviewDelay > 0 ? metrics.prReviewDelay : "<1"} <span className="text-lg text-slate-400">hours</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">Time to first review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Rocket className="w-4 h-4" />
                <span className="text-sm">Deploy Frequency</span>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[deployBenchmark])}>
                {benchmarkLabels[deployBenchmark]}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">
              {metrics.deploymentFrequency} <span className="text-lg text-slate-400">/week</span>
            </p>
            <p className="text-sm text-slate-400 mt-2">Deploys per week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4 text-center">
            <GitPullRequest className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
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
            <Activity className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{metrics.contributors}</p>
            <p className="text-xs text-slate-400">Contributors</p>
          </CardContent>
        </Card>
      </div>

      {data.repos && data.repos.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader>
            <CardTitle>Repository Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.repos.slice(0, 9).map((repo) => (
                <div key={repo.id} className="p-3 rounded-lg bg-slate-700/30">
                  <p className="text-sm text-white truncate">{repo.name}</p>
                  <p className="text-xs text-slate-500">
                    {repo.language || "Unknown"} • {new Date(repo.pushed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
