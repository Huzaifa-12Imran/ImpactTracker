# Contributing to Impact Tracker

First off, thank you for considering contributing to Impact Tracker! It's people like you that make open source such a great community.

## 1. Where do I go from here?
If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) first. If it's not there, feel free to open a new issue.

## 2. Fork & create a branch
If this is something you think you can fix, then fork Impact Tracker and create a branch with a descriptive name.
```sh
git checkout -b new-feature-name
```

## 3. Local Development
1. Clone your fork and install dependencies via `pnpm install`.
2. Copy `.env.example` to `.env` and configure your API keys (GitHub App, Gemini, Upstash).
3. Start the services with Docker: `docker compose up -d`
4. Run `pnpm db:push` and `pnpm db:generate`.
5. Start development servers: `pnpm dev`

## 4. Submitting a Pull Request
- Make sure your code conforms to the existing style.
- Update the README.md with details of changes to the interface or architecture, if applicable.
- Once you are ready, submit your PR and we will review it as soon as possible!

## 5. Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
