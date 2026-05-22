import Link from "next/link";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <header className="fixed w-full top-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-xl shadow-[0_0_40px_rgba(123,47,247,0.1)] transition-transform border-b border-outline/10">
        <div className="flex justify-between items-center px-gutter py-unit w-full max-w-max-width mx-auto h-16">
          <div className="flex items-center gap-4">
            <span className="font-display-lg text-display-lg bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent text-[24px]">Parallelogram</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300" href="#">Infrastructure</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300" href="#">Pricing</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-all duration-300" href="https://github.com/techxsarwar/ParallelogramDrive">GitHub</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">sensors</span>
            </button>
            <Show when="signed-in">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 border border-outline/20 shadow-[0_0_15px_rgba(123,47,247,0.3)]" } }} />
            </Show>
            <Show when="signed-out">
                <SignInButton mode="modal">
                    <button className="bg-primary-container text-white px-4 py-2 rounded font-body-sm text-body-sm hover:bg-inverse-primary transition-colors glow-effect">
                        Launch Console
                    </button>
                </SignInButton>
            </Show>
            <Show when="signed-in">
                <Link href="/dashboard" className="bg-primary-container text-white px-4 py-2 rounded font-body-sm text-body-sm hover:bg-inverse-primary transition-colors glow-effect">
                    Dashboard
                </Link>
            </Show>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[819px] flex flex-col justify-center items-center text-center py-20">
          <div className="hero-glow"></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel mb-8 border border-primary/30 text-primary font-label-caps text-label-caps">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            v1.0.4 Network is Live
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[72px] mb-6 max-w-4xl tracking-tighter bg-gradient-to-b from-white to-on-surface-variant bg-clip-text text-transparent">
            The Geometry of <br/> <span className="text-primary-container">Infinite Storage</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-12">
            Distributed infrastructure powered by a proprietary network. ParallelogramDrive fractures your data across a resilient, encrypted grid, rendering traditional server architecture obsolete.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Show when="signed-out">
                <SignInButton mode="modal">
                    <button className="bg-primary-container text-white px-8 py-4 rounded-lg font-headline-md text-headline-md text-[16px] glow-effect flex items-center justify-center gap-2">
                        Start Storing
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </SignInButton>
            </Show>
            <Show when="signed-in">
                <Link href="/dashboard" className="bg-primary-container text-white px-8 py-4 rounded-lg font-headline-md text-headline-md text-[16px] glow-effect flex items-center justify-center gap-2">
                    Enter Dashboard
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
            </Show>
            
            <button className="glass-panel text-on-surface px-8 py-4 rounded-lg font-headline-md text-headline-md text-[16px] hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
              Explore Infrastructure
            </button>
          </div>

          {/* Abstract Graphic Representation */}
          <div className="mt-24 relative w-full max-w-5xl h-64 md:h-96">
            <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 gap-4 opacity-20">
              <div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm bg-primary/10"></div>
              <div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm bg-tertiary/10"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div><div className="border border-outline/30 rounded-sm"></div>
            </div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-primary/50 transform -skew-x-12 floating-shape shadow-[0_0_30px_rgba(123,47,247,0.2)] bg-background/50 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">hub</span>
            </div>
            <div className="absolute top-1/2 right-1/3 w-24 h-24 border border-tertiary/40 transform skew-x-12 floating-shape-delayed shadow-[0_0_20px_rgba(139,52,217,0.2)] bg-background/50 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-2xl">folder_shared</span>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-l-2 border-b-2 border-secondary/30 transform rotate-45 floating-shape shadow-[0_0_40px_rgba(5,102,217,0.1)] flex items-center justify-center">
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg md:text-[40px] mb-4">Architectural Supremacy</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Engineered for cryptographic resilience and unparalleled latency.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-xl glow-effect flex flex-col group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl group-hover:bg-primary-container/20 transition-all"></div>
              <span className="material-symbols-outlined text-primary text-[32px] mb-6">hub</span>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Distributed Nodes</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Data is sharded and distributed across a global network of autonomous nodes, ensuring absolute redundancy and eliminating single points of failure.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-xl glow-effect flex flex-col group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary-container/10 rounded-full blur-2xl group-hover:bg-secondary-container/20 transition-all"></div>
              <span className="material-symbols-outlined text-secondary text-[32px] mb-6">send</span>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Proprietary Backend</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Leveraging ultra-fast backend protocol for instant synchronization and unbreachable end-to-end encryption layers.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-xl glow-effect flex flex-col group relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-tertiary-container/10 rounded-full blur-2xl group-hover:bg-tertiary-container/20 transition-all"></div>
              <span className="material-symbols-outlined text-tertiary text-[32px] mb-6">terminal</span>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Developer Native</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Access infrastructure via robust REST APIs and SDKs. Built for CLI environments with mathematical precision and comprehensive documentation.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 border-t border-outline/10">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg md:text-[40px] mb-4">Scalable Topology</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Transparent metrics for distributed operations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-panel rounded-xl p-8 flex flex-col border-t-2 border-t-outline/20">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">LITE TIER</h3>
              <div className="font-display-lg text-display-lg mb-6">$0<span className="text-[20px] text-on-surface-variant font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-outline">check</span>
                  100GB Distributed Storage
                </li>
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-outline">check</span>
                  Standard Latency
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-outline/30 font-body-sm text-body-sm hover:bg-surface-container-high transition-colors">Start Free</button>
            </div>
            <div className="glass-panel rounded-xl p-8 flex flex-col border-t-2 border-t-primary relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(123,47,247,0.15)]">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-container text-white px-3 py-1 rounded-full font-label-caps text-label-caps text-[10px]">RECOMMENDED</div>
              <h3 className="font-label-caps text-label-caps text-primary mb-2">PRO TIER</h3>
              <div className="font-display-lg text-display-lg mb-6">$12<span className="text-[20px] text-on-surface-variant font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">check</span>
                  2TB Encrypted Storage
                </li>
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">check</span>
                  High-Speed Node Routing
                </li>
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">check</span>
                  API Access
                </li>
              </ul>
              <button className="w-full py-3 rounded bg-primary-container text-white font-body-sm text-body-sm hover:bg-inverse-primary transition-colors glow-effect">Upgrade to Pro</button>
            </div>
            <div className="glass-panel rounded-xl p-8 flex flex-col border-t-2 border-t-secondary/50">
              <h3 className="font-label-caps text-label-caps text-secondary mb-2">INFRASTRUCTURE</h3>
              <div className="font-headline-lg text-headline-lg mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
                  Unlimited Scale
                </li>
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
                  Dedicated Node Clusters
                </li>
                <li className="flex items-start gap-3 font-body-sm text-body-sm text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
                  SLA Guarantees
                </li>
              </ul>
              <button className="w-full py-3 rounded border border-outline/30 font-body-sm text-body-sm hover:bg-surface-container-high transition-colors">Contact Sales</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-12 bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline/10 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-max-width mx-auto gap-gutter">
          <div className="font-label-caps text-label-caps text-on-surface-variant">
            © 2024 ParallelogramDrive. Distributed Infrastructure.
          </div>
          <nav className="flex flex-wrap gap-6 justify-center md:justify-end">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Network Status</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">API Docs</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="https://github.com/techxsarwar/ParallelogramDrive">GitHub</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
