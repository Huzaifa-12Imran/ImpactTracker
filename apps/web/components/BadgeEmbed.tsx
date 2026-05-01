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
    <div className="console-card p-8 bg-white">
      <h3 className="mb-6 font-syne text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
        Asset Distribution
      </h3>

      {/* Badge preview */}
      <div className="mb-6 flex items-center justify-center border border-jet-black bg-slate-50 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="Impact Score Badge" className="h-5" />
      </div>

      {/* Style selector */}
      <div className="mb-6 flex gap-1 border-b border-slate-100 pb-4">
        {(["default", "flat", "sdg"] as const).map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-3 py-1 font-mono text-[9px] font-bold uppercase transition-all ${
              selectedStyle === style
                ? "bg-jet-black text-white"
                : "text-slate-400 hover:text-jet-black"
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Snippets */}
      <div className="space-y-4">
        {(Object.entries(snippets) as [string, string][]).map(([key, snippet]) => (
          <div key={key}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
                {key}
              </span>
              <button
                onClick={() => handleCopy(key, snippet)}
                className="font-mono text-[9px] font-bold uppercase text-primary-600 hover:text-jet-black"
              >
                {copied === key ? "[COPIED]" : "[COPY]"}
              </button>
            </div>
            <div className="code-block text-[10px]">
              {snippet}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
