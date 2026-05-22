"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Folder, File as FileIcon, Upload, Trash2, Clock, Share2, Search, Bell, Download, Link as LinkIcon, Check, Globe, LayoutGrid, List } from "lucide-react";
import Link from "next/link";

interface FileMeta {
  id: string;
  fileName: string;
  size: number;
  mimeType: string;
  isPublic: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    if (res.ok) {
      const data = await res.json();
      setFiles(data);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200) {
        await fetchFiles();
      } else {
        alert("Upload failed: " + xhr.responseText);
      }
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      alert("An error occurred during upload.");
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    handleFileUpload(selectedFile);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const toggleShare = async (id: string) => {
    const res = await fetch(`/api/files/${id}/share`, { method: "POST" });
    if (res.ok) {
      fetchFiles();
    }
  };

  const copyPublicLink = (id: string) => {
    const url = `${window.location.origin}/api/public/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
  const mediaSize = files.filter(f => f.mimeType.includes('image') || f.mimeType.includes('video')).reduce((a,c) => a+c.size, 0);
  const documentSize = totalSize - mediaSize;

  const totalSizeGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
  const maxStorageGB = 500; // Fake limit for UI donut chart

  return (
    <div className="min-h-screen bg-[#060608] text-white flex overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#8A2BE2]/10 blur-[150px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-[260px] border-r border-white/5 flex flex-col p-5 bg-[#0a0a0e]/50 backdrop-blur-2xl z-10">
        <Link href="/" className="flex items-center gap-3 mb-10 px-2 group">
          <div className="w-7 h-7 border-2 border-[#8A2BE2] transform -skew-x-12 shadow-[0_0_15px_rgba(138,43,226,0.5)] group-hover:shadow-[0_0_25px_rgba(138,43,226,0.8)] transition-all" />
          <span className="font-semibold tracking-tight text-base">Parallelogram<span className="text-[#8A2BE2]">Drive</span></span>
        </Link>
        
        <label className="mb-8 block cursor-pointer group">
          <input type="file" className="hidden" onChange={handleInputChange} disabled={isUploading} />
          <div className="bg-[#8A2BE2] group-hover:bg-[#9B30FF] group-hover:shadow-[0_0_20px_rgba(138,43,226,0.4)] text-white rounded-xl py-3 flex items-center justify-center gap-2 font-medium transition-all transform group-active:scale-95">
             <Upload className="w-4 h-4" /> Upload New
          </div>
        </label>

        <nav className="space-y-1.5 flex-1">
          <NavItem icon={<Folder className="w-[18px] h-[18px]" />} label="Dashboard" active />
          <NavItem icon={<FileIcon className="w-[18px] h-[18px]" />} label="My Files" />
          <NavItem icon={<Share2 className="w-[18px] h-[18px]" />} label="Shared with me" />
          <NavItem icon={<Clock className="w-[18px] h-[18px]" />} label="Recent" />
          <NavItem icon={<Trash2 className="w-[18px] h-[18px]" />} label="Trash" />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="px-2 mb-2 text-[11px] font-bold text-zinc-500 tracking-wider">STORAGE</div>
          <div className="px-2 mb-6">
             <div className="text-xs font-semibold mb-2">{formatSize(totalSize)} <span className="text-zinc-500 font-normal">/ Unlimited</span></div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-[#8A2BE2] to-[#B026FF] w-[5%] shadow-[0_0_10px_#8A2BE2]" />
             </div>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
             <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
               <img src={user?.imageUrl || "https://api.dicebear.com/7.x/avataaars/svg"} alt="User" />
             </div>
             <div className="flex-1 min-w-0">
               <div className="text-sm font-semibold truncate">{user?.firstName || "User"}</div>
               <div className="text-xs text-zinc-400 truncate">{user?.primaryEmailAddress?.emailAddress || "user@example.com"}</div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 relative z-10 ${isDragging ? 'bg-[#8A2BE2]/5' : 'bg-transparent'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a0c]/80 backdrop-blur-sm border-2 border-dashed border-[#8A2BE2] m-4 rounded-3xl pointer-events-none">
            <div className="text-3xl font-bold text-[#8A2BE2] drop-shadow-[0_0_15px_rgba(138,43,226,0.8)] animate-pulse">
               Drop files to upload instantly
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-10">
           <div>
             <h2 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.firstName || "User"} 👋</h2>
             <p className="text-zinc-500 text-sm mt-1">Here's what's happening with your storage today.</p>
           </div>
           <div className="flex items-center gap-5">
              <div className="relative group">
                 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#8A2BE2] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search files..." 
                   className="bg-[#111116] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-[#8A2BE2]/50 focus:bg-[#1a1a24] transition-all placeholder:text-zinc-600"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">⌘K</div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-[#111116] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all relative">
                 <Bell className="w-4 h-4" />
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#8A2BE2] rounded-full border-2 border-[#111116]" />
              </button>
           </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto px-10 pb-10">
          
          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="mb-8 bg-[#111116] border border-[#8A2BE2]/40 rounded-2xl p-5 flex items-center gap-5 shadow-[0_0_30px_rgba(138,43,226,0.15)] animate-in slide-in-from-top-4">
              <div className="w-12 h-12 rounded-xl bg-[#8A2BE2]/20 flex items-center justify-center animate-pulse">
                 <Upload className="w-6 h-6 text-[#8A2BE2]" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-white">Uploading file to Telegram nodes...</span>
                    <span className="text-[#8A2BE2] font-bold">{uploadProgress}%</span>
                 </div>
                 <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                   <div 
                     className="h-full bg-gradient-to-r from-[#8A2BE2] to-[#D400FF] transition-all duration-300 ease-out shadow-[0_0_10px_#8A2BE2]" 
                     style={{ width: `${uploadProgress}%` }} 
                   />
                 </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-10">
            <StatCard title="Total Files" value={files.length.toString()} trend="+12 this week" icon={<Folder className="w-5 h-5 text-purple-400" />} />
            <StatCard title="Total Size" value={formatSize(totalSize)} trend="Unlimited storage" icon={<FileIcon className="w-5 h-5 text-blue-400" />} />
            <StatCard title="Uploads" value={files.length.toString()} trend="+8 today" icon={<Upload className="w-5 h-5 text-green-400" />} />
            <StatCard title="Downloads" value="0" trend="+0 today" icon={<Download className="w-5 h-5 text-[#8A2BE2]" />} />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">My Files</h3>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#111116] rounded-lg p-1 border border-white/5">
                <button className="p-1.5 bg-white/10 rounded-md text-white shadow-sm"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-1.5 text-zinc-500 hover:text-white rounded-md"><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          
          {/* File List */}
          <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider bg-[#15151A]">
               <div className="col-span-5">Name</div>
               <div className="col-span-2">Size</div>
               <div className="col-span-3">Date Added</div>
               <div className="col-span-2 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-white/5">
               {files.length === 0 ? (
                 <div className="p-16 flex flex-col items-center justify-center text-zinc-500">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 border-dashed">
                      <Upload className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h4 className="text-white font-medium text-lg mb-2">No files uploaded yet</h4>
                    <p className="text-sm">Drag and drop files here to store them infinitely.</p>
                 </div>
               ) : (
                 files.map(file => (
                   <div key={file.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#1A1A24] transition-all group cursor-default">
                     <div className="col-span-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-[#8A2BE2]/10 group-hover:border-[#8A2BE2]/30 transition-colors">
                           <FileIcon className={`w-5 h-5 ${file.isPublic ? 'text-[#8A2BE2]' : 'text-zinc-400'}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                           <span className="font-medium text-sm truncate text-zinc-200 group-hover:text-white transition-colors">{file.fileName}</span>
                           <span className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5 flex items-center gap-2">
                              {file.mimeType.split('/')[1] || 'FILE'}
                              {file.isPublic && <span className="text-[#8A2BE2] font-semibold bg-[#8A2BE2]/10 px-1.5 py-0.5 rounded">PUBLIC LINK</span>}
                           </span>
                        </div>
                     </div>
                     <div className="col-span-2 text-sm text-zinc-400 font-medium">{formatSize(file.size)}</div>
                     <div className="col-span-3 text-sm text-zinc-400">{new Date(file.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                     <div className="col-span-2 flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        <button 
                           onClick={() => toggleShare(file.id)}
                           title={file.isPublic ? "Make private" : "Make public"}
                           className={`p-2 rounded-lg transition-all ${file.isPublic ? 'text-[#8A2BE2] bg-[#8A2BE2]/10 hover:bg-[#8A2BE2]/20 border border-[#8A2BE2]/30' : 'text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'}`}
                        >
                           <Share2 className="w-4 h-4" />
                        </button>

                        {file.isPublic && (
                          <button 
                             onClick={() => copyPublicLink(file.id)}
                             title="Copy public link"
                             className="p-2 text-[#8A2BE2] hover:text-white hover:bg-[#8A2BE2]/20 bg-[#8A2BE2]/10 rounded-lg transition-all border border-[#8A2BE2]/30"
                          >
                             {copiedId === file.id ? <Check className="w-4 h-4 text-green-400" /> : <LinkIcon className="w-4 h-4" />}
                          </button>
                        )}

                        <a href={`/api/download/${file.id}`} download className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg transition-all ml-2 shadow-sm">
                           <Download className="w-4 h-4" />
                        </a>
                        <button className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 rounded-lg transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Storage Overview */}
      <aside className="w-[320px] border-l border-white/5 p-6 bg-[#0a0a0e]/50 backdrop-blur-xl z-10 flex flex-col hidden lg:flex">
         <h3 className="text-sm font-semibold mb-6">Storage Overview</h3>
         
         {/* Donut Chart placeholder */}
         <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
              {/* Foreground circle */}
              <circle 
                cx="50" cy="50" r="40" 
                stroke="url(#gradient)" 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray={`${(totalSizeGB / maxStorageGB) * 251 || 5} 251`} 
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(138,43,226,0.5)]"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8A2BE2" />
                  <stop offset="100%" stopColor="#D400FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-white">{totalSizeGB} GB</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Used</span>
            </div>
         </div>

         {/* Legend */}
         <div className="space-y-3 mb-10">
            <div className="flex items-center justify-between text-sm">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2] shadow-[0_0_8px_#8A2BE2]" />
                 <span className="text-zinc-400 font-medium">Documents</span>
               </div>
               <span className="text-white font-medium">{formatSize(documentSize)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#D400FF] shadow-[0_0_8px_#D400FF]" />
                 <span className="text-zinc-400 font-medium">Media</span>
               </div>
               <span className="text-white font-medium">{formatSize(mediaSize)}</span>
            </div>
         </div>

         <div className="w-full h-px bg-white/5 mb-8" />

         <h3 className="text-sm font-semibold mb-6 flex items-center justify-between">
           Active Nodes
           <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> 12 Online
           </span>
         </h3>
         
         <div className="bg-[#111116] rounded-xl p-4 border border-white/5 mb-6 relative overflow-hidden group">
            {/* Abstract Map placeholder */}
            <Globe className="w-full h-24 text-white/5 group-hover:text-white/10 transition-colors" />
            <div className="absolute top-8 left-10 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_10px_#8A2BE2] animate-ping" />
            <div className="absolute bottom-6 right-12 w-1.5 h-1.5 bg-[#D400FF] rounded-full shadow-[0_0_10px_#D400FF] animate-pulse" />
            <div className="absolute top-12 right-20 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_10px_#8A2BE2] animate-ping" delay-75 />
         </div>
         <p className="text-xs text-zinc-500 leading-relaxed mb-6">
           Your data is distributed across Telegram's 12 parallel nodes worldwide for maximum redundancy.
         </p>

         <button className="w-full py-2.5 bg-[#111116] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-sm font-medium transition-all text-white shadow-sm">
            View All Nodes
         </button>

         <div className="mt-auto">
           <h3 className="text-sm font-semibold mb-4">Shortcuts</h3>
           <div className="grid grid-cols-2 gap-3">
             <button className="py-2 bg-[#111116] hover:bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-zinc-300 transition-colors">
                Create Folder
             </button>
             <button className="py-2 bg-[#111116] hover:bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-zinc-300 transition-colors">
                Share Files
             </button>
           </div>
         </div>
      </aside>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-semibold ${active ? 'bg-[#8A2BE2]/10 text-[#8A2BE2] border border-[#8A2BE2]/20' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'}`}>
      {icon}
      {label}
    </div>
  )
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 flex items-start justify-between hover:border-white/10 transition-colors shadow-lg">
      <div>
         <div className="text-zinc-400 text-xs font-bold tracking-wider uppercase mb-2">{title}</div>
         <div className="text-3xl font-bold tracking-tight mb-2 text-white">{value}</div>
         <div className="text-[11px] font-semibold text-green-400 flex items-center gap-1">
            {trend}
         </div>
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shadow-inner">
         {icon}
      </div>
    </div>
  )
}
