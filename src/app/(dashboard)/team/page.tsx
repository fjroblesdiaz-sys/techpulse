"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Mail, MoreHorizontal, Shield, User, Loader2, Users as UsersIcon } from "lucide-react";
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
}

export default function TeamPage() {
  const { data: session, status } = useSession();
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
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

  const handleInvite = () => {
    if (!inviteEmail) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setInviteEmail("");
      setTimeout(() => setSent(false), 2000);
    }, 500);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const metrics = githubData?.metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-slate-400">Manage your team members</p>
        </div>
      </div>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Invite Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleInvite} disabled={sending || !inviteEmail}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : sent ? "Invited!" : <> <Plus className="w-4 h-4 mr-2" /> Send Invite</>}
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Invite team members to collaborate on metrics
          </p>
        </CardContent>
      </Card>

      {metrics && (
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg">Team Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-slate-700/20 text-center">
                <p className="text-2xl font-bold text-emerald-400">{metrics.totalCommits}</p>
                <p className="text-sm text-slate-400">Commits</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/20 text-center">
                <p className="text-2xl font-bold text-indigo-400">{metrics.totalPRs}</p>
                <p className="text-sm text-slate-400">PRs</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/20 text-center">
                <p className="text-2xl font-bold text-emerald-400">{metrics.mergedPRs}</p>
                <p className="text-sm text-slate-400">Merged</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/20 text-center">
                <p className="text-2xl font-bold text-amber-400">{metrics.contributors}</p>
                <p className="text-sm text-slate-400">Contributors</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/20 text-center">
                <p className="text-2xl font-bold text-purple-400">{metrics.openPRs}</p>
                <p className="text-sm text-slate-400">Open PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg">Your GitHub Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/20">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"}
                className="w-16 h-16 rounded-xl"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-white">{session.user?.name}</p>
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-400">{session.user?.email}</p>
              <p className="text-sm text-indigo-400 mt-1">Connected via GitHub</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
