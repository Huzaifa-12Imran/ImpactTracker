import type { Metadata } from "next";
import Link from "next/link";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Impact Tracker",
  description:
    "Classify open source projects by sector and score social impact.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className="min-h-screen font-sans selection:bg-accent-500 selection:text-jet-black" suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// --- Navbar ---
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-jet-black bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-jet-black bg-primary-600">
            <svg className="h-6 w-6 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-syne text-xl font-bold uppercase tracking-tighter text-jet-black">
            Impact<span className="text-primary-600">Tracker</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="font-syne text-xs font-bold uppercase tracking-widest text-jet-black/60 transition-colors hover:text-primary-600">
            Features
          </Link>
          <Link href="/#how-it-works" className="font-syne text-xs font-bold uppercase tracking-widest text-jet-black/60 transition-colors hover:text-primary-600">
            How It Works
          </Link>
          <Link href="/dashboard" className="font-syne text-xs font-bold uppercase tracking-widest text-jet-black/60 transition-colors hover:text-primary-600">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
            className="btn-primary"
          >
            Sign in
          </a>
        </div>
      </div>
    </nav>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="border-t border-jet-black bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-jet-black" />
            <span className="font-syne text-sm font-bold uppercase tracking-widest text-jet-black">Impact Tracker</span>
          </div>
          <div className="flex items-center gap-8 font-syne text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Link href="/privacy" className="transition-colors hover:text-primary-600">Privacy</Link>
            <a href="https://github.com" className="transition-colors hover:text-primary-600">GitHub</a>
            <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
          </div>
          <p className="max-w-xs text-center text-[10px] leading-relaxed text-slate-400 md:text-right">
            TRACKING SOCIAL IMPACT FOR THE OPEN SOURCE ECOSYSTEM.
          </p>
        </div>
      </div>
    </footer>
  );
}
