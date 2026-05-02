import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      id: "01",
      title: "Data Collection",
      content: "ImpactTracker only collects publicly available data from GitHub repositories that you explicitly connect or analyze. This includes repository metadata, commit history, and contributor usernames. We do not access private repository content unless specifically authorized via the GitHub App installation.",
    },
    {
      id: "02",
      title: "Usage of Information",
      content: "The information gathered is used exclusively to generate social impact scores, geographic diversity maps, and community health metrics. We do not sell, rent, or trade your data with third parties.",
    },
    {
      id: "03",
      title: "Authentication",
      content: "We use GitHub OAuth and the GitHub App framework for secure authentication. We never store your GitHub password. Our access is restricted to the permissions you grant during the installation process.",
    },
    {
      id: "04",
      title: "Data Security",
      content: "Your data is stored securely on encrypted infrastructure provided by Northflank and Upstash. We follow industry best practices to protect your information against unauthorized access or disclosure.",
    },
  ];

  return (
    <div className="bg-white pb-24">
      {/* Header Section */}
      <section className="grid-hero border-b border-jet-black px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 border border-jet-black bg-accent-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-jet-black">
            Policy v1.0
          </div>
          <h1 className="font-syne text-6xl font-bold leading-[0.9] tracking-tighter text-jet-black md:text-8xl">
            PRIVACY <br />
            <span className="text-primary-600">PRINCIPLES.</span>
          </h1>
          <p className="mt-8 max-w-xl font-sans text-lg font-medium leading-relaxed text-slate-600">
            Transparency is at the core of ImpactTracker. We only process what is necessary to quantify social impact.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {sections.map((section) => (
              <div key={section.id} className="console-card group bg-white p-8 hover:bg-slate-50">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-syne text-4xl font-bold text-slate-200 transition-colors group-hover:text-primary-200">
                    {section.id}
                  </span>
                  <div className="h-2 w-12 bg-jet-black group-hover:bg-primary-600" />
                </div>
                <h2 className="mb-4 font-syne text-2xl font-bold uppercase tracking-tight text-jet-black">
                  {section.title}
                </h2>
                <p className="font-sans text-base font-medium leading-relaxed text-slate-600">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact / Help Box */}
          <div className="mt-16 console-card border-2 border-jet-black bg-accent-500 p-12 text-center shadow-[8px_8px_0px_#0f172a]">
            <h3 className="mb-4 font-syne text-3xl font-bold uppercase tracking-tighter text-jet-black">
              Questions about your data?
            </h3>
            <p className="mb-8 mx-auto max-w-md font-sans text-sm font-bold text-jet-black/60 uppercase tracking-widest">
              We are open source and committed to privacy. Reach out if you need clarification.
            </p>
            <Link 
              href="https://github.com/Huzaifa-12Imran/ImpactTracker" 
              className="btn-primary inline-flex items-center gap-3 border-2 border-jet-black bg-jet-black text-white hover:bg-primary-600"
            >
              <span>GITHUB REPOSITORY</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

