"use client";
import Link from "next/link";
import { useState } from "react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("sharding");

  const sections = [
    {
      id: "sharding",
      label: "Distributed Sharding",
      category: "01 CORE ENGINE",
      categoryColor: "text-[#FACC15]",
    },
    {
      id: "encryption",
      label: "AES Edge Ciphers",
      category: "01 CORE ENGINE",
      categoryColor: "text-[#FACC15]",
    },
    {
      id: "routing",
      label: "Multipath Routing",
      category: "01 CORE ENGINE",
      categoryColor: "text-[#FACC15]",
    },
    {
      id: "upload-api",
      label: "POST /api/v1/upload",
      category: "02 REST API",
      categoryColor: "text-white",
    },
    {
      id: "download-api",
      label: "GET /api/v1/file/:id",
      category: "02 REST API",
      categoryColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#030307] text-white antialiased relative overflow-x-hidden">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#FACC15]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/[0.04] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top Navigation */}
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

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-body-sm text-sm text-white/50 hover:text-white font-medium transition-all">Home</Link>
            <span className="font-body-sm text-sm text-[#FACC15] font-medium">Docs</span>
            <Link href="/dashboard" className="font-body-sm text-sm text-white/50 hover:text-white font-medium transition-all">Dashboard</Link>
          </nav>

          <Link
            href="/dashboard"
            className="bg-[#FACC15] hover:bg-yellow-300 text-black px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            Console
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Docs Layout */}
      <div className="flex-grow pt-24 pb-12 max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row gap-0 px-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-72 shrink-0 mb-8 md:mb-0 md:pr-10 md:border-r border-white/[0.06]">
          <div className="sticky top-24">
            <p className="font-label-caps text-[10px] text-[#FACC15] font-bold uppercase tracking-widest mb-6">
              Documentation
            </p>

            {["01 CORE ENGINE", "02 REST API"].map((cat) => (
              <div key={cat} className="mb-8">
                <h4 className="font-label-caps text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                  {cat}
                </h4>
                <ul className="space-y-1">
                  {sections
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => setActiveSection(s.id)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-all font-body-sm ${
                            activeSection === s.id
                              ? "bg-[#FACC15]/10 text-[#FACC15] font-semibold border-l-2 border-[#FACC15]"
                              : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                          }`}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}

            <div className="mt-8 p-4 rounded-xl bg-[#FACC15]/5 border border-[#FACC15]/10">
              <p className="text-xs text-white/60 font-body-sm leading-relaxed">
                Need help? Join our developer community or open a support ticket.
              </p>
              <a
                href="https://github.com/techxsarwar/ParallelogramDrive"
                className="mt-3 flex items-center gap-2 text-[#FACC15] text-xs font-bold uppercase tracking-wider hover:underline"
              >
                GitHub
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Article Body */}
        <main className="flex-grow md:pl-10 space-y-16 text-sm leading-relaxed text-white/70 max-w-3xl">
          
          {/* Sharding */}
          <section id="sharding" className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] font-bold text-[10px] uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                Protocol Spec
              </div>
              <h1 className="font-display-lg text-3xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                Distributed Network Sharding
              </h1>
              <p className="font-body-sm text-base text-white/60 leading-relaxed">
                Parallelogram splits payload streams client-side or gateway-side into fixed cryptographic sharded blobs of{" "}
                <span className="text-[#FACC15] font-bold">20.0 MB blocks</span>. Each sharded block is dispersed
                autonomously across separate private Telegram CDN backup backend nodes.
              </p>
            </div>

            <div className="bg-black/40 border border-white/[0.08] rounded-xl p-6 font-mono text-xs text-white/70 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15]/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-white/30 text-[10px] uppercase tracking-widest">Terminal</span>
              </div>
              <code>
                <span className="text-[#FACC15]">$</span>{" "}
                <span className="text-white">pd sharding init --cluster=global_mesh</span>
                <br />
                <span className="text-white/40">[INFO] Provisioning local sharding buffers...</span>
                <br />
                <span className="text-green-400">[SUCCESS] Sharding topology mapped correctly.</span>
              </code>
            </div>
          </section>

          {/* Encryption */}
          <section id="encryption" className="space-y-6 border-t border-white/[0.06] pt-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Cryptographic Layer
              </div>
              <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mb-4">
                AES-GCM-256 Edge Cipher
              </h2>
              <p className="font-body-sm text-base text-white/60 leading-relaxed">
                Before dispatching, each individual sharded blob undergoes automated hardware-accelerated symmetric encryption
                using <span className="text-white font-bold">AES-256-GCM</span>. Encryption keymaps are secure and isolated.
                The central indexing gateway never has access to, stores, or processes decryption keys.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Key Size", value: "256-bit" },
                { label: "Mode", value: "GCM" },
                { label: "Auth Tag", value: "128-bit" },
                { label: "IV Length", value: "96-bit" },
              ].map((item) => (
                <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <p className="font-label-caps text-[10px] text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="font-mono text-base text-[#FACC15] font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Routing */}
          <section id="routing" className="space-y-6 border-t border-white/[0.06] pt-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FACC15]/10 border border-[#FACC15]/20 text-[#FACC15] font-bold text-[10px] uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
                Network Layer
              </div>
              <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mb-4">
                Multipath Routing Protocol
              </h2>
              <p className="font-body-sm text-base text-white/60 leading-relaxed">
                Shards are dispatched simultaneously across <span className="text-[#FACC15] font-bold">6 parallel node connections</span> in
                our Telegram infrastructure routing cluster. This parallel dispatch mechanism bypasses local IP throttling and
                achieves maximum throughput by utilizing multiple distinct network paths.
              </p>
            </div>
          </section>

          {/* Upload API */}
          <section id="upload-api" className="space-y-6 border-t border-white/[0.06] pt-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Gateway Endpoint
              </div>
              <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mb-4">
                POST /api/v1/upload
              </h2>
              <p className="font-body-sm text-base text-white/60 leading-relaxed">
                Upload payload stream securely. Provide your custom developer credential key inside the{" "}
                <code className="bg-[#FACC15]/10 border border-[#FACC15]/20 px-1.5 py-0.5 rounded text-[#FACC15] font-bold font-mono text-xs">
                  x-api-key
                </code>{" "}
                header.
              </p>
            </div>

            <div className="bg-black/40 border border-white/[0.08] rounded-xl p-6 font-mono text-xs text-white/70 overflow-x-auto select-all">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.06]">
                <span className="text-[#FACC15] font-bold text-[10px] uppercase tracking-widest">API REQUEST</span>
              </div>
              <pre className="text-white/80">
                <span className="text-[#FACC15] font-bold">curl</span>{" -X POST \\\n"}
                {"  "}<span className="text-white/50">-H</span>{' "x-api-key: pd_live_key_..." \\\n'}
                {"  "}<span className="text-white/50">-F</span>{' "file=@asset.tar.gz" \\\n'}
                {"  "}https://parallelogramdrive.com/api/v1/upload
              </pre>
            </div>
          </section>

          {/* Download API */}
          <section id="download-api" className="space-y-6 border-t border-white/[0.06] pt-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-[10px] uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                Retrieval Endpoint
              </div>
              <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-tight mb-4">
                GET /api/v1/file/:id
              </h2>
              <p className="font-body-sm text-base text-white/60 leading-relaxed">
                Retrieve and reassemble a sharded file by its unique ID. The system will re-collect all encrypted shards
                from distributed nodes, decrypt them using the stored keymap, and stream the reconstructed file.
              </p>
            </div>

            <div className="bg-black/40 border border-white/[0.08] rounded-xl p-6 font-mono text-xs overflow-x-auto">
              <div className="mb-4 pb-3 border-b border-white/[0.06]">
                <span className="text-[#FACC15] font-bold text-[10px] uppercase tracking-widest">RESPONSE 200 OK</span>
              </div>
              <pre className="text-white/70 leading-relaxed">{`{
  "id": "cmpi59a6s0001cyfp",
  "fileName": "asset.tar.gz",
  "size": 4096000,
  "mimeType": "application/gzip",
  "isPublic": false,
  "downloadUrl": "https://...",
  "createdAt": "2026-05-23T09:26:30.868Z"
}`}</pre>
            </div>
          </section>

        </main>
      </div>

      {/* Global Footer */}
      <footer className="relative w-full py-10 bg-black/20 border-t border-white/[0.06] mt-auto z-10">
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
            © 2026 ParallelogramDrive. Distributed Infrastructure secured by Telegram.
          </p>
          <div className="flex gap-6">
            <Link href="/" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Home</Link>
            <Link href="/terms" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="font-body-sm text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
