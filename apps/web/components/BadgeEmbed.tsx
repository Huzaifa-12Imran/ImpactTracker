"use client";

import { useState } from "react";
import { getBadgeUrl } from "@lib/api";

/**
 * Badge Embed — copy-paste markdown/HTML snippets for README embedding.
 */
interface BadgeEmbedProps {
  owner: string;
  repo: string;
}

export default function BadgeEmbed({ owner, repo }: BadgeEmbedProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<"default" | "flat" | "sdg">("default");

  const badgeUrl = getBadgeUrl(owner, repo, selectedStyle);
  const repoUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/repo/${owner}/${repo}`;

  const snippets = {
    markdown: `[![Impact Score](${badgeUrl})](${repoUrl})`,
    html: `<a href="${repoUrl}"><img src="${badgeUrl}" alt="Impact Score" /></a>`,
    url: badgeUrl,
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-dark-400">
        Embed Badge
      </h3>

      {/* Badge preview */}
      <div className="mb-5 flex items-center justify-center rounded-lg bg-dark-900/50 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="Impact Score Badge" className="h-5" />
      </div>

      {/* Style selector */}
      <div className="mb-4 flex gap-2">
        {(["default", "flat", "sdg"] as const).map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              selectedStyle === style
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                : "bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-600"
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Snippets */}
      <div className="space-y-3">
        {(Object.entries(snippets) as [string, string][]).map(([key, snippet]) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-dark-500">
                {key}
              </span>
              <button
                onClick={() => handleCopy(key, snippet)}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-dark-400 transition-colors hover:bg-dark-800 hover:text-primary-400"
              >
                {copied === key ? (
                  <>
                    <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="code-block overflow-x-auto whitespace-nowrap text-xs text-dark-300">
              {snippet}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
