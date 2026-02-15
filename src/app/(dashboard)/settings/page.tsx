"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, ExternalLink, Github, Link2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  language: string;
  pushed_at: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [notifications, setNotifications] = useState({
    prReviews: true,
    issuesAssigned: true,
    teamDigest: false,
    weeklySummary: true,
  });
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (session) {
      setName(session.user?.name || "");
      fetchRepos();
      
      const savedNotifications = localStorage.getItem("notifications");
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    }
  }, [session]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const fetchRepos = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github?days=30");
      const data = await res.json();
      if (data.repos) {
        setRepos(data.repos);
        const savedSelection = localStorage.getItem("selectedRepos");
        if (savedSelection) {
          setSelectedRepos(JSON.parse(savedSelection));
        }
      }
    } catch (e) {
      console.error("Error fetching repos:", e);
    }
    setLoadingRepos(false);
  };

  const toggleRepo = (repoId: number) => {
    setSelectedRepos(prev => {
      if (prev.includes(repoId)) {
        return prev.filter(id => id !== repoId);
      }
      return [...prev, repoId];
    });
  };

  const saveSelectedRepos = () => {
    setSaving(true);
    localStorage.setItem("selectedRepos", JSON.stringify(selectedRepos));
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
    router.push("/login");
    return null;
  }

  const isGitHubConnected = !!session;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account and integrations</p>
      </div>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Full Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Email</label>
              <Input 
                value={session.user?.email || ""} 
                disabled 
                type="email" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Company</label>
            <Input 
              value={company} 
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your company" 
            />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>Connect your repositories to track metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/20 border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-700">
                🐙
              </div>
              <div>
                <p className="font-medium text-slate-200">GitHub</p>
                <p className="text-sm text-slate-400 capitalize">
                  {isGitHubConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {isGitHubConnected ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-emerald-400">
                  <Check className="w-4 h-4" />
                  Connected
                </span>
                <Button variant="ghost" size="sm" onClick={fetchRepos} disabled={loadingRepos}>
                  <RefreshCw className={cn("w-4 h-4", loadingRepos && "animate-spin")} />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm">
                <Link2 className="w-4 h-4 mr-2" />
                Connect
              </Button>
            )}
          </div>

          {isGitHubConnected && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-300">Select repositories to track</p>
                <Button 
                  size="sm" 
                  onClick={saveSelectedRepos} 
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : "Save Selection"}
                </Button>
              </div>
              
              {loadingRepos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => toggleRepo(repo.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedRepos.includes(repo.id)
                          ? "bg-indigo-500/10 border-indigo-500/50"
                          : "bg-slate-700/20 border-slate-700/50 hover:bg-slate-700/40"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        selectedRepos.includes(repo.id)
                          ? "bg-indigo-500"
                          : "border border-slate-500"
                      )}>
                        {selectedRepos.includes(repo.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{repo.name}</p>
                        <p className="text-xs text-slate-500">{repo.language || "Unknown"}</p>
                      </div>
                      {repo.private && <span className="text-xs">🔒</span>}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-slate-500">
                {selectedRepos.length} of {repos.length} repositories selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="flex items-center justify-between py-3 border-b border-slate-700/30"
            onClick={() => toggleNotification("prReviews")}
          >
            <span className="text-slate-300 cursor-pointer">PR reviews assigned</span>
            <button
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                notifications.prReviews ? "bg-indigo-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  notifications.prReviews ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <div 
            className="flex items-center justify-between py-3 border-b border-slate-700/30"
            onClick={() => toggleNotification("issuesAssigned")}
          >
            <span className="text-slate-300 cursor-pointer">Issues assigned to me</span>
            <button
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                notifications.issuesAssigned ? "bg-indigo-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  notifications.issuesAssigned ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <div 
            className="flex items-center justify-between py-3 border-b border-slate-700/30"
            onClick={() => toggleNotification("teamDigest")}
          >
            <span className="text-slate-300 cursor-pointer">Team activity digest</span>
            <button
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                notifications.teamDigest ? "bg-indigo-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  notifications.teamDigest ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
          <div 
            className="flex items-center justify-between py-3"
            onClick={() => toggleNotification("weeklySummary")}
          >
            <span className="text-slate-300 cursor-pointer">Weekly summary report</span>
            <button
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors cursor-pointer",
                notifications.weeklySummary ? "bg-indigo-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  notifications.weeklySummary ? "translate-x-7" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/20">
            <div>
              <p className="font-medium text-slate-200">GitHub OAuth</p>
              <p className="text-sm text-slate-400">Connected via GitHub</p>
            </div>
            <span className="flex items-center gap-1 text-sm text-emerald-400">
              <Check className="w-4 h-4" />
              Active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
