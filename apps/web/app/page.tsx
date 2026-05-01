"use client";

import { useState } from "react";
import { SECTORS, SECTOR_COLORS, SDG_GOAL_NAMES, SCORE_MAX } from "@impact/shared";
import type { Sector, SDGGoal } from "@impact/shared";

export default function HomePage() {
  return (
    <div className="gradient-hero">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SectorsSection />
      <CTASection />
    </div>
  );
}

// --- Hero ---
function HeroSection() {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchInput.trim().replace("https://github.com/", "");
    if (cleaned.includes("/")) {
      window.location.href = `/repo/${cleaned}`;
    }
  };

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 md:pt-32">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm text-primary-400">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse-soft" />
          Now tracking 1,000+ repos
        </div>

        {/* Title */}
        <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Measure the{" "}
          <span className="gradient-text">Social Impact</span>{" "}
          of Open Source
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-dark-400 leading-relaxed">
          Classify repos by sector. Score contributor diversity. Track first-time contributors.
          Generate embeddable badges. All powered by AI and the GitHub API.
        </p>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-xl items-center gap-2 rounded-xl border border-dark-700 bg-dark-900/80 p-2 backdrop-blur-sm transition-all focus-within:border-primary-500/50 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
        >
          <div className="flex items-center gap-2 px-3 text-dark-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="owner/repo or paste GitHub URL"
            className="flex-1 bg-transparent py-2 text-white placeholder:text-dark-500 focus:outline-none"
          />
          <button type="submit" className="btn-primary whitespace-nowrap px-6 py-2.5">
            Analyze
          </button>
        </form>

        {/* Quick links */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="text-dark-500">Try:</span>
          {["facebook/react", "tensorflow/tensorflow", "openai/whisper"].map((repo) => (
            <a
              key={repo}
              href={`/repo/${repo}`}
              className="rounded-md border border-dark-700 bg-dark-800/50 px-3 py-1 text-dark-300 transition-all hover:border-primary-500/30 hover:text-primary-400"
            >
              {repo}
            </a>
          ))}
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-[300px] w-[300px] rounded-full bg-accent-500/5 blur-[80px]" />
    </section>
  );
}

// --- Features ---
function FeaturesSection() {
  const features = [
    {
      icon: "🧬",
      title: "AI Sector Classification",
      description: "Automatically classifies repos into Health, Education, Climate, and more using Gemini AI.",
    },
    {
      icon: "🌍",
      title: "Geographic Diversity",
      description: "Maps contributor locations to measure global inclusion and identify representation gaps.",
    },
    {
      icon: "🌱",
      title: "First-Timer Tracking",
      description: "Rewards repos that actively onboard new developers with welcoming contribution workflows.",
    },
    {
      icon: "🏅",
      title: "Embeddable Badges",
      description: "Dynamic SVG badges for your README that update automatically as your impact grows.",
    },
    {
      icon: "📊",
      title: "Impact Dashboard",
      description: "Public, shareable dashboard with radar charts, world maps, and score history.",
    },
    {
      icon: "🔗",
      title: "Deep GitHub Integration",
      description: "REST API, GraphQL, Webhooks, and OAuth for real-time scoring and seamless workflow.",
    },
  ];

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything you need to{" "}
            <span className="gradient-text">measure impact</span>
          </h2>
          <p className="text-dark-400">Five scoring dimensions. One embeddable badge. Zero friction.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-dark-800 text-2xl">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-dark-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- How It Works ---
function HowItWorksSection() {
  const steps = [
    { step: "01", title: "Install the GitHub App", description: "One-click install on any repo or org. We request minimal read-only permissions." },
    { step: "02", title: "AI analyzes your project", description: "Our scoring engine classifies your sector, maps contributor geography, and checks documentation." },
    { step: "03", title: "Get your Impact Score", description: "View your interactive dashboard and embed a dynamic badge in your README." },
  ];

  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">
          Three steps to{" "}
          <span className="gradient-text">impact transparency</span>
        </h2>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="glass-card flex items-start gap-6 p-8 animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl gradient-primary text-xl font-bold text-white">
                {step.step}
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="text-dark-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Sectors ---
function SectorsSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Aligned with{" "}
          <span className="gradient-text">UN Sustainable Development Goals</span>
        </h2>
        <p className="mb-12 text-dark-400">
          Every repo is classified into a social impact sector and mapped to relevant SDGs.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {(SECTORS.filter((s) => s !== "General Tech") as Sector[]).map((sector) => (
            <div
              key={sector}
              className="rounded-full border px-5 py-2 text-sm font-medium transition-all hover:scale-105"
              style={{
                borderColor: `${SECTOR_COLORS[sector]}40`,
                backgroundColor: `${SECTOR_COLORS[sector]}15`,
                color: SECTOR_COLORS[sector],
              }}
            >
              {sector}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- CTA ---
function CTASection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="glass-card p-12">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to measure your impact?
          </h2>
          <p className="mb-8 text-dark-400">
            Install the GitHub App and get your Impact Score in under 5 minutes.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Get Started Free
          </a>
        </div>
      </div>
    </section>
  );
}
