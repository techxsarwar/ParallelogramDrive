"use client";

import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Palette ─────────────────────────────────────────────── */
const C = {
  bg:       "#ffffff",
  surface:  "#f5fdf5",   // light green-tinted white
  surfaceUp:"#eafaea",
  cyan:     "#20a800",   // deep parrot green — readable on white
  cyanNeon: "#39FF14",   // neon green — use for decorative/button bgs
  cyanDim:  "#178800",
  blue:     "#d4a000",   // dark amber/gold — readable on white
  violet:   "#c07000",   // dark orange — readable on white
  text:     "#0a180a",   // near-black with green tint
  muted:    "#4a6b4a",   // medium sage
  border:   "rgba(32,168,0,0.18)",
  borderMd: "rgba(32,168,0,0.32)",
  borderLg: "rgba(32,168,0,0.55)",
};

/* ─── Code snippets ────────────────────────────────────────── */
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

/* ─── Animated Particle Canvas ─────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; pulse: number;
    };

    const particles: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.015;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        const isYellow = p.r > 1.4; // ~25% of particles are yellow (r is random 0.4–1.9)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isYellow ? `rgba(255,230,0,${a * 0.75})` : `rgba(57,255,20,${a})`;
        ctx.fill();
      }

      // Draw connecting lines for close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ─── Animated counter ─────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const dur = 1600;
        const step = (t: number) => {
          const p = Math.min(t / dur, 1);
          setVal(Math.floor(p * p * target));
          if (p < 1) requestAnimationFrame(ts => step(ts - (start || (start = ts))));
        };
        requestAnimationFrame(ts => { start = ts; step(0); });
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <div ref={ref}>{val.toLocaleString()}{suffix}</div>;
}

/* ─── Topology Map ─────────────────────────────────────────── */
function TopologyMap() {
  const nodes = [
    { id: "US-East",      x: 21, y: 36, active: true  },
    { id: "EU-Central",   x: 47, y: 24, active: true  },
    { id: "Asia-East",    x: 73, y: 38, active: true  },
    { id: "SA-East",      x: 30, y: 65, active: false },
    { id: "AP-Southeast", x: 80, y: 58, active: true  },
  ];
  const lines = [[0,1],[1,2],[0,3],[2,4],[1,3],[0,2]];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{
      height: 240,
      background: "linear-gradient(135deg,#030711 0%,#08101e 100%)",
      border: `1px solid ${C.border}`,
    }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
        {/* Grid dots */}
        {Array.from({length:8}).map((_,r) =>
          Array.from({length:13}).map((_,c) => (
            <circle key={`${r}-${c}`} cx={c*8+4} cy={r*10+5} r="0.2" fill="rgba(0,229,255,0.06)" />
          ))
        )}
        {/* Connections */}
        {lines.map(([a,b],i) => {
          const na = nodes[a]; const nb = nodes[b];
          return <line key={i}
            x1={`${na.x}%`} y1={`${na.y}%`}
            x2={`${nb.x}%`} y2={`${nb.y}%`}
            stroke={C.cyan} strokeWidth="0.4" strokeDasharray="2.5,2.5" opacity="0.3"
          />;
        })}
        {/* Node rings */}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="6" fill={C.cyan} opacity="0.04"/>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="3.5" fill={C.cyan} opacity="0.06"/>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="2" fill={n.active ? C.cyan : "#334155"} opacity="0.9"/>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="0.8" fill="white" opacity="0.7"/>
          </g>
        ))}
      </svg>
      {/* Labels */}
      {nodes.map(n => (
        <div key={n.id} className="absolute" style={{ left:`${n.x}%`, top:`${n.y}%`, transform:"translate(-50%,-200%)" }}>
          <div className="px-2 py-0.5 rounded-md text-center whitespace-nowrap" style={{
            background:"rgba(235,255,235,0.95)",
            border:`1px solid ${C.border}`,
            backdropFilter:"blur(8px)",
          }}>
            <div className="text-[8px] font-bold" style={{ color: C.text }}>{n.id}</div>
            <div className="text-[7px]" style={{ color: n.active ? C.cyan : C.muted }}>
              {n.active ? "● Active" : "○ Standby"}
            </div>
          </div>
        </div>
      ))}
      {/* Live indicator */}
      <div className="absolute top-3 right-4 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Live</span>
      </div>
      {/* Corner accent */}
      <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none" style={{
        background: `radial-gradient(circle at bottom left, rgba(0,229,255,0.06), transparent)`,
      }}/>
    </div>
  );
}

/* ─── Glow Button ──────────────────────────────────────────── */
function GlowBtn({ children, href, onClick, secondary }: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  secondary?: boolean;
}) {
  const cls = "inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-200 cursor-pointer select-none";
  const pri: React.CSSProperties = {
    background: `linear-gradient(135deg, #39FF14, #28cc0c)`,
    color: "#0a180a",
    boxShadow: `0 4px 20px rgba(32,168,0,0.3), 0 2px 8px rgba(0,0,0,0.12)`,
  };
  const sec: React.CSSProperties = {
    background: "rgba(32,168,0,0.06)",
    color: C.cyan,
    border: `1px solid ${C.borderMd}`,
    backdropFilter: "blur(8px)",
  };
  const style = secondary ? sec : pri;

  if (href) return <Link href={href} className={cls} style={style}>{children}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [activeLang, setActiveLang] = useState<"js"|"curl"|"python"|"go">("js");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { setLogs(p => [...p, LOGS[i % LOGS.length]].slice(-7)); i++; }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveStep(p => (p+1)%3), 3500);
    return () => clearInterval(t);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const features = [
    { icon:"hub",           title:"Distributed Storage",      desc:"Files sharded across geo-redundant nodes with zero single point of failure.", accent: C.cyan },
    { icon:"offline_bolt",  title:"Instant Retrieval",        desc:"Parallel shard assembly delivers sub-second global file reconstruction.", accent: C.blue },
    { icon:"terminal",      title:"API-First Design",         desc:"Every action is programmable. Built for CLI, CI/CD, and backend pipelines.", accent: C.cyan },
    { icon:"send",          title:"Telegram Infrastructure",  desc:"Telegram's multi-datacenter backend as encrypted distributed storage.", accent: "#10b981" },
    { icon:"lock",          title:"Zero-Knowledge Encryption",desc:"AES-GCM-256 local encryption. Your server never sees plaintext shards.", accent: C.cyan },
    { icon:"language",      title:"Global Edge Routing",      desc:"Smart routing to nearest node clusters. 34 active regions worldwide.", accent: C.blue },
  ];

  const steps = [
    { stage:"01", icon:"lock",       title:"Shard & Encrypt",        desc:"Your file is split into symmetric shards locally. Each chunk is AES-GCM-256 encrypted before leaving your device." },
    { stage:"02", icon:"alt_route",  title:"Parallel Dispatch",      desc:"Shards are dispatched simultaneously across 6 isolated node connections, bypassing rate limits and single-pipe bottlenecks." },
    { stage:"03", icon:"join_inner", title:"Zero-Knowledge Assembly",desc:"Retrieval uses a cryptographic map to reassemble shards globally. The server logs zero readable content — only metadata hashes." },
  ];

  const stats = [
    { val: 12.4, suffix: "M+", label:"Files Distributed", icon:"folder_open" },
    { val: 240,  suffix: " TB", label:"Data Routed",       icon:"storage" },
    { val: 99.99,suffix: "%",  label:"Uptime SLA",         icon:"verified" },
    { val: 34,   suffix: "",   label:"Global Node Clusters",icon:"language" },
  ];

  const useCases = [
    { icon:"psychology",    tag:"AI & ML",   title:"AI Dataset Storage",     desc:"Stream multi-GB model weights and training sets across parallel nodes.", grad: `linear-gradient(135deg, rgba(0,229,255,0.08), rgba(79,142,247,0.06))` },
    { icon:"image",         tag:"Media",     title:"Image & Video Hosting",  desc:"Bypass CDN egress costs. Serve static assets from Telegram clusters.", grad: `linear-gradient(135deg, rgba(16,185,129,0.08), rgba(0,229,255,0.04))` },
    { icon:"smart_toy",     tag:"Bots",      title:"Telegram Bot Backends",  desc:"Provision datastores, state maps, and logs natively inside bot servers.", grad: `linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.06))` },
    { icon:"security",      tag:"Backup",    title:"Encrypted Backups",      desc:"DB exports and pipeline dumps with zero-readable shard metadata.", grad: `linear-gradient(135deg, rgba(0,229,255,0.08), rgba(16,185,129,0.04))` },
    { icon:"build_circle",  tag:"DevOps",    title:"CI/CD Artifact Storage", desc:"Store build bundles, releases, and compiler outputs via cURL.", grad: `linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,142,247,0.06))` },
    { icon:"dns",           tag:"Edge",      title:"Serverless Databases",   desc:"SQLite containers and static JSON stores on ultra-light HTTP.", grad: `linear-gradient(135deg, rgba(79,142,247,0.08), rgba(0,229,255,0.06))` },
  ];

  const testimonials = [
    { init:"A", name:"Alex Mercer",  role:"DevOps Engineer @ ShardTech",  color:C.cyan,      quote:"ParallelogramDrive replaced our S3 setup entirely. The AES-GCM sharding layer is genuinely impressive — zero config, instant CLI uploads." },
    { init:"K", name:"Kira Vance",   role:"Lead Architect @ VectorLabs",  color:C.blue,      quote:"Sub-second retrieval on a Telegram backend sounds insane — it works. Our serverless functions just POST to /upload and we're done." },
    { init:"M", name:"Marcus Chen",  role:"Principal Infra @ NodeStack",  color:"#10b981",   quote:"The zero-knowledge encryption combined with geo-sharding made this the obvious choice for our CI/CD artifact pipeline." },
  ];

  return (
    <div className="min-h-screen flex flex-col antialiased overflow-x-hidden" style={{ background: C.bg, color: C.text }}>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50" style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div className="max-w-7xl mx-auto px-6 h-[62px] flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rotate-45 rounded-sm" style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.blue})`,
                opacity: 0.15,
              }}/>
              <div className="absolute inset-[3px] rotate-45 rounded-sm border" style={{ borderColor: C.cyan, opacity: 0.8 }}>
                <div className="absolute inset-[3px] rounded-sm" style={{ background: C.cyan, opacity: 0.9 }}/>
              </div>
            </div>
            <span className="font-black text-[15px] tracking-tight" style={{ color: C.text }}>
              Parallelogram<span style={{ color: C.cyan }}>Drive</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 mx-auto">
            {[["Features","/#infrastructure"],["API","/#apisdksection"],["Docs","/docs"],["Pricing","/#pricing"],["Network","/#topology"]].map(([label,href]) => (
              <a key={label} href={href}
                className="text-[13px] font-medium transition-all duration-150 relative group"
                style={{ color: C.muted }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto lg:ml-0 flex-shrink-0">
            <a href="https://github.com/techxsarwar/ParallelogramDrive" target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-lg transition-all duration-150"
              style={{ color: C.muted }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = "transparent"; }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
                <Link href="/dashboard"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[12px] transition-all"
                  style={{ background: C.cyan, color: C.bg, boxShadow:`0 0 18px rgba(0,229,255,0.3)` }}>
                  Console <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </Link>
              </div>
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[12px] transition-all"
                  style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg, boxShadow:`0 0 20px rgba(0,229,255,0.3)` }}>
                  Console <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-[62px]">

        {/* ── 1. HERO ─────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          className="relative min-h-[100vh] flex items-center overflow-hidden"
        >
          {/* Particle field */}
          <ParticleCanvas />

          {/* Dynamic radial glow that follows mouse */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-500" style={{
            background: `radial-gradient(700px circle at ${mousePos.x*100}% ${mousePos.y*100}%, rgba(32,168,0,0.08) 0%, transparent 65%)`,
          }}/>

          {/* Static ambient glows */}
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none" style={{
            background: "radial-gradient(circle, rgba(57,255,20,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}/>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
            background: "radial-gradient(circle, rgba(255,200,0,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}/>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}/>

          <div className="relative max-w-6xl mx-auto px-6 w-full py-32 z-10 text-center">

            {/* Status badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-10" style={{
              background: "rgba(32,168,0,0.07)",
              border: `1px solid rgba(32,168,0,0.2)`,
              backdropFilter: "blur(12px)",
            }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#39FF14" }}/>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: C.cyan }}>
                Infrastructure Platform · v1.0 Live
              </span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: `rgba(32,168,0,0.3)` }}/>
            </div>

            {/* Main heading */}
            <h1 className="font-black leading-[0.9] tracking-tighter mb-8" style={{
              fontSize: "clamp(56px, 9vw, 110px)",
              color: C.text,
            }}>
              <span className="block" style={{ color: C.text }}>Distributed</span>
              <span className="block relative" style={{
                background: `linear-gradient(135deg, #15803d 0%, #22c55e 40%, #39FF14 70%, #d97706 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Infinite
              </span>
              <span className="block" style={{ color: C.text }}>Storage.</span>
            </h1>

            <p className="text-[18px] leading-relaxed max-w-2xl mx-auto mb-12" style={{ color: C.muted }}>
              Upload once, distribute across intelligent Telegram-powered storage nodes,
              retrieve instantly through developer-first APIs.{" "}
              <span style={{ color: C.text }}>Zero cloud bills. Zero config.</span>
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <GlowBtn>
                    Start Building
                    <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                  </GlowBtn>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <GlowBtn href="/dashboard">
                  Open Console
                  <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
                </GlowBtn>
              </Show>
              <GlowBtn href="#infrastructure" secondary>
                Explore Features
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </GlowBtn>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-1">
              {[
                ["12.4M+","Files Stored"],
                ["240 TB","Data Routed"],
                ["99.99%","Uptime SLA"],
                ["34","Global Nodes"],
              ].map(([v,l], i) => (
                <div key={l} className="flex items-center">
                  <div className="px-8 py-4 text-center">
                    <div className="text-[30px] font-black font-mono leading-none mb-1" style={{ color: C.text }}>{v}</div>
                    <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: C.muted }}>{l}</div>
                  </div>
                  {i < 3 && <div className="w-px h-10 self-center" style={{ background: C.border }}/>}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
            background: `linear-gradient(to bottom, transparent, ${C.bg})`,
          }}/>
        </section>

        {/* ── 2. TRUST STRIP ──────────────────────────────────────── */}
        <section className="py-12" style={{ borderBottom:`1px solid ${C.border}`, background: "rgba(245,253,245,0.7)" }}>
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] font-bold mb-8" style={{ color: C.muted }}>
              Trusted by engineers at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10" style={{ opacity: 0.35 }}>
              {[
                { name:"GitHub",   path:"M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.477-10-10-10z" },
                { name:"Vercel",   path:"M24 22.525H0l12-21.05 12 21.05z" },
                { name:"Telegram", path:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.02c-.12.57-.48.71-.97.44l-2.68-1.97-1.3 1.25c-.14.14-.27.27-.56.27l.19-2.73 4.99-4.51c.22-.19-.05-.3-.34-.11L7.36 14.4l-2.62-.82c-.57-.18-.58-.57.12-.84l10.23-3.95c.47-.18.88.11.55 1.01z" },
                { name:"Supabase", path:"M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.12 12.888.734 14.064 1.824 14.064h7.802l-.06 8.9c.015.986 1.26 1.409 1.874.637l9.262-11.652c.645-.839.031-2.014-1.06-2.014h-7.802l.06-8.9z" },
              ].map(({ name, path }) => (
                <div key={name} className="flex items-center gap-2 transition-all duration-200 hover:opacity-80" style={{ opacity: 1 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={C.text}><path d={path}/></svg>
                  <span className="text-[13px] font-bold" style={{ color: C.text }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FEATURES ─────────────────────────────────────────── */}
        <section id="infrastructure" className="py-28" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4" style={{
                color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
              }}>
                Core Capabilities
              </span>
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                Infrastructure-Grade<br/>
                <span style={{ color: C.cyan }}>Features</span>
              </h2>
              <p className="text-[16px] max-w-xl mx-auto mt-5" style={{ color: C.muted }}>
                Every feature designed for engineers who care about correctness, performance, and zero operational overhead.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div key={i}
                  className="group rounded-2xl p-7 cursor-default transition-all duration-300 relative overflow-hidden"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.borderLg;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,229,255,0.06)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  {/* Inner glow on hover */}
                  <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-bl-full" style={{
                    background: `radial-gradient(circle, ${f.accent}11 0%, transparent 70%)`,
                  }}/>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative" style={{
                    background: `${f.accent}12`,
                    border: `1px solid ${f.accent}25`,
                  }}>
                    <span className="material-symbols-outlined text-[22px]" style={{ color: f.accent }}>{f.icon}</span>
                  </div>
                  <h3 className="text-[15px] font-bold mb-2.5 uppercase tracking-tight" style={{ color: C.text }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ─────────────────────────────────────── */}
        <section className="py-28 relative" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(240,252,240,0.8)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, rgba(32,168,0,0.05) 0%, transparent 65%)",
          }}/>
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4" style={{
                color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
              }}>
                Mathematical Flow
              </span>
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                How <span style={{ color: C.cyan }}>Sharding</span> Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line */}
              <div className="hidden md:block absolute top-14 left-[22%] right-[22%] h-px" style={{
                background: `linear-gradient(90deg, transparent, ${C.cyan}40, ${C.cyan}40, transparent)`,
              }}/>

              {steps.map((s, i) => (
                <div key={i}
                  className="rounded-2xl p-8 transition-all duration-500 relative"
                  style={{
                    background: C.surface,
                    border: `1px solid ${activeStep === i ? C.cyan : C.border}`,
                    boxShadow: activeStep === i ? `0 0 40px rgba(0,229,255,0.12), 0 8px 32px rgba(0,0,0,0.3)` : "none",
                    transform: activeStep === i ? "translateY(-6px)" : "none",
                    opacity: activeStep === i ? 1 : 0.5,
                  }}
                >
                  {activeStep === i && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                      background: "radial-gradient(ellipse at top, rgba(0,229,255,0.05), transparent 60%)",
                    }}/>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[13px]" style={{
                      background: activeStep === i ? `${C.cyan}18` : "rgba(255,255,255,0.04)",
                      color: activeStep === i ? C.cyan : C.muted,
                      border: `1px solid ${activeStep === i ? `${C.cyan}40` : C.border}`,
                    }}>
                      {s.stage}
                    </div>
                    <span className="material-symbols-outlined text-[24px]" style={{ color: activeStep === i ? C.cyan : C.muted }}>{s.icon}</span>
                  </div>
                  <h3 className="text-[17px] font-black uppercase tracking-tight mb-3" style={{ color: C.text }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{s.desc}</p>
                  <div className="mt-6 h-0.5 rounded-full transition-all duration-700" style={{
                    background: `linear-gradient(90deg, ${C.cyan}, ${C.blue})`,
                    opacity: activeStep === i ? 1 : 0,
                    width: activeStep === i ? "100%" : "0%",
                  }}/>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. CODE ──────────────────────────────────────────────── */}
        <section id="apisdksection" className="py-28" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-5" style={{
                  color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
                }}>
                  Developer-Native
                </span>
                <h2 className="font-black tracking-tighter uppercase mb-5" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                  Three Lines<br/>
                  <span style={{ color: C.cyan }}>of Code.</span>
                </h2>
                <p className="text-[16px] leading-relaxed mb-8" style={{ color: C.muted }}>
                  Integrate geo-sharded, zero-knowledge encrypted file storage directly into any backend pipeline.
                  Works with every language, framework, and runtime.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {(["js","curl","python","go"] as const).map(l => (
                    <button key={l} onClick={() => setActiveLang(l)}
                      className="px-4 py-2 text-[12px] font-bold font-mono rounded-lg uppercase transition-all duration-200"
                      style={activeLang===l
                        ? { background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg, boxShadow:`0 0 20px rgba(0,229,255,0.3)` }
                        : { border:`1px solid ${C.border}`, color: C.muted, background:"transparent" }}>
                      {l==="js"?"Node.js":l==="curl"?"cURL":l==="python"?"Python":"Go"}
                    </button>
                  ))}
                </div>
                <Link href="/docs" className="inline-flex items-center gap-2 text-[13px] font-bold transition-all" style={{ color: C.cyan }}
                  onMouseEnter={e => { e.currentTarget.style.gap = "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.gap = "8px"; }}>
                  Full API Reference <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>

              {/* Code block */}
              <div className="rounded-2xl overflow-hidden" style={{
                border: `1px solid ${C.borderMd}`,
                boxShadow: `0 0 60px rgba(0,229,255,0.07), 0 20px 40px rgba(0,0,0,0.5)`,
              }}>
                <div className="flex items-center justify-between px-5 py-3.5" style={{
                  background: "#0f1a0f",
                  borderBottom: `1px solid rgba(32,168,0,0.15)`,
                }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"/>
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FFE600", opacity: 0.8 }}/>
                    <div className="w-3 h-3 rounded-full" style={{ background: "#39FF14", opacity: 0.8 }}/>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold" style={{ color: C.cyan }}>
                    {activeLang==="curl"?"Terminal":"SDK"} · parallelogram/{activeLang}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(CODE[activeLang]); setCopied(true); setTimeout(()=>setCopied(false),1500); }}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded transition-all"
                    style={{ color: copied ? "#4ade80" : C.muted, background: copied ? "rgba(74,222,128,0.1)": "transparent" }}>
                    <span className="material-symbols-outlined text-[13px]">{copied?"check":"content_copy"}</span>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="px-6 py-6 text-[12.5px] font-mono leading-[1.8] overflow-x-auto" style={{
                  background: "#0f1a0f",
                  color: "#86efac",
                }}>
                  <code>{CODE[activeLang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TOPOLOGY ──────────────────────────────────────────── */}
        <section id="topology" className="py-28" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(240,252,240,0.7)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-5" style={{
                  color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
                }}>
                  Live Network
                </span>
                <h2 className="font-black tracking-tighter uppercase mb-5" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                  Global Shard<br/>
                  <span style={{ color: C.cyan }}>Routing.</span>
                </h2>
                <p className="text-[16px] leading-relaxed mb-8" style={{ color: C.muted }}>
                  Watch your assets traverse intelligent routing pathways across 34 global node clusters —
                  all encrypted, all parallel, all real-time.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[["34","Active Nodes"],["99.99%","Uptime"],["6","Parallel Shards"],["<15ms","Avg Latency"]].map(([v,l]) => (
                    <div key={l} className="rounded-xl p-4 transition-all duration-200" style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMd; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                      <div className="text-[24px] font-black font-mono" style={{ color: C.cyan }}>{v}</div>
                      <div className="text-[11px] mt-1" style={{ color: C.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <TopologyMap />
                {/* Log terminal */}
                <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${C.borderMd}` }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{
                    background: "#0f1a0f",
                    borderBottom: `1px solid rgba(32,168,0,0.15)`,
                  }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#39FF14" }}/>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: "#39FF14" }}>Uplink Telemetry</span>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color:"rgba(255,255,255,0.2)" }}>LIVE STDOUT</span>
                  </div>
                  <div className="px-4 py-4 space-y-1.5 font-mono text-[11px]" style={{ background:"#0f1a0f", minHeight:"155px" }}>
                    {logs.map((line, i) => (
                      <div key={i} className="flex gap-2.5 pl-3 border-l-2 transition-all" style={{ borderColor:"rgba(57,255,20,0.3)" }}>
                        <span style={{ color:"rgba(255,255,255,0.12)" }}>›</span>
                        <span style={{ color:
                          line.startsWith("SYSTEM") ? "#39FF14" :
                          line.includes("[OK]")     ? "#4ade80" :
                          line.startsWith("CIPHER") ? "#FFE600" :
                          "rgba(180,255,180,0.7)"
                        }}>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. ANIMATED STATS ───────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 65%)",
          }}/>
          <div className="max-w-5xl mx-auto px-6 relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
              {stats.map((s, i) => (
                <div key={i} className="text-center py-8 px-4" style={{
                  borderRight: i < 3 ? `1px solid ${C.border}` : undefined,
                }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{
                    background: "rgba(0,229,255,0.08)", border:`1px solid ${C.border}`
                  }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: C.cyan }}>{s.icon}</span>
                  </div>
                  <div className="text-[44px] font-black font-mono leading-none mb-2" style={{
                    background: `linear-gradient(135deg, #15803d, #22c55e, #d97706)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    <Counter target={s.val} suffix={s.suffix}/>
                  </div>
                  <div className="text-[11px] uppercase tracking-wider font-bold" style={{ color: C.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. USE CASES ────────────────────────────────────────── */}
        <section className="py-28" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(245,255,245,0.6)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4" style={{
                color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
              }}>
                Built For
              </span>
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                Modern Developer<br/>
                <span style={{ color: C.cyan }}>Use Cases.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {useCases.map((u, i) => (
                <div key={i}
                  className="rounded-2xl p-6 cursor-default transition-all duration-300 relative overflow-hidden"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = C.borderMd;
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = "";
                  }}
                >
                  <div className="absolute inset-0 opacity-60 rounded-2xl" style={{ background: u.grad }}/>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{
                        background: "rgba(0,229,255,0.1)", border:`1px solid ${C.border}`
                      }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: C.cyan }}>{u.icon}</span>
                      </div>
                      <span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{
                        background:"rgba(0,229,255,0.1)", color: C.cyan, border:`1px solid ${C.border}`
                      }}>{u.tag}</span>
                    </div>
                    <h3 className="text-[15px] font-bold mb-2 uppercase tracking-tight" style={{ color: C.text }}>{u.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. TESTIMONIALS ─────────────────────────────────────── */}
        <section className="py-28" style={{ borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4" style={{
                color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
              }}>
                Developer Voices
              </span>
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                Built for Devs,<br/>
                <span style={{ color: C.cyan }}>by Devs.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i}
                  className="rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMd; e.currentTarget.style.transform = "translateY(-4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = ""; }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{
                    background: `radial-gradient(circle, ${t.color}0a 0%, transparent 70%)`,
                  }}/>
                  <div className="relative">
                    <div className="text-[52px] font-black leading-none mb-4" style={{ color:`${t.color}30`, fontFamily:"Georgia,serif" }}>&ldquo;</div>
                    <p className="text-[14px] leading-relaxed" style={{ color:"#c8d6e8" }}>&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="mt-6 pt-5 flex items-center gap-3 relative" style={{ borderTop:`1px solid rgba(0,229,255,0.06)` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[15px]" style={{
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)`,
                      color: C.bg,
                    }}>
                      {t.init}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold" style={{ color: C.text }}>{t.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: C.muted }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. API ENDPOINTS ────────────────────────────────────── */}
        <section id="api" className="py-28" style={{ borderBottom:`1px solid ${C.border}`, background:"rgba(240,252,240,0.8)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-2.5">
                {[
                  { method:"POST",   path:"/v1/upload",             desc:"Upload & shard a file" },
                  { method:"GET",    path:"/v1/files/:id",           desc:"Retrieve file metadata" },
                  { method:"GET",    path:"/v1/files/:id/download",  desc:"Download reconstructed file" },
                  { method:"DELETE", path:"/v1/files/:id",           desc:"Permanently destroy all shards" },
                  { method:"POST",   path:"/v1/files/:id/share",     desc:"Toggle public access" },
                  { method:"GET",    path:"/v1/developer/keys",      desc:"List API keys" },
                ].map(ep => (
                  <div key={`${ep.method}-${ep.path}`}
                    className="flex items-center gap-4 rounded-xl px-5 py-3.5 transition-all duration-200 group"
                    style={{ background: C.surface, border:`1px solid ${C.border}` }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMd; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                    <span className="text-[10px] font-black font-mono w-14 text-center py-1.5 rounded-lg flex-shrink-0" style={{
                      background: ep.method==="POST"?"rgba(74,222,128,0.1)":ep.method==="GET"?"rgba(0,229,255,0.1)":"rgba(239,68,68,0.1)",
                      color:      ep.method==="POST"?"#4ade80":ep.method==="GET"?C.cyan:"#f87171",
                      border:     `1px solid ${ep.method==="POST"?"rgba(74,222,128,0.2)":ep.method==="GET"?C.border:"rgba(239,68,68,0.2)"}`,
                    }}>{ep.method}</span>
                    <code className="text-[12px] font-mono flex-1" style={{ color: C.text }}>{ep.path}</code>
                    <span className="text-[11px]" style={{ color: C.muted }}>{ep.desc}</span>
                  </div>
                ))}
              </div>

              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-5" style={{
                  color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
                }}>
                  Programmatic Access
                </span>
                <h2 className="font-black tracking-tighter uppercase mb-5" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                  REST API<br/>
                  <span style={{ color: C.cyan }}>&amp; SDKs.</span>
                </h2>
                <p className="text-[16px] leading-relaxed mb-7" style={{ color: C.muted }}>
                  A clean, versioned REST API with SDK wrappers for Node.js, Python, Go, and cURL.
                  Supports streaming uploads, range downloads, and webhook callbacks.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Node.js","Python","Go","cURL","REST"].map(sdk => (
                    <div key={sdk} className="px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{
                      background:"rgba(0,229,255,0.07)", color: C.cyan, border:`1px solid ${C.border}`
                    }}>{sdk}</div>
                  ))}
                </div>
                <Link href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[13px] transition-all duration-200"
                  style={{ background:`linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg, boxShadow:`0 0 24px rgba(0,229,255,0.3)` }}>
                  Browse API Docs <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. PRICING ─────────────────────────────────────────── */}
        <section className="py-28" style={{ background: C.bg, borderBottom:`1px solid ${C.border}` }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-4" style={{
                color: C.cyan, background: "rgba(0,229,255,0.07)", border: `1px solid ${C.border}`
              }}>
                Pricing
              </span>
              <h2 className="font-black tracking-tighter uppercase mb-4" style={{ fontSize:"clamp(32px,5vw,52px)", color: C.text }}>
                Scalable <span style={{ color: C.cyan }}>Plans.</span>
              </h2>
              <p className="text-[16px]" style={{ color: C.muted }}>No egress fees. No per-request charges. Just infrastructure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {[
                { name:"Developer",      price:"$0",      period:"/mo", desc:"For side projects & experimentation",
                  features:["100 GB Distributed Storage","Core REST API endpoints","API Key Generator","Community support"],
                  cta:"Start Free", highlight:false },
                { name:"Pro",            price:"$12",     period:"/mo", desc:"For production-grade deployments",
                  features:["2 TB Geo-Sharded Storage","Parallel multithread routing","Priority node access","SDK + webhook support","Analytics dashboard"],
                  cta:"Upgrade to Pro", highlight:true },
                { name:"Infrastructure", price:"Custom",  period:"",    desc:"For teams & enterprise workloads",
                  features:["Unlimited distributed storage","Dedicated node clusters","Custom SLA & uptime guarantees","24/7 engineering support"],
                  cta:"Contact Sales", highlight:false },
              ].map((plan, i) => (
                <div key={i} className="rounded-2xl p-8 flex flex-col transition-all duration-300 relative overflow-hidden" style={{
                  ...(plan.highlight ? {
                    background: `linear-gradient(160deg, rgba(57,255,20,0.12) 0%, rgba(255,220,0,0.08) 50%, rgba(245,253,245,1) 100%)`,
                    border: `1px solid ${C.cyan}`,
                    boxShadow: `0 0 50px rgba(57,255,20,0.15), 0 12px 30px rgba(0,0,0,0.08)`,
                    transform: "translateY(-8px)",
                  } : {
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  })
                }}>
                  {plan.highlight && (
                    <>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{
                        background: `linear-gradient(90deg, transparent, ${C.cyan}, transparent)`,
                      }}/>
                      <div className="mb-4">
                        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest" style={{
                          background:`linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg
                        }}>Recommended</span>
                      </div>
                    </>
                  )}
                  <div className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: plan.highlight ? C.cyan : C.muted }}>{plan.name}</div>
                  <div className="font-black font-mono mb-2" style={{ fontSize:"42px", color: C.text, lineHeight:1 }}>
                    {plan.price}<span className="text-[15px] font-normal" style={{ color: C.muted }}>{plan.period}</span>
                  </div>
                  <p className="text-[12px] mb-7" style={{ color: C.muted }}>{plan.desc}</p>
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px]" style={{ color:"#c8d6e8" }}>
                        <span className="material-symbols-outlined text-[15px] flex-shrink-0" style={{ color: plan.highlight ? C.cyan : C.blue }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="w-full py-3.5 rounded-xl font-bold text-[13px] transition-all duration-200" style={
                        plan.highlight
                          ? { background:`linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg, boxShadow:`0 0 20px rgba(0,229,255,0.25)` }
                          : { border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }
                      }>{plan.cta}</button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <Link href="/dashboard" className="w-full py-3.5 rounded-xl font-bold text-[13px] text-center block transition-all duration-200" style={
                      plan.highlight
                        ? { background:`linear-gradient(135deg, ${C.cyan}, ${C.cyanDim})`, color: C.bg, boxShadow:`0 0 20px rgba(0,229,255,0.25)` }
                        : { border:`1px solid ${C.borderMd}`, color: C.cyan, background:"transparent" }
                    }>{plan.cta}</Link>
                  </Show>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 12. FINAL CTA ────────────────────────────────────────── */}
        <section className="py-36 relative overflow-hidden">
          {/* Dramatic background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at center, rgba(32,168,0,0.06) 0%, transparent 60%)`,
            }}/>
            {/* Grid */}
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            }}/>
          </div>

          <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10" style={{
              background:"rgba(0,229,255,0.06)", border:`1px solid ${C.borderMd}`, backdropFilter:"blur(12px)",
            }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.cyan }}>Ready to Deploy</span>
            </div>

            <h2 className="font-black tracking-tighter uppercase mb-8" style={{
              fontSize: "clamp(48px,8vw,90px)",
              lineHeight: 0.9,
              color: C.text,
            }}>
              Build on<br/>
              <span style={{
                background: `linear-gradient(135deg, ${C.cyan} 0%, ${C.blue} 50%, ${C.violet} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Parallel</span><br/>
              Infrastructure.
            </h2>

            <p className="text-[18px] leading-relaxed max-w-xl mx-auto mb-12" style={{ color: C.muted }}>
              Get your API key in 30 seconds. No credit card required.
              No complex setup. Just raw distributed storage.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <GlowBtn>
                    Get API Key <span className="material-symbols-outlined text-[17px]">vpn_key</span>
                  </GlowBtn>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <GlowBtn href="/dashboard">
                  Open Console <span className="material-symbols-outlined text-[17px]">vpn_key</span>
                </GlowBtn>
              </Show>
              <GlowBtn href="/docs" secondary>
                Read Docs <span className="material-symbols-outlined text-[17px]">menu_book</span>
              </GlowBtn>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-12" style={{ background: C.surface, borderTop:`1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10" style={{ borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rotate-45 rounded-sm border" style={{ borderColor: C.cyan, opacity: 0.7 }}>
                    <div className="absolute inset-[3px] rounded-sm" style={{ background: C.cyan, opacity: 0.8 }}/>
                  </div>
                </div>
                <span className="font-black text-[14px] uppercase" style={{ color: C.text }}>
                  Parallelogram<span style={{ color: C.cyan }}>Drive</span>
                </span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: C.muted }}>
                Distributed storage infrastructure powered by Telegram&apos;s backend protocol.
              </p>
            </div>

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
                        className="text-[12px] transition-colors duration-150"
                        style={{ color: C.muted }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.text)}
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
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-[11px]" style={{ color: C.muted }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
