"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GitHubDataFetcher from "@/components/github-data-fetcher";
import { 
  Clock, 
  Zap, 
  GitPullRequest, 
  Rocket,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Timer,
  Target,
  Heart,
  Loader2,
  Users
} from "lucide-react";
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

function MetricCard({ 
  title, 
  value, 
  unit, 
  benchmark,
  icon: Icon,
  iconBg,
  iconColor,
  benchmarkLabel
}: { 
  title: string;
  value: string | number;
  unit?: string;
  benchmark: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  benchmarkLabel: string;
}) {
  const benchmarkColors: Record<string, string> = {
    elite: "text-emerald-400 bg-emerald-500/20",
    high: "text-blue-400 bg-blue-500/20",
    medium: "text-amber-400 bg-amber-500/20",
    low: "text-red-400 bg-red-500/20",
  };
  
  return (
    <Card className="bg-slate-800/30 border-slate-700/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={cn("p-2.5 rounded-xl", iconBg)}>
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", benchmarkColors[benchmark])}>
            {benchmarkLabel}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-white">
            {value}<span className="text-lg text-slate-400 ml-1">{unit}</span>
          </p>
          <p className="text-sm text-slate-400 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, description, severity, action }: { 
  title: string; 
  description: string; 
  severity: string;
  action?: string | null;
}) {
  const severityConfig = {
    critical: { bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertTriangle, iconColor: "text-red-400" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertCircle, iconColor: "text-amber-400" },
    info: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Activity, iconColor: "text-blue-400" },
    positive: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2, iconColor: "text-emerald-400" },
  };
  
  const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.info;
  const Icon = config.icon;
  
  return (
    <div className={cn("p-4 rounded-xl border", config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5", config.iconColor)} />
        <div className="flex-1">
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-slate-400 mt-1">{description}</p>
          {action && (
            <button className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 flex items-center gap-1">
              {action} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const { metrics } = githubData || { metrics: { leadTime: 0, cycleTime: 0, prReviewDelay: 0, deploymentFrequency: 0, totalCommits: 0, totalPRs: 0, mergedPRs: 0, contributors: 0 } };

  const leadTimeBenchmark = getBenchmark(metrics.leadTime, "leadTime");
  const cycleTimeBenchmark = getBenchmark(metrics.cycleTime, "cycleTime");
  const reviewDelayBenchmark = getBenchmark(metrics.prReviewDelay, "prReviewDelay");
  const deployBenchmark = getBenchmark(metrics.deploymentFrequency, "deployFreq");

  const insights = [];
  
  if (metrics.leadTime > 7) {
    insights.push({
      title: "Lead time is high",
      description: "Consider improving your deployment process to deliver value faster.",
      severity: "warning"
    });
  }
  
  if (metrics.prReviewDelay > 24) {
    insights.push({
      title: "PR review delay is high",
      description: "PRs are waiting more than 24 hours for first review. Consider adding more reviewers.",
      severity: "warning"
    });
  }

  if (metrics.mergedPRs > 0) {
    insights.push({
      title: `${metrics.mergedPRs} PRs merged this month`,
      description: "Great job! Keep up the good work.",
      severity: "positive"
    });
  }

  if (githubData?.repos?.length > 0) {
    insights.push({
      title: `${githubData.repos.length} repositories tracked`,
      description: "Monitoring activity across all your repositories.",
      severity: "info"
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Health</h1>
          <p className="text-slate-400">Flow metrics and insights from your GitHub</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-400">Live</span>
          </div>
          <span className="text-sm text-slate-500">Last 30 days</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Lead Time"
          value={metrics.leadTime > 0 ? metrics.leadTime : "<1"}
          unit="days"
          benchmark={leadTimeBenchmark}
          benchmarkLabel={benchmarkLabels[leadTimeBenchmark]}
          icon={Clock}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
        />
        <MetricCard
          title="Cycle Time"
          value={metrics.cycleTime > 0 ? metrics.cycleTime : "<1"}
          unit="hours"
          benchmark={cycleTimeBenchmark}
          benchmarkLabel={benchmarkLabels[cycleTimeBenchmark]}
          icon={Timer}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
        />
        <MetricCard
          title="PR Review Delay"
          value={metrics.prReviewDelay > 0 ? metrics.prReviewDelay : "<1"}
          unit="hours"
          benchmark={reviewDelayBenchmark}
          benchmarkLabel={benchmarkLabels[reviewDelayBenchmark]}
          icon={GitPullRequest}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-400"
        />
        <MetricCard
          title="Deploy Frequency"
          value={metrics.deploymentFrequency}
          unit="/week"
          benchmark={deployBenchmark}
          benchmarkLabel={benchmarkLabels[deployBenchmark]}
          icon={Rocket}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                <p className="text-2xl font-bold text-emerald-400">{metrics.totalCommits}</p>
                <p className="text-sm text-slate-400">Commits</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                <p className="text-2xl font-bold text-indigo-400">{metrics.totalPRs}</p>
                <p className="text-sm text-slate-400">PRs</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                <p className="text-2xl font-bold text-emerald-400">{metrics.mergedPRs}</p>
                <p className="text-sm text-slate-400">Merged</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/30 text-center">
                <p className="text-2xl font-bold text-amber-400">{metrics.contributors}</p>
                <p className="text-sm text-slate-400">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-indigo-400" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <InsightCard 
                    key={index}
                    title={insight.title}
                    description={insight.description}
                    severity={insight.severity}
                    action={insight.action}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">Connect your GitHub repositories to see insights</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {githubData?.repos && githubData.repos.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Your Repositories ({githubData.repos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {githubData.repos.slice(0, 9).map((repo: any) => (
                <div key={repo.id} className="p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{repo.name}</span>
                    {repo.private && <span className="text-xs">🔒</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {repo.language || "Unknown"} • {new Date(repo.pushed_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            {githubData.repos.length > 9 && (
              <p className="text-sm text-slate-400 mt-3 text-center">
                +{githubData.repos.length - 9} more repositories
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
