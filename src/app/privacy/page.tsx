import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#030307] text-white antialiased relative overflow-x-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FACC15]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[100px]" />
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] font-bold text-[10px] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
            Security Policy
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-4">
            Privacy & Data Protocol
          </h1>
          <p className="font-body-sm text-sm text-white/40 font-mono">
            Last synchronized: May 23, 2026
          </p>
        </div>

        <div className="space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] font-mono font-bold text-xs">1</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Zero-Knowledge Cryptography
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Parallelogram leverages strict zero-knowledge principles. All sharded assets are encrypted on client nodes
              with standard <span className="text-[#FACC15] font-semibold">AES-GCM-256</span> before transmission. The
              central indexing gateway never has access to, stores, or processes decryption keys.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] font-mono font-bold text-xs">2</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Shard Anonymity
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Sharded blocks are isolated and split mathematically. A single sharded block residing on a Telegram CDN
              channel contains zero readable file context, metadata, or original file signature parameters. A file can only
              be reconstructed by merging all distributed shards securely using the original keymap.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] font-mono font-bold text-xs">3</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                User Credentials & Key Isolation
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Cryptographic API access keys and Clerk authentication records are stored securely in encrypted databases.
              Key logs or token invocations are strictly private and never disclosed or sold to third parties under any
              circumstances.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] font-mono font-bold text-xs">4</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Data Retention
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              Files and their associated sharding metadata are retained as long as the associated account is active.
              Upon account deletion, all file records, shard metadata, and API tokens are permanently purged from our
              distributed systems within 30 days.
            </p>
          </section>

          <div className="border-t border-white/[0.06]" />

          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 flex items-center justify-center text-[#FACC15] font-mono font-bold text-xs">5</span>
              <h2 className="font-display-lg text-xl font-black text-white uppercase tracking-tight">
                Contact & Transparency
              </h2>
            </div>
            <p className="font-body-sm text-base text-white/60 leading-relaxed pl-9">
              For privacy-related inquiries, data removal requests, or security disclosures, contact our security team
              via our GitHub repository or support channels. We are committed to transparency and respond to all verified
              requests within 72 hours.
            </p>
          </section>

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-[#FACC15]/5 border border-[#FACC15]/10 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
          <div>
            <p className="font-display-lg text-base font-black text-white uppercase tracking-tight mb-1">
              Questions about your data?
            </p>
            <p className="font-body-sm text-sm text-white/50">
              Our team is available to help clarify any privacy concerns.
            </p>
          </div>
          <a
            href="https://github.com/techxsarwar/ParallelogramDrive"
            className="shrink-0 bg-[#FACC15] hover:bg-yellow-300 text-black px-6 py-3 rounded font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all"
          >
            Contact Us
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
            <Link href="/terms" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
