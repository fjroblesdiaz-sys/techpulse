export const mockDoraMetrics = {
  leadTime: { 
    value: "2.3", 
    unit: "days", 
    change: -12, 
    trend: "down-good",
    benchmark: "elite" 
  },
  cycleTime: { 
    value: "4.1", 
    unit: "hours", 
    change: 5, 
    trend: "up-bad",
    benchmark: "high" 
  },
  prReviewDelay: { 
    value: "8.2", 
    unit: "hours", 
    change: 23, 
    trend: "up-bad",
    benchmark: "medium" 
  },
  deploymentFrequency: { 
    value: "12", 
    unit: "/week", 
    change: 8, 
    trend: "up-good",
    benchmark: "elite" 
  },
};

export const mockChangeFailureRate = {
  value: 4.2,
  unit: "%",
  change: -15,
  trend: "down-good",
  benchmark: "elite"
};

export const mockTimeToRestore = {
  value: 45,
  unit: "min",
  change: -8,
  trend: "down-good",
  benchmark: "high"
};

export const mockFlowData = [
  { day: "Mon", backlog: 12, inProgress: 8, review: 5, done: 15 },
  { day: "Tue", backlog: 14, inProgress: 10, review: 6, done: 12 },
  { day: "Wed", backlog: 11, inProgress: 12, review: 4, done: 18 },
  { day: "Thu", backlog: 15, inProgress: 9, review: 7, done: 14 },
  { day: "Fri", backlog: 13, inProgress: 11, review: 5, done: 16 },
  { day: "Sat", backlog: 13, inProgress: 8, review: 4, done: 8 },
  { day: "Sun", backlog: 13, inProgress: 8, review: 4, done: 6 },
];

export const mockThroughput = [
  { week: "W1", prsMerged: 12, issuesClosed: 8, deploys: 14 },
  { week: "W2", prsMerged: 15, issuesClosed: 11, deploys: 16 },
  { week: "W3", prsMerged: 18, issuesClosed: 9, deploys: 19 },
  { week: "W4", prsMerged: 14, issuesClosed: 12, deploys: 15 },
];

export const mockPRPipeline = [
  { id: 1, title: "Add user authentication", author: "Sarah C.", reviewers: ["Mike J."], waiting: 26, status: "review", files: 12 },
  { id: 2, title: "Fix login bug on mobile", author: "Emma W.", reviewers: ["Alex R."], waiting: 2, status: "approved", files: 3 },
  { id: 3, title: "Update API documentation", author: "David P.", reviewers: [], waiting: 0, status: "draft", files: 1 },
  { id: 4, title: "Refactor database queries", author: "Mike J.", reviewers: ["Sarah C.", "Emma W."], waiting: 48, status: "blocked", files: 28 },
  { id: 5, title: "Add dark mode support", author: "Alex R.", reviewers: ["David P."], waiting: 6, status: "review", files: 8 },
];

export const mockInsights = [
  {
    id: 1,
    type: "alert",
    severity: "critical",
    title: "3 PRs blocked waiting >48h",
    description: "The 'Refactor database queries' PR has 2 pending reviews. Consider assigning more reviewers.",
    action: "Assign reviewers"
  },
  {
    id: 2,
    type: "insight",
    severity: "info",
    title: "Cycle time increased 15% this week",
    description: "Since starting the new billing feature, average cycle time went from 3.5h to 4.1h. This is expected for complex features.",
    action: null
  },
  {
    id: 3,
    type: "insight",
    severity: "positive",
    title: "Lead time improved 12%",
    description: "The team is delivering features 12% faster than last month. Great job on the recent process improvements!",
    action: null
  },
  {
    id: 4,
    type: "alert",
    severity: "warning",
    title: "Single point of failure in reviews",
    description: "Sarah Chen is reviewing 60% of all PRs. Consider distributing review load to prevent burnout.",
    action: "View distribution"
  },
];

export const mockTeamHealth = {
  overall: "healthy",
  score: 78,
  dimensions: {
    flow: { score: 82, status: "healthy" },
    quality: { score: 75, status: "healthy" },
    delivery: { score: 85, status: "excellent" },
    wellbeing: { score: 70, status: "warning" }
  }
};

export const mockTeam = {
  id: "1",
  name: "TechCorp Dev",
  plan: "free",
  members: [
    { id: "1", name: "Alex Rivera", email: "alex@techcompany.com", role: "admin", avatar: "AR" },
    { id: "2", name: "Sarah Chen", email: "sarah@techcompany.com", role: "member", avatar: "SC" },
    { id: "3", name: "Mike Johnson", email: "mike@techcompany.com", role: "member", avatar: "MJ" },
    { id: "4", name: "Emma Wilson", email: "emma@techcompany.com", role: "member", avatar: "EW" },
    { id: "5", name: "David Park", email: "david@techcompany.com", role: "member", avatar: "DP" },
  ],
};

export const mockRecentActivity = [
  { id: 1, user: "Sarah Chen", action: "merged PR", target: "Add user authentication", time: "12 min ago", type: "merge" },
  { id: 2, user: "Mike Johnson", action: "opened PR", target: "Refactor database queries", time: "2 hours ago", type: "pr" },
  { id: 3, user: "Emma Wilson", action: "deployed to", target: "production", time: "3 hours ago", type: "deploy" },
  { id: 4, user: "David Park", action: "approved PR", target: "Fix login bug on mobile", time: "4 hours ago", type: "review" },
  { id: 5, user: "Alex Rivera", action: "completed", target: "v2.4.0 release", time: "6 hours ago", type: "release" },
];

export const mockIntegrations = [
  { id: "github", name: "GitHub", status: "connected", icon: "🐙", color: "bg-slate-700", reposConnected: 5 },
  { id: "jira", name: "Jira", status: "disconnected", icon: "📋", color: "bg-blue-600", reposConnected: 0 },
  { id: "slack", name: "Slack", status: "disconnected", icon: "💬", color: "bg-purple-600", reposConnected: 0 },
];

export const mockPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    features: ["3 developers", "7-day data retention", "1 repository", "Basic DORA metrics"],
    current: false,
  },
  {
    id: "team",
    name: "Team",
    price: 15,
    features: ["Unlimited developers", "30-day data retention", "Unlimited repositories", "AI insights", "Slack alerts", "Email support"],
    current: true,
  },
  {
    id: "business",
    name: "Business",
    price: 35,
    features: ["Everything in Team", "90-day data retention", "Custom alerts", "Priority support", "API access"],
    current: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    features: ["Unlimited data retention", "SSO & SAML", "Dedicated Slack channel", "SLA guarantee", "On-premise option"],
    current: false,
  },
];
