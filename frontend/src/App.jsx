import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Languages,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Zap,
  Brain,
  Globe,
  ChevronRight,
  Github,
  Twitter,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

const examples = [
  "eng tv na?",
  "ot dg te",
  "nham bay ot?",
  "slanh eng nas",
  "yg chea khmer",
  "reak reay",
  "khg",
  "saok sday",
];

const features = [
  {
    icon: Brain,
    title: "AI-Powered",
    desc: "Trained directly from real Khmer slang datasets — not hand-crafted dictionaries.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Instant Results",
    desc: "Sub-100ms translations with confidence scoring so you always know how accurate it is.",
    gradient: "from-cyan-500 to-sky-500",
  },
  {
    icon: Globe,
    title: "Living Language",
    desc: "Handles informal romanization, slang, and creative spellings used in everyday Khmer texting.",
    gradient: "from-teal-500 to-emerald-600",
  },
];

const steps = [
  {
    num: "01",
    title: "Type your slang",
    desc: "Enter any romanized Khmer slang or informal typing style into the input box.",
  },
  {
    num: "02",
    title: "AI processes it",
    desc: "Our model finds the closest learned pattern from the training dataset.",
  },
  {
    num: "03",
    title: "Get Khmer script",
    desc: "Receive the Khmer Unicode output instantly, complete with a confidence score.",
  },
];

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [matchedRoman, setMatchedRoman] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("synctype-theme") !== "light";
    } catch {
      return true;
    }
  });
  const [outputVisible, setOutputVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("synctype-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);

  const canTranslate = useMemo(() => input.trim().length > 0, [input]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`${API_BASE}/suggest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, max_results: 5 }),
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [input]);

  const translateText = useCallback(
    async (value = input) => {
      const text = value.trim();
      if (!text) return;
      setLoading(true);
      setError("");
      setOutputVisible(false);
      try {
        const res = await fetch(`${API_BASE}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setOutput(data.translation || "");
        setConfidence(data.confidence ?? null);
        setMatchedRoman(data.matched_roman || "");
        setTimeout(() => setOutputVisible(true), 50);
      } catch {
        setError("Backend not running yet. Start the Python server first.");
        setOutput("");
        setConfidence(null);
        setMatchedRoman("");
      } finally {
        setLoading(false);
      }
    },
    [input],
  );

  const useExample = (text) => {
    setInput(text);
    translateText(text);
  };

  const pickSuggestion = (khmer) => {
    setOutput((prev) => (prev ? prev + " " + khmer : khmer));
    setInput("");
    setSuggestions([]);
    setOutputVisible(true);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setConfidence(null);
    setMatchedRoman("");
    setError("");
    setOutputVisible(false);
    setSuggestions([]);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0a0f1e]" : "bg-[#faf8f3]"}`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }

        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(16,185,129,0.3)} 50%{box-shadow:0 0 40px rgba(16,185,129,0.6)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes orb-drift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }

        .float-anim { animation: float 4s ease-in-out infinite; }
        .breathe-anim { animation: breathe 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #10b981, #06b6d4, #34d399);
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .output-reveal { animation: slide-up 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); }

        /* ── LIGHT MODE ── */
        .glass { background: rgba(255,255,255,0.72); border: 1px solid rgba(5,150,105,0.12); backdrop-filter: blur(20px); }
        .surface { background: rgba(255,255,255,0.85); border: 1px solid rgba(5,150,105,0.1); }
        .input-area { background: rgba(255,255,255,0.95); border: 1.5px solid rgba(5,150,105,0.2); color: #0f172a; }
        .input-area:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.08); outline: none; }
        .input-area::placeholder { color: rgba(100,116,139,0.5); }

        /* ── DARK MODE ── */
        .dark .glass { background: rgba(15,25,50,0.7); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(20px); }
        .dark .surface { background: rgba(10,18,38,0.8); border: 1px solid rgba(255,255,255,0.06); }
        .dark .input-area { background: rgba(8,14,32,0.9); border: 1.5px solid rgba(255,255,255,0.08); color: #e2e8f0; }
        .dark .input-area:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); outline: none; }
        .dark .input-area::placeholder { color: rgba(148,163,184,0.35); }

        .orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.12; animation: orb-drift 12s ease-in-out infinite; pointer-events:none; }
        .dark .orb { opacity:0.25; }
      `}</style>

      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="orb w-96 h-96 bg-emerald-500 top-[-5%] left-[-5%]"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="orb w-72 h-72 bg-cyan-500 top-[20%] right-[-3%]"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="orb w-80 h-80 bg-teal-500 bottom-[10%] left-[20%]"
          style={{ animationDelay: "8s" }}
        />
      </div>

      <div className="relative z-10">
        {/* ── NAV ── */}
        <nav
          className={`sticky top-0 z-50 transition-colors duration-300 ${dark ? "border-b border-white/5 bg-[#0a0f1e]/80" : "border-b border-emerald-100/80 bg-[#faf8f3]/80"} backdrop-blur-xl`}
        >
          <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="frontend/public/mylogo.svg"
                alt="SyncType logo"
                className="h-9 w-9 object-contain"
              />
              <span
                className={`font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}
              >
                Sync<span className="gradient-text">Type</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="#translate"
                className={`hidden sm:block text-sm font-medium transition-colors ${dark ? "text-slate-400 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"}`}
              >
                Translate
              </a>
              <a
                href="#features"
                className={`hidden sm:block text-sm font-medium transition-colors ${dark ? "text-slate-400 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"}`}
              >
                Features
              </a>
              <a
                href="#how"
                className={`hidden sm:block text-sm font-medium transition-colors ${dark ? "text-slate-400 hover:text-emerald-400" : "text-slate-500 hover:text-emerald-600"}`}
              >
                How it works
              </a>

              {/* Theme Toggle */}
              <button
                onClick={() => setDark((d) => !d)}
                className={`relative flex h-8 w-14 items-center rounded-full transition-all duration-300 ${dark ? "bg-emerald-600/30 border border-emerald-500/30" : "bg-emerald-100 border border-emerald-200"}`}
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-all duration-300 ${dark ? "left-1" : "left-7"}`}
                >
                  {dark ? (
                    <Moon className="h-3 w-3 text-white" />
                  ) : (
                    <Sun className="h-3 w-3 text-white" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-xs font-medium tracking-widest uppercase glass">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span className={dark ? "text-emerald-300" : "text-emerald-700"}>
              AI-Powered · Khmer NLP
            </span>
          </div>

          <h1
            className={`font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05] ${dark ? "text-white" : "text-slate-900"}`}
          >
            Type in slang.
            <br />
            <span className="gradient-text">Read in Khmer.</span>
          </h1>

          <p
            className={`mx-auto max-w-xl text-lg leading-relaxed mb-10 ${dark ? "text-slate-400" : "text-slate-500"}`}
          >
            SyncType bridges the gap between how Cambodians type informally and
            the beautiful Khmer script — powered by real conversation data.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#translate"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#how"
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all glass ${dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
            >
              How it works <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Floating stat pills */}
          <div className="mt-14 flex flex-wrap justify-center gap-6">
            {[
              { val: "8000+", label: "Slang patterns learned" },
              { val: "<100ms", label: "Translation speed" },
              { val: "90%+", label: "Accuracy rate" },
            ].map((s) => (
              <div
                key={s.val}
                className={`glass rounded-2xl px-6 py-4 text-center card-hover ${dark ? "" : ""}`}
              >
                <div
                  className={`font-display text-2xl font-bold gradient-text`}
                >
                  {s.val}
                </div>
                <div
                  className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRANSLATOR ── */}
        <section id="translate" className="mx-auto max-w-5xl px-5 pb-24">
          <div
            className={`rounded-3xl p-6 sm:p-8 shadow-2xl ${dark ? "shadow-black/40" : "shadow-emerald-100/60"} glass`}
          >
            {/* Example chips */}
            <div className="mb-6">
              <p
                className={`mb-3 text-xs font-medium uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-400"}`}
              >
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => useExample(ex)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 ${
                      dark
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-400/40"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Input / Output grid */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Input */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}
                >
                  Khmer slang / Romanized Khmer
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      suggestions.length > 0
                    ) {
                      e.preventDefault();
                      pickSuggestion(suggestions[0].khmer);
                    } else if (e.key === "Enter" && e.metaKey) {
                      translateText();
                    }
                  }}
                  placeholder="Type or paste your slang here…"
                  className="input-area h-52 w-full rounded-2xl px-4 py-4 text-base outline-none transition-all resize-none"
                />

                {/* Suggestion chips */}
                {suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => pickSuggestion(s.khmer)}
                        className={`group relative rounded-xl px-4 py-2 text-base font-medium transition-all hover:-translate-y-0.5 ${
                          idx === 0
                            ? dark
                              ? "bg-emerald-500/20 text-emerald-200 border-2 border-emerald-400/40 hover:bg-emerald-500/30"
                              : "bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-200"
                            : dark
                              ? "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                              : "bg-white/60 text-slate-700 border border-emerald-100 hover:bg-white"
                        }`}
                      >
                        <span className="block">{s.khmer}</span>
                        <span
                          className={`block text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {s.roman} · {(s.confidence * 100).toFixed(0)}%
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {loadingSuggestions && suggestions.length === 0 && (
                  <div
                    className={`mt-3 flex items-center gap-2 text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading suggestions…
                  </div>
                )}
              </div>

              {/* Output */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${dark ? "text-slate-300" : "text-slate-600"}`}
                >
                  Khmer script output
                </label>
                <div
                  className={`input-area relative h-52 w-full rounded-2xl px-4 py-4 overflow-auto flex items-start`}
                >
                  {loading ? (
                    <div
                      className={`flex items-center gap-2.5 text-sm ${dark ? "text-slate-400" : "text-slate-400"}`}
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                      Translating…
                    </div>
                  ) : output ? (
                    <p
                      className={`text-2xl leading-relaxed ${outputVisible ? "output-reveal" : "opacity-0"} ${dark ? "text-emerald-200" : "text-emerald-800"}`}
                    >
                      {output}
                    </p>
                  ) : (
                    <span
                      className={`text-sm ${dark ? "text-slate-600" : "text-slate-400"}`}
                    >
                      Translation will appear here…
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => translateText()}
                disabled={!canTranslate || loading}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Translate
              </button>
              <button
                onClick={clearAll}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all glass hover:opacity-80 ${dark ? "text-slate-300" : "text-slate-600"}`}
              >
                Clear
              </button>
              <span
                className={`ml-auto hidden sm:block text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}
              >
                ⌘ + Enter to translate
              </span>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            {(confidence !== null || matchedRoman) && !error && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 output-reveal">
                <div className="surface rounded-2xl p-4">
                  <div
                    className={`mb-1 text-xs uppercase tracking-widest font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Confidence
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`h-1.5 flex-1 rounded-full ${dark ? "bg-white/10" : "bg-slate-100"} overflow-hidden`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                        style={{
                          width:
                            confidence !== null
                              ? `${(confidence * 100).toFixed(0)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}
                    >
                      {confidence !== null
                        ? `${(confidence * 100).toFixed(1)}%`
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="surface rounded-2xl p-4">
                  <div
                    className={`mb-1 text-xs uppercase tracking-widest font-medium ${dark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Closest learned pattern
                  </div>
                  <div
                    className={`text-sm font-semibold mt-1 ${dark ? "text-emerald-300" : "text-emerald-700"}`}
                  >
                    {matchedRoman || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          id="features"
          className={`py-20 ${dark ? "border-t border-white/5" : "border-t border-emerald-50"}`}
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="mb-12 text-center">
              <p
                className={`text-xs font-medium uppercase tracking-widest mb-3 ${dark ? "text-emerald-400" : "text-emerald-600"}`}
              >
                Why SyncType
              </p>
              <h2
                className={`font-display text-3xl sm:text-4xl font-bold ${dark ? "text-white" : "text-slate-900"}`}
              >
                Built different, from the ground up
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`card-hover glass rounded-3xl p-6`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg float-anim`}
                    style={{ animationDelay: `${i * 0.7}s` }}
                  >
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3
                    className={`font-display text-lg font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="py-20 mx-auto max-w-6xl px-5">
          <div className="mb-12 text-center">
            <p
              className={`text-xs font-medium uppercase tracking-widest mb-3 ${dark ? "text-emerald-400" : "text-emerald-600"}`}
            >
              Process
            </p>
            <h2
              className={`font-display text-3xl sm:text-4xl font-bold ${dark ? "text-white" : "text-slate-900"}`}
            >
              Three steps to clarity
            </h2>
          </div>

          <div className="relative grid gap-6 sm:grid-cols-3">
            {/* Connector line */}
            <div
              className={`absolute top-8 left-[16.5%] right-[16.5%] h-px hidden sm:block ${dark ? "bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30" : "bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200"}`}
            />

            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div
                  className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold font-display glass border-2 ${dark ? "border-emerald-500/30 text-emerald-400" : "border-emerald-300 text-emerald-600"} breathe-anim`}
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  {step.num}
                </div>
                <h3
                  className={`font-display text-lg font-semibold mb-2 ${dark ? "text-white" : "text-slate-900"}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-center shadow-2xl shadow-emerald-900/30">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, cyan 0%, transparent 50%)",
              }}
            />
            <Languages className="mx-auto mb-4 h-10 w-10 text-emerald-100 float-anim" />
            <h2 className="font-display text-3xl font-bold text-white mb-3">
              LIFE MADE EASIER
            </h2>
            <p className="text-emerald-100/80 mb-6 text-sm max-w-md mx-auto">
              Turning everyday Khmer slang into readable Khmer script.
            </p>
            <a
              href=""
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Start translating <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className={`border-t py-10 ${dark ? "border-white/5" : "border-emerald-100"}`}
        >
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="public/mylogo.svg"
                  alt="SyncType logo"
                  className="h-9 w-9 object-contain"
                />
                <span
                  className={`font-display text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}
                >
                  SyncType
                </span>
              </div>

              <div className="flex items-center gap-6">
                {[
                  { label: "Translate", href: "#translate" },
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how" },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className={`text-sm transition-colors ${dark ? "text-slate-500 hover:text-emerald-400" : "text-slate-400 hover:text-emerald-600"}`}
                  >
                    {l.label}
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all glass hover:opacity-80`}
                >
                  <Github
                    className={`h-4 w-4 ${dark ? "text-slate-400" : "text-slate-500"}`}
                  />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all glass hover:opacity-80`}
                >
                  <Twitter
                    className={`h-4 w-4 ${dark ? "text-slate-400" : "text-slate-500"}`}
                  />
                </a>
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 glass`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-emerald-400" : "bg-emerald-500"} animate-pulse`}
                  />
                  <span
                    className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {dark ? "Dark" : "Light"} mode
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`mt-6 pt-6 border-t text-center text-xs ${dark ? "border-white/5 text-slate-600" : "border-emerald-50 text-slate-400"}`}
            >
              © 2026 SyncType · Bridging Khmer informal typing and native script
              · Built for the Khmer community
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
