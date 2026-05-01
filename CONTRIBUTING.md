# Contributing to Impact Tracker

Thank you for your interest in contributing to Impact Tracker! This document explains how to set up your development environment and submit changes.

---

## Development Setup

### Prerequisites

- **Node.js 20+** — [Download](https://nodejs.org/)
- **pnpm 9+** — `npm install -g pnpm`
- **Docker** — For local PostgreSQL and Redis

### Getting Started

```bash
# 1. Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/impact-tracker.git
cd impact-tracker

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Fill in required values (see .env.example for descriptions)

# 4. Start infrastructure
docker compose up -d

# 5. Set up the database
pnpm db:generate
pnpm db:push

# 6. Start development
pnpm dev
```

### Project Structure

This is a **Turborepo monorepo** with pnpm workspaces:

- `apps/api` — Express backend (port 4000)
- `apps/web` — Next.js dashboard (port 3000)
- `packages/*` — Shared libraries

### Useful Commands

```bash
pnpm dev          # Start all apps in development mode
pnpm build        # Build all packages and apps
pnpm test         # Run all tests
pnpm typecheck    # Type-check all packages
pnpm db:studio    # Open Prisma Studio (database GUI)
```

---

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/my-change`
2. Make your changes
3. Run `pnpm typecheck && pnpm test` to verify
4. Commit with a descriptive message
5. Push and open a Pull Request

### PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Include tests for new scoring logic
- Update documentation if changing API endpoints
- Follow existing code style (TypeScript, ESM)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
