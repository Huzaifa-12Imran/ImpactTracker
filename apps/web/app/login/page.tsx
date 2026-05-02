import Link from "next/link";

export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div className="grid-hero min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
      <div className="console-card w-full max-w-lg bg-white p-12 text-center shadow-[12px_12px_0px_#7c3aed]">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center border-2 border-jet-black bg-accent-500 text-4xl">
          <svg className="h-10 w-10 text-jet-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        <h1 className="mb-4 font-syne text-4xl font-bold uppercase tracking-tighter text-jet-black">
          ACCESS <span className="text-primary-600">DASHBOARD.</span>
        </h1>
        
        <p className="mb-10 font-sans text-base font-medium leading-relaxed text-slate-500">
          Connect your GitHub account to authorize ImpactTracker to sync your repositories and generate social impact scores.
        </p>

        <div className="space-y-4">
          <a
            href={`${apiUrl}/api/auth/github`}
            className="btn-primary flex w-full items-center justify-center gap-4 py-5 text-base shadow-[4px_4px_0px_#84cc16] hover:shadow-none transition-all"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>CONTINUE WITH GITHUB</span>
          </a>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary-600" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Read-only access requested
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-accent-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Compliance v1.0 Security Verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

