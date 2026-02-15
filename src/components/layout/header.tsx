"use client";

import { Bell, Search, ChevronDown, LogOut, User, Plus, Check } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [teamName, setTeamName] = useState("My Team");
  const [teams, setTeams] = useState<{id: string; name: string}[]>([
    { id: "1", name: "My Team" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "PR Review Request", message: "Sarah Chen requested your review on #234", time: "5 min ago", read: false },
    { id: 2, title: "PR Merged", message: "Add user authentication was merged", time: "1 hour ago", read: false },
    { id: 3, title: "New Comment", message: "Mike Johnson commented on your PR", time: "2 hours ago", read: true },
  ]);

  useEffect(() => {
    const savedTeams = localStorage.getItem("userTeams");
    if (savedTeams) {
      setTeams(JSON.parse(savedTeams));
    }
    
    const savedTeam = localStorage.getItem("currentTeam");
    if (savedTeam) {
      setTeamName(savedTeam);
    }
  }, []);

  const handleTeamChange = (team: {id: string; name: string}) => {
    setTeamName(team.name);
    localStorage.setItem("currentTeam", team.name);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const user = session?.user;
  const avatarUrl = user?.image;
  const userName = user?.name || "User";
  const userEmail = user?.email || "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isSearchPage = pathname === "/search";

  return (
    <header className="sticky top-0 z-20 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4 lg:gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                <span>{teamName}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-slate-800 border-slate-700">
              <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider">
                Your Teams
              </div>
              {teams.map((team) => (
                <DropdownMenuItem 
                  key={team.id}
                  onClick={() => handleTeamChange(team)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{team.name}</span>
                  {team.name === teamName && <Check className="w-4 h-4 text-indigo-400" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder:text-slate-500 w-48"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-slate-500 bg-slate-900 rounded border border-slate-700">
              ⌘K
            </kbd>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-800 border-slate-700">
              <div className="px-3 py-2 border-b border-slate-700 flex items-center justify-between">
                <p className="font-medium text-slate-200">Notifications</p>
                <button 
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                >
                  Mark all as read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-3 py-8 text-center text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start p-3 cursor-pointer",
                        !notification.read && "bg-indigo-500/10"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <p className="font-medium text-slate-200 text-sm">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="px-3 py-2 border-t border-slate-700">
                <button 
                  className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300"
                  onClick={() => router.push("/settings")}
                >
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName}
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-medium text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-slate-200">
                  {userName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
              <div className="px-3 py-2 border-b border-slate-700">
                <p className="text-sm font-medium text-slate-200">{userName}</p>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-slate-700 hover:text-slate-100 cursor-pointer"
                onClick={() => router.push("/team")}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-slate-300 hover:bg-slate-700 hover:text-slate-100 cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:bg-slate-700 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
