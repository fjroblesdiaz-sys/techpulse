# TechPulse - Engineering Team Health Platform

## 1. Product Positioning

### ❌ What we removed (surveillance)
- Individual commit leaderboards
- Per-developer metrics
- Productivity rankings
- Real-time individual activity tracking

### ✅ What we built (team flow)

| Metric | Definition | Why it matters |
|--------|------------|----------------|
| **Lead Time** | Time from issue creation to deploy | Customer delivery speed |
| **Cycle Time** | Time from first commit to merge | Team efficiency |
| **PR Review Delay** | Time from PR open to first review | Bottleneck detection |
| **Deployment Frequency** | Deploys per week | Delivery flow |
| **Change Failure Rate** | % of deploys causing incidents | Code quality |
| **Time to Restore** | Time to recover from incidents | Reliability |

### Product framing

> **TechPulse** = "Visibility into team flow, not individual surveillance"

**Core message:**
*"Know your team's health, not just your metrics. Identify bottlenecks, not bottlenecks."*

---

## 2. Dashboard Structure

### Header (top row) - DORA Metrics
- Lead Time, Cycle Time, PR Review Delay, Deploy Frequency
- Each with benchmark indicator (Elite/High/Medium/Low)

### Second row - Flow Analysis
- **Cumulative Flow Diagram (CFD)**: Backlog → In Progress → Review → Done
- **PR Pipeline**: Current PRs with aging (hours waiting for review)

### Third row - Insights + Alerts
- Intelligent alerts (PR aging, bottleneck detection, deploy drift)
- AI-generated insights (rules-based, ML in future)

---

## 3. Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 + Tailwind |
| API | Next.js API Routes (serverless) |
| DB | PostgreSQL (Supabase) |
| Auth | Clerk or NextAuth + GitHub OAuth |
| Background Jobs | Trigger.dev |
| Hosting | Vercel |

### Data Extraction
```
GitHub Webhooks → Your API → PostgreSQL → Metrics Engine → Dashboard
```

### Webhooks to configure:
- `push` → count commits, files changed
- `pull_request` → PR lifecycle timestamps
- `pull_request_review` → review times
- `deployment` → deploy frequency

---

## 4. Pricing - Per Active Developer

> **Active Developer** = user with ≥1 commit in last 30 days

| Plan | Price | Includes |
|------|-------|----------|
| **Starter** | $0 | 3 devs, 7-day data, 1 repo |
| **Team** | $15/dev/mo | 30-day data, unlimited repos, insights |
| **Business** | $35/dev/mo | 90-day data, Slack alerts, priority |
| **Enterprise** | Custom | Unlimited data, SSO, API, SLA |

---

## 5. 60-Day Roadmap

### Week 1-2: Foundations
- [x] Setup Supabase + schema SQL
- [ ] Auth with GitHub OAuth (Clerk)
- [ ] Webhook receiver for GitHub
- [ ] GitHub App setup

### Week 3-4: Core Metrics
- [x] Lead Time, Cycle Time, PR Delay calculation
- [x] Dashboard with DORA metrics
- [x] PR Pipeline view
- [ ] First 3 alerts

### Month 2: Flow + Insights
- [x] Cumulative Flow Diagram
- [ ] Throughput chart
- [ ] Rules-based insights engine
- [ ] Multi-repo support
- [ ] Onboarding flow

### Month 3: Polish + Growth
- [ ] Trigger.dev for background jobs
- [ ] Caching for metrics
- [ ] Slack integration
- [ ] Landing page
- [ ] Stripe checkout

---

## 6. Critical Risks

### Technical
| Risk | Mitigation |
|------|------------|
| GitHub API rate limits | Webhooks > polling |
| Slow metric calculation | Pre-calculate nightly |
| Webhook failures | Queue + retry logic |

### Cultural (CRITICAL)
| Risk | Solution |
|------|----------|
| Micro-management | UI copy always "team", never individual |
| Gaming metrics | Lead time counts delivery, not commits |
| Leaderboards | NEVER |
| Punitive use | Positive insights only |

### Competition
| Competitor | Our Differentiation |
|------------|---------------------|
| GitHub Insights | Alerts + AI insights |
| Linear | Real GitHub integration |
| Datadog | Team health focus |

---

## 7. File Structure

```
/src
  /app
    /api
      /v1
        /webhooks/github
        /team/:teamId/health
        /team/:teamId/flow
        /team/:teamId/prs
        /team/:teamId/insights
    /(auth)
      /login
      /register
    /(dashboard)
      /dashboard
      /metrics
      /team
      /settings
      /billing
  /components
    /ui
    /charts
    /layout
  /lib
    /db
      schema.sql
    /types
      index.ts
    /utils
    data.ts (mock data for MVP)
  /hooks
  /services
    github.ts
    metrics.ts
    insights.ts
```

---

## 8. Database Schema

See `/src/lib/db/schema.sql` for complete PostgreSQL schema including:
- teams, users, repositories
- pull_requests, reviews, commits, deployments, issues
- daily_metrics, team_health_scores
- alerts, insights
- Helper functions for DORA metrics calculation
- Row-level security policies
