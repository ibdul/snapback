import "./App.css";
import useSnapbackLayer from "@snapback/react";

import { Bolt, History, Layers, Plus } from "lucide-react";

export default function App() {
  const { applyUpdate, getSnapbackState } = useSnapbackLayer<
    { count: number }
  >();
  const countEntity = getSnapbackState("counter");
  const count = countEntity.count ?? 0;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans selection:bg-primary/30 selection:text-white flex flex-col justify-between">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#060e20]/60 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-cyan-900/10 h-20">
        <div className="flex justify-between items-center px-8 h-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(76,215,246,0.5)]">
              <Layers size={18} className="text-[#0b1326]" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase font-headline">
              <span className="">
                Snapback
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-label text-xs tracking-widest uppercase font-bold">
            <a
              className="text-primary border-b-2 border-primary pb-1"
              href="#docs"
            >
              Docs
            </a>
            <a
              className="text-slate-400 hover:text-white transition-colors"
              href="#"
            >
              GitHub
            </a>
            <a
              className="text-slate-400 hover:text-white transition-colors"
              href="#sandbox"
            >
              Sandbox
            </a>
          </div>
          <button className="bg-[#06b6d4] text-[#003640] font-label px-6 py-2.5 rounded-full font-bold active:scale-95 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-24">
        <section className="text-center space-y-8 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse">
            </span>
            <span className="font-label text-[10px] uppercase tracking-widest text-[#acedff]">
              v1.0.0 Flagship
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight font-headline text-white leading-tight">
            Zero-Latency <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#acedff]">
              State Projection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 font-light leading-relaxed">
            Handle complex optimistic updates, and easily perform rollbacks.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[#171f33]/60 backdrop-blur-md border border-white/5">
              <Bolt size={20} className="text-primary" />
              <span className="font-label text-xs uppercase tracking-widest font-bold">
                Optimistic Changes
              </span>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-[#171f33]/60 backdrop-blur-md border border-white/5">
              <History size={20} className="text-[#ffb95f]" />
              <span className="font-label text-xs uppercase tracking-widest font-bold">
                Easy Rollback
              </span>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-[#171f33]/60 backdrop-blur-md border border-white/5 cursor-pointer"
            onClick={() => {
              applyUpdate({ id: "counter", count: count + 1 });
            }}
          >
            <Plus size={20} className="text-primary" />
            <span className="font-label text-xs uppercase tracking-widest font-bold">
              Count ({count})
            </span>
          </button>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#060e20] w-full py-16 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <div className="text-xl font-black uppercase tracking-tighter font-headline">
              <span className="text-primary">
                Snapback
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
              Assume the best. Handle the rest
            </p>
          </div>
          <div className="flex gap-10 font-label text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a className="hover:text-primary transition-colors" href="#">
              Documentation
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              GitHub
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              NPM
            </a>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
            © {new Date().getFullYear()} Snapback.
          </div>
        </div>
      </footer>

      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Grotesk:wght@500;700&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-headline { font-family: 'Inter', sans-serif; font-weight: 900; }
        .font-label { font-family: 'Space Grotesk', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        
        .glass-panel {
          background: rgba(23, 31, 51, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}
      </style>
    </div>
  );
}
