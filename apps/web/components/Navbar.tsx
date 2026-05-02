"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("gh_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleSignOut = () => {
    sessionStorage.removeItem("gh_token");
    setIsLoggedIn(false);
    router.push("/");
  };

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
          {isLoggedIn && (
            <Link href="/dashboard" className="font-syne text-xs font-bold uppercase tracking-widest text-jet-black/60 transition-colors hover:text-primary-600">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="btn-secondary border-jet-black py-2 px-4 text-xs uppercase"
            >
              Sign out
            </button>
          ) : (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
              className="btn-primary py-2 px-4 text-xs"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
