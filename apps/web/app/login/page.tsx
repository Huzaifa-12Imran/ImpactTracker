export default function LoginPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
      <div className="glass-card w-full max-w-md p-10 text-center">
        <div className="mb-6 text-5xl">🌍</div>

        <h1 className="mb-2 text-2xl font-bold text-white">
          Sign in to Impact Tracker
        </h1>
        <p className="mb-8 text-sm text-dark-400">
          Connect your GitHub account to view your repositories&apos; impact scores
          and manage your dashboard.
        </p>

        <a
          href={`${apiUrl}/api/auth/github`}
          className="btn-primary flex w-full items-center justify-center gap-3 py-3 text-base"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </a>

        <div className="mt-6 space-y-2 text-xs text-dark-500">
          <p>We request <span className="text-dark-300">read-only</span> access to your repositories.</p>
          <p>🔒 Private repo data is never shared publicly and never used to train AI models.</p>
        </div>
      </div>
    </div>
  );
}
