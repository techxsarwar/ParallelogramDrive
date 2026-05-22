import Link from "next/link";
import { ArrowRight, Box, Shield, Zap, Network, Globe, Lock, Upload } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans overflow-hidden">
      
      {/* Abstract Glowing Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#8A2BE2]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D400FF]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-full max-w-[1000px] h-full pointer-events-none z-0">
         <div className="absolute inset-0 border-[1px] border-white/[0.03] transform -skew-x-[25deg] shadow-[0_0_50px_rgba(138,43,226,0.1)] rounded-3xl" />
         <div className="absolute inset-4 border-[1px] border-white/[0.02] transform -skew-x-[25deg] rounded-3xl" />
         <div className="absolute inset-8 border-[1px] border-white/[0.01] transform -skew-x-[25deg] rounded-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto backdrop-blur-md border-b border-white/5 bg-[#050508]/50 rounded-b-3xl mb-12">
        <div className="flex items-center gap-3 group">
          <div className="w-8 h-8 border-2 border-[#8A2BE2] transform -skew-x-12 shadow-[0_0_15px_rgba(138,43,226,0.5)] group-hover:shadow-[0_0_25px_rgba(138,43,226,0.8)] transition-all duration-300" />
          <span className="font-bold tracking-tight text-lg">Parallelogram<span className="text-[#8A2BE2]">Drive</span></span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-zinc-400">
          <Link href="#features" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Features</Link>
          <Link href="#how-it-works" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">How it works</Link>
          <Link href="#security" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Security</Link>
          <Link href="#faq" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">FAQ</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link href="https://github.com/techxsarwar/ParallelogramDrive" target="_blank" className="hidden md:flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            Star on GitHub
          </Link>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-[#8A2BE2] hover:bg-[#9B30FF] text-white text-sm font-bold px-7 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.4)] hover:shadow-[0_0_25px_rgba(138,43,226,0.6)] transform hover:scale-105">
                Sign In
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="bg-[#8A2BE2] hover:bg-[#9B30FF] text-white text-sm font-bold px-7 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.4)] hover:shadow-[0_0_25px_rgba(138,43,226,0.6)] mr-4 transform hover:scale-105">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10 border-2 border-white/10 shadow-[0_0_15px_rgba(138,43,226,0.3)]" } }} />
          </Show>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 gap-16 items-center min-h-[85vh] pt-12 pb-24">
          
          <div className="space-y-8 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#8A2BE2] animate-pulse"></span>
              <span className="text-xs font-bold tracking-wider text-zinc-300">TELEGRAM-POWERED BACKEND V2.0</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1]">
              Infinite <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8A2BE2] to-[#D400FF] drop-shadow-[0_0_30px_rgba(138,43,226,0.4)]">
                Storage.
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-lg leading-relaxed font-medium">
              ParallelogramDrive hijacks the Telegram API to give you literally unlimited, completely free cloud storage. Fast, scalable, and beautifully designed.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Show when="signed-in">
                <Link href="/dashboard" className="flex items-center gap-3 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(138,43,226,0.4)] border border-white/10">
                  Enter Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-3 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(138,43,226,0.4)] border border-white/10">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </button>
                </SignInButton>
              </Show>
              <Link href="#" className="flex items-center gap-2 bg-[#111116] hover:bg-white/5 text-white px-8 py-4 rounded-2xl font-bold transition-colors border border-white/10 shadow-lg">
                View Architecture
              </Link>
            </div>

            <div className="pt-10 flex items-center gap-8 border-t border-white/5 mt-10">
               <div>
                  <div className="text-3xl font-black text-white mb-1">∞</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Storage Limit</div>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div>
                  <div className="text-2xl font-black text-white mb-1">0ms</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cold Starts</div>
               </div>
               <div className="w-px h-12 bg-white/10" />
               <div>
                  <div className="text-2xl font-black text-white mb-1">100%</div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Free</div>
               </div>
            </div>
          </div>

          <div className="relative h-[600px] hidden md:block">
             {/* 3D Parallelogram Mockup */}
             <div className="absolute inset-0 bg-gradient-to-tr from-[#111116] to-[#1a1a24] border border-white/10 rounded-3xl transform rotate-y-12 rotate-x-12 scale-[0.8] shadow-[0_30px_100px_rgba(0,0,0,0.5),0_0_50px_rgba(138,43,226,0.2)] flex flex-col overflow-hidden backdrop-blur-3xl group transition-all duration-700 hover:rotate-y-0 hover:rotate-x-0 hover:scale-100">
                <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-black/20">
                   <div className="w-3 h-3 rounded-full bg-red-500/80" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                   <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 p-8 flex flex-col gap-4">
                   <div className="h-32 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center p-6 gap-6 relative overflow-hidden group-hover:bg-[#8A2BE2]/5 transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                      <Upload className="w-10 h-10 text-[#8A2BE2]" />
                      <div className="flex-1 space-y-3">
                         <div className="h-3 w-1/3 bg-white/10 rounded-full" />
                         <div className="h-2 w-full bg-[#111116] rounded-full overflow-hidden border border-white/5">
                           <div className="h-full w-[70%] bg-gradient-to-r from-[#8A2BE2] to-[#D400FF] rounded-full shadow-[0_0_10px_#8A2BE2]" />
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-[#8A2BE2]/20 flex items-center justify-center"><Globe className="w-4 h-4 text-[#8A2BE2]" /></div>
                        <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                     </div>
                     <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D400FF]/20 flex items-center justify-center"><Lock className="w-4 h-4 text-[#D400FF]" /></div>
                        <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                     </div>
                   </div>
                   <div className="h-20 bg-gradient-to-r from-[#8A2BE2]/20 to-transparent border border-[#8A2BE2]/30 rounded-2xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#8A2BE2] rounded-xl flex items-center justify-center shadow-[0_0_20px_#8A2BE2]"><Zap className="w-6 h-6 text-white" /></div>
                      <div>
                        <div className="text-sm font-bold text-white mb-1">Infinite Transfer Activated</div>
                        <div className="text-xs font-semibold text-[#8A2BE2]">Node 4 connected.</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 border-t border-white/5 pt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Why Parallelogram<span className="text-[#8A2BE2]">Drive</span>?</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">We've engineered a completely unique approach to cloud storage by leveraging decentralized nodes on the world's fastest messaging network.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-[#8A2BE2]" />}
              title="Global Node Network"
              description="Your files are distributed across Telegram's massive global CDN, ensuring lightning-fast downloads no matter where you are."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-[#D400FF]" />}
              title="Military-Grade Security"
              description="Every file is encrypted in transit and at rest. Your data remains completely private and inaccessible to anyone without your unique keys."
            />
            <FeatureCard 
              icon={<Box className="w-6 h-6 text-[#8A2BE2]" />}
              title="Infinite Scalability"
              description="Say goodbye to 'Storage Full' warnings. Our architecture bypasses traditional disk limits, giving you truly unlimited capacity forever."
            />
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 border-t border-white/5 pt-24 pb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How it works.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Three simple steps to break free from traditional cloud storage limits.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-px bg-gradient-to-r from-[#8A2BE2]/0 via-[#8A2BE2]/50 to-[#8A2BE2]/0" />
            
            <StepCard number="01" title="Upload" description="Drop any file into your dashboard. Our Next.js backend intercepts the file and prepares it for distribution." />
            <StepCard number="02" title="Chunk & Encrypt" description="Large files are split into chunks, heavily encrypted, and sent to the Telegram API pipeline in parallel." />
            <StepCard number="03" title="Store & Stream" description="The files reside safely on Telegram's servers. When you need them, we stitch them back together instantly." />
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 mb-16 relative rounded-3xl bg-gradient-to-b from-[#111116] to-[#050508] border border-white/10 p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[#8A2BE2]/10 blur-[100px] pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10 text-white">Ready to unlock infinite storage?</h2>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="relative z-10 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(138,43,226,0.5)]">
                Create Your Free Account
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard" className="inline-block relative z-10 bg-[#8A2BE2] hover:bg-[#9B30FF] text-white px-10 py-5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(138,43,226,0.5)]">
              Go to Dashboard
            </Link>
          </Show>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-zinc-500 text-sm">
        <p>© {new Date().getFullYear()} ParallelogramDrive. Building the infinite cloud.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
      <div className="w-14 h-14 bg-[#111116] rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:border-[#8A2BE2]/30 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#111116] border-2 border-[#8A2BE2] flex items-center justify-center text-xl font-black text-[#8A2BE2] mb-6 relative z-10 shadow-[0_0_20px_rgba(138,43,226,0.3)]">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}
