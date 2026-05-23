"use client";

import { useEffect, useState, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const T = {
  bg:       "#050816",
  surface:  "#0B1220",
  surfaceUp:"#0f1a2e",
  cyan:     "#00D9FF",
  blue:     "#3B82F6",
  text:     "#F8FAFC",
  muted:    "#64748b",
  dim:      "#94a3b8",
  border:   "rgba(0,217,255,0.1)",
  borderMd: "rgba(0,217,255,0.2)",
};

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
interface FileMeta {
  id: string;
  fileName: string;
  size: number;
  mimeType: string;
  isPublic: boolean;
  createdAt: string;
}
interface ApiKey {
  id: string;
  name: string;
  type: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B","KB","MB","GB","TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month:"short", day:"numeric" });
}
function getMimeIcon(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "movie";
  if (mime.includes("pdf")) return "picture_as_pdf";
  if (mime.includes("zip") || mime.includes("tar")) return "folder_zip";
  if (mime.startsWith("text/") || mime.includes("javascript")) return "code";
  return "draft";
}
function getMimeColor(mime: string) {
  if (mime.startsWith("image/")) return T.cyan;
  if (mime.startsWith("video/")) return "#a78bfa";
  if (mime.includes("pdf")) return "#f87171";
  if (mime.includes("zip") || mime.includes("tar")) return "#fb923c";
  if (mime.startsWith("text/") || mime.includes("javascript")) return "#34d399";
  return T.dim;
}

/* ═══════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════ */
const NAV = [
  { id:"Dashboard",      icon:"dashboard" },
  { id:"Files",          icon:"folder_open" },
  { id:"Infrastructure", icon:"hub" },
  { id:"API Keys",       icon:"vpn_key" },
  { id:"Analytics",      icon:"bar_chart" },
  { id:"Settings",       icon:"settings" },
];

/* ═══════════════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════════════ */

/** Thin sparkline */
function Spark({ up = true, color = T.cyan }: { up?: boolean; color?: string }) {
  const pts = up
    ? "0,18 12,13 24,15 36,9 48,11 60,5 72,7 84,2 96,4"
    : "0,4 12,8 24,6 36,12 48,10 60,14 72,12 84,17 96,18";
  return (
    <svg width="96" height="20" viewBox="0 0 96 20">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.8" />
    </svg>
  );
}

/** Stat card */
function StatCard({ icon, label, value, delta, up, color = T.cyan }: {
  icon: string; label: string; value: string; delta: string; up: boolean; color?: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 group hover:-translate-y-0.5 transition-all duration-200"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
          <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${up ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
          {up ? "↑" : "↓"} {delta}
        </span>
      </div>
      <div>
        <div className="text-[22px] font-black font-mono leading-none" style={{ color: T.text }}>{value}</div>
        <div className="text-[11px] mt-1.5" style={{ color: T.muted }}>{label}</div>
      </div>
      <Spark up={up} color={color} />
    </div>
  );
}

/** Section header */
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[14px] font-bold uppercase tracking-wider" style={{ color: T.text }}>{title}</h2>
      {action && (
        <button onClick={onAction} className="text-[11px] font-bold transition-colors hover:underline" style={{ color: T.cyan }}>
          {action} →
        </button>
      )}
    </div>
  );
}

/** Terminal log stream */
const LOG_LINES = [
  { t:"SYS",  msg:"Shard pipeline initialized",                          ok:true  },
  { t:"ENCR", msg:"AES-GCM-256 key derived [32-byte]",                  ok:true  },
  { t:"SHARD",msg:"dataset.tar.gz → 6 chunks dispatched",               ok:true  },
  { t:"NODE", msg:"us-east-1  →  Shard 0  ACK  12ms",                   ok:true  },
  { t:"NODE", msg:"eu-central →  Shard 1  ACK  28ms",                   ok:true  },
  { t:"NODE", msg:"ap-east-1  →  Shard 2  ACK  41ms",                   ok:true  },
  { t:"TG",   msg:"Telegram uplink confirmed  msg_id: 48921",            ok:true  },
  { t:"META", msg:"Shard map committed — integrity 100%",                ok:true  },
  { t:"API",  msg:"POST /v1/upload  200 OK  89ms",                       ok:true  },
  { t:"WARN", msg:"sa-east node latency spike  +120ms",                  ok:false },
];

function LiveTerminal() {
  const [visible, setVisible] = useState<typeof LOG_LINES>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setVisible(p => [...p, LOG_LINES[i % LOG_LINES.length]].slice(-8));
      i++;
    }, 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background:"#030712", border:`1px solid ${T.borderMd}` }}>
      {/* Terminal bar */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom:`1px solid rgba(0,217,255,0.1)` }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase" style={{ color: T.cyan }}>Live Uplink Telemetry</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5 font-mono text-[11px]" style={{ minHeight:180 }}>
        {visible.map((l, i) => (
          <div key={i} className="flex gap-3 items-start pl-2 border-l" style={{ borderColor: l.ok ? "rgba(0,217,255,0.25)" : "rgba(251,113,133,0.4)" }}>
            <span className="w-10 flex-shrink-0 font-black text-[9px] pt-0.5" style={{ color: l.ok ? T.cyan : "#f87171" }}>{l.t}</span>
            <span style={{ color: l.ok ? "rgba(255,255,255,0.65)" : "#fca5a5" }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mini bar chart for API requests */
function RequestBars() {
  const bars = [42, 58, 39, 71, 55, 88, 63];
  const days = ["M","T","W","T","F","S","S"];
  const max = Math.max(...bars);
  return (
    <div className="flex items-end gap-1.5 h-20 mt-3">
      {bars.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-t-sm transition-all" style={{
            height:`${(v/max)*64}px`,
            background: i === 5
              ? T.cyan
              : i === 6
              ? `rgba(0,217,255,0.5)`
              : `rgba(0,217,255,0.15)`,
            boxShadow: i === 5 ? `0 0 8px rgba(0,217,255,0.4)` : "none",
          }} />
          <span className="text-[8px]" style={{ color: T.muted }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut distribution chart */
function DonutChart() {
  const segs = [
    { label:"US East",  pct:38, color: T.cyan },
    { label:"EU West",  pct:24, color: T.blue },
    { label:"AP South", pct:18, color:"#a78bfa" },
    { label:"AP SE",    pct:12, color:"#34d399" },
    { label:"SA East",  pct:8,  color:"#fb923c" },
  ];
  const r = 42, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" />
        {segs.map((s, i) => {
          const offset = cum;
          cum += s.pct;
          const dash = (s.pct / 100) * circ;
          const gap  = circ - dash;
          const rot  = (offset / 100) * 360 - 90;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="12"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rot} ${cx} ${cy})`}
              opacity="0.9"
            />
          );
        })}
        <text x={cx} y={cy-4} textAnchor="middle" fill={T.text} fontSize="11" fontWeight="800">240</text>
        <text x={cx} y={cy+9} textAnchor="middle" fill={T.muted} fontSize="7">TB</text>
      </svg>
      <div className="space-y-2">
        {segs.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[10px]" style={{ color: T.dim }}>{s.label}</span>
            <span className="text-[10px] font-bold font-mono ml-auto pl-4" style={{ color: T.text }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mini infra map */
function InfraMap() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p+1)%5), 900);
    return () => clearInterval(t);
  }, []);
  const nodes = [
    { x:20, y:40, label:"US-East",  count:12 },
    { x:46, y:28, label:"EU-West",  count:8  },
    { x:72, y:44, label:"AP-South", count:6  },
    { x:30, y:64, label:"SA-East",  count:4  },
    { x:80, y:60, label:"AP-SE",    count:4  },
  ];
  const edges = [[0,1],[1,2],[0,3],[2,4],[1,3]];
  return (
    <div className="relative w-full h-[200px] rounded-xl overflow-hidden" style={{ background:"#030712", border:`1px solid ${T.border}` }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        {/* dot grid */}
        {Array.from({length:10}).map((_,r) => Array.from({length:14}).map((_,c) => (
          <circle key={`${r}-${c}`} cx={c*7+3} cy={r*8+4} r="0.2" fill="rgba(0,217,255,0.08)" />
        )))}
        {/* edges */}
        {edges.map(([a,b], i) => {
          const na = nodes[a], nb = nodes[b];
          return <line key={i}
            x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
            stroke={T.cyan} strokeWidth="0.45" strokeDasharray="2,2" opacity={pulse===i?0.8:0.25} />;
        })}
        {/* nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="4" fill={T.cyan} opacity={pulse===i?0.2:0.06} />
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="2" fill={T.cyan} opacity="0.9" />
            <circle cx={`${n.x}%`} cy={`${n.y}%`} r="1" fill="white" opacity="0.6" />
          </g>
        ))}
      </svg>
      {/* labels */}
      {nodes.map((n, i) => (
        <div key={i} className="absolute" style={{ left:`${n.x}%`, top:`${n.y}%`, transform:"translate(-50%,-160%)" }}>
          <div className="px-1.5 py-1 rounded-md text-center whitespace-nowrap" style={{ background:"rgba(11,18,32,0.9)", border:`1px solid ${T.border}` }}>
            <div className="text-[8px] font-bold" style={{ color: T.cyan }}>{n.label}</div>
            <div className="text-[7px]" style={{ color: T.dim }}>{n.count} nodes</div>
          </div>
        </div>
      ))}
      <div className="absolute top-2 right-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[9px] font-bold text-green-400">Live</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useUser();

  /* state */
  const [files, setFiles]           = useState<FileMeta[]>([]);
  const [keys, setKeys]             = useState<ApiKey[]>([]);
  const [activeTab, setActiveTab]   = useState("Dashboard");
  const [search, setSearch]         = useState("");
  const [uploadProgress, setUploadProgress] = useState<number|null>(null);
  const [uploadingName, setUploadingName]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyName, setNewKeyName]     = useState("");
  const [newKeyType, setNewKeyType]     = useState("production");
  const [visibleKeys, setVisibleKeys]   = useState<Record<string,boolean>>({});
  const [copiedKeyId, setCopiedKeyId]   = useState<string|null>(null);
  const [copiedId, setCopiedId]         = useState<string|null>(null);
  const [encryptDefault, setEncryptDefault] = useState(true);
  const [compress, setCompress]             = useState(false);
  const [isDragging, setIsDragging]         = useState(false);
  const [origin, setOrigin]                 = useState("https://parallelogramdrive.com");

  /* data */
  const fetchFiles = async () => { try { const r = await fetch("/api/files"); if (r.ok) setFiles(await r.json()); } catch {} };
  const fetchKeys  = async () => { try { const r = await fetch("/api/developer/keys"); if (r.ok) setKeys(await r.json()); } catch {} };

  useEffect(() => {
    fetchFiles(); fetchKeys();
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  /* derived */
  const totalSize   = files.reduce((a,f) => a+f.size, 0);
  const totalSizeGB = totalSize / 1024**3;
  const usedPct     = Math.min((totalSizeGB / 500) * 100, 100);

  /* upload */
  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploadingName(file.name); setUploadProgress(0);
    const fd = new FormData(); fd.append("file", file);
    try {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = e => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded/e.total)*100)); };
      xhr.onload = () => { setUploadProgress(null); setUploadingName(""); fetchFiles(); };
      xhr.open("POST","/api/upload"); xhr.send(fd);
    } catch { setUploadProgress(null); }
  };

  /* key ops */
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsGenerating(true);
    try {
      const r = await fetch("/api/developer/keys", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:newKeyName,type:newKeyType}) });
      if (r.ok) { setNewKeyName(""); await fetchKeys(); }
    } finally { setIsGenerating(false); }
  };
  const handleDeleteKey  = async (id: string) => { try { await fetch(`/api/developer/keys/${id}`,{method:"DELETE"}); await fetchKeys(); } catch {} };
  const handleDeleteFile = async (id: string) => { setFiles(p=>p.filter(f=>f.id!==id)); try { await fetch(`/api/files/${id}`,{method:"DELETE"}); } catch {} };
  const handleToggleShare = async (id: string) => { try { await fetch(`/api/files/${id}/share`,{method:"POST"}); await fetchFiles(); } catch {} };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f=e.dataTransfer.files[0]; if(f) handleUpload(f); };

  const firstKey  = keys[0];
  const maskedKey = firstKey ? firstKey.key.slice(0,10)+"••••••••••••"+firstKey.key.slice(-4) : "pd_live_••••••••••••bb7d";

  /* ── style helpers ── */
  const card = { background:T.surface, border:`1px solid ${T.border}` } as React.CSSProperties;

  /* ════════════════════════════════════════════
     SIDEBAR
  ════════════════════════════════════════════ */
  const Sidebar = () => (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-30"
      style={{ background:T.surface, borderRight:`1px solid ${T.border}` }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom:`1px solid ${T.border}` }}>
        <div className="w-5 h-5 rotate-45 flex items-center justify-center flex-shrink-0" style={{ border:`2px solid ${T.cyan}` }}>
          <div className="w-1.5 h-1.5" style={{ background:T.cyan }} />
        </div>
        <span className="text-[13px] font-black tracking-tight uppercase" style={{ color:T.text }}>
          Para<span style={{ color:T.cyan }}>Drive</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-grow overflow-y-auto">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all text-[13px] font-medium"
              style={{
                background: active ? "rgba(0,217,255,0.1)" : "transparent",
                color:      active ? T.cyan : T.dim,
                borderLeft: active ? `2px solid ${T.cyan}` : "2px solid transparent",
              }}>
              <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
              {item.id}
            </button>
          );
        })}
      </nav>

      {/* Storage meter */}
      <div className="px-4 pb-3 pt-4" style={{ borderTop:`1px solid ${T.border}` }}>
        <div className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color:T.muted }}>Storage Used</div>
        <div className="text-[16px] font-black font-mono" style={{ color:T.text }}>
          {totalSizeGB > 0 ? `${totalSizeGB.toFixed(0)} GB` : "240 TB"}
          <span className="text-[10px] font-normal ml-1" style={{ color:T.muted }}> / 500 TB</span>
        </div>
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background:"rgba(0,217,255,0.08)" }}>
          <div className="h-full rounded-full transition-all" style={{ width:`${Math.max(usedPct,48)}%`, background:`linear-gradient(90deg,${T.cyan},${T.blue})`, boxShadow:`0 0 8px rgba(0,217,255,0.4)` }} />
        </div>
        <div className="text-[9px] mt-1" style={{ color:T.muted }}>{Math.max(usedPct,48).toFixed(0)}% used</div>

        <button className="mt-3 w-full py-2 rounded-xl text-[11px] font-bold transition-all"
          style={{ background:T.cyan, color:T.bg }}>
          Upgrade Plan
        </button>
      </div>

      {/* Docs link */}
      <div className="px-4 pb-4 pt-3" style={{ borderTop:`1px solid ${T.border}` }}>
        <Link href="/docs" className="flex items-center gap-2 text-[12px] transition-colors py-1"
          style={{ color:T.muted }}
          onMouseEnter={e=>(e.currentTarget.style.color=T.cyan)}
          onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
          <span className="material-symbols-outlined text-[15px]">menu_book</span>
          Documentation
          <span className="material-symbols-outlined text-[13px] ml-auto">chevron_right</span>
        </Link>
      </div>
    </aside>
  );

  /* ════════════════════════════════════════════
     TOPBAR
  ════════════════════════════════════════════ */
  const Topbar = () => (
    <header className="fixed top-0 left-[220px] right-0 h-14 z-20 flex items-center px-6 gap-4 backdrop-blur-xl"
      style={{ background:"rgba(5,8,22,0.9)", borderBottom:`1px solid ${T.border}` }}>
      {/* Search */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 max-w-md"
        style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}` }}>
        <span className="material-symbols-outlined text-[15px]" style={{ color:T.muted }}>search</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search files, nodes, keys..."
          className="bg-transparent text-[13px] placeholder-[#64748b] outline-none flex-1"
          style={{ color:T.text }} />
        <kbd className="text-[9px] px-1.5 py-0.5 rounded" style={{ color:T.muted, background:"rgba(255,255,255,0.06)", border:`1px solid ${T.border}` }}>⌘ K</kbd>
      </div>

      <div className="flex-1" />

      {/* Status chip */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)" }}>
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-[11px] font-bold text-green-400">All Systems Operational</span>
      </div>

      {/* Notif */}
      <button className="relative p-2 rounded-xl transition-all" style={{ color:T.dim }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,217,255,0.08)";e.currentTarget.style.color=T.cyan;}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.dim;}}>
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center" style={{ background:T.cyan, color:T.bg }}>3</span>
      </button>

      {/* User */}
      <div className="flex items-center gap-3 pl-4" style={{ borderLeft:`1px solid ${T.border}` }}>
        <div className="hidden sm:block text-right">
          <div className="text-[12px] font-bold" style={{ color:T.text }}>{user?.firstName || "Developer"}</div>
          <div className="text-[10px]" style={{ color:T.muted }}>Pro Plan</div>
        </div>
        <UserButton appearance={{ elements: { avatarBox:"w-8 h-8" } }} />
      </div>
    </header>
  );

  /* ════════════════════════════════════════════
     DASHBOARD VIEW
  ════════════════════════════════════════════ */
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Welcome row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-black tracking-tight" style={{ color:T.text }}>
            Good morning, <span style={{ color:T.cyan }}>{user?.firstName || "Dev"}</span> 👋
          </h1>
          <p className="text-[13px] mt-1" style={{ color:T.muted }}>
            Your infrastructure is healthy. 34 nodes active across 6 regions.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all"
            style={{ background:T.cyan, color:T.bg, boxShadow:`0 0 20px rgba(0,217,255,0.3)` }}>
            <span className="material-symbols-outlined text-[16px]">upload</span>
            Upload File
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleUpload(f);}} />
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background:"rgba(0,217,255,0.06)", border:`1px solid ${T.borderMd}` }}>
          <span className="material-symbols-outlined animate-spin" style={{ color:T.cyan }}>sync</span>
          <div className="flex-1">
            <div className="text-[12px] font-bold mb-1.5" style={{ color:T.cyan }}>Sharding & uploading {uploadingName}…</div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(0,217,255,0.1)" }}>
              <div className="h-full rounded-full transition-all" style={{ width:`${uploadProgress}%`, background:`linear-gradient(90deg,${T.cyan},${T.blue})` }} />
            </div>
          </div>
          <span className="text-[13px] font-black font-mono" style={{ color:T.cyan }}>{uploadProgress}%</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="folder_copy"  label="Total Files"       value={files.length > 0 ? `${files.length}` : "12.4M"} delta="12.5%"  up={true}  color={T.cyan} />
        <StatCard icon="storage"      label="Data Distributed"  value={totalSizeGB > 0 ? formatSize(totalSize) : "240 TB"} delta="8.3%" up={true} color={T.blue} />
        <StatCard icon="api"          label="API Requests"       value="34.2M"  delta="18.7%" up={true}  color="#a78bfa" />
        <StatCard icon="verified"     label="Retrieval Success"  value="99.99%" delta="0.01%" up={true}  color="#34d399" />
      </div>

      {/* Row: Infra map + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={card}>
          <SectionHead title="Live Infrastructure Map" />
          <InfraMap />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[["34","Active Nodes"],["6","Regions"],["<15ms","Avg Latency"]].map(([v,l]) => (
              <div key={l} className="rounded-xl p-3 text-center" style={{ background:"rgba(0,217,255,0.06)" }}>
                <div className="text-[16px] font-black font-mono" style={{ color:T.cyan }}>{v}</div>
                <div className="text-[10px] mt-0.5" style={{ color:T.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <LiveTerminal />
      </div>

      {/* Row: API + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* API Overview */}
        <div className="col-span-2 rounded-2xl p-5" style={card}>
          <SectionHead title="API Traffic" action="View Docs" onAction={() => window.open("/docs")} />
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label:"Requests / week", value:"34.2M", delta:"+18.7%", ok:true },
              { label:"Bandwidth",       value:"1.78 TB", delta:"+9.2%", ok:true },
              { label:"Error Rate",      value:"0.01%",  delta:"-0.02%", ok:true },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background:"rgba(0,217,255,0.04)", border:`1px solid ${T.border}` }}>
                <div className="text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color:T.muted }}>{m.label}</div>
                <div className="text-[18px] font-black font-mono" style={{ color:T.text }}>{m.value}</div>
                <div className={`text-[10px] font-bold mt-0.5 ${m.ok?"text-green-400":"text-red-400"}`}>{m.delta}</div>
              </div>
            ))}
          </div>
          {/* Active key */}
          <div className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color:T.muted }}>Active API Key</div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ background:"rgba(0,217,255,0.04)", border:`1px solid ${T.border}` }}>
            <span className="material-symbols-outlined text-[14px]" style={{ color:T.cyan }}>vpn_key</span>
            <code className="font-mono text-[12px] flex-1" style={{ color:T.dim }}>{maskedKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(firstKey?.key||""); setCopiedKeyId("main"); setTimeout(()=>setCopiedKeyId(null),1500); }}
              style={{ color:T.cyan }}>
              <span className="material-symbols-outlined text-[14px]">{copiedKeyId==="main"?"check":"content_copy"}</span>
            </button>
          </div>
          <RequestBars />
        </div>

        {/* Distribution */}
        <div className="rounded-2xl p-5" style={card}>
          <SectionHead title="Storage Regions" />
          <DonutChart />
          <div className="mt-4 pt-4 space-y-2" style={{ borderTop:`1px solid ${T.border}` }}>
            {[
              { label:"Avg Response", value:"132ms" },
              { label:"Active Nodes",  value:"34 / 34" },
              { label:"Uptime (30d)",  value:"99.99%" },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-[11px]" style={{ color:T.muted }}>{m.label}</span>
                <span className="text-[12px] font-bold font-mono" style={{ color:T.text }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Files */}
      <div className="rounded-2xl p-5" style={card}>
        <SectionHead title="Recent Files" action="View All" onAction={() => setActiveTab("Files")} />
        {files.length === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color:"rgba(0,217,255,0.2)" }}>folder_open</span>
            <p className="text-[13px]" style={{ color:T.muted }}>No files yet — upload your first file above.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor:T.border }}>
            {files.slice(0,5).map(f => (
              <div key={f.id} className="flex items-center gap-4 py-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${getMimeColor(f.mimeType)}18` }}>
                  <span className="material-symbols-outlined text-[16px]" style={{ color:getMimeColor(f.mimeType) }}>{getMimeIcon(f.mimeType)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color:T.text }}>{f.fileName}</div>
                  <div className="text-[11px] mt-0.5" style={{ color:T.muted }}>{formatSize(f.size)} · {timeAgo(f.createdAt)}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={f.isPublic
                  ? { background:"rgba(52,211,153,0.1)", color:"#34d399" }
                  : { background:T.border, color:T.cyan }}>
                  {f.isPublic ? "Public" : "Private"}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => {navigator.clipboard.writeText(`${origin}/api/files/${f.id}/download`);setCopiedId(f.id);setTimeout(()=>setCopiedId(null),1500);}}
                    className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,217,255,0.08)";e.currentTarget.style.color=T.cyan;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                    <span className="material-symbols-outlined text-[14px]">{copiedId===f.id?"check":"content_copy"}</span>
                  </button>
                  <button onClick={() => handleDeleteFile(f.id)}
                    className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.1)";e.currentTarget.style.color="#f87171";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     FILES VIEW
  ════════════════════════════════════════════ */
  const FilesView = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black" style={{ color:T.text }}>Files</h1>
          <p className="text-[13px] mt-0.5" style={{ color:T.muted }}>{files.length} files · {formatSize(totalSize)} used</p>
        </div>
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
          style={{ background:T.cyan, color:T.bg, boxShadow:`0 0 20px rgba(0,217,255,0.25)` }}>
          <span className="material-symbols-outlined text-[15px]">upload</span> Upload File
        </button>
      </div>
      <input ref={fileInputRef} type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleUpload(f);}} />

      {/* Drop zone */}
      <div
        onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
        onDragLeave={()=>setIsDragging(false)}
        onDrop={onDrop}
        onClick={()=>fileInputRef.current?.click()}
        className="rounded-2xl p-10 text-center cursor-pointer transition-all"
        style={{
          border:`2px dashed ${isDragging ? T.cyan : T.border}`,
          background: isDragging ? "rgba(0,217,255,0.05)" : "transparent",
        }}>
        <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color:T.cyan }}>cloud_upload</span>
        <div className="text-[14px] font-bold" style={{ color:T.text }}>Drop files here or click to upload</div>
        <div className="text-[12px] mt-1" style={{ color:T.muted }}>Any format · AES-GCM-256 encrypted · Auto geo-sharded</div>
      </div>

      {uploadProgress !== null && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background:"rgba(0,217,255,0.05)", border:`1px solid ${T.borderMd}` }}>
          <span className="material-symbols-outlined animate-spin" style={{ color:T.cyan }}>sync</span>
          <div className="flex-1">
            <div className="text-[12px] font-bold mb-1.5" style={{ color:T.cyan }}>Uploading {uploadingName}…</div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(0,217,255,0.1)" }}>
              <div className="h-full rounded-full transition-all" style={{ width:`${uploadProgress}%`, background:`linear-gradient(90deg,${T.cyan},${T.blue})` }} />
            </div>
          </div>
          <span className="text-[13px] font-black font-mono" style={{ color:T.cyan }}>{uploadProgress}%</span>
        </div>
      )}

      {/* File table */}
      <div className="rounded-2xl overflow-hidden" style={{ background:T.surface, border:`1px solid ${T.border}` }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom:`1px solid ${T.border}`, background:"rgba(0,217,255,0.03)" }}>
              {["Name","Size","Type","Uploaded","Status","Actions"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-[10px] uppercase tracking-widest font-bold" style={{ color:T.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr><td colSpan={6} className="py-16 text-center">
                <span className="material-symbols-outlined text-[44px] block mb-3" style={{ color:"rgba(0,217,255,0.15)" }}>folder_open</span>
                <p className="text-[13px]" style={{ color:T.muted }}>No files uploaded yet</p>
              </td></tr>
            ) : (
              files.filter(f=>f.fileName.toLowerCase().includes(search.toLowerCase())).map(f => (
                <tr key={f.id} className="group transition-colors" style={{ borderBottom:`1px solid rgba(0,217,255,0.05)` }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,217,255,0.03)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${getMimeColor(f.mimeType)}15` }}>
                        <span className="material-symbols-outlined text-[14px]" style={{ color:getMimeColor(f.mimeType) }}>{getMimeIcon(f.mimeType)}</span>
                      </div>
                      <span className="font-medium truncate max-w-[200px]" style={{ color:T.text }}>{f.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color:T.dim }}>{formatSize(f.size)}</td>
                  <td className="py-3 px-4 capitalize" style={{ color:T.dim }}>{f.mimeType.split("/")[0]}</td>
                  <td className="py-3 px-4" style={{ color:T.dim }}>{timeAgo(f.createdAt)}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={f.isPublic
                      ? { background:"rgba(52,211,153,0.1)",color:"#34d399" }
                      : { background:T.border, color:T.cyan }}>
                      {f.isPublic?"Public":"Private"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {navigator.clipboard.writeText(`${origin}/api/files/${f.id}/download`);setCopiedId(f.id);setTimeout(()=>setCopiedId(null),1500);}}
                        className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                        onMouseEnter={e=>{e.currentTarget.style.color=T.cyan;e.currentTarget.style.background="rgba(0,217,255,0.08)";}}
                        onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                        <span className="material-symbols-outlined text-[14px]">{copiedId===f.id?"check":"content_copy"}</span>
                      </button>
                      <button onClick={() => handleToggleShare(f.id)}
                        className="p-1.5 rounded-lg transition-all" style={{ color: f.isPublic ? "#34d399" : T.muted }}>
                        <span className="material-symbols-outlined text-[14px]">{f.isPublic?"public":"lock"}</span>
                      </button>
                      <a href={`/api/files/${f.id}/download`} download
                        className="p-1.5 rounded-lg transition-all inline-flex items-center" style={{ color:T.muted }}
                        onMouseEnter={e=>{e.currentTarget.style.color=T.cyan;e.currentTarget.style.background="rgba(0,217,255,0.08)";}}
                        onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                        <span className="material-symbols-outlined text-[14px]">download</span>
                      </a>
                      <button onClick={() => handleDeleteFile(f.id)}
                        className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                        onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.background="rgba(248,113,113,0.08)";}}
                        onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     API KEYS VIEW
  ════════════════════════════════════════════ */
  const ApiKeysView = () => (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-black" style={{ color:T.text }}>API Keys</h1>
        <p className="text-[13px] mt-0.5" style={{ color:T.muted }}>Manage programmatic access to your storage infrastructure.</p>
      </div>

      {/* Create */}
      <div className="rounded-2xl p-6" style={card}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color:T.cyan }}>Generate New Key</div>
        <form onSubmit={handleCreateKey} className="flex gap-3">
          <input value={newKeyName} onChange={e=>setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. production-backend)"
            className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
            style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, color:T.text }}
            onFocus={e=>(e.currentTarget.style.borderColor=T.cyan)}
            onBlur={e=>(e.currentTarget.style.borderColor=T.border)} />
          <select value={newKeyType} onChange={e=>setNewKeyType(e.target.value)}
            className="rounded-xl px-3 py-2.5 text-[13px] outline-none"
            style={{ background:T.surfaceUp, border:`1px solid ${T.border}`, color:T.text }}>
            <option value="production">Production</option>
            <option value="development">Development</option>
            <option value="readonly">Read Only</option>
          </select>
          <button type="submit" disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50"
            style={{ background:T.cyan, color:T.bg }}>
            {isGenerating
              ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              : <span className="material-symbols-outlined text-[16px]">add</span>}
            Generate
          </button>
        </form>
      </div>

      {/* Key list */}
      <div className="rounded-2xl overflow-hidden" style={{ background:T.surface, border:`1px solid ${T.border}` }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom:`1px solid ${T.border}`, background:"rgba(0,217,255,0.03)" }}>
          <span className="text-[11px] uppercase tracking-widest font-bold" style={{ color:T.muted }}>Active Keys ({keys.length})</span>
        </div>
        {keys.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[44px] block mb-3" style={{ color:"rgba(0,217,255,0.15)" }}>vpn_key</span>
            <p className="text-[13px]" style={{ color:T.muted }}>No API keys. Generate your first key above.</p>
          </div>
        ) : (
          keys.map(k => (
            <div key={k.id} className="flex items-center gap-4 px-5 py-4 transition-colors" style={{ borderBottom:`1px solid rgba(0,217,255,0.05)` }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(0,217,255,0.03)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(0,217,255,0.1)" }}>
                <span className="material-symbols-outlined text-[17px]" style={{ color:T.cyan }}>vpn_key</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold" style={{ color:T.text }}>{k.name}</div>
                <code className="font-mono text-[11px]" style={{ color:T.muted }}>
                  {visibleKeys[k.id] ? k.key : k.key.slice(0,12)+"••••••••••••"+k.key.slice(-4)}
                </code>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={
                k.type==="production"
                  ? { background:"rgba(0,217,255,0.1)", color:T.cyan }
                  : { background:"rgba(52,211,153,0.1)", color:"#34d399" }
              }>{k.type}</span>
              <div className="flex items-center gap-1">
                <button onClick={()=>setVisibleKeys(p=>({...p,[k.id]:!p[k.id]}))}
                  className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.color=T.cyan;e.currentTarget.style.background="rgba(0,217,255,0.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                  <span className="material-symbols-outlined text-[15px]">{visibleKeys[k.id]?"visibility_off":"visibility"}</span>
                </button>
                <button onClick={()=>{navigator.clipboard.writeText(k.key);setCopiedKeyId(k.id);setTimeout(()=>setCopiedKeyId(null),1500);}}
                  className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.color=T.cyan;e.currentTarget.style.background="rgba(0,217,255,0.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                  <span className="material-symbols-outlined text-[15px]">{copiedKeyId===k.id?"check":"content_copy"}</span>
                </button>
                <button onClick={()=>handleDeleteKey(k.id)}
                  className="p-1.5 rounded-lg transition-all" style={{ color:T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.background="rgba(248,113,113,0.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=T.muted;e.currentTarget.style.background="transparent";}}>
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick start */}
      {firstKey && (
        <div className="rounded-2xl p-6" style={card}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color:T.cyan }}>Quick Start — cURL</div>
          <div className="rounded-xl overflow-hidden" style={{ background:"#030712", border:`1px solid rgba(0,217,255,0.15)` }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom:"1px solid rgba(0,217,255,0.08)" }}>
              <span className="text-[10px] font-mono font-bold" style={{ color:T.cyan }}>Terminal</span>
              <button className="text-[10px] font-bold transition-colors" style={{ color:T.muted }}>Copy</button>
            </div>
            <pre className="px-4 py-4 text-[12px] font-mono leading-relaxed overflow-x-auto" style={{ color:"#cffafe" }}>
{`curl -X POST ${origin}/api/v1/upload \\
  -H "Authorization: Bearer ${firstKey.key.slice(0,12)}••••" \\
  -F "file=@image.png"`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════════
     SETTINGS VIEW
  ════════════════════════════════════════════ */
  const SettingsView = () => (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-black" style={{ color:T.text }}>Settings</h1>
        <p className="text-[13px] mt-0.5" style={{ color:T.muted }}>Configure your infrastructure preferences.</p>
      </div>

      <div className="rounded-2xl p-6" style={card}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color:T.cyan }}>Upload Preferences</div>
        {[
          { label:"Encrypt files by default", sub:"AES-256 local encryption before upload",  val:encryptDefault, set:setEncryptDefault },
          { label:"Compress before upload",   sub:"Reduce storage usage with gzip compression", val:compress,       set:setCompress },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color:T.text }}>{s.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color:T.muted }}>{s.sub}</div>
            </div>
            <button onClick={()=>s.set(!s.val)}
              className="relative w-12 h-6 rounded-full transition-all"
              style={{ background: s.val ? T.cyan : "rgba(255,255,255,0.08)", boxShadow: s.val ? `0 0 12px rgba(0,217,255,0.4)` : "none" }}>
              <div className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all" style={{ left: s.val ? "28px" : "4px" }} />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={card}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color:T.cyan }}>Account</div>
        <div className="flex items-center gap-4">
          <UserButton appearance={{ elements:{ avatarBox:"w-14 h-14" } }} />
          <div>
            <div className="text-[15px] font-bold" style={{ color:T.text }}>{user?.fullName || "Developer"}</div>
            <div className="text-[12px] mt-0.5" style={{ color:T.muted }}>{user?.primaryEmailAddress?.emailAddress || "—"}</div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background:"rgba(0,217,255,0.1)", color:T.cyan }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Pro Infrastructure
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     PLACEHOLDER VIEW
  ════════════════════════════════════════════ */
  const PlaceholderView = ({ title, icon }: { title: string; icon: string }) => (
    <div className="flex flex-col items-center justify-center h-[55vh] text-center">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background:"rgba(0,217,255,0.08)", border:`1px solid ${T.borderMd}` }}>
        <span className="material-symbols-outlined text-[36px]" style={{ color:T.cyan }}>{icon}</span>
      </div>
      <h2 className="text-[20px] font-black mb-2" style={{ color:T.text }}>{title}</h2>
      <p className="text-[13px] max-w-sm" style={{ color:T.muted }}>This section is coming soon. Stay tuned for updates.</p>
    </div>
  );

  /* ════════════════════════════════════════════
     CONTENT ROUTER
  ════════════════════════════════════════════ */
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":      return <DashboardView />;
      case "Files":          return <FilesView />;
      case "API Keys":       return <ApiKeysView />;
      case "Settings":       return <SettingsView />;
      case "Infrastructure": return <PlaceholderView title="Infrastructure" icon="hub" />;
      case "Analytics":      return <PlaceholderView title="Analytics" icon="bar_chart" />;
      default:               return <DashboardView />;
    }
  };

  /* ════════════════════════════════════════════
     SHELL
  ════════════════════════════════════════════ */
  return (
    <div className="min-h-screen antialiased" style={{ background:T.bg, color:T.text }}>
      <Sidebar />
      <Topbar />
      <main className="pl-[220px] pt-14 min-h-screen">
        <div className="max-w-[1360px] mx-auto px-6 py-7">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
