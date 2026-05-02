"use client";

import { useState } from "react";
import { SECTORS, SECTOR_COLORS, SDG_GOAL_NAMES } from "@impact/shared";
import type { Sector } from "@impact/shared";

export default function HomePage() {
  return (
    <div className="bg-white">
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
    <section className="grid-hero relative overflow-hidden border-b border-jet-black px-6 pb-24 pt-24 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 inline-flex items-center gap-2 border border-jet-black bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-jet-black">
          <svg className="h-3 w-3 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Live Network Active
        </div>

        <h1 className="mb-8 font-syne text-6xl font-bold leading-[0.9] tracking-tighter text-jet-black md:text-8xl">
          TRACKING <br />
          <span className="text-primary-600">SOCIAL IMPACT</span> <br />
          IN OPEN SOURCE.
        </h1>

        <p className="mb-12 max-w-xl font-sans text-lg font-medium leading-relaxed text-slate-600">
          We use AI to classify project sectors and measure geographic diversity. 
          Get your impact score and embed it anywhere.
        </p>

        {/* Search */}
        <div className="relative mb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-400"></span>
            </span>
            V2 REPO SEARCH: COMING SOON (NEEDS CONTRIBUTORS)
          </div>
          
          <form
            onSubmit={handleSearch}
            className="flex max-w-2xl flex-col gap-0 md:flex-row opacity-60 group"
          >
            <div className="relative flex-1">
              <input
                disabled
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="SEARCH REPOSITORY (COMING IN V2)"
                className="w-full border-2 border-jet-black bg-slate-50 px-6 py-4 font-mono text-sm uppercase tracking-widest text-slate-400 placeholder:text-slate-300 focus:outline-none cursor-not-allowed"
              />
            </div>
            <button disabled type="submit" className="btn-primary border-2 border-l-0 border-jet-black bg-slate-200 px-10 py-4 text-slate-400 cursor-not-allowed">
              Analyze
            </button>
          </form>
          <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Experimental feature. Join our Discord to help build the V2 scanner.
          </p>
        </div>

        {/* Quick links */}
        <div className="mt-8 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span>Popular:</span>
          {["facebook/react", "tensorflow/tensorflow", "openai/whisper"].map((repo) => (
            <a
              key={repo}
              href={`/repo/${repo}`}
              className="border-b border-transparent transition-colors hover:border-primary-600 hover:text-primary-600"
            >
              {repo}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Features (Bento) ---
function FeaturesSection() {
  const features = [
    {
      title: "AI CLASSIFICATION",
      description: "Automated sector mapping via Gemini Pro.",
      size: "col-span-1 md:col-span-2",
      accent: "bg-primary-100",
    },
    {
      title: "GEO DIVERSITY",
      description: "Visualizing global contribution reach.",
      size: "col-span-1",
      accent: "bg-accent-500",
    },
    {
      title: "ONBOARDING",
      description: "First-timer tracking and retention metrics.",
      size: "col-span-1",
      accent: "bg-white",
    },
    {
      title: "EMBEDDABLE BADGES",
      description: "Real-time SVG badges for your README.md.",
      size: "col-span-1 md:col-span-2",
      accent: "bg-slate-50",
    },
  ];

  return (
    <section id="features" className="border-b border-jet-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
          <h2 className="font-syne text-4xl font-bold uppercase tracking-tighter text-jet-black md:text-5xl">
            CORE <span className="text-primary-600">CAPABILITIES</span>
          </h2>
          <p className="max-w-xs text-right font-sans text-xs font-bold uppercase tracking-widest text-slate-400">
            QUANTIFYING IMPACT THROUGH FIVE DATA DIMENSIONS.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`console-card p-8 ${feature.size} ${feature.accent}`}
            >
              <h3 className="mb-4 font-syne text-2xl font-bold tracking-tighter text-jet-black">{feature.title}</h3>
              <p className="font-sans text-sm font-medium leading-relaxed text-slate-600">{feature.description}</p>
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
    { num: "01", title: "INTEGRATION", desc: "Connect GitHub App with one click." },
    { num: "02", numColor: "text-primary-600", title: "ANALYSIS", desc: "AI scans repo metadata and history." },
    { num: "03", numColor: "text-accent-500", title: "REPORTING", desc: "Deploy your impact dashboard." },
  ];

  return (
    <section id="how-it-works" className="border-b border-jet-black px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-20 text-center">
          <h2 className="font-syne text-4xl font-bold uppercase tracking-tighter text-jet-black md:text-5xl">
            THE <span className="text-accent-500">WORKFLOW</span>
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-jet-black md:block" />
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.num} className="relative flex items-center gap-12">
                <div className={`z-10 flex h-16 w-16 shrink-0 items-center justify-center border-2 border-jet-black bg-white font-syne text-2xl font-bold ${step.numColor || 'text-jet-black'}`}>
                  {step.num}
                </div>
                <div>
                  <h3 className="font-syne text-xl font-bold uppercase tracking-tight text-jet-black">{step.title}</h3>
                  <p className="font-sans text-sm font-medium text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Sectors ---
function SectorsSection() {
  return (
    <section className="border-b border-jet-black px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-12 font-syne text-4xl font-bold uppercase tracking-tighter text-jet-black">
          ALIGNED WITH <span className="text-primary-600">SDGS</span>
        </h2>
        
        <div className="flex flex-wrap justify-center gap-2">
          {(SECTORS.filter((s) => s !== "General Tech") as Sector[]).map((sector) => (
            <div
              key={sector}
              className="border border-jet-black bg-white px-6 py-3 font-syne text-xs font-bold uppercase tracking-widest text-jet-black transition-all hover:bg-primary-600 hover:text-white"
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
      <div className="mx-auto max-w-4xl">
        <div className="console-card bg-jet-black p-16 text-center shadow-[8px_8px_0px_#84cc16]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm bg-accent-500/10 border border-accent-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-500">
            <span className="flex h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
            V1 STABLE: GITHUB APP LOGIN VERIFIED
          </div>
          <h2 className="mb-6 font-syne text-4xl font-bold uppercase tracking-tighter text-white md:text-6xl">
            READY TO MEASURE <br /> <span className="text-accent-500">YOUR IMPACT?</span>
          </h2>
          <p className="mb-10 mx-auto max-w-md font-sans text-sm font-medium text-slate-400">
            The GitHub App integration is fully operational. 
            Connect your account and get real-time impact scores for your repositories instantly.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
            className="btn-primary border-2 border-white bg-accent-500 text-jet-black hover:bg-white inline-flex items-center gap-3"
          >
            <span>INSTALL GITHUB APP</span>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
