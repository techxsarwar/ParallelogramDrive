"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

interface FileMeta {
  id: string;
  fileName: string;
  size: number;
  mimeType: string;
  isPublic: boolean;
  createdAt: string;
}

function getMaterialIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "movie";
  if (mimeType.includes("zip") || mimeType.includes("tar") || mimeType.includes("rar"))
    return "folder_zip";
  if (mimeType.startsWith("text/") || mimeType.includes("pdf") || mimeType.includes("document"))
    return "description";
  return "draft";
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { user } = useUser();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<FileMeta | null>(null);

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    if (res.ok) setFiles(await res.json());
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = async () => {
      if (xhr.status === 200) await fetchFiles();
      setIsUploading(false); setUploadProgress(0); setUploadFileName("");
    };
    xhr.onerror = () => setIsUploading(false);
    xhr.send(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileUpload(f);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileUpload(f);
  };

  const toggleShare = async (id: string) => {
    const res = await fetch(`/api/files/${id}/share`, { method: "POST" });
    if (res.ok) fetchFiles();
  };

  const copyPublicLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/public/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    fetch(`/api/files/${id}`, { method: "DELETE" }).catch(console.error);
  };

  const totalSize = files.reduce((a, c) => a + c.size, 0);
  const gbUsed = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
  const percentUsed = Math.min((totalSize / (2 * 1024 * 1024 * 1024 * 1024)) * 100, 100);

  let displayed = files;
  if (search.trim()) displayed = displayed.filter(f => f.fileName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div 
      className="text-on-background font-body-sm text-body-sm h-screen overflow-hidden flex bg-[#050505]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm border-2 border-dashed border-primary pointer-events-none">
          <span className="material-symbols-outlined text-[64px] text-primary animate-bounce drop-shadow-[0_0_20px_rgba(123,47,247,0.8)]">cloud_upload</span>
          <p className="text-2xl font-bold text-primary mt-4">Drop to upload</p>
        </div>
      )}

      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col w-64 bg-surface-container-low/90 dark:bg-surface-container-low/90 backdrop-blur-2xl border-r border-outline/10 fixed left-0 top-0 h-full py-6 overflow-y-auto z-40">
        <Link href="/" className="px-6 mb-8 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center glow-effect shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">Parallelogram</h1>
            <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">Distributed Network</p>
          </div>
        </Link>
        <div className="flex-1 px-3 space-y-1">
          <a onClick={() => setActiveTab("Dashboard")} className={`${activeTab === "Dashboard" ? "bg-primary-container/20 text-primary border-r-2 border-primary" : "text-on-surface-variant hover:bg-surface-container-high"} flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-caps text-label-caps">Dashboard</span>
          </a>
          <a onClick={() => setActiveTab("File Manager")} className={`${activeTab === "File Manager" ? "bg-primary-container/20 text-primary border-r-2 border-primary" : "text-on-surface-variant hover:bg-surface-container-high"} flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all`}>
            <span className="material-symbols-outlined">folder_shared</span>
            <span className="font-label-caps text-label-caps">File Manager</span>
          </a>
          <a className="text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors duration-200 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">hub</span>
            <span className="font-label-caps text-label-caps">Nodes</span>
          </a>
          <a className="text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors duration-200 rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-caps text-label-caps">Settings</span>
          </a>
        </div>
        <div className="px-6 mt-8 space-y-4">
          <label className="w-full relative overflow-hidden bg-surface-container-high hover:bg-surface-bright text-primary border border-primary/20 rounded-lg py-3 flex justify-center items-center gap-2 transition-all duration-300 cursor-pointer group">
            <input type="file" className="hidden" onChange={handleInputChange} disabled={isUploading} />
            <span className="font-label-caps text-label-caps relative z-10">Upload File</span>
            <span className="material-symbols-outlined text-sm relative z-10 group-hover:-translate-y-1 transition-transform">upload</span>
          </label>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-64 h-full overflow-y-auto relative pb-20 md:pb-0">
        
        {/* Top Header Area */}
        <div className="hidden md:flex justify-between items-center px-margin-desktop py-6 max-w-max-width mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-b border-outline/20 focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/50 w-64 py-2 pl-8 pr-4 font-body-sm transition-all focus:outline-none focus:border-b-2" 
                placeholder="Search network..." 
              />
              <span className="material-symbols-outlined absolute left-0 top-2.5 text-on-surface-variant text-sm">search</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-code-sm text-code-sm text-primary">
              <span className="w-2 h-2 rounded-full bg-primary node-pulse"></span>
              <span>SYNCING [99.8%]</span>
            </div>
            <div className="h-6 w-px bg-outline/20"></div>
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-outline/20" } }} />
          </div>
        </div>

        <div className="px-margin-mobile md:px-margin-desktop py-6 max-w-max-width mx-auto space-y-gutter">
          
          {isUploading && (
            <div className="glass-panel rounded-xl p-6 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-4 relative z-10 w-full">
                <span className="material-symbols-outlined text-primary animate-pulse">cloud_upload</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2 font-body-sm text-on-surface">
                    <span className="truncate max-w-xs">{uploadFileName}</span>
                    <span className="text-primary font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-tertiary-container to-primary h-1.5 rounded-full shadow-[0_0_10px_#8A2BE2]" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero / Action Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <div className="lg:col-span-2 glass-panel rounded-xl p-8 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/20 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Secure Distributed Storage</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">Your files are encrypted and sharded across active nodes globally, ensuring zero downtime.</p>
              </div>
              <div className="mt-8 relative z-10 flex gap-4">
                <label className="relative overflow-hidden bg-primary-container text-on-primary-container font-label-caps text-label-caps px-6 py-3 rounded-lg flex items-center gap-2 hover:scale-[1.02] transition-transform glow-effect cursor-pointer">
                  <input type="file" className="hidden" onChange={handleInputChange} disabled={isUploading} />
                  <div className="beam"></div>
                  <span className="material-symbols-outlined text-sm relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                  <span className="relative z-10">Upload File</span>
                </label>
              </div>
            </div>

            {/* Storage Summary Card */}
            <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Network Storage</h3>
                <span className="material-symbols-outlined text-primary">hard_drive</span>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-display-lg text-display-lg text-on-surface">{gbUsed}</span>
                  <span className="font-headline-md text-headline-md text-on-surface-variant pb-1">GB</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">of Unlimited allocated</p>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mb-2 relative overflow-hidden">
                <div className="bg-gradient-to-r from-tertiary-container to-primary h-1.5 rounded-full" style={{ width: `${Math.max(percentUsed, 1)}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-code-sm text-on-surface-variant">
                <span>{files.length} Total Files</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-6">File Overview</h3>
            <div className="space-y-4">
              {displayed.length === 0 && (
                <div className="py-8 text-center text-on-surface-variant font-body-sm">
                   No files found. Upload something to get started.
                </div>
              )}
              {displayed.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded hover:bg-surface-container transition-colors cursor-pointer group" onClick={() => setPreviewFile(file)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center shrink-0 border border-outline/20">
                      <span className="material-symbols-outlined text-[18px] text-primary">{getMaterialIcon(file.mimeType)}</span>
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{file.fileName}</p>
                      <p className="font-code-sm text-[10px] text-on-surface-variant">{formatSize(file.size)} • {timeAgo(file.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); file.isPublic ? copyPublicLink(file.id) : toggleShare(file.id); }}
                      title={file.isPublic ? "Copy link" : "Share"}
                      className={`p-2 rounded hover:bg-surface-container-highest transition-colors ${file.isPublic ? "text-primary" : "text-on-surface-variant"}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{copiedId === file.id ? 'check' : 'share'}</span>
                    </button>
                    <a href={`/api/download/${file.id}`} download className="p-2 rounded hover:bg-surface-container-highest text-on-surface-variant hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </a>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="p-2 rounded hover:bg-error-container text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-6">
          <div className="relative bg-surface-container-lowest border border-outline/20 rounded-3xl shadow-[0_0_80px_rgba(123,47,247,0.2)] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10 bg-surface-container-low">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{getMaterialIcon(previewFile.mimeType)}</span>
                <div>
                  <p className="font-semibold text-sm text-on-surface truncate max-w-xs">{previewFile.fileName}</p>
                  <p className="text-[10px] font-code-sm text-on-surface-variant">{formatSize(previewFile.size)} · {previewFile.mimeType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`/api/download/${previewFile.id}`} download className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-white bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-[16px]">download</span> Download
                </a>
                <button onClick={() => setPreviewFile(null)} className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white transition-all">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            {/* Preview body */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-surface-dim min-h-[300px] p-6 w-full">
              {previewFile.mimeType.startsWith("video/") && (
                <div className="w-full h-full flex items-center justify-center">
                  <CustomVideoPlayer src={`/api/stream/${previewFile.id}`} />
                </div>
              )}
              {previewFile.mimeType.startsWith("audio/") && (
                <div className="p-12 flex flex-col items-center gap-6 glass-panel rounded-3xl">
                  <div className="w-24 h-24 rounded-full bg-primary-container/20 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_40px_rgba(123,47,247,0.3)] node-pulse">
                    <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface">{previewFile.fileName}</p>
                  <audio src={`/api/stream/${previewFile.id}`} controls autoPlay className="w-full max-w-md" />
                </div>
              )}
              {previewFile.mimeType.startsWith("image/") && (
                <img src={`/api/stream/${previewFile.id}`} alt={previewFile.fileName} className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl" />
              )}
              {!previewFile.mimeType.startsWith("video/") &&
               !previewFile.mimeType.startsWith("audio/") &&
               !previewFile.mimeType.startsWith("image/") && (
                <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant glass-panel rounded-3xl">
                  <span className="material-symbols-outlined text-[64px] mb-4 opacity-50">{getMaterialIcon(previewFile.mimeType)}</span>
                  <p className="text-sm font-medium text-on-surface">Preview not available</p>
                  <p className="text-xs mt-1 opacity-70">Download the file to open it locally.</p>
                  <a href={`/api/download/${previewFile.id}`} download className="mt-8 flex items-center gap-2 bg-primary-container hover:bg-inverse-primary text-white px-6 py-3 rounded-xl font-bold transition-all glow-effect">
                    <span className="material-symbols-outlined text-[18px]">download</span> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
