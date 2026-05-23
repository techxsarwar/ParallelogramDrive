"use client";

import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/* ── Palette constants ───────────────────────────────────── */
const C = {
  bg:        "#050816",
  surface:   "#0B1220",
  surfaceUp: "#0f1a2e",
  cyan:      "#00D9FF",
  blue:      "#3B82F6",
  text:      "#F8FAFC",
  muted:     "#94a3b8",
  border:    "rgba(0,217,255,0.1)",
  borderMd:  "rgba(0,217,255,0.18)",
};

/* ── Code snippets ───────────────────────────────────────── */
const CODE: Record<string, string> = {
  js: `import { PDClient } from "@parallelogram/sdk";

const pd = new PDClient({ apiKey: process.env.PD_API_KEY });

// Shard, encrypt & distribute in one call
const file = await pd.upload("./dataset.tar.gz", {
  redundancy: "geo-replicated",
  encrypt: true,
});

console.log(\`Distributed across 6 nodes: \${file.id}\`);`,

  curl: `curl -X POST https://api.parallelogramdrive.com/v1/upload \\
  -H "x-api-key: pd_live_••••••••••••••••" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@dataset.tar.gz" \\
  -F "redundancy=geo-replicated"`,

  python: `from parallelogram import PDClient

pd = PDClient(api_key="pd_live_••••••••••••••••")

# Fractures & streams shards via Telegram grid
file = pd.upload(
    path="./dataset.tar.gz",
    geo_redundancy=True,
    encrypt=True,
)

print(f"Shards synced across 6 nodes: {file.id}")`,

  go: `package main

import (
  "context"
  pd "github.com/parallelogram/sdk-go"
)

func main() {
  client := pd.NewClient("pd_live_••••••••••••••••")
  file, _ := client.Upload(context.Background(),
    "./dataset.tar.gz",
    pd.WithGeoRedundancy(),
  )
  println("File ID:", file.ID)
}`,
};

const LOGS = [
  "SYSTEM: Initializing shard fracture pipeline...",
  "CIPHER: AES-GCM-256 key generated [32-byte entropy]",
  "SHARD: Split dataset.tar.gz → 6 cryptographic shards",
  "ROUTE: Shard 0 → Node US-East    12ms  [OK]",
  "ROUTE: Shard 1 → Node EU-Central 28ms  [OK]",
  "ROUTE: Shard 2 → Node Asia-East  41ms  [OK]",
  "ROUTE: Shard 3 → Node SA-East    19ms  [OK]",
  "ROUTE: Shard 4 → Node US-West    15ms  [OK]",
  "ROUTE: Shard 5 → Node AU-East    34ms  [OK]",
  "TELEGRAM: Uplink confirmed — msg_id: 48921",
  "META: Shard map committed to distributed ledger",
  "SYSTEM: Pipeline complete. Integrity: 100% ✓",
];



/* ── World topology map ───────────────────────────────────── */
function TopologyMap() {
  const regionNodes = [
    { id: "us-east",       x: 20, y: 38, count: 12, active: true  },
    { id: "eu-west",       x: 46, y: 26, count: 8,  active: true  },
    { id: "ap-south",      x: 70, y: 42, count: 6,  active: true  },
    { id: "sa-east",       x: 29, y: 63, count: 4,  active: false },
    { id: "ap-southeast",  x: 79, y: 58, count: 4,  active: true  },
  ];
  const lines = [[0,1],[1,2],[0,3],[2,4],[1,3]];

  return (
    <div className="relative w-full h-[220px] rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#030712 0%,#0B1220 100%)", border: `1px solid ${C.border}` }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        {Array.from({length:10}).map((_,r) => Array.from({length:14}).map((_,c) => (
          <circle key={`${r}-${c}`} cx={c*7+3} cy={r*8+4} r="0.25" fill="rgba(0,217,255,0.08)" />
        )))}
        {lines.map(([a,b],i) => {
          const na = regionNodes[a]; const nb = regionNodes[b];
          return <line key={i} x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
            stroke={C.cyan} strokeWidth="0.5" strokeDasharray="2,2" opacity="0.4" />;
        })}
        {regionNodes.map(n => (
          <g key={n.id}>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="4" fill={C.cyan} opacity="0.1" />
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="2" fill={n.active ? C.cyan : "#475569"} opacity="0.9" />
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="1" fill="white" opacity="0.6" />
          </g>
        ))}
      </svg>
      {regionNodes.map(n => (
        <div key={n.id} className="absolute" style={{ left:`${n.x}%`, top:`${n.y}%`, transform:"translate(-50%,-160%)" }}>
          <div className="px-2 py-1 text-center whitespace-nowrap rounded-lg" style={{ background:"rgba(11,18,32,0.9)", border:`1px solid ${C.border}` }}>
            <div className="text-[9px] font-bold" style={{ color: C.text }}>{n.id}</div>
            <div className="text-[8px]" style={{ color: C.cyan }}>{n.count} nodes</div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-3 left-4 flex gap-4">
        {[[C.cyan,"Active"],["#475569","Standby"]].map(([col,lbl]) => (
          <div key={lbl} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: col }} />
            <span className="text-[9px]" style={{ color: C.muted }}>{lbl}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-3 right-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[9px] text-green-400 font-bold">Live</span>
      </div>
    </div>
  );
}

/* ── Mini sparkline ──────────────────────────────────────── */
function Spark({ color = C.cyan }: { color?: string }) {
  return (
    <svg width="96" height="18" viewBox="0 0 96 18">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        points="0,16 12,10 24,13 36,5 48,9 60,3 72,7 84,1 96,4" opacity="0.7" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function Home() {
  const [activeLang, setActiveLang] = useState<"js"|"curl"|"python"|"go">("js");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { setLogs(p => [...p, LOGS[i % LOGS.length]].slice(-7)); i++; }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p+1)%3), 3500);
    return () => clearInterval(t);
  }, []);

  /* ── Data ───────────────────────────────────────────────── */
  const features = [
    { icon:"hub",           title:"Distributed Storage",      desc:"Files sharded across geo-redundant nodes. Zero single point of failure." },
    { icon:"offline_bolt",  title:"Instant Retrieval",        desc:"Parallel shard assembly delivers sub-second global file reconstruction." },
    { icon:"terminal",      title:"API-First Design",         desc:"Every action is programmable. Built for CLI, CI/CD, and backend pipelines." },
    { icon:"send",          title:"Telegram Infrastructure",  desc:"Telegram's multi-datacenter backend as encrypted distributed storage." },
    { icon:"lock",          title:"Zero-Knowledge Encryption",desc:"AES-GCM-256 local encryption. Your server never sees plaintext shards." },
    { icon:"language",      title:"Global Edge Routing",      desc:"Smart routing to nearest node clusters. 34 active regions worldwide." },
  ];

  const useCases = [
    { icon:"psychology",    tag:"AI & ML",   title:"AI Dataset Storage",     desc:"Stream multi-GB model weights and training sets across parallel nodes." },
    { icon:"image",         tag:"Media",     title:"Image & Video Hosting",  desc:"Bypass CDN egress costs. Serve static assets from Telegram clusters." },
    { icon:"smart_toy",     tag:"Bots",      title:"Telegram Bot Backends",  desc:"Provision datastores, state maps, and logs natively inside bot servers." },
    { icon:"security",      tag:"Backup",    title:"Encrypted Backups",      desc:"DB exports and pipeline dumps with zero-readable shard metadata." },
    { icon:"build_circle",  tag:"DevOps",    title:"CI/CD Artifact Storage", desc:"Store build bundles, releases, and compiler outputs via cURL." },
    { icon:"dns",           tag:"Edge",      title:"Serverless Databases",   desc:"SQLite containers and static JSON stores on ultra-light HTTP." },
  ];

  const testimonials = [
    { init:"A", name:"Alex Mercer",  role:"DevOps Engineer @ ShardTech",  color:C.cyan,  quote:"ParallelogramDrive replaced our S3 setup entirely. The AES-GCM sharding layer is genuinely impressive — zero config, instant CLI uploads." },
    { init:"K", name:"Kira Vance",   role:"Lead Architect @ VectorLabs",  color:C.blue,  quote:"Sub-second retrieval on a Telegram backend sounds insane — it works. Our serverless functions just POST to /upload and we're done." },
    { init:"M", name:"Marcus Chen",  role:"Principal Infra @ NodeStack",  color:"#10b981",quote:"The zero-knowledge encryption combined with geo-sharding made this the obvious choice for our CI/CD artifact pipeline." },
  ];

  const steps = [
    { icon:"lock",       stage:"01", title:"Shard & Encrypt",        desc:"Your file is split into symmetric shards locally. Each chunk is AES-GCM-256 encrypted before leaving your device." },
    { icon:"alt_route",  stage:"02", title:"Parallel Dispatch",      desc:"Shards are dispatched simultaneously across 6 isolated node connections, bypassing rate limits and single-pipe bottlenecks." },
    { icon:"join_inner", stage:"03", title:"Zero-Knowledge Assembly", desc:"Retrieval uses a cryptographic map to reassemble shards globally. The server logs zero readable content — only metadata hashes." },
  ];

  const stats = [
    { val:"12.4M+", label:"Files Distributed" },
    { val:"240 TB", label:"Data Routed" },
    { val:"99.99%", label:"Uptime" },
    { val:"34",     label:"Global Node Clusters" },
  ];

  /* ── Shared style tokens ────────────────────────────────── */
  const card  = { background: C.surface, border: `1px solid ${C.border}` };
  const cardHv = "hover:border-[rgba(0,217,255,0.28)] hover:shadow-lg hover:shadow-[rgba(0,217,255,0.06)] transition-all duration-300";

  /* ══ RENDER ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col antialiased overflow-x-hidden" style={{ background: C.bg, color: C.text }}>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl" style={{ background:"rgba(5,8,22,0.85)", borderBottom:`1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-[60px] flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-6 h-6 rotate-45 flex items-center justify-center" style={{ border:`2px solid ${C.cyan}` }}>
              <div className="w-2 h-2" style={{ background: C.cyan }} />
            </div>
            <span className="font-black text-[15px] tracking-tight uppercase" style={{ color: C.text }}>
              Parallelogram<span style={{ color: C.cyan }}>Drive</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-7 mx-auto">
            {[["Infrastructure","/#infrastructure"],["API & SDK","/#apisdksection"],["Docs","/docs"],["Pricing","/#pricing"],["Topology","/#topology"]].map(([label, href]) => (
              <a key={label} href={href}
                className="text-[13px] font-medium transition-colors"
                style={{ color: C.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = C.cyan)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >{label}</a>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3 ml-auto lg:ml-0 flex-shrink-0">
            <a href="https://github.com/techxsarwar/ParallelogramDrive" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg transition-all" style={{ color: C.muted }}
              onMouseEnter={e => { e.currentTarget.style.color=C.cyan; e.currentTarget.style.background="rgba(0,217,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color=C.muted; e.currentTarget.style.background="transparent"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
                <Link href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[12px] transition-all"
                  style={{ background: C.cyan, color: C.bg }}>
                  Console <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[12px] transition-all shadow-lg"
                  style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 20px rgba(0,217,255,0.3)` }}>
                  Console <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[60px]">

        {/* ── 1. HERO ────────────────────────────────────────── */}
        <section className="min-h-[92vh] flex items-center" style={{ borderBottom:`1px solid ${C.border}` }}>
          {/* Ambient glows */}
          <div className="pointer-events-none absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background:`radial-gradient(circle, rgba(0,217,255,0.07) 0%, transparent 70%)`, filter:"blur(80px)" }} />
          <div className="pointer-events-none absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background:`radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)`, filter:"blur(60px)" }} />

          <div className="relative max-w-5xl mx-auto px-6 w-full py-28 z-10 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ background:"rgba(0,217,255,0.08)", border:`1px solid rgba(0,217,255,0.2)` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.cyan }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.cyan }}>Infrastructure Platform · v1.0 Live</span>
            </div>

            {/* Heading */}
            <h1 className="text-[56px] md:text-[80px] font-black leading-[0.88] tracking-tight uppercase mb-6" style={{ color: C.text }}>
              Geometry of<br />
              <span style={{ color: C.cyan }} className="text-glow-cyan">Infinite</span><br />
              Storage.
            </h1>

            <p className="text-[17px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: C.muted }}>
              Upload once, distribute across intelligent Telegram-powered storage nodes, retrieve instantly through developer-first APIs. Zero cloud bills. Zero config. Pure infrastructure.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] transition-all"
                    style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 30px rgba(0,217,255,0.35)` }}>
                    Start Building <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] transition-all"
                  style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 30px rgba(0,217,255,0.35)` }}>
                  Open Console <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </Show>
              <a href="#infrastructure"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-[14px] transition-all"
                style={{ border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }}>
                Explore Infrastructure
              </a>
            </div>

            {/* Quick stats */}
            <div className="flex justify-center gap-12">
              {[["12.4M+","Files stored"],["240 TB","Data routed"],["99.99%","Uptime SLA"],["34","Global nodes"]].map(([v,l]) => (
                <div key={l}>
                  <div className="text-[26px] font-black font-mono leading-none" style={{ color: C.text }}>{v}</div>
                  <div className="text-[12px] mt-1.5" style={{ color: C.muted }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. TRUST STRIP ─────────────────────────────────── */}
        <section className="py-10" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(11,18,32,0.5)" }}>
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-[11px] uppercase tracking-widest font-bold mb-8" style={{ color: C.muted }}>Trusted by engineers from</p>
            <div className="flex flex-wrap items-center justify-center gap-10" style={{ opacity: 0.4 }}>
              {[
                { name:"GitHub",     path:"M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z" },
                { name:"Vercel",     path:"M24 22.525H0l12-21.05 12 21.05z" },
                { name:"Telegram",   path:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.57-.48.71-.97.44l-2.68-1.97-1.3 1.25c-.14.14-.27.27-.56.27l.19-2.73 4.99-4.51c.22-.19-.05-.3-.34-.11L7.36 14.4l-2.62-.82c-.57-.18-.58-.57.12-.84l10.23-3.95c.47-.18.88.11.55 1.01z" },
                { name:"Supabase",   path:"M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.12 12.888.734 14.064 1.824 14.064h7.802l-.06 8.9c.015.986 1.26 1.409 1.874.637l9.262-11.652c.645-.839.031-2.014-1.06-2.014h-7.802l.06-8.9z" },
              ].map(({ name, path }) => (
                <div key={name} className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.text}><path d={path}/></svg>
                  <span className="text-[13px] font-bold" style={{ color: C.text }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FEATURE GRID ────────────────────────────────── */}
        <section id="infrastructure" className="py-24" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Core Capabilities</span>
              <h2 className="text-[40px] font-black tracking-tight uppercase" style={{ color: C.text }}>Infrastructure-Grade Features</h2>
              <p className="text-[15px] max-w-2xl mx-auto mt-4" style={{ color: C.muted }}>
                Every feature designed for engineers who care about correctness, performance, and zero operational overhead.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div key={i} className={`group rounded-2xl p-7 cursor-default ${cardHv}`} style={card}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all"
                    style={{ background:"rgba(0,217,255,0.1)" }}>
                    <span className="material-symbols-outlined text-[20px] transition-all" style={{ color: C.cyan }}>{f.icon}</span>
                  </div>
                  <h3 className="text-[15px] font-bold mb-2 uppercase tracking-tight" style={{ color: C.text }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ────────────────────────────────── */}
        <section className="py-24" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(11,18,32,0.4)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Mathematical Flow</span>
              <h2 className="text-[40px] font-black tracking-tight uppercase" style={{ color: C.text }}>How Sharding Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="rounded-2xl p-8 transition-all duration-500" style={{
                  ...card,
                  ...(activeStep === i ? { borderColor: C.cyan, boxShadow:`0 0 30px rgba(0,217,255,0.1)`, transform:"translateY(-4px)" } : { opacity:0.55 })
                }}>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.cyan }}>Stage {s.stage}</span>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: C.cyan }}>{s.icon}</span>
                  </div>
                  <h3 className="text-[16px] font-black uppercase mb-3" style={{ color: C.text }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
                  <div className="mt-6 h-0.5 transition-all duration-700 rounded-full" style={{
                    background:`linear-gradient(90deg, ${C.cyan}, transparent)`,
                    opacity: activeStep === i ? 1 : 0
                  }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. CODE EXAMPLE ────────────────────────────────── */}
        <section id="apisdksection" className="py-24" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Developer-Native</span>
                <h2 className="text-[40px] font-black tracking-tight uppercase mb-5" style={{ color: C.text }}>Three Lines<br />of Code.</h2>
                <p className="text-[15px] leading-relaxed mb-8" style={{ color: C.muted }}>
                  Integrate geo-sharded, zero-knowledge encrypted file storage directly into any backend pipeline. Works with every language, framework, and runtime.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {(["js","curl","python","go"] as const).map(l => (
                    <button key={l} onClick={() => setActiveLang(l)}
                      className="px-4 py-2 text-[12px] font-bold font-mono rounded-lg uppercase transition-all"
                      style={activeLang===l
                        ? { background: C.cyan, color: C.bg, boxShadow:`0 0 16px rgba(0,217,255,0.35)` }
                        : { border:`1px solid ${C.border}`, color: C.cyan, background:"transparent" }}>
                      {l==="js"?"Node.js":l==="curl"?"cURL":l==="python"?"Python":"Go"}
                    </button>
                  ))}
                </div>
                <Link href="/docs" className="inline-flex items-center gap-2 text-[13px] font-bold hover:underline" style={{ color: C.cyan }}>
                  Full API Reference <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>

              {/* Code block */}
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border:`1px solid ${C.borderMd}`, boxShadow:`0 0 40px rgba(0,217,255,0.08)` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ background:"#030712", borderBottom:`1px solid rgba(0,217,255,0.1)` }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold" style={{ color: C.cyan }}>
                    {activeLang==="curl"?"Terminal":"SDK"} · parallelogram/{activeLang}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(CODE[activeLang]); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
                    style={{ color: C.muted }}>
                    <span className="material-symbols-outlined text-[14px]">{copied?"check":"content_copy"}</span>
                  </button>
                </div>
                <pre className="px-6 py-5 text-[12px] font-mono leading-[1.75] overflow-x-auto" style={{ background:"#030712", color:"#cffafe" }}>
                  <code>{CODE[activeLang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. LIVE TOPOLOGY ───────────────────────────────── */}
        <section id="topology" className="py-24" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(11,18,32,0.4)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Live Network</span>
                <h2 className="text-[40px] font-black tracking-tight uppercase mb-5" style={{ color: C.text }}>Global Shard<br />Routing.</h2>
                <p className="text-[15px] leading-relaxed mb-6" style={{ color: C.muted }}>
                  Watch your assets traverse intelligent routing pathways across 34 global node clusters — all encrypted, all parallel, all real-time.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[["34","Active Nodes"],["99.99%","Uptime"],["6","Parallel Shards"],["<15ms","Avg Latency"]].map(([v,l]) => (
                    <div key={l} className="rounded-xl p-4" style={card}>
                      <div className="text-[22px] font-black font-mono" style={{ color: C.cyan }}>{v}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: C.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <TopologyMap />
                {/* Log terminal */}
                <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${C.borderMd}` }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ background:"#030712", borderBottom:`1px solid rgba(0,217,255,0.1)` }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold uppercase" style={{ color: C.cyan }}>Uplink Telemetry</span>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>LIVE STDOUT</span>
                  </div>
                  <div className="px-4 py-3 space-y-1.5 font-mono text-[11px]" style={{ background:"#030712", minHeight:"160px" }}>
                    {logs.map((line, i) => (
                      <div key={i} className="flex gap-2 pl-3 border-l-2" style={{ borderColor:"rgba(0,217,255,0.3)" }}>
                        <span style={{ color:"rgba(255,255,255,0.15)" }}>›</span>
                        <span style={{ color:
                          line.startsWith("SYSTEM") ? C.cyan :
                          line.includes("[OK]")     ? "#4ade80" :
                          "rgba(255,255,255,0.55)"
                        }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. STATS ───────────────────────────────────────── */}
        <section className="py-20" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((s, i) => (
                <div key={i} className="py-6" style={i < stats.length-1 ? { borderRight:`1px solid ${C.border}` } : {}}>
                  <div className="text-[42px] font-black font-mono leading-none text-glow-cyan" style={{ color: C.cyan }}>{s.val}</div>
                  <div className="text-[12px] mt-2 uppercase font-bold tracking-wider" style={{ color: C.muted }}>{s.label}</div>
                  <div className="mt-3 flex justify-center"><Spark /></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. USE CASES ───────────────────────────────────── */}
        <section className="py-24" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(11,18,32,0.4)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Built For</span>
              <h2 className="text-[40px] font-black tracking-tight uppercase" style={{ color: C.text }}>Modern Developer<br />Use Cases.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {useCases.map((u, i) => (
                <div key={i} className={`rounded-2xl p-6 cursor-default ${cardHv}`} style={card}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"rgba(0,217,255,0.1)" }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: C.cyan }}>{u.icon}</span>
                    </div>
                    <span className="text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider" style={{ background:"rgba(0,217,255,0.1)", color: C.cyan }}>{u.tag}</span>
                  </div>
                  <h3 className="text-[14px] font-bold mb-2 uppercase" style={{ color: C.text }}>{u.title}</h3>
                  <p className="text-[12px] leading-relaxed" style={{ color: C.muted }}>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. TESTIMONIALS ────────────────────────────────── */}
        <section className="py-24" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Developer Voices</span>
              <h2 className="text-[40px] font-black tracking-tight uppercase" style={{ color: C.text }}>
                Built for Devs,<br /><span style={{ color: C.cyan }}>by Devs.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className={`rounded-2xl p-8 flex flex-col justify-between ${cardHv}`} style={card}>
                  <div>
                    <span className="text-[48px] font-black leading-none block mb-4" style={{ color:"rgba(0,217,255,0.2)", fontFamily:"Georgia,serif" }}>&ldquo;</span>
                    <p className="text-[13px] leading-relaxed" style={{ color:"#cbd5e1" }}>&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="mt-6 pt-4 flex items-center gap-3" style={{ borderTop:`1px solid rgba(0,217,255,0.08)` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[14px]" style={{ background: t.color, color: C.bg }}>
                      {t.init}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold" style={{ color: C.text }}>{t.name}</div>
                      <div className="text-[10px]" style={{ color: C.muted }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. API REFERENCE ──────────────────────────────── */}
        <section id="api" className="py-24" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(11,18,32,0.4)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-3">
                {[
                  { method:"POST",   path:"/v1/upload",             desc:"Upload & shard a file" },
                  { method:"GET",    path:"/v1/files/:id",           desc:"Retrieve file metadata" },
                  { method:"GET",    path:"/v1/files/:id/download",  desc:"Download reconstructed file" },
                  { method:"DELETE", path:"/v1/files/:id",           desc:"Permanently destroy all shards" },
                  { method:"POST",   path:"/v1/files/:id/share",     desc:"Toggle public access" },
                  { method:"GET",    path:"/v1/developer/keys",      desc:"List API keys" },
                ].map(ep => (
                  <div key={`${ep.method}-${ep.path}`}
                    className={`flex items-center gap-4 rounded-xl px-5 py-3 ${cardHv}`} style={card}>
                    <span className="text-[10px] font-black font-mono w-14 text-center py-1 rounded" style={{
                      background: ep.method==="POST"?"rgba(74,222,128,0.1)":ep.method==="GET"?"rgba(0,217,255,0.1)":"rgba(239,68,68,0.1)",
                      color:      ep.method==="POST"?"#4ade80":ep.method==="GET"?C.cyan:"#f87171",
                    }}>{ep.method}</span>
                    <code className="text-[12px] font-mono flex-1" style={{ color: C.text }}>{ep.path}</code>
                    <span className="text-[11px]" style={{ color: C.muted }}>{ep.desc}</span>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Programmatic Access</span>
                <h2 className="text-[40px] font-black tracking-tight uppercase mb-5" style={{ color: C.text }}>REST API<br />&amp; SDKs.</h2>
                <p className="text-[15px] leading-relaxed mb-6" style={{ color: C.muted }}>
                  A clean, versioned REST API with SDK wrappers for Node.js, Python, Go, and cURL. Supports streaming uploads, range downloads, and webhook callbacks.
                </p>
                <div className="flex flex-wrap gap-3 mb-8">
                  {["Node.js","Python","Go","cURL","REST"].map(sdk => (
                    <div key={sdk} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ background:"rgba(0,217,255,0.1)", color: C.cyan }}>{sdk}</div>
                  ))}
                </div>
                <Link href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[13px] transition-all"
                  style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 20px rgba(0,217,255,0.3)` }}>
                  Browse API Docs <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. PRICING ────────────────────────────────────── */}
        <section id="pricing" className="py-24" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-[11px] font-bold uppercase tracking-widest block mb-3" style={{ color: C.cyan }}>Pricing</span>
              <h2 className="text-[40px] font-black tracking-tight uppercase" style={{ color: C.text }}>Scalable Plans.</h2>
              <p className="text-[15px] mt-4" style={{ color: C.muted }}>No egress fees. No per-request charges. Just infrastructure.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {[
                { name:"Developer",     price:"$0",     period:"/mo", desc:"For side projects & experimentation",
                  features:["100 GB Distributed Storage","Core REST API endpoints","API Key Generator","Community support"],
                  cta:"Start Free", highlight:false },
                { name:"Pro",           price:"$12",    period:"/mo", desc:"For production-grade deployments",
                  features:["2 TB Geo-Sharded Storage","Parallel multithread routing","Priority node access","SDK + webhook support","Analytics dashboard"],
                  cta:"Upgrade to Pro", highlight:true },
                { name:"Infrastructure",price:"Custom", period:"",    desc:"For teams & enterprise workloads",
                  features:["Unlimited distributed storage","Dedicated node clusters","Custom SLA & uptime guarantees","24/7 engineering support"],
                  cta:"Contact Sales", highlight:false },
              ].map((plan, i) => (
                <div key={i} className="rounded-2xl p-8 flex flex-col" style={{
                  ...(plan.highlight
                    ? { background:`linear-gradient(135deg,rgba(0,217,255,0.15),rgba(59,130,246,0.1))`, border:`1px solid ${C.cyan}`, boxShadow:`0 0 40px rgba(0,217,255,0.15)`, transform:"translateY(-6px)" }
                    : card)
                }}>
                  {plan.highlight && (
                    <div className="mb-4">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: C.cyan, color: C.bg }}>Recommended</span>
                    </div>
                  )}
                  <div className="text-[11px] font-black uppercase tracking-widest mb-1" style={{ color: plan.highlight ? C.cyan : C.muted }}>{plan.name}</div>
                  <div className="text-[38px] font-black font-mono mb-1" style={{ color: C.text }}>
                    {plan.price}<span className="text-[14px] font-normal" style={{ color: C.muted }}>{plan.period}</span>
                  </div>
                  <p className="text-[12px] mb-6" style={{ color: C.muted }}>{plan.desc}</p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[12px]" style={{ color:"#cbd5e1" }}>
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0" style={{ color: plan.highlight ? C.cyan : C.blue }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="w-full py-3 rounded-xl font-bold text-[13px] transition-all" style={
                        plan.highlight
                          ? { background: C.cyan, color: C.bg }
                          : { border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }
                      }>{plan.cta}</button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <Link href="/dashboard" className="w-full py-3 rounded-xl font-bold text-[13px] text-center block transition-all" style={
                      plan.highlight
                        ? { background: C.cyan, color: C.bg }
                        : { border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }
                    }>{plan.cta}</Link>
                  </Show>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 12. FINAL CTA ──────────────────────────────────── */}
        <section className="py-28 relative overflow-hidden" style={{ borderBottom:`1px solid ${C.border}` }}>
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse at center, rgba(0,217,255,0.1) 0%, transparent 65%)` }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
            <h2 className="text-[52px] md:text-[72px] font-black tracking-tight uppercase leading-[0.88] mb-6" style={{ color: C.text }}>
              Build on Parallel<br /><span style={{ color: C.cyan }} className="text-glow-cyan">Infrastructure.</span>
            </h2>
            <p className="text-[16px] max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: C.muted }}>
              Ditch traditional server limits. Upload, shard, and secure developer data with mathematical precision and zero-knowledge cryptographic architecture.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[13px] uppercase transition-all"
                    style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 40px rgba(0,217,255,0.4)` }}>
                    Get API Key <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[13px] uppercase transition-all"
                  style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 40px rgba(0,217,255,0.4)` }}>
                  Open Console <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                </Link>
              </Show>
              <Link href="/docs"
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-black text-[13px] uppercase transition-all"
                style={{ border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }}>
                Read Docs <span className="material-symbols-outlined text-[16px]">menu_book</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-12" style={{ background: C.surface, borderTop:`1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10" style={{ borderBottom:`1px solid ${C.border}` }}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rotate-45 flex items-center justify-center" style={{ border:`2px solid ${C.cyan}` }}>
                  <div className="w-1.5 h-1.5" style={{ background: C.cyan }} />
                </div>
                <span className="font-black text-[14px] uppercase" style={{ color: C.text }}>
                  Parallelogram<span style={{ color: C.cyan }}>Drive</span>
                </span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: C.muted }}>
                Distributed storage infrastructure powered by Telegram&apos;s backend protocol.
              </p>
            </div>
            {/* Link columns */}
            {[
              { title:"Product", links:[
                { label:"Infrastructure", href:"/#infrastructure" },
                { label:"API & SDK",      href:"/#apisdksection" },
                { label:"Pricing",        href:"/#pricing" },
                { label:"Changelog",      href:"#" },
                { label:"Status",         href:"#" },
              ]},
              { title:"Developers", links:[
                { label:"Documentation", href:"/docs" },
                { label:"API Reference", href:"/docs#api" },
                { label:"SDKs",          href:"/docs#sdks" },
                { label:"GitHub",        href:"https://github.com/techxsarwar/ParallelogramDrive" },
                { label:"Postman",       href:"#" },
              ]},
              { title:"Company", links:[
                { label:"About",   href:"#" },
                { label:"Blog",    href:"#" },
                { label:"Privacy", href:"/privacy" },
                { label:"Terms",   href:"/terms" },
                { label:"Contact", href:"mailto:support@parallelogramdrive.com" },
              ]},
            ].map(col => (
              <div key={col.title}>
                <div className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: C.text }}>{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href}
                        target={l.href.startsWith("http")?"_blank":undefined}
                        rel={l.href.startsWith("http")?"noopener noreferrer":undefined}
                        className="text-[12px] transition-colors"
                        style={{ color: C.muted }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.cyan)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                      >{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px]" style={{ color: C.muted }}>© 2026 ParallelogramDrive. All rights reserved.</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[11px]" style={{ color: C.muted }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
