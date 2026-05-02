import Link from "next/link";

export function Footer() {
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
