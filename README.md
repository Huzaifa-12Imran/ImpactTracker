# 🌍 Impact Tracker

**Measure the real-world social impact of open source repositories.**

Impact Tracker is a GitHub App that classifies projects by sector (Health, Education, Climate, Civic Tech, Accessibility), scores contributor geographic diversity, tracks first-time contributors, and generates embeddable badges — all powered by AI and the GitHub API.

[![CI](https://github.com/Huzaifa-12Imran/ImpactTracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Huzaifa-12Imran/ImpactTracker/actions/workflows/ci.yml)

---

## Tech Stack

**Languages**  
<br/>
<img src="https://skillicons.dev/icons?i=ts,js" alt="Languages" />

**Web & Backend Stack**  
<br/>
<img src="https://skillicons.dev/icons?i=react,nextjs,nodejs,express,tailwind" alt="Web Stack" />

**Databases & Tools**  
<br/>
<img src="https://skillicons.dev/icons?i=postgres,redis,prisma,docker,git,github" alt="Databases and Tools" />

---

## Features

- **🧬 AI Sector Classification** — Automatically classifies repos using Google Gemini AI
- **🌍 Geographic Diversity** — Maps contributor locations across 500+ cities worldwide
- **🌱 First-Timer Tracking** — Rewards repos that welcome new developers
- **🏅 Embeddable Badges** — Dynamic SVG badges for your README
- **📊 Impact Dashboard** — Public, shareable dashboard with charts and maps
- **🔗 Deep GitHub Integration** — REST API, GraphQL, Webhooks, and OAuth

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL + Redis)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-org/impact-tracker.git
cd impact-tracker

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env with your GitHub App credentials and API keys

# Start PostgreSQL + Redis
docker compose up -d

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development servers
pnpm dev
```

The API runs on `http://localhost:4000` and the dashboard on `http://localhost:3000`.

---

## Embed a Badge

Add an impact score badge to your README:

```markdown
[![Impact Score](https://api.impact-tracker.dev/api/badge/OWNER/REPO.svg)](https://impact-tracker.dev/repo/OWNER/REPO)
```

**Badge styles:**

| Style | Example URL |
|-------|------------|
| Default | `/api/badge/owner/repo.svg` |
| Flat | `/api/badge/owner/repo.svg?style=flat` |
| SDG | `/api/badge/owner/repo.svg?style=sdg` |

---

## Impact Scoring Model (0-100)

| Dimension | Points | What it measures |
|-----------|--------|-----------------|
| Sector Relevance | 30 | AI classification + UN SDG alignment |
| Contributor Geography | 25 | Unique countries in contributor base |
| First-Timer Onboarding | 20 | Ratio of first-time contributors |
| Docs Accessibility | 15 | README quality + CONTRIBUTING + Code of Conduct |
| Community Health | 10 | Issue response time + PR merge rate + activity |

See [docs/scoring-model.md](docs/scoring-model.md) for detailed formulas.

---

## GitHub API Integration

| API | Usage |
|-----|-------|
| **REST API** | Repo metadata, contributors, README content, community profile |
| **GraphQL API** | Contribution calendars, dependency graph manifests |
| **Webhooks** | Push, pull_request, issues, star, installation events |
| **OAuth** | Secure user login via GitHub identity |

---

## Architecture

```
impact-tracker/
├── apps/
│   ├── api/          # Node.js/Express backend (webhooks, scoring, badges)
│   └── web/          # Next.js 15 dashboard (React 19, Tailwind CSS 4)
├── packages/
│   ├── shared/       # Types, constants, utilities
│   ├── database/     # Prisma schema + client
│   ├── github-client/# Octokit wrappers (REST + GraphQL)
│   ├── classifier/   # Gemini AI + OpenRouter + rule-based fallback
│   ├── scorer/       # 5-dimension scoring engine
│   └── badge/        # SVG badge generator (badge-maker)
├── docs/             # API reference, scoring model, privacy policy
└── .github/          # CI/CD workflows
```

---

## Privacy

- Private repo data is **never shared publicly** and **never used to train AI models**
- Data is deleted within 90 days of app uninstallation
- See [docs/privacy-policy.md](docs/privacy-policy.md) for the full policy

---

## License

MIT
