# Contributing to Impact Tracker 🚀

First off, thank you for considering contributing to Impact Tracker! It's people like you that make open source such a great community.

## 🛠️ Local Development Workflow

1. **Prerequisites**: Ensure you have Node.js 20+, pnpm 9+, and Docker installed.
2. **Setup**:
   ```bash
   pnpm install
   cp .env.example .env # Configure your credentials
   docker compose up -d
   pnpm db:push
   pnpm db:generate
   ```
3. **Execution**:
   - `pnpm dev`: Starts API and Dashboard in watch mode.
   - `pnpm turbo typecheck`: Runs TypeScript validation across all packages.
   - `pnpm turbo build`: Validates production builds.

## 🌿 Branching Policy

- `feat/`: New features
- `fix/`: Bug fixes
- `docs/`: Documentation updates
- `refactor/`: Code improvements
- `chore/`: Maintenance tasks

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add SDG mapping to dashboard`
- `fix: resolve country resolution for city-only locations`
- `docs: update setup instructions`

## 🏁 Pull Request Checklist

- [ ] Branch is up-to-date with `main`.
- [ ] `pnpm turbo typecheck` passes.
- [ ] All new logic is covered by comments or documentation.
- [ ] Commits are descriptive and follow the guidelines.

## ⚖️ Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
