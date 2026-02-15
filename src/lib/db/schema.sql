-- TechPulse Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEAMS
-- =====================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'team', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  github_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_team ON users(team_id);

-- =====================================================
-- REPOSITORIES
-- =====================================================
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  full_name TEXT NOT NULL,
  github_repo_id BIGINT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repos_team ON repositories(team_id);

-- =====================================================
-- PULL REQUESTS
-- =====================================================
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('open', 'merged', 'closed', 'draft')),
  author TEXT NOT NULL,
  author_avatar_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL,
  merged_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  first_commit_at TIMESTAMPTZ,
  first_review_requested_at TIMESTAMPTZ,
  first_review_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  
  review_requested_users TEXT[] DEFAULT '{}',
  reviewers TEXT[] DEFAULT '{}',
  approved_by TEXT[] DEFAULT '{}',
  
  labels TEXT[] DEFAULT '{}',
  
  UNIQUE(repo_id, number)
);

CREATE INDEX idx_prs_repo ON pull_requests(repo_id);
CREATE INDEX idx_prs_merged ON pull_requests(merged_at) WHERE merged_at IS NOT NULL;
CREATE INDEX idx_prs_state ON pull_requests(state);

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pr_id UUID NOT NULL REFERENCES pull_requests(id) ON DELETE CASCADE,
  reviewer TEXT NOT NULL,
  reviewer_avatar_url TEXT,
  
  submitted_at TIMESTAMPTZ NOT NULL,
  
  state TEXT NOT NULL CHECK (state IN ('approved', 'changes_requested', 'commented', 'pending')),
  body TEXT
);

CREATE INDEX idx_reviews_pr ON reviews(pr_id);

-- =====================================================
-- COMMITS
-- =====================================================
CREATE TABLE commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  sha TEXT NOT NULL UNIQUE,
  message TEXT NOT NULL,
  author TEXT NOT NULL,
  author_avatar_url TEXT,
  
  committed_at TIMESTAMPTZ NOT NULL,
  
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0
);

CREATE INDEX idx_commits_repo ON commits(repo_id);
CREATE INDEX idx_commits_author ON commits(author);
CREATE INDEX idx_commits_date ON commits(committed_at);

-- =====================================================
-- DEPLOYMENTS
-- =====================================================
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('production', 'staging', 'development')),
  
  sha TEXT NOT NULL,
  ref TEXT NOT NULL,
  
  deployed_at TIMESTAMPTZ NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'pending', 'cancelled')),
  
  duration INTEGER
);

CREATE INDEX idx_deploys_repo ON deployments(repo_id);
CREATE INDEX idx_deploys_date ON deployments(deployed_at);

-- =====================================================
-- ISSUES
-- =====================================================
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  
  state TEXT NOT NULL CHECK (state IN ('open', 'closed')),
  
  author TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  first_commit_at TIMESTAMPTZ,
  first_pr_at TIMESTAMPTZ,
  
  labels TEXT[] DEFAULT '{}',
  
  UNIQUE(repo_id, number)
);

CREATE INDEX idx_issues_repo ON issues(repo_id);
CREATE INDEX idx_issues_closed ON issues(closed_at) WHERE closed_at IS NOT NULL;

-- =====================================================
-- WEBHOOK EVENTS (for debugging/replay)
-- =====================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_date ON webhook_events(created_at);

-- =====================================================
-- DAILY METRICS (pre-calculated)
-- =====================================================
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  lead_time DECIMAL(10,2),
  cycle_time DECIMAL(10,2),
  pr_review_delay DECIMAL(10,2),
  deployment_frequency INTEGER,
  change_failure_rate DECIMAL(5,2),
  
  commits INTEGER DEFAULT 0,
  prs_merged INTEGER DEFAULT 0,
  prs_opened INTEGER DEFAULT 0,
  issues_closed INTEGER DEFAULT 0,
  deployments INTEGER DEFAULT 0,
  
  UNIQUE(team_id, repo_id, date)
);

CREATE INDEX idx_daily_metrics_team ON daily_metrics(team_id);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);

-- =====================================================
-- TEAM HEALTH SCORES
-- =====================================================
CREATE TABLE team_health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  overall INTEGER NOT NULL CHECK (overall BETWEEN 0 AND 100),
  flow INTEGER NOT NULL CHECK (flow BETWEEN 0 AND 100),
  quality INTEGER NOT NULL CHECK (quality BETWEEN 0 AND 100),
  delivery INTEGER NOT NULL CHECK (delivery BETWEEN 0 AND 100),
  wellbeing INTEGER NOT NULL CHECK (wellbeing BETWEEN 0 AND 100),
  
  UNIQUE(team_id, date)
);

CREATE INDEX idx_health_team ON team_health_scores(team_id);

-- =====================================================
-- ALERTS
-- =====================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('pr_aging', 'bottleneck', 'deploy_drift', 'wip_warning', 'health_warning')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  
  title TEXT NOT NULL,
  description TEXT,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_team ON alerts(team_id);
CREATE INDEX idx_alerts_unresolved ON alerts(resolved_at) WHERE resolved_at IS NULL;

-- =====================================================
-- INSIGHTS
-- =====================================================
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('trend', 'anomaly', 'recommendation')),
  
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT,
  change DECIMAL(5,2),
  
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_insights_team ON insights(team_id);

-- =====================================================
-- INTEGRATIONS
-- =====================================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  provider TEXT NOT NULL CHECK (provider IN ('github', 'jira', 'slack', 'linear')),
  
  access_token TEXT,
  refresh_token TEXT,
  webhook_id TEXT,
  
  connected BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMPTZ,
  
  settings JSONB DEFAULT '{}',
  
  UNIQUE(team_id, provider)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Users can only see their team's data
CREATE POLICY "Users can view own team" ON teams
  FOR SELECT USING (id IN (SELECT team_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view team users" ON users
  FOR SELECT USING (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view team repos" ON repositories
  FOR SELECT USING (team_id IN (SELECT team_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- HELPER FUNCTIONS (for calculating DORA metrics)
-- =====================================================

-- Lead Time: from issue creation to deployment
CREATE OR REPLACE FUNCTION calculate_lead_time(p_repo_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_avg_lead_time DECIMAL(10,2);
BEGIN
  SELECT AVG(
    EXTRACT(EPOCH FROM (d.deployed_at - i.created_at)) / 3600
  ) INTO v_avg_lead_time
  FROM issues i
  JOIN pull_requests pr ON pr.repo_id = i.repo_id 
    AND pr.number::TEXT = ANY(string_to_array(i.title, '#'))
  JOIN deployments d ON d.repo_id = pr.repo_id AND d.sha = pr.author
  WHERE i.repo_id = p_repo_id
    AND i.created_at >= p_start_date
    AND i.created_at <= p_end_date
    AND d.deployed_at IS NOT NULL;
  
  RETURN COALESCE(v_avg_lead_time, 0);
END;
$$ LANGUAGE plpgsql;

-- Cycle Time: from first commit to PR merge
CREATE OR REPLACE FUNCTION calculate_cycle_time(p_repo_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_avg_cycle_time DECIMAL(10,2);
BEGIN
  SELECT AVG(
    EXTRACT(EPOCH FROM (pr.merged_at - pr.created_at)) / 3600
  ) INTO v_avg_cycle_time
  FROM pull_requests pr
  WHERE pr.repo_id = p_repo_id
    AND pr.merged_at IS NOT NULL
    AND pr.created_at >= p_start_date
    AND pr.created_at <= p_end_date;
  
  RETURN COALESCE(v_avg_cycle_time, 0);
END;
$$ LANGUAGE plpgsql;

-- PR Review Delay: from PR open to first review
CREATE OR REPLACE FUNCTION calculate_pr_review_delay(p_repo_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_avg_delay DECIMAL(10,2);
BEGIN
  SELECT AVG(
    EXTRACT(EPOCH FROM (r.submitted_at - pr.created_at)) / 3600
  ) INTO v_avg_delay
  FROM pull_requests pr
  JOIN reviews r ON r.pr_id = pr.id
  WHERE pr.repo_id = p_repo_id
    AND pr.created_at >= p_start_date
    AND pr.created_at <= p_end_date
  GROUP BY pr.id, r.submitted_at
  ORDER BY r.submitted_at
  LIMIT 1;
  
  RETURN COALESCE(v_avg_delay, 0);
END;
$$ LANGUAGE plpgsql;

-- Deployment Frequency: deployments per week
CREATE OR REPLACE FUNCTION calculate_deployment_frequency(p_repo_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM deployments
  WHERE repo_id = p_repo_id
    AND status = 'success'
    AND deployed_at >= p_start_date
    AND deployed_at <= p_end_date;
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Change Failure Rate: % of deployments causing incidents
CREATE OR REPLACE FUNCTION calculate_change_failure_rate(p_repo_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_total INTEGER;
  v_failed INTEGER;
  v_rate DECIMAL(5,2);
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'failure')
  INTO v_total, v_failed
  FROM deployments
  WHERE repo_id = p_repo_id
    AND deployed_at >= p_start_date
    AND deployed_at <= p_end_date;
  
  IF v_total > 0 THEN
    v_rate := (v_failed::DECIMAL / v_total::DECIMAL) * 100;
  ELSE
    v_rate := 0;
  END IF;
  
  RETURN v_rate;
END;
$$ LANGUAGE plpgsql;
