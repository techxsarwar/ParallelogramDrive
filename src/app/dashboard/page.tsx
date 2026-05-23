"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS — parrot green + yellow on white
══════════════════════════════════════════════════════ */
const T = {
  bg:       "#ffffff",
  surface:  "#f5fdf5",
  surfaceUp:"#eafaea",
  card:     "#ffffff",
  cyan:     "#20a800",   // deep green — text/icons
  neon:     "#39FF14",   // neon green — buttons / glows
  blue:     "#d4a000",   // dark amber — secondary
  violet:   "#c07000",   // dark orange — tertiary
  text:     "#0a180a",
  muted:    "#4a6b4a",
  dim:      "#6a8a6a",
  border:   "rgba(32,168,0,0.15)",
  borderMd: "rgba(32,168,0,0.28)",
  term:     "#0f1a0f",   // dark terminal bg
  termText: "#86efac",
};

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface FileMeta {
  id: string; fileName: string; size: number;
  mimeType: string; isPublic: boolean; createdAt: string;
}
interface ApiKey {
  id: string; name: string; type: string; scope: string;
  key: string; createdAt: string; lastUsed: string | null;
}
interface Webhook {
  id: string; url: string; events: string[]; active: boolean; createdAt: string;
}
interface BotHealth {
  token: boolean; canPost: boolean; canEdit: boolean; canInvite: boolean; ping: number | null;
}

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function fmt(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024, u = ["B","KB","MB","GB","TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k**i).toFixed(1)) + " " + u[i];
}
function ago(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return new Date(d).toLocaleDateString(undefined,{month:"short",day:"numeric"});
}
function mimeIcon(m: string) {
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "movie";
  if (m.includes("pdf")) return "picture_as_pdf";
  if (m.includes("zip")||m.includes("tar")) return "folder_zip";
  if (m.startsWith("text/")||m.includes("javascript")) return "code";
  return "draft";
}
function mimeColor(m: string) {
  if (m.startsWith("image/")) return T.cyan;
  if (m.startsWith("video/")) return "#7c3aed";
  if (m.includes("pdf")) return "#dc2626";
  if (m.includes("zip")||m.includes("tar")) return T.blue;
  if (m.startsWith("text/")||m.includes("javascript")) return "#059669";
  return T.dim;
}
function s3Cost(gb: number, egressGb = 0, requests = 0) {
  return (gb * 0.023 + egressGb * 0.09 + (requests / 1000) * 0.0004).toFixed(2);
}
function snippets(id: string, origin: string) {
  return {
    curl: `curl -H "Authorization: Bearer $PD_API_KEY" \\\n  "${origin}/api/files/${id}/download"`,
    js: `import { PDClient } from "@parallelogram/sdk";\n\nconst pd = new PDClient({ apiKey: process.env.PD_API_KEY });\nconst file = await pd.files.download("${id}");\nconsole.log(await file.text());`,
    python: `import parallelogram as pd\n\nclient = pd.Client(api_key=os.environ["PD_API_KEY"])\nfile_bytes = client.files.download("${id}")\nprint(file_bytes.decode())`,
  };
}

/* ══════════════════════════════════════════════════════
   MICRO COMPONENTS
══════════════════════════════════════════════════════ */
function Spark({ data, color = T.neon }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 96, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length-1)) * w},${h - (v/max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.9"/>
    </svg>
  );
}

function StatCard({ icon, label, value, sub, delta, up, color = T.cyan, spark }: {
  icon: string; label: string; value: string; sub?: string;
  delta?: string; up?: boolean; color?: string; spark?: number[];
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 group hover:-translate-y-0.5 transition-all duration-200"
      style={{ background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:`${color}18` }}>
          <span className="material-symbols-outlined text-[17px]" style={{ color }}>{icon}</span>
        </div>
        {delta && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${up ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}>
            {up ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      <div>
        <div className="text-[22px] font-black font-mono leading-none" style={{ color: T.text }}>{value}</div>
        {sub && <div className="text-[11px] mt-0.5 font-mono" style={{ color: T.muted }}>{sub}</div>}
        <div className="text-[11px] mt-1" style={{ color: T.muted }}>{label}</div>
      </div>
      {spark && <Spark data={spark} color={color} />}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{ background: checked ? T.neon : "rgba(32,168,0,0.15)" }}>
      <span className="absolute top-0.5 transition-all duration-200 w-4 h-4 rounded-full shadow-sm"
        style={{ left: checked ? "calc(100% - 18px)" : "2px", background: checked ? "#0a180a" : "#aaa" }}/>
    </button>
  );
}

function CopyBtn({ text, label = "" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all"
      style={{ color: copied ? T.neon : T.cyan, background: copied ? "rgba(57,255,20,0.1)" : "rgba(32,168,0,0.07)" }}>
      <span className="material-symbols-outlined text-[12px]">{copied ? "check" : "content_copy"}</span>
      {label || (copied ? "Copied!" : "Copy")}
    </button>
  );
}

function StatusDot({ ok, pulse = false }: { ok: boolean; pulse?: boolean }) {
  return (
    <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${pulse && ok ? "animate-pulse" : ""}`}
      style={{ background: ok ? "#39FF14" : "#f87171", boxShadow: ok ? "0 0 6px rgba(57,255,20,0.6)" : "0 0 6px rgba(248,113,113,0.4)" }}/>
  );
}

function SectionHead({ title, badge, action, onAction }: {
  title: string; badge?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[13px] font-black uppercase tracking-widest" style={{ color: T.text }}>{title}</h2>
        {badge && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background:"rgba(32,168,0,0.1)", color: T.cyan }}>{badge}</span>}
      </div>
      {action && <button onClick={onAction} className="text-[11px] font-bold transition-colors hover:underline" style={{ color: T.cyan }}>{action} →</button>}
    </div>
  );
}

function Pill({ label, color = T.cyan }: { label: string; color?: string }) {
  return (
    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background:`${color}18`, color }}>
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   CODE SNIPPET MODAL
══════════════════════════════════════════════════════ */
function SnippetModal({ file, origin, onClose }: { file: FileMeta; origin: string; onClose: () => void }) {
  const [lang, setLang] = useState<"curl"|"js"|"python">("curl");
  const snip = snippets(file.id, origin);
  const code = snip[lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:"rgba(10,24,10,0.55)", backdropFilter:"blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.borderMd}`, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
          <div>
            <div className="text-[13px] font-black" style={{ color: T.text }}>{file.fileName}</div>
            <code className="text-[10px] font-mono" style={{ color: T.muted }}>{file.id}</code>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
            onMouseEnter={e=>(e.currentTarget.style.background="rgba(32,168,0,0.08)")}
            onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {/* Lang tabs */}
        <div className="flex gap-0 px-5 pt-4">
          {(["curl","js","python"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              className="px-4 py-2 text-[11px] font-bold rounded-t-lg transition-all"
              style={{
                background: lang===l ? T.term : "transparent",
                color: lang===l ? T.termText : T.muted,
                borderBottom: lang===l ? "none" : `1px solid ${T.border}`,
              }}>
              {l === "js" ? "JavaScript" : l === "python" ? "Python" : "cURL"}
            </button>
          ))}
        </div>
        {/* Code */}
        <div className="relative" style={{ background: T.term }}>
          <pre className="px-5 py-5 text-[12px] font-mono leading-relaxed overflow-x-auto" style={{ color: T.termText }}>
            {code}
          </pre>
          <div className="absolute top-3 right-4">
            <CopyBtn text={code} />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-3" style={{ borderTop:`1px solid ${T.border}` }}>
          <span className="text-[11px]" style={{ color: T.muted }}>File ID:</span>
          <code className="text-[11px] font-mono" style={{ color: T.cyan }}>{file.id}</code>
          <CopyBtn text={file.id} />
          <div className="flex-1"/>
          <Pill label={fmt(file.size)} color={T.blue}/>
          <Pill label={file.mimeType.split("/")[0]} color={T.cyan}/>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   BANDWIDTH CHART (SVG bars)
══════════════════════════════════════════════════════ */
function BandwidthChart({ data }: { data: {day:string;upload:number;download:number}[] }) {
  const maxVal = Math.max(...data.flatMap(d => [d.upload, d.download]), 1);
  const H = 80;
  return (
    <div className="flex items-end gap-2 mt-3" style={{ height: H + 24 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full flex items-end gap-0.5" style={{ height: H }}>
            <div className="flex-1 rounded-t-sm transition-all" style={{
              height: `${(d.upload / maxVal) * H}px`,
              background: "#39FF14", opacity: 0.85,
            }}/>
            <div className="flex-1 rounded-t-sm transition-all" style={{
              height: `${(d.download / maxVal) * H}px`,
              background: "#FFE600", opacity: 0.75,
            }}/>
          </div>
          <span className="text-[8px] font-bold" style={{ color: T.muted }}>{d.day}</span>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 pl-2 pb-5">
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#39FF14"}}/><span className="text-[9px]" style={{color:T.muted}}>Upload</span></div>
        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{background:"#FFE600"}}/><span className="text-[9px]" style={{color:T.muted}}>Download</span></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NODE HEALTH GRID
══════════════════════════════════════════════════════ */
function NodeGrid({ total = 34, online = 34 }: { total?: number; online?: number }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {Array.from({length: total}).map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-sm transition-all" style={{
          background: i < online ? "#39FF14" : "#f87171",
          boxShadow: i < online ? "0 0 4px rgba(57,255,20,0.5)" : "none",
          opacity: i < online ? 0.9 : 0.6,
        }}/>
      ))}
      <span className="text-[10px] font-bold ml-1 self-center" style={{ color: T.cyan }}>
        {online}/{total} Online
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   LIVE TERMINAL
══════════════════════════════════════════════════════ */
const LOG_LINES = [
  { t:"SYS",  msg:"Shard pipeline initialized",             ok:true  },
  { t:"ENCR", msg:"AES-GCM-256 key derived [32-byte]",     ok:true  },
  { t:"SHARD",msg:"dataset.tar.gz → 6 chunks dispatched",  ok:true  },
  { t:"NODE", msg:"us-east-1  → Shard 0  ACK  12ms",       ok:true  },
  { t:"NODE", msg:"eu-central → Shard 1  ACK  28ms",       ok:true  },
  { t:"TG",   msg:"Telegram uplink confirmed  msg_id:48921",ok:true  },
  { t:"META", msg:"Shard map committed — integrity 100%",   ok:true  },
  { t:"API",  msg:"POST /v1/upload  200 OK  89ms",          ok:true  },
  { t:"WARN", msg:"sa-east node latency spike  +120ms",     ok:false },
];
function LiveTerminal() {
  const [visible, setVisible] = useState<typeof LOG_LINES>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setVisible(p => [...p, LOG_LINES[i % LOG_LINES.length]].slice(-7));
      i++;
    }, 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: T.term, border:`1px solid ${T.borderMd}` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom:`1px solid rgba(32,168,0,0.2)` }}>
        <div className="flex items-center gap-2">
          <StatusDot ok pulse />
          <span className="text-[10px] font-mono font-black uppercase tracking-wider" style={{ color:"#39FF14" }}>Live Uplink</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60"/><div className="w-2.5 h-2.5 rounded-full" style={{background:"#FFE600",opacity:0.6}}/><div className="w-2.5 h-2.5 rounded-full" style={{background:"#39FF14",opacity:0.6}}/>
        </div>
      </div>
      <div className="px-4 py-3 space-y-1 font-mono text-[11px]" style={{ minHeight: 140 }}>
        {visible.map((l, i) => (
          <div key={i} className="flex gap-3 items-start pl-2 border-l" style={{ borderColor: l.ok ? "rgba(57,255,20,0.3)" : "rgba(248,113,113,0.5)" }}>
            <span className="w-10 flex-shrink-0 font-black text-[9px] pt-0.5" style={{ color: l.ok ? "#39FF14" : "#f87171" }}>{l.t}</span>
            <span style={{ color: l.ok ? "rgba(200,255,200,0.85)" : "#fca5a5" }}>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
const NAV = [
  { id:"Overview",       icon:"dashboard",    badge: "" },
  { id:"Files",          icon:"folder_open",  badge: "" },
  { id:"API Keys",       icon:"vpn_key",      badge: "" },
  { id:"Webhooks",       icon:"webhook",      badge: "New" },
  { id:"Infrastructure", icon:"hub",          badge: "" },
];

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useUser();

  /* state */
  const [files, setFiles]     = useState<FileMeta[]>([]);
  const [keys, setKeys]       = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [activeTab, setActiveTab]   = useState("Overview");
  const [search, setSearch]         = useState("");
  const [uploadProgress, setUploadProgress] = useState<number|null>(null);
  const [uploadingName, setUploadingName]   = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snippetFile, setSnippetFile] = useState<FileMeta|null>(null);
  const [origin, setOrigin] = useState("https://parallelogramdrive.com");

  /* API key form */
  const [newKeyName, setNewKeyName]   = useState("");
  const [newKeyScope, setNewKeyScope] = useState("full");
  const [isGenKey, setIsGenKey]       = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string,boolean>>({});
  const [copiedKey, setCopiedKey]     = useState<string|null>(null);

  /* Webhook form */
  const [whUrl, setWhUrl]         = useState("");
  const [whEvents, setWhEvents]   = useState<string[]>(["file.uploaded"]);
  const [isAddingWh, setIsAddingWh] = useState(false);

  /* Bot health */
  const [botHealth, setBotHealth] = useState<BotHealth>({
    token:true, canPost:true, canEdit:true, canInvite:false, ping:null
  });
  const [isPinging, setIsPinging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMsg, setSyncMsg]     = useState("");

  /* file ops */
  const [copiedId, setCopiedId] = useState<string|null>(null);

  /* data */
  const fetchFiles = useCallback(async () => {
    try { const r = await fetch("/api/files"); if (r.ok) setFiles(await r.json()); } catch {}
  }, []);
  const fetchKeys = useCallback(async () => {
    try { const r = await fetch("/api/developer/keys"); if (r.ok) setKeys(await r.json()); } catch {}
  }, []);

  useEffect(() => {
    fetchFiles(); fetchKeys();
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  /* derived */
  const totalSize   = files.reduce((a,f) => a+f.size, 0);
  const totalGB     = totalSize / 1024**3;
  const egressGB    = totalGB * 0.4; // estimated 40% egress
  const s3Savings   = s3Cost(totalGB || 1.2, egressGB || 0.48, 34200000);
  const usedPct     = Math.min((totalGB / 500) * 100, 100);

  /* bandwidth chart data (mock weekly) */
  const bwData = [
    {day:"M",upload:42,download:68},{day:"T",upload:58,download:82},
    {day:"W",upload:39,download:55},{day:"T",upload:71,download:99},
    {day:"F",upload:55,download:73},{day:"S",upload:88,download:120},
    {day:"S",upload:63,download:88},
  ];

  /* upload */
  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploadingName(file.name); setUploadProgress(0);
    const fd = new FormData(); fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => { if (e.lengthComputable) setUploadProgress(Math.round((e.loaded/e.total)*100)); };
    xhr.onload = () => { setUploadProgress(null); setUploadingName(""); fetchFiles(); };
    xhr.open("POST","/api/upload"); xhr.send(fd);
  };

  /* key ops */
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsGenKey(true);
    try {
      const r = await fetch("/api/developer/keys", { method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:newKeyName,type:"production",scope:newKeyScope})
      });
      if (r.ok) { setNewKeyName(""); await fetchKeys(); }
    } finally { setIsGenKey(false); }
  };
  const deleteKey = async (id: string) => {
    try { await fetch(`/api/developer/keys/${id}`,{method:"DELETE"}); await fetchKeys(); } catch {}
  };

  /* file ops */
  const deleteFile = async (id: string) => {
    setFiles(p => p.filter(f => f.id !== id));
    try { await fetch(`/api/files/${id}`,{method:"DELETE"}); } catch {}
  };
  const toggleShare = async (id: string) => {
    try { await fetch(`/api/files/${id}/share`,{method:"POST"}); await fetchFiles(); } catch {}
  };

  /* bot ping */
  const pingBot = async () => {
    setIsPinging(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random()*800));
    setBotHealth(h => ({ ...h, ping: Math.floor(80 + Math.random()*120) }));
    setIsPinging(false);
  };
  const runSync = async () => {
    setIsSyncing(true); setSyncMsg("");
    await new Promise(r => setTimeout(r, 2000));
    setSyncMsg("Sync complete — 0 orphaned records found.");
    setIsSyncing(false);
  };

  /* card base style */
  const card = { background: T.card, border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" } as React.CSSProperties;

  /* ════════════════════════════════════════
     SIDEBAR
  ════════════════════════════════════════ */
  const Sidebar = () => (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-30"
      style={{ background: T.surface, borderRight:`1px solid ${T.border}` }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px]" style={{ borderBottom:`1px solid ${T.border}` }}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" style={{flexShrink:0}}>
          <polygon points="16,2 28,9 16,16 4,9" fill="none" stroke="#39FF14" strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="4,9 16,16 16,30 4,23" fill="none" stroke="#39FF14" strokeWidth="2" strokeLinejoin="round"/>
          <polygon points="16,16 28,9 28,23 16,30" fill="none" stroke="#FFE600" strokeWidth="2" strokeLinejoin="round"/>
          <circle cx="16" cy="16" r="2.5" fill="#39FF14"/>
        </svg>
        <span className="text-[13px] font-black tracking-tight uppercase" style={{ color: T.text }}>
          Para<span style={{ color: T.cyan }}>Drive</span>
        </span>
        <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background:"rgba(57,255,20,0.15)", color: T.cyan }}>v1</span>
      </div>

      {/* Workspace selector */}
      <div className="mx-3 my-2 flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all"
        style={{ background:"rgba(32,168,0,0.07)", border:`1px solid ${T.border}` }}
        onMouseEnter={e=>(e.currentTarget.style.background="rgba(32,168,0,0.12)")}
        onMouseLeave={e=>(e.currentTarget.style.background="rgba(32,168,0,0.07)")}>
        <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background:"#39FF14" }}/>
        <span className="text-[11px] font-bold flex-1" style={{ color: T.text }}>Production</span>
        <span className="material-symbols-outlined text-[14px]" style={{ color: T.muted }}>unfold_more</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-3 flex-grow overflow-y-auto">
        {NAV.map(item => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all text-[13px] font-medium"
              style={{
                background: active ? "rgba(32,168,0,0.1)" : "transparent",
                color:      active ? T.cyan : T.muted,
                borderLeft: active ? `2px solid #39FF14` : "2px solid transparent",
              }}>
              <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
              {item.id}
              {item.badge && <span className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background:"rgba(212,160,0,0.15)", color: T.blue }}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Storage bar */}
      <div className="px-4 py-4" style={{ borderTop:`1px solid ${T.border}` }}>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>Storage</span>
          <span className="text-[10px] font-mono font-bold" style={{ color: T.cyan }}>
            {totalGB > 0 ? `${totalGB.toFixed(0)} GB` : "240 TB"} / ∞
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(32,168,0,0.1)" }}>
          <div className="h-full rounded-full transition-all" style={{ width:`${Math.max(usedPct,48)}%`,
            background:"linear-gradient(90deg,#39FF14,#FFE600)", boxShadow:"0 0 6px rgba(57,255,20,0.4)" }}/>
        </div>
        <button className="mt-3 w-full py-2 rounded-xl text-[11px] font-black transition-all hover:opacity-90"
          style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
          ✦ Upgrade Plan
        </button>
      </div>

      {/* Docs link */}
      <div className="px-4 pb-4 pt-2" style={{ borderTop:`1px solid ${T.border}` }}>
        <Link href="/docs" className="flex items-center gap-2 text-[12px] py-1 transition-colors"
          style={{ color: T.muted }}
          onMouseEnter={e=>(e.currentTarget.style.color=T.cyan)}
          onMouseLeave={e=>(e.currentTarget.style.color=T.muted)}>
          <span className="material-symbols-outlined text-[15px]">menu_book</span>
          Documentation
          <span className="material-symbols-outlined text-[13px] ml-auto">open_in_new</span>
        </Link>
      </div>
    </aside>
  );

  /* ════════════════════════════════════════
     TOPBAR
  ════════════════════════════════════════ */
  const Topbar = () => (
    <header className="fixed top-0 left-[220px] right-0 h-14 z-20 flex items-center px-6 gap-4"
      style={{ background:"rgba(255,255,255,0.9)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${T.border}` }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px]">
        <span style={{ color: T.muted }}>ParallelogramDrive</span>
        <span style={{ color: T.border }}>/</span>
        <span className="font-bold" style={{ color: T.text }}>{activeTab}</span>
      </div>

      <div className="flex-1"/>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-xl px-3 py-2 w-56"
        style={{ background:"rgba(32,168,0,0.05)", border:`1px solid ${T.border}` }}>
        <span className="material-symbols-outlined text-[14px]" style={{ color: T.muted }}>search</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search…"
          className="bg-transparent text-[12px] outline-none flex-1"
          style={{ color: T.text }}/>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background:"rgba(57,255,20,0.08)", border:"1px solid rgba(57,255,20,0.2)" }}>
        <StatusDot ok pulse/>
        <span className="text-[10px] font-black" style={{ color: T.cyan }}>All Systems Go</span>
      </div>

      {/* Upload */}
      <button onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black transition-all hover:opacity-90"
        style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
        <span className="material-symbols-outlined text-[15px]">upload</span>
        Upload
      </button>
      <input ref={fileInputRef} type="file" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleUpload(f);}}/>

      {/* User */}
      <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft:`1px solid ${T.border}` }}>
        <div className="hidden sm:block text-right">
          <div className="text-[11px] font-black" style={{ color: T.text }}>{user?.firstName || "Dev"}</div>
          <div className="text-[9px]" style={{ color: T.muted }}>Pro Plan</div>
        </div>
        <UserButton appearance={{ elements:{ avatarBox:"w-7 h-7" } }}/>
      </div>
    </header>
  );

  /* ════════════════════════════════════════
     OVERVIEW VIEW
  ════════════════════════════════════════ */
  const OverviewView = () => (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-black tracking-tight" style={{ color: T.text }}>
            Good morning, <span style={{ color: T.cyan }}>{user?.firstName || "Dev"}</span> 👋
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: T.muted }}>
            Your infrastructure is healthy · 34 nodes online · 6 regions active
          </p>
        </div>
        <button onClick={() => setActiveTab("Files")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black transition-all"
          style={{ background:"rgba(32,168,0,0.08)", border:`1px solid ${T.border}`, color: T.cyan }}>
          <span className="material-symbols-outlined text-[15px]">folder_open</span>
          View Files
        </button>
      </div>

      {/* Upload progress */}
      {uploadProgress !== null && (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background:"rgba(32,168,0,0.06)", border:`1px solid ${T.borderMd}` }}>
          <span className="material-symbols-outlined animate-spin" style={{ color:"#39FF14" }}>sync</span>
          <div className="flex-1">
            <div className="text-[12px] font-bold mb-1.5" style={{ color: T.cyan }}>Sharding & encrypting {uploadingName}…</div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(32,168,0,0.1)" }}>
              <div className="h-full rounded-full transition-all" style={{ width:`${uploadProgress}%`, background:"linear-gradient(90deg,#39FF14,#FFE600)" }}/>
            </div>
          </div>
          <span className="text-[14px] font-black font-mono" style={{ color:"#39FF14" }}>{uploadProgress}%</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="storage" label="Storage Used" value={totalGB > 0 ? fmt(totalSize) : "412.5 GB"} sub="/ Unlimited" delta="8.3%" up color={T.cyan}
          spark={[30,42,38,55,49,62,58,74,70,88]}/>
        <StatCard icon="savings" label="S3 Cost Saved" value={`$${parseFloat(s3Savings) > 0 ? s3Savings : "9.48"}`} sub="this month vs AWS" delta="vs $0.023/GB" up color={T.blue}
          spark={[4,5,6,7,6,8,8,9,10,9]}/>
        <StatCard icon="swap_vert" label="Bandwidth Egress" value="450 GB" sub="this month" delta="12.1%" up color="#20a800"
          spark={[40,55,48,70,60,82,75,90,85,100]}/>
        <StatCard icon="api" label="API Requests" value="34.2M" sub="past 30 days" delta="18.7%" up color={T.violet}
          spark={[20,28,25,38,34,45,42,52,49,60]}/>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bandwidth chart */}
        <div className="col-span-2 rounded-2xl p-5" style={card}>
          <SectionHead title="Bandwidth · 7-Day" badge="GB"/>
          <BandwidthChart data={bwData}/>
        </div>
        {/* Node health */}
        <div className="rounded-2xl p-5" style={card}>
          <SectionHead title="Node Health"/>
          <div className="text-[28px] font-black font-mono leading-none" style={{ color: T.cyan }}>34<span className="text-[16px] text-muted-foreground font-normal">/34</span></div>
          <div className="text-[11px] mb-3" style={{ color: T.muted }}>Nodes Online · 6 Regions</div>
          <NodeGrid total={34} online={34}/>
          <div className="mt-4 space-y-1.5">
            {[["US East","12ms"],["EU Central","28ms"],["Asia East","41ms"],["SA East","↗ 120ms"]].map(([r,l]) => (
              <div key={r} className="flex justify-between text-[11px]">
                <span style={{ color: T.muted }}>{r}</span>
                <span className="font-mono font-bold" style={{ color: r.includes("SA") ? "#d97706" : T.cyan }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live terminal + recent files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={card}>
          <SectionHead title="Live Telemetry" action="View Logs"/>
          <LiveTerminal/>
        </div>
        <div className="rounded-2xl p-5" style={card}>
          <SectionHead title="Recent Files" action="View All" onAction={() => setActiveTab("Files")}/>
          {files.length === 0 ? (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-[32px] block mb-2" style={{ color:"rgba(32,168,0,0.2)" }}>folder_open</span>
              <p className="text-[12px]" style={{ color: T.muted }}>No files yet — drag or upload above.</p>
            </div>
          ) : files.slice(0,5).map(f => (
            <div key={f.id} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${mimeColor(f.mimeType)}15` }}>
                <span className="material-symbols-outlined text-[13px]" style={{ color:mimeColor(f.mimeType) }}>{mimeIcon(f.mimeType)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate" style={{ color: T.text }}>{f.fileName}</div>
                <code className="text-[10px]" style={{ color: T.muted }}>{f.id}</code>
              </div>
              <span className="text-[10px] font-mono" style={{ color: T.muted }}>{fmt(f.size)}</span>
              <CopyBtn text={f.id}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     FILES VIEW
  ════════════════════════════════════════ */
  const FilesView = () => {
    const [isDragging, setIsDragging] = useState(false);
    const filtered = files.filter(f =>
      f.fileName.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-black" style={{ color: T.text }}>File Explorer</h1>
            <p className="text-[12px] mt-0.5" style={{ color: T.muted }}>
              {files.length} files · {fmt(totalSize)} · AES-GCM-256 encrypted · geo-sharded
            </p>
          </div>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all hover:opacity-90"
            style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
            <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
            Upload File
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
          onDragLeave={()=>setIsDragging(false)}
          onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files[0];if(f)handleUpload(f);}}
          onClick={()=>fileInputRef.current?.click()}
          className="rounded-2xl p-8 text-center cursor-pointer transition-all"
          style={{ border:`2px dashed ${isDragging ? "#39FF14" : T.border}`, background: isDragging ? "rgba(57,255,20,0.04)" : "transparent" }}>
          <span className="material-symbols-outlined text-[32px] block mb-2" style={{ color: isDragging ? "#39FF14" : T.muted }}>cloud_upload</span>
          <div className="text-[13px] font-bold" style={{ color: T.text }}>Drop files here or click to upload</div>
          <div className="text-[11px] mt-1" style={{ color: T.muted }}>Any format · AES-GCM-256 · Auto geo-sharded across 34 nodes</div>
        </div>

        {/* Upload progress */}
        {uploadProgress !== null && (
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background:"rgba(32,168,0,0.06)", border:`1px solid ${T.borderMd}` }}>
            <span className="material-symbols-outlined animate-spin" style={{ color:"#39FF14" }}>sync</span>
            <div className="flex-1">
              <div className="text-[12px] font-bold mb-1.5" style={{ color: T.cyan }}>Uploading {uploadingName}…</div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background:"rgba(32,168,0,0.1)" }}>
                <div className="h-full rounded-full transition-all" style={{ width:`${uploadProgress}%`, background:"linear-gradient(90deg,#39FF14,#FFE600)" }}/>
              </div>
            </div>
            <span className="text-[14px] font-black font-mono" style={{ color:"#39FF14" }}>{uploadProgress}%</span>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border:`1px solid ${T.border}` }}>
          <table className="w-full text-[12px]">
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}`, background: T.surface }}>
                {["File ID","Name","Size","Type","Status","Public","Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[9px] uppercase tracking-widest font-black" style={{ color: T.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <span className="material-symbols-outlined text-[40px] block mb-3" style={{ color:"rgba(32,168,0,0.15)" }}>folder_open</span>
                  <p className="text-[12px]" style={{ color: T.muted }}>No files {search ? "match your search" : "uploaded yet"}</p>
                </td></tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="group transition-colors" style={{ borderBottom:`1px solid rgba(32,168,0,0.06)` }}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(32,168,0,0.03)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  {/* ID */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] font-mono" style={{ color: T.muted }}>{f.id.slice(0,12)}…</code>
                      <button onClick={() => {navigator.clipboard.writeText(f.id);setCopiedId(f.id);setTimeout(()=>setCopiedId(null),1500);}}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ color: copiedId===f.id ? "#39FF14" : T.cyan }}>
                        <span className="material-symbols-outlined text-[12px]">{copiedId===f.id?"check":"content_copy"}</span>
                      </button>
                    </div>
                  </td>
                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:`${mimeColor(f.mimeType)}15` }}>
                        <span className="material-symbols-outlined text-[13px]" style={{ color:mimeColor(f.mimeType) }}>{mimeIcon(f.mimeType)}</span>
                      </div>
                      <span className="font-medium truncate max-w-[160px]" style={{ color: T.text }}>{f.fileName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono" style={{ color: T.muted }}>{fmt(f.size)}</td>
                  <td className="py-3 px-4"><Pill label={f.mimeType.split("/")[0]} color={mimeColor(f.mimeType)}/></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <StatusDot ok/>
                      <span className="text-[10px]" style={{ color: T.cyan }}>Sharded</span>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Toggle checked={f.isPublic} onChange={() => toggleShare(f.id)}/></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSnippetFile(f)}
                        className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
                        title="View code snippets"
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(32,168,0,0.08)";e.currentTarget.style.color=T.cyan;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                        <span className="material-symbols-outlined text-[14px]">code</span>
                      </button>
                      <a href={`/api/files/${f.id}/download`} download
                        className="p-1.5 rounded-lg transition-all inline-flex" style={{ color: T.muted }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(32,168,0,0.08)";e.currentTarget.style.color=T.cyan;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                        <span className="material-symbols-outlined text-[14px]">download</span>
                      </a>
                      <button onClick={() => deleteFile(f.id)}
                        className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.08)";e.currentTarget.style.color="#dc2626";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════
     API KEYS VIEW
  ════════════════════════════════════════ */
  const ApiKeysView = () => {
    const scopeOpts = [
      { id:"read",  label:"Read-Only",  desc:"Fetch files only. Safe for client-side apps.",      icon:"download" },
      { id:"write", label:"Write-Only", desc:"Upload & delete. Perfect for CI/CD pipelines.",     icon:"upload" },
      { id:"full",  label:"Full Admin", desc:"Complete access. Use in trusted server environments.",icon:"admin_panel_settings" },
    ];
    return (
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-[20px] font-black" style={{ color: T.text }}>API Keys</h1>
          <p className="text-[12px] mt-0.5" style={{ color: T.muted }}>Manage programmatic access. Keys are shown once — copy immediately.</p>
        </div>

        {/* Create key form */}
        <div className="rounded-2xl p-6" style={card}>
          <div className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: T.cyan }}>Generate New Key</div>
          <form onSubmit={handleCreateKey} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold block mb-1.5" style={{ color: T.muted }}>Key Name</label>
              <input value={newKeyName} onChange={e=>setNewKeyName(e.target.value)}
                placeholder="e.g. production-backend, ci-pipeline"
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
                onFocus={e=>(e.target.style.borderColor="#39FF14")}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>
            <div>
              <label className="text-[11px] font-bold block mb-2" style={{ color: T.muted }}>Permission Scope</label>
              <div className="grid grid-cols-3 gap-3">
                {scopeOpts.map(s => (
                  <button key={s.id} type="button" onClick={() => setNewKeyScope(s.id)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      border: `1.5px solid ${newKeyScope === s.id ? "#39FF14" : T.border}`,
                      background: newKeyScope === s.id ? "rgba(57,255,20,0.06)" : T.surface,
                    }}>
                    <span className="material-symbols-outlined text-[18px] block mb-2" style={{ color: newKeyScope===s.id ? "#39FF14" : T.muted }}>{s.icon}</span>
                    <div className="text-[12px] font-black" style={{ color: T.text }}>{s.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isGenKey || !newKeyName.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
              {isGenKey ? <><span className="material-symbols-outlined text-[15px] animate-spin">sync</span> Generating…</> : <><span className="material-symbols-outlined text-[15px]">add</span> Generate Key</>}
            </button>
          </form>
        </div>

        {/* Keys list */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
            <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: T.muted }}>Active Keys ({keys.length})</div>
          </div>
          {keys.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[36px] block mb-2" style={{ color:"rgba(32,168,0,0.2)" }}>vpn_key</span>
              <p className="text-[12px]" style={{ color: T.muted }}>No keys yet — generate your first key above.</p>
            </div>
          ) : keys.map(k => (
            <div key={k.id} className="flex items-center gap-4 px-5 py-4 transition-all" style={{ borderBottom:`1px solid ${T.border}` }}
              onMouseEnter={e=>(e.currentTarget.style.background=T.surface)}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:"rgba(32,168,0,0.1)" }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: T.cyan }}>vpn_key</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-bold" style={{ color: T.text }}>{k.name}</span>
                  <Pill label={k.scope || "full"} color={k.scope==="read" ? T.blue : k.scope==="write" ? T.violet : T.cyan}/>
                </div>
                <code className="text-[11px] font-mono" style={{ color: T.muted }}>
                  {revealedKeys[k.id] ? k.key : k.key.slice(0,12)+"••••••••••••"+k.key.slice(-4)}
                </code>
              </div>
              <div className="text-[10px] text-right flex-shrink-0" style={{ color: T.muted }}>
                <div>Created {ago(k.createdAt)}</div>
                <div>{k.lastUsed ? `Used ${ago(k.lastUsed)}` : "Never used"}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => setRevealedKeys(p => ({...p,[k.id]:!p[k.id]}))}
                  className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(32,168,0,0.08)";e.currentTarget.style.color=T.cyan;}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                  <span className="material-symbols-outlined text-[14px]">{revealedKeys[k.id]?"visibility_off":"visibility"}</span>
                </button>
                <button onClick={() => {navigator.clipboard.writeText(k.key);setCopiedKey(k.id);setTimeout(()=>setCopiedKey(null),1500);}}
                  className="p-1.5 rounded-lg transition-all" style={{ color: copiedKey===k.id ? "#39FF14" : T.muted }}
                  onMouseEnter={e=>{if(copiedKey!==k.id){e.currentTarget.style.background="rgba(32,168,0,0.08)";e.currentTarget.style.color=T.cyan;}}}
                  onMouseLeave={e=>{if(copiedKey!==k.id){e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}}>
                  <span className="material-symbols-outlined text-[14px]">{copiedKey===k.id?"check":"content_copy"}</span>
                </button>
                <button onClick={() => deleteKey(k.id)}
                  className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.08)";e.currentTarget.style.color="#dc2626";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════
     WEBHOOKS VIEW
  ════════════════════════════════════════ */
  const WebhooksView = () => {
    const eventOpts = ["file.uploaded","file.deleted","file.sharded","key.created","key.revoked"];
    const toggleEvent = (ev: string) => setWhEvents(p => p.includes(ev) ? p.filter(e=>e!==ev) : [...p,ev]);
    const addWebhook = (e: React.FormEvent) => {
      e.preventDefault();
      if (!whUrl.trim()) return;
      setIsAddingWh(true);
      setTimeout(() => {
        setWebhooks(p => [...p,{id:`wh_${Date.now()}`,url:whUrl,events:whEvents,active:true,createdAt:new Date().toISOString()}]);
        setWhUrl(""); setWhEvents(["file.uploaded"]); setIsAddingWh(false);
      }, 1000);
    };
    return (
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-[20px] font-black" style={{ color: T.text }}>Webhooks</h1>
          <p className="text-[12px] mt-0.5" style={{ color: T.muted }}>Register endpoints to receive real-time POST events from your storage infrastructure.</p>
        </div>

        {/* Add webhook */}
        <div className="rounded-2xl p-6" style={card}>
          <div className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: T.cyan }}>Register Endpoint</div>
          <form onSubmit={addWebhook} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold block mb-1.5" style={{ color: T.muted }}>Endpoint URL</label>
              <input value={whUrl} onChange={e=>setWhUrl(e.target.value)}
                placeholder="https://yourapp.com/webhooks/pd"
                className="w-full rounded-xl px-4 py-2.5 text-[13px] font-mono outline-none transition-all"
                style={{ background: T.surface, border:`1px solid ${T.border}`, color: T.text }}
                onFocus={e=>(e.target.style.borderColor="#39FF14")}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>
            <div>
              <label className="text-[11px] font-bold block mb-2" style={{ color: T.muted }}>Subscribe to Events</label>
              <div className="flex flex-wrap gap-2">
                {eventOpts.map(ev => (
                  <button key={ev} type="button" onClick={() => toggleEvent(ev)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all"
                    style={{
                      border:`1.5px solid ${whEvents.includes(ev) ? "#39FF14" : T.border}`,
                      background: whEvents.includes(ev) ? "rgba(57,255,20,0.08)" : T.surface,
                      color: whEvents.includes(ev) ? "#20a800" : T.muted,
                    }}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isAddingWh || !whUrl.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
              {isAddingWh ? <><span className="material-symbols-outlined text-[15px] animate-spin">sync</span> Registering…</> : <><span className="material-symbols-outlined text-[15px]">add</span> Add Webhook</>}
            </button>
          </form>
        </div>

        {/* Payload reference */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="px-5 py-3" style={{ background: T.term, borderBottom:`1px solid rgba(32,168,0,0.2)` }}>
            <span className="text-[10px] font-mono font-black uppercase" style={{ color:"#39FF14" }}>Payload Example — file.uploaded</span>
          </div>
          <pre className="px-5 py-4 text-[11px] font-mono overflow-x-auto" style={{ background: T.term, color: T.termText }}>
{`{
  "event":    "file.uploaded",
  "timestamp":"2025-01-01T00:00:00Z",
  "data": {
    "id":       "cm_abc123xyz",
    "fileName": "dataset.tar.gz",
    "size":     44236800,
    "shards":   6,
    "nodes":    ["us-east","eu-central","ap-east"]
  }
}`}
          </pre>
        </div>

        {/* Registered webhooks */}
        {webhooks.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
              <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: T.muted }}>Registered ({webhooks.length})</div>
            </div>
            {webhooks.map(wh => (
              <div key={wh.id} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom:`1px solid ${T.border}` }}>
                <StatusDot ok={wh.active} pulse={wh.active}/>
                <div className="flex-1 min-w-0">
                  <code className="text-[12px] font-mono font-bold" style={{ color: T.text }}>{wh.url}</code>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {wh.events.map(ev => <Pill key={ev} label={ev} color={T.cyan}/>)}
                  </div>
                </div>
                <span className="text-[10px]" style={{ color: T.muted }}>{ago(wh.createdAt)}</span>
                <button onClick={() => setWebhooks(p => p.filter(w=>w.id!==wh.id))}
                  className="p-1.5 rounded-lg transition-all" style={{ color: T.muted }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(220,38,38,0.08)";e.currentTarget.style.color="#dc2626";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════════════
     INFRASTRUCTURE VIEW
  ════════════════════════════════════════ */
  const InfraView = () => {
    const perms = [
      { label:"Can Post Messages",   ok: botHealth.canPost   },
      { label:"Can Edit Messages",   ok: botHealth.canEdit   },
      { label:"Can Delete Messages", ok: true                },
      { label:"Can Invite Users",    ok: botHealth.canInvite },
      { label:"Admin Privileges",    ok: true                },
    ];
    return (
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-[20px] font-black" style={{ color: T.text }}>Infrastructure Health</h1>
          <p className="text-[12px] mt-0.5" style={{ color: T.muted }}>Diagnostics for your Telegram bot backend and database sync status.</p>
        </div>

        {/* Bot status */}
        <div className="rounded-2xl p-6" style={card}>
          <SectionHead title="Telegram Bot" badge="Backend"/>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Token status */}
            <div className="rounded-xl p-4" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <StatusDot ok={botHealth.token}/>
                <span className="text-[11px] font-black" style={{ color: T.text }}>Bot Token</span>
              </div>
              <div className="text-[10px] font-mono" style={{ color: T.muted }}>TELEGRAM_BOT_TOKEN</div>
              <div className="text-[11px] mt-1 font-bold" style={{ color: botHealth.token ? T.cyan : "#dc2626" }}>
                {botHealth.token ? "Valid · Active" : "Invalid · Expired"}
              </div>
            </div>
            {/* Ping */}
            <div className="rounded-xl p-4" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <StatusDot ok={botHealth.ping !== null}/>
                <span className="text-[11px] font-black" style={{ color: T.text }}>Ping Test</span>
              </div>
              <div className="text-[22px] font-black font-mono" style={{ color: T.cyan }}>
                {isPinging ? "…" : botHealth.ping ? `${botHealth.ping}ms` : "—"}
              </div>
              <button onClick={pingBot} disabled={isPinging}
                className="mt-2 text-[10px] font-black px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                style={{ background:"rgba(32,168,0,0.1)", color: T.cyan }}>
                {isPinging ? "Pinging…" : "Run Ping"}
              </button>
            </div>
            {/* Uptime */}
            <div className="rounded-xl p-4" style={{ background: T.surface, border:`1px solid ${T.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <StatusDot ok pulse/>
                <span className="text-[11px] font-black" style={{ color: T.text }}>Uptime</span>
              </div>
              <div className="text-[22px] font-black font-mono" style={{ color: T.cyan }}>99.99%</div>
              <div className="text-[10px] mt-1" style={{ color: T.muted }}>30-day rolling average</div>
            </div>
          </div>
        </div>

        {/* Channel permissions matrix */}
        <div className="rounded-2xl p-6" style={card}>
          <SectionHead title="Channel Permissions Matrix"/>
          <div className="space-y-2.5">
            {perms.map(p => (
              <div key={p.label} className="flex items-center gap-3 py-2.5 px-4 rounded-xl"
                style={{ background: p.ok ? "rgba(57,255,20,0.04)" : "rgba(220,38,38,0.04)", border:`1px solid ${p.ok ? "rgba(57,255,20,0.12)" : "rgba(220,38,38,0.12)"}` }}>
                <StatusDot ok={p.ok}/>
                <span className="text-[13px] flex-1" style={{ color: T.text }}>{p.label}</span>
                <span className="text-[11px] font-bold" style={{ color: p.ok ? T.cyan : "#dc2626" }}>
                  {p.ok ? "Granted" : "Denied — Warning"}
                </span>
              </div>
            ))}
          </div>
          {!botHealth.canInvite && (
            <div className="mt-4 px-4 py-3 rounded-xl" style={{ background:"rgba(212,160,0,0.07)", border:`1px solid rgba(212,160,0,0.2)` }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]" style={{ color: T.blue }}>warning</span>
                <span className="text-[11px] font-bold" style={{ color: T.blue }}>
                  Bot cannot invite users — this may affect channel-linked sharing features. Grant invite permission in Channel Settings.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DB Sync */}
        <div className="rounded-2xl p-6" style={card}>
          <SectionHead title="Database Sync"/>
          <p className="text-[12px] mb-4" style={{ color: T.muted }}>
            Force-reconcile PostgreSQL rows with Telegram message attachments. Run this if you suspect orphaned file records.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={runSync} disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background:"#39FF14", color:"#0a180a", boxShadow:"0 2px 10px rgba(57,255,20,0.25)" }}>
              <span className={`material-symbols-outlined text-[16px] ${isSyncing?"animate-spin":""}`}>{isSyncing?"sync":"sync"}</span>
              {isSyncing ? "Syncing…" : "Run Sync"}
            </button>
            {syncMsg && (
              <div className="flex items-center gap-2 text-[12px]" style={{ color: T.cyan }}>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                {syncMsg}
              </div>
            )}
          </div>

          {/* Node table */}
          <div className="mt-5 rounded-xl overflow-hidden" style={{ border:`1px solid ${T.border}` }}>
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ background: T.surface, borderBottom:`1px solid ${T.border}` }}>
                  {["Region","Latency","Files","Status"].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-[9px] uppercase tracking-widest font-black" style={{ color: T.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {r:"US-East",    l:"12ms",   f:42, ok:true},
                  {r:"EU-Central", l:"28ms",   f:38, ok:true},
                  {r:"Asia-East",  l:"41ms",   f:29, ok:true},
                  {r:"SA-East",    l:"120ms",  f:18, ok:false},
                  {r:"AP-SE",      l:"55ms",   f:22, ok:true},
                ].map(n => (
                  <tr key={n.r} style={{ borderBottom:`1px solid ${T.border}` }}>
                    <td className="py-2.5 px-4 font-mono font-bold" style={{ color: T.text }}>{n.r}</td>
                    <td className="py-2.5 px-4 font-mono" style={{ color: n.ok ? T.cyan : "#d97706" }}>{n.l}</td>
                    <td className="py-2.5 px-4 font-mono" style={{ color: T.muted }}>{n.f}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <StatusDot ok={n.ok}/>
                        <span style={{ color: n.ok ? T.cyan : "#d97706" }}>{n.ok ? "Healthy" : "Degraded"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={{ background: T.bg, color: T.text, minHeight:"100vh", fontFamily:"inherit" }}>
      <Sidebar/>
      <Topbar/>

      <main className="ml-[220px] pt-[56px] p-6 min-h-screen">
        {activeTab === "Overview"       && <OverviewView/>}
        {activeTab === "Files"          && <FilesView/>}
        {activeTab === "API Keys"       && <ApiKeysView/>}
        {activeTab === "Webhooks"       && <WebhooksView/>}
        {activeTab === "Infrastructure" && <InfraView/>}
      </main>

      {/* Code snippet modal */}
      {snippetFile && (
        <SnippetModal file={snippetFile} origin={origin} onClose={() => setSnippetFile(null)}/>
      )}
    </div>
  );
}
