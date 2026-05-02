import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="border-b border-jet-black px-6 py-6">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
          <Link href="/" className="font-syne text-2xl font-black uppercase tracking-tighter text-jet-black flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600 flex items-center justify-center text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            ImpactTracker
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-12 inline-flex items-center gap-2 border border-jet-black bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-jet-black">
          Compliance v1.0
        </div>

        <h1 className="mb-12 font-syne text-6xl font-bold leading-[0.9] tracking-tighter text-jet-black md:text-7xl">
          PRIVACY <br />
          <span className="text-primary-600">POLICY.</span>
        </h1>

        <div className="prose prose-slate max-w-none space-y-12">
          <section>
            <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-jet-black border-b-2 border-jet-black pb-2 mb-6">
              01. Data Collection
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-slate-600">
              ImpactTracker only collects publicly available data from GitHub repositories that you explicitly connect or analyze. This includes repository metadata, commit history, and contributor usernames. We do not access private repository content unless specifically authorized via the GitHub App installation.
            </p>
          </section>

          <section>
            <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-jet-black border-b-2 border-jet-black pb-2 mb-6">
              02. Usage of Information
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-slate-600">
              The information gathered is used exclusively to generate social impact scores, geographic diversity maps, and community health metrics. We do not sell, rent, or trade your data with third parties.
            </p>
          </section>

          <section>
            <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-jet-black border-b-2 border-jet-black pb-2 mb-6">
              03. Authentication
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-slate-600">
              We use GitHub OAuth and the GitHub App framework for secure authentication. We never store your GitHub password. Our access is restricted to the permissions you grant during the installation process.
            </p>
          </section>

          <section>
            <h2 className="font-syne text-2xl font-bold uppercase tracking-tight text-jet-black border-b-2 border-jet-black pb-2 mb-6">
              04. Data Security
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-slate-600">
              Your data is stored securely on encrypted infrastructure provided by Northflank and Upstash. We follow industry best practices to protect your information against unauthorized access or disclosure.
            </p>
          </section>

          <section className="bg-slate-50 p-8 border-2 border-jet-black">
            <h3 className="font-syne text-xl font-bold uppercase tracking-tight text-jet-black mb-4">
              Questions?
            </h3>
            <p className="font-sans text-sm font-medium text-slate-500 mb-6">
              If you have any questions regarding this policy or how your data is processed, please contact us via our GitHub repository.
            </p>
            <Link href="https://github.com/Huzaifa-12Imran/ImpactTracker" className="font-mono text-xs font-bold uppercase tracking-widest text-primary-600 border-b border-primary-600 pb-1">
              Github Repository &rarr;
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-jet-black px-6 py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
            &copy; {new Date().getFullYear()} ImpactTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
