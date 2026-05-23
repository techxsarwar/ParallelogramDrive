import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030307] text-white antialiased relative overflow-x-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FACC15]/[0.03] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Header */}
      <header className="fixed w-full top-0 z-50 bg-[#030307]/80 backdrop-blur-xl border-b border-white/[0.06] h-16 flex items-center">
        <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#FACC15] transform rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#FACC15]" />
            </div>
            <Link href="/" className="font-display-lg text-white font-black tracking-tighter text-[18px] uppercase">
              Parallelogram<span className="text-[#FACC15]">Drive</span>
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="bg-[#FACC15] hover:bg-yellow-300 text-black px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            Console
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow pt-32 pb-20 px-6 max-w-3xl mx-auto w-full relative z-10">

        {/* Header Badge */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            Legal Framework
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-4">
            Terms of Protocol & Service
          </h1>
          <p className="font-body-sm text-sm text-white/40 font-mono">
            Last synchronized: May 23, 2026
          </p>
        </div>

        <div className="space-y-12">

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 font-mono font-bold text-xs">1</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Protocol Acceptance
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              By interacting with the Parallelogram decentralized storage gateway, generating API tokens, or dispersing
              assets across routing peer nodes, you accept these Terms of Service in full. If you do not agree to these
              terms, you must discontinue use of the platform immediately.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 font-mono font-bold text-xs">2</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Distributed Node Integrity
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Users represent that all uploaded payloads represent verified, encrypted cryptographic segments. Hosting of
              unencrypted illicit or harmful signatures is strictly monitored by network abuse filters. Nodes hosting
              abusive block signatures will be automatically banned by the Command Center and reported to relevant
              authorities.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 font-mono font-bold text-xs">3</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Quota Limits
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Bandwidth and database storage proxy segments are governed by your allocated grid plan. Exceeding
              continuous API throughput limits will trigger temporary network throttling. Persistent abuse of the
              rate limiting system may result in permanent suspension of your developer credentials.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 font-mono font-bold text-xs">4</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Intellectual Property
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Users retain ownership of all files uploaded to the ParallelogramDrive infrastructure. By uploading content,
              you grant ParallelogramDrive a limited, non-exclusive license to store, shard, and distribute the encrypted
              fragments across our node network solely for the purpose of providing the service.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 font-mono font-bold text-xs">5</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Limitation of Liability
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              ParallelogramDrive is provided as-is. While we maintain 99.999% uptime SLA for paid tiers, we are not
              liable for data loss resulting from force majeure events, Telegram infrastructure outages, or actions
              beyond our direct control. Always maintain independent backups of critical data.
            </p>
          </section>

        </div>

        {/* Bottom Info */}
        <div className="mt-16 p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <p className="font-display-lg text-base font-black text-white uppercase tracking-tight mb-1">
              Questions about these terms?
            </p>
            <p className="font-body-sm text-sm text-white/50">
              Reach out via our GitHub repository for legal inquiries.
            </p>
          </div>
          <a
            href="https://github.com/techxsarwar/ParallelogramDrive"
            className="shrink-0 border border-white/10 hover:border-[#FACC15]/40 hover:text-[#FACC15] text-white/60 px-6 py-3 rounded font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all"
          >
            View on GitHub
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-10 bg-black/20 border-t border-white/[0.06] z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-[#FACC15] transform rotate-45 flex items-center justify-center">
              <div className="w-1 h-1 bg-[#FACC15]" />
            </div>
            <span className="font-display-lg text-white font-black tracking-tighter text-sm uppercase">
              Parallelogram<span className="text-[#FACC15]">Drive</span>
            </span>
          </div>
          <p className="font-mono text-[10px] text-white/30">
            © 2026 ParallelogramDrive. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Docs</Link>
            <Link href="/privacy" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
