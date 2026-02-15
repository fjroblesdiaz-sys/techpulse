export interface Team {
  id: string;
  name: string;
  plan: 'starter' | 'team' | 'business' | 'enterprise';
  createdAt: Date;
  stripeCustomerId?: string;
}

export interface User {
  id: string;
  teamId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  createdAt: Date;
}

export interface Repository {
  id: string;
  teamId: string;
  name: string;
  owner: string;
  fullName: string;
  githubRepoId: number;
  enabled: boolean;
  createdAt: Date;
}

export interface PullRequest {
  id: string;
  repoId: string;
  number: number;
  title: string;
  state: 'open' | 'merged' | 'closed' | 'draft';
  author: string;
  authorAvatarUrl?: string;
  
  createdAt: Date;
  mergedAt?: Date;
  closedAt?: Date;
  
  firstCommitAt?: Date;
  firstReviewRequestedAt?: Date;
  firstReviewAt?: Date;
  approvedAt?: Date;
  
  additions: number;
  deletions: number;
  filesChanged: number;
  
  reviewRequestedUsers: string[];
  reviewers: string[];
  approvedBy: string[];
  
  labels: string[];
}

export interface Review {
  id: string;
  prId: string;
  reviewer: string;
  reviewerAvatarUrl?: string;
  
  submittedAt: Date;
  
  state: 'approved' | 'changes_requested' | 'commented' | 'pending';
  body?: string;
}

export interface Commit {
  id: string;
  repoId: string;
  sha: string;
  message: string;
  author: string;
  authorAvatarUrl?: string;
  
  committedAt: Date;
  
  additions: number;
  deletions: number;
}

export interface Deployment {
  id: string;
  repoId: string;
  environment: 'production' | 'staging' | 'development';
  
  sha: string;
  ref: string;
  
  deployedAt: Date;
  
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  
  duration?: number;
}

export interface Issue {
  id: string;
  repoId: string;
  number: number;
  title: string;
  
  state: 'open' | 'closed';
  
  author: string;
  
  createdAt: Date;
  closedAt?: Date;
  firstCommitAt?: Date;
  firstPrAt?: Date;
  
  labels: string[];
}

export interface WebhookEvent {
  id: string;
  repoId: string;
  eventType: string;
  payload: any;
  processedAt?: Date;
  createdAt: Date;
}

export interface DailyMetric {
  id: string;
  teamId: string;
  repoId?: string;
  
  date: Date;
  
  leadTime: number;
  cycleTime: number;
  prReviewDelay: number;
  deploymentFrequency: number;
  changeFailureRate: number;
  
  commits: number;
  prsMerged: number;
  prsOpened: number;
  issuesClosed: number;
  deployments: number;
}

export interface TeamHealthScore {
  teamId: string;
  date: Date;
  
  overall: number;
  flow: number;
  quality: number;
  delivery: number;
  wellbeing: number;
}

export interface Alert {
  id: string;
  teamId: string;
  
  type: 'pr_aging' | 'bottleneck' | 'deploy_drift' | 'wip_warning' | 'health_warning';
  severity: 'critical' | 'warning' | 'info';
  
  title: string;
  description: string;
  
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface Insight {
  id: string;
  teamId: string;
  
  type: 'trend' | 'anomaly' | 'recommendation';
  
  title: string;
  description: string;
  metric?: string;
  change?: number;
  
  generatedAt: Date;
}

export interface Integration {
  id: string;
  teamId: string;
  
  provider: 'github' | 'jira' | 'slack' | 'linear';
  
  accessToken?: string;
  refreshToken?: string;
  webhookId?: string;
  
  connected: boolean;
  connectedAt?: Date;
  
  settings: Record<string, any>;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  
  maxDevelopers: number | null;
  dataRetentionDays: number;
  maxRepositories: number | null;
  
  features: string[];
  
  stripePriceId?: string;
}
