import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impact Tracker — Measure Open Source Social Impact",
  description:
    "Classify open source projects by sector, score contributor diversity, and generate embeddable impact badges for your GitHub repositories.",
  keywords: [
    "open source", "social impact", "github", "sustainability",
    "SDG", "contributor diversity", "impact score",
  ],
  openGraph: {
    title: "Impact Tracker",
    description: "Measure the real-world social impact of open source repositories",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-dark-950 text-dark-100 antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// --- Navbar ---
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-dark-800/50 bg-dark-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <span className="text-lg font-bold text-white">🌍</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Impact<span className="text-primary-400">Tracker</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="/#features" className="text-sm text-dark-400 transition-colors hover:text-primary-400">
            Features
          </a>
          <a href="/#how-it-works" className="text-sm text-dark-400 transition-colors hover:text-primary-400">
            How It Works
          </a>
          <a href="/dashboard" className="text-sm text-dark-400 transition-colors hover:text-primary-400">
            Dashboard
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="border-t border-dark-800/50 bg-dark-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span className="text-sm font-semibold text-dark-400">Impact Tracker</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-dark-500">
            <a href="/privacy" className="transition-colors hover:text-dark-300">Privacy Policy</a>
            <a href="https://github.com" className="transition-colors hover:text-dark-300">GitHub</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <p className="max-w-sm text-center text-xs text-dark-600 md:text-right">
            Your private repo data is never shared publicly and never used to train AI models.
          </p>
        </div>
      </div>
    </footer>
  );
}
