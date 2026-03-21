import "./App.css";
import useSnapbackLayer from "@snapback/react";

import { AnimatePresence, motion } from "motion/react";

import {
  Bolt,
  BookOpen,
  CheckCircle2,
  Copy,
  Edit3,
  History,
  Info,
  Layers,
  Plus,
  RotateCcw,
  Terminal,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const snippets = {
  init: `// 1. Initialize the hook
const { 
  getOptimisticState, 
  applyUpdate, 
  rollbackUpdate 
} = useOptimisticUpdatesLayer();

// 2. Wrap your data
const optimisticTasks = getOptimisticState(baseTasks);`,
  add: `const handleAddTask = async (title) => {
  const id = generateId();
  
  // Apply layer immediately
  const reqId = applyUpdate({ id, title, __type: 'create' });

  try {
    const serverTask = await api.create(title);
    setBaseTasks(prev => [...prev, serverTask]);
  } finally {
    // Clear optimistic layer once server confirms
    rollbackUpdate(id, reqId);
  }
};`,
  edit: `const handleEditTask = async (id, newTitle) => {
  const reqId = applyUpdate({ id, title: newTitle });

  try {
    await api.patch(id, { title: newTitle });
    setBaseTasks(prev => prev.map(t => 
       t.id === id ? { ...t, title: newTitle } : t
    ));
  } finally {
    rollbackUpdate(id, reqId);
  }
};`,
  delete: `const handleDeleteTask = async (id) => {
  // Use __type: 'delete' to mark as deleted in layers
  const reqId = applyUpdate({ id, __type: 'delete' });

  try {
    await api.destroy(id);
    setBaseTasks(prev => prev.filter(t => t.id !== id));
  } finally {
    rollbackUpdate(id, reqId);
  }
};`,
  rollback: `try {
  await api.update(data);
} catch (err) {
  // Simple: Since we don't update baseTasks until success,
  // we just clear the layer and the UI "snaps back" automatically.
  rollbackUpdate(id, requestId);
  notifyError("Failed to sync changes.");
}`,
};

const CodeBlock = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-black/40 rounded-xl border border-white/5 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Terminal size={12} /> {label}
        </span>
        <button
          onClick={handleCopy}
          className="text-slate-500 hover:text-primary transition-colors"
        >
          {copied
            ? <CheckCircle2 size={14} className="text-emerald-500" />
            : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 text-[11px] font-mono leading-relaxed text-primary/90 overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
};

export default function App() {
  const { applyUpdate, getSnapbackState } = useSnapbackLayer<
    { count: number }
  >();

  const [activeTab, setActiveTab] = useState<keyof typeof snippets>("init");

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

        {/* Documentation Section */}
        <section id="docs" className="pt-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <BookOpen size={14} /> Usage Guide
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">
                Implementation Patterns
              </h2>
            </div>
            <div className="flex gap-2 bg-[#0d1526] p-1.5 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
              {[
                { id: "init", label: "Setup", icon: <Layers size={14} /> },
                { id: "add", label: "Add", icon: <Plus size={14} /> },
                { id: "edit", label: "Edit", icon: <Edit3 size={14} /> },
                { id: "delete", label: "Delete", icon: <Trash2 size={14} /> },
                {
                  id: "rollback",
                  label: "Rollback",
                  icon: <RotateCcw size={14} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof typeof snippets)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? "bg-primary text-[#060b18]"
                    : "text-slate-500 hover:text-white"
                    }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeTab === "init" && "Getting Started"}
                  {activeTab === "add" && "Adding New Entities"}
                  {activeTab === "edit" && "Updating Existing State"}
                  {activeTab === "delete" && "Soft Deletions"}
                  {activeTab === "rollback" && "Handling Failures"}
                </h3>
                <div className="text-sm text-slate-400 leading-relaxed space-y-4">
                  {activeTab === "init" && (
                    <>
                      <p>
                        The library provides a single hook that maintains an
                        internal store of "patches". You feed your base state
                        into{" "}
                        <code className="text-primary">
                          getSnapbackState
                        </code>, and it returns the merged result.
                      </p>
                      <ul className="space-y-2 list-disc pl-4 text-xs">
                        <li>
                          Zero dependency on how you store your base state
                          (Redux, Zustand, useState).
                        </li>
                        <li>
                          Non-destructive: The base state is never touched by
                          the hook.
                        </li>
                      </ul>
                    </>
                  )}
                  {activeTab === "add" && (
                    <>
                      <p>
                        When creating a new entity, include{" "}
                        <code className="text-primary">__type: 'create'</code>
                        {" "}
                        in the patch. The hook will treat this as a virtual
                        entry that doesn't yet exist in the base state.
                      </p>
                      <p>
                        This ensures your UI reflects the new item immediately
                        before the database ID is even generated.
                      </p>
                    </>
                  )}
                  {activeTab === "edit" && (
                    <>
                      <p>
                        Standard updates simply require the{" "}
                        <code className="text-primary">id</code>{" "}
                        of the entity and the fields you wish to override.
                      </p>
                      <p>
                        Multiple layers can exist for the same ID; the hook
                        automatically resolves them using the latest layer as
                        the source of truth.
                      </p>
                    </>
                  )}
                  {activeTab === "delete" && (
                    <>
                      <p>
                        Use{" "}
                        <code className="text-primary">__type: 'delete'</code>
                        {" "}
                        to immediately remove an item from the optimistic
                        result. This is much smoother than waiting for a 204 No
                        Content response from your API.
                      </p>
                    </>
                  )}
                  {activeTab === "rollback" && (
                    <>
                      <p>
                        Rollbacks are built-in. If a request fails, you simply
                        don't update your base state and just call{" "}
                        <code className="text-primary">rollbackUpdate</code>.
                      </p>
                      <p>
                        The UI will automatically snap back to the base state
                        because the optimistic layer override has been removed.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                <div className="mt-1">
                  <Info size={16} className="text-primary" />
                </div>
                <p className="text-[11px] text-primary/80 leading-normal">
                  Pro-tip: You can pass a specific{" "}
                  <code className="font-bold">requestId</code>{" "}
                  to rollback a specific operation, or just the{" "}
                  <code className="font-bold">id</code>{" "}
                  to clear all layers for that entity.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CodeBlock
                  label={`${activeTab.toUpperCase()}`}
                  code={snippets[activeTab]}
                />
              </motion.div>
            </AnimatePresence>
          </div>
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
