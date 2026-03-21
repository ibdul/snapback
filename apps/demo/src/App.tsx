import "./App.css";
import useSnapbackLayer from "@snapback/react";

import { AnimatePresence, motion } from "motion/react";

import {
  AlertCircle,
  Bolt,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit3,
  History,
  Info,
  Layers,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Terminal,
  Trash,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

const snippets = {
  init: `// 1. Initialize the hook
const { 
  getSnapbackState, 
  applyUpdate, 
  rollbackUpdate 
} = useOptimisticUpdatesLayer();

// 2. Wrap your data
const optimisticTasks = getSnapbackState(baseTasks);`,
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

type Patch = {
  id: string;
} & Record<string, string | number>;

type PendingRequest = {
  requestId: string;
  id: string;
  label: string;
  patch: Patch;
  type: string;
  latency: number;
  elapsed: number;
  onComplete: () => void;
};

type RequestHandler = (req: PendingRequest) => void;
const PatchItem = (
  { req, onFail, onCancel, isPaused }: {
    req: PendingRequest;
    onFail: RequestHandler;
    onCancel: RequestHandler;
    isPaused: boolean;
  },
) => {
  const [isOpen, setIsOpen] = useState(false);
  const progress = Math.min(100, (req.elapsed / req.latency) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all"
    >
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {!isPaused
              ? (
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              )
              : <Pause size={10} className="text-amber-500" />}
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-tight ${req.type === "create"
                ? "text-emerald-400"
                : req.type === "delete"
                  ? "text-rose-400"
                  : "text-cyan-400"
                }`}
            >
              {req.type} • {req.id}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFail(req)}
              className="p-1 hover:bg-rose-500/20 text-rose-500 rounded transition-colors"
            >
              <AlertCircle size={14} />
            </button>
            <button
              onClick={() => onCancel(req)}
              className="p-1 hover:bg-slate-500/20 text-slate-400 rounded transition-colors"
            >
              <XCircle size={14} />
            </button>
          </div>
        </div>

        <div className="text-xs font-bold text-white truncate">
          {req.label}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-2 flex items-center gap-1 text-[9px] font-bold uppercase text-slate-500 hover:text-cyan-400"
        >
          {isOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          Data
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-cyan-400/80">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(req.patch, null, 2)}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-1 w-full bg-white/5 relative">
        <div
          className="absolute top-0 left-0 h-full bg-cyan-500 transition-[width] duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
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
  const [latency, setLatency] = useState(3000);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState("init");
  const now = useMemo(() => {
    const out = new Date();
    return out.valueOf();
  }, []);
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Refactor state logic",
      status: "todo",
      createdAt: now - 10000,
    },
    {
      id: "2",
      title: "Write documentation",
      status: "todo",
      createdAt: now - 5000,
    },
  ]);

  const {
    applyUpdate,
    snapback_state,
    rollbackUpdate,
    getSnapbackState,
    // rawUpdates,
  } = useSnapbackLayer();

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const tickRate = 100;
    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      setPendingRequests((prev) => {
        if (prev.length === 0) return prev;
        const next = [];
        let hasChanges = false;

        for (const req of prev) {
          const newElapsed = req.elapsed + tickRate;
          if (newElapsed >= req.latency) {
            req.onComplete();
            rollbackUpdate(req.id, req.requestId);
            hasChanges = true;
          } else {
            next.push({ ...req, elapsed: newElapsed });
            hasChanges = true;
          }
        }
        return hasChanges ? next : prev;
      });
    }, tickRate);
    return () => clearInterval(interval);
  }, []);

  const optimisticTasks = tasks.sort((a, b) => b.createdAt - a.createdAt);

  const createRequest = (
    label: string,
    patch: Patch,
    type = "update",
    onComplete: () => void,
  ) => {
    const reqId = applyUpdate({ ...patch, __type: type });
    const newReq = {
      requestId: reqId,
      id: patch.id,
      label,
      patch,
      type,
      latency: latency,
      elapsed: 0,
      onComplete: onComplete,
    };

    setPendingRequests((prev) => [...prev, newReq]);
  };

  const addTask = () => {
    const id = Math.random().toString(36).substr(2, 5);
    const title = "New Task Layer";
    const createdAt = Date.now();

    createRequest(`Create Task`, { id, title, createdAt }, "create", () => {
      setTasks((prev) => [...prev, { id, title, status: "todo", createdAt }]);
    });
  };

  const editTask = (id: string, title: string) => {
    const [main_title, revision] = title.split("_v");
    const current_revision = revision?.trim() ?? "1";
    const newTitle = `${main_title} _v ${Number(current_revision) + 1}`;
    createRequest(`Edit Task ${id}`, { id, title: newTitle }, "update", () => {
      setTasks((prev) =>
        prev.map((t) => t.id === id ? { ...t, title: newTitle } : t)
      );
    });
  };

  const deleteTask = (id: string) => {
    createRequest(`Delete Task ${id}`, { id }, "delete", () => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const clearList = () => {
    optimisticTasks.forEach((task) => {
      if (!task) {
        return;
      }
      createRequest(
        `Batch Delete: ${task.id}`,
        { id: task.id },
        "delete",
        () => {
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
        },
      );
    });
  };

  const handleManualFail = (req: PendingRequest) => {
    setPendingRequests((prev) =>
      prev.filter((r) => r.requestId !== req.requestId)
    );
    rollbackUpdate(req.id, req.requestId);
  };

  const handleManualCancel = (req: PendingRequest) => {
    setPendingRequests((prev) =>
      prev.filter((r) => r.requestId !== req.requestId)
    );
    rollbackUpdate(req.id, req.requestId);
  };

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
        </section>

        {/* Sandbox Section */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[#0d1526] rounded-3xl border border-white/5 p-8 relative overflow-hidden flex flex-col h-[640px]">
                <div className="flex justify-between items-center mb-8 relative z-10 shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Live Sandbox
                    </h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                      Interactive state visualization
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`p-3 rounded-xl border transition-all ${isPaused
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                        }`}
                    >
                      {isPaused
                        ? <Play size={18} fill="currentColor" />
                        : <Pause size={18} fill="currentColor" />}
                    </button>
                    <button
                      onClick={clearList}
                      disabled={optimisticTasks.length === 0}
                      className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash size={16} /> Clear
                    </button>
                    <button
                      onClick={addTask}
                      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-cyan-500/20"
                    >
                      <Plus size={18} /> New Task
                    </button>
                  </div>
                </div>

                <div className="space-y-3 relative z-10 overflow-y-auto flex-grow pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {optimisticTasks.length === 0
                      ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-slate-600 space-y-4"
                        >
                          <div className="p-4 bg-white/5 rounded-full">
                            <CheckCircle2 size={32} className="opacity-20" />
                          </div>
                          <p className="text-sm italic">
                            Queue cleared. Trigger an update to see layers.
                          </p>
                        </motion.div>
                      )
                      : (
                        optimisticTasks.map((_task) => {
                          if (!_task) {
                            return (
                              <Fragment key={crypto.randomUUID()}></Fragment>
                            );
                          }
                          const task_snap = getSnapbackState(_task.id);
                          const task = { ..._task, ...task_snap };
                          const hasPending = !!snapback_state[_task.id]?.length;
                          return (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className={`group flex justify-between items-center p-5 bg-white/5 rounded-2xl border transition-all ${hasPending
                                ? "border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                                : "border-white/5 hover:border-white/10"
                                }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${hasPending
                                    ? "border-cyan-500/50 text-cyan-400 bg-cyan-500/10 animate-pulse"
                                    : "border-white/10 text-slate-600"
                                    }`}
                                >
                                  {hasPending
                                    ? <Zap size={18} fill="currentColor" />
                                    : <CheckCircle2 size={18} />}
                                </div>
                                <div>
                                  <div className="text-white font-medium">
                                    {task.title}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-slate-600 font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
                                      ID: {task.id}
                                    </span>
                                    {hasPending && (
                                      <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
                                        Syncing...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => editTask(task.id, task.title)}
                                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-[#0d1526] rounded-2xl border border-white/5 p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      Global Latency
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="500"
                        max="10000"
                        step="500"
                        value={latency}
                        onChange={(e) => setLatency(Number(e.target.value))}
                        className="w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-xs font-mono text-cyan-400">
                        {latency}ms
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs italic">
                  <Info size={14} />{" "}
                  Layers are applied in order of request timestamp.
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0d1526] rounded-3xl border border-white/5 p-6 h-[640px] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Clock size={14} /> Request Queue
                  </h3>
                  {isPaused && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold border border-amber-500/20 animate-pulse"
                    >
                      PAUSED
                    </motion.span>
                  )}
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                  <AnimatePresence initial={false}>
                    {pendingRequests.length === 0
                      ? (
                        <motion.div
                          key="empty-layers"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="py-20 flex flex-col items-center justify-center text-slate-600 space-y-3 opacity-50"
                        >
                          <Layers size={32} />
                          <p className="text-xs uppercase tracking-tighter text-center px-4">
                            No active network requests
                          </p>
                        </motion.div>
                      )
                      : (
                        pendingRequests.map((req) => (
                          <PatchItem
                            key={req.requestId}
                            req={req}
                            onFail={handleManualFail}
                            onCancel={handleManualCancel}
                            isPaused={isPaused}
                          />
                        ))
                      )}
                  </AnimatePresence>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 shrink-0">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={12} /> Optimization
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      This UI logic separates the "Truth" (Base Data) from the
                      "Perception" (Optimistic Layers).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  code={snippets[activeTab as keyof typeof snippets]}
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
