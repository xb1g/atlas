import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, Zap, RefreshCw, Compass, MapPin, Loader } from "lucide-react";
import { Opportunity, InterviewAnswers } from "../types";

interface ReflectionProps {
  opportunity?: Opportunity;
  answers: InterviewAnswers;
  onNextAdventure: () => void;
  onRestart: () => void;
}

const archetypes = {
  builder: {
    label: "The Builder",
    emoji: "🔨",
    color: "from-blue-600 to-cyan-500",
    bgCard: "bg-blue-50 border-blue-200/60",
    accent: "text-blue-700",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
    superpower: "You Make Things Real",
    tagline: "Ideas become tools in your hands.",
    reveal: "You come alive when you're building — turning a vague idea into something people can actually touch, use, or see. Most people stop at the concept. You don't.",
    challenge: "Your next level: ship something before it feels ready.",
    nextHint: "Build something with a real interface — a calculator, a map, a live tracker.",
  },
  talker: {
    label: "The Talker",
    emoji: "✍️",
    color: "from-amber-500 to-orange-400",
    bgCard: "bg-amber-50 border-amber-200/60",
    accent: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    superpower: "You Move People",
    tagline: "Your words make people act.",
    reveal: "You come alive when you're communicating — shaping a message, convincing someone, or making people genuinely care. You have the rarest skill: you can change minds.",
    challenge: "Your next level: put your name on something public.",
    nextHint: "Write a piece that goes somewhere real — an op-ed, a pitch, a campaign that asks for something specific.",
  },
  organizer: {
    label: "The Organizer",
    emoji: "🗺️",
    color: "from-emerald-600 to-teal-500",
    bgCard: "bg-emerald-50 border-emerald-200/60",
    accent: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    superpower: "You See the Whole System",
    tagline: "You see what's missing before others do.",
    reveal: "You come alive when you're figuring out how all the pieces connect — who does what, in what order, and why it works. You design systems others follow.",
    challenge: "Your next level: build something that runs without you.",
    nextHint: "Create a plan that others can follow — a step-by-step guide, a repeatable event, a community system.",
  },
  tastemaker: {
    label: "The Tastemaker",
    emoji: "🎨",
    color: "from-rose-500 to-pink-400",
    bgCard: "bg-rose-50 border-rose-200/60",
    accent: "text-rose-700",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
    superpower: "You Feel What's Right",
    tagline: "Your aesthetic sense is a superpower.",
    reveal: "You come alive when things feel right — the right visual, the right tone, the right experience. You raise the bar everywhere you go. Most people can't articulate why something works. You already know.",
    challenge: "Your next level: make your taste visible to the world.",
    nextHint: "Create something where look and feel is the whole point — a zine, a visual campaign, a brand identity.",
  },
  investigator: {
    label: "The Investigator",
    emoji: "🔍",
    color: "from-purple-600 to-violet-500",
    bgCard: "bg-purple-50 border-purple-200/60",
    accent: "text-purple-700",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
    superpower: "You Ask Better Questions",
    tagline: "You find what everyone else missed.",
    reveal: "You come alive when you're digging — finding the fact nobody noticed, tracing something back to its real cause, surfacing what everyone assumed but nobody checked. Truth is your tool.",
    challenge: "Your next level: publish what you found.",
    nextHint: "Pick a claim that's treated as obvious in your community and find out if it's actually true.",
  },
};

// Parse the stored medium label back to an archetype key
function parseMediumToArchetypeKey(medium: string): string | null {
  const m = medium.toLowerCase();
  if (m.includes("builder") || m.includes("technical") || m.includes("coding")) return "builder";
  if (m.includes("talker") || m.includes("human") || m.includes("social")) return "talker";
  if (m.includes("organizer") || m.includes("systems") || m.includes("organizing")) return "organizer";
  if (m.includes("tastemaker") || m.includes("taste")) return "tastemaker";
  if (m.includes("investigator") || m.includes("insight") || m.includes("investigating")) return "investigator";
  return null;
}

const q1Options = [
  { id: "builder",     emoji: "🔨", text: "Building or making the actual thing" },
  { id: "talker",      emoji: "✍️", text: "Explaining, convincing, or connecting with people" },
  { id: "organizer",   emoji: "🗺️", text: "Figuring out how all the pieces fit together" },
  { id: "tastemaker",  emoji: "🎨", text: "Getting the look and feel exactly right" },
  { id: "investigator",emoji: "🔍", text: "Digging to find the real answer or data" },
];

export default function Reflection({ opportunity, answers, onNextAdventure, onRestart }: ReflectionProps) {
  const [step, setStep] = useState(0); // 0=Q1, 1=Q2, 2=Q3, 3=reveal
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setSurprise] = useState("");
  const [q3, setQ3] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const archetype = q1 ? archetypes[q1 as keyof typeof archetypes] : null;

  // Parse original medium from stored label string
  const originalKey = answers.medium ? parseMediumToArchetypeKey(answers.medium) : null;
  const originalArchetype = originalKey ? archetypes[originalKey as keyof typeof archetypes] : null;
  const hasMeaningfulContrast = originalKey && q1 && originalKey !== q1;

  const projectTitle = opportunity?.title ?? "your project";

  return (
    <div className="max-w-xl mx-auto py-6 animate-fadeIn">
      <AnimatePresence mode="wait">

        {/* Q1 — What felt natural */}
        {step === 0 && (
          <motion.div key="q1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[10px] font-mono px-4 py-1.5 rounded-full mb-5 font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Reflect on what you just did
              </span>
              <h1 className="text-3xl font-display font-medium text-emerald-950 tracking-tight mb-3 leading-snug">
                What part of<br />"{projectTitle.length > 40 ? projectTitle.slice(0, 38) + "…" : projectTitle}"<br />felt most natural?
              </h1>
              <p className="text-sm text-slate-500 font-sans">Pick the one that felt effortless.</p>
            </div>

            <div className="space-y-2.5 mb-6">
              {q1Options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQ1(opt.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-sans transition-all duration-200 cursor-pointer flex items-center gap-3 ${
                    q1 === opt.id
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-sm"
                      : "bg-white/80 border-orange-100/60 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
                >
                  <span className="text-xl shrink-0">{opt.emoji}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!q1}
              className="w-full h-12 rounded-2xl font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Progress */}
            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 0 ? "w-6 bg-emerald-500" : "w-3 bg-slate-200"}`} />)}
            </div>
          </motion.div>
        )}

        {/* Q2 — Surprise */}
        {step === 1 && (
          <motion.div key="q2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-medium text-emerald-950 tracking-tight mb-3">
                Anything surprise you?
              </h1>
              <p className="text-sm text-slate-500 font-sans max-w-sm mx-auto">Something you didn't expect about yourself — good, hard, or just interesting. Optional.</p>
            </div>

            <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 shadow-sm mb-6">
              <textarea
                value={q2}
                onChange={(e) => setSurprise(e.target.value)}
                placeholder="e.g. I thought I'd hate writing but I actually loved it..."
                rows={4}
                className="w-full bg-[#fefdf9] border border-orange-100/60 rounded-2xl px-4 py-3 text-sm font-sans text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-300 resize-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="h-12 px-5 rounded-2xl border border-orange-200/40 text-emerald-800 text-sm font-sans font-bold bg-white hover:bg-slate-50 transition cursor-pointer">
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-2xl font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>{q2.trim() ? "Next" : "Skip"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 1 ? "w-6 bg-emerald-500" : "w-3 bg-slate-200"}`} />)}
            </div>
          </motion.div>
        )}

        {/* Q3 — Where next */}
        {step === 2 && (
          <motion.div key="q3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-medium text-emerald-950 tracking-tight mb-3">
                Where do you want<br />to go next?
              </h1>
            </div>

            <div className="space-y-2.5 mb-6">
              {[
                { id: "deeper", emoji: "🌊", text: "Go deeper into this same topic", desc: "Build on what I just made" },
                { id: "different", emoji: "🔄", text: "Try a different kind of project", desc: "Same cause, new format" },
                { id: "new", emoji: "✨", text: "Explore a completely new cause", desc: "Fresh start, new mission" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setQ3(opt.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                    q3 === opt.id
                      ? "bg-emerald-50 border-emerald-300 shadow-sm"
                      : "bg-white/80 border-orange-100/60 hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
                >
                  <span className="text-xl shrink-0">{opt.emoji}</span>
                  <div>
                    <span className={`text-sm font-sans font-semibold block ${q3 === opt.id ? "text-emerald-900" : "text-slate-700"}`}>{opt.text}</span>
                    <span className="text-xs font-sans text-slate-400 mt-0.5 block">{opt.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="h-12 px-5 rounded-2xl border border-orange-200/40 text-emerald-800 text-sm font-sans font-bold bg-white hover:bg-slate-50 transition cursor-pointer">
                ← Back
              </button>
              <button
                onClick={async () => {
                  if (!q3) return;
                  setIsAnalyzing(true);
                  try {
                    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
                    const res = await fetch("/api/project/reflect", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-session-id": sessionId,
                      },
                      body: JSON.stringify({ q1, q2, q3 }),
                    });
                    const data = await res.json();
                    if (data.analysis) setAiAnalysis(data.analysis);
                  } catch (err) {
                    console.error("Reflection analysis failed:", err);
                  } finally {
                    setIsAnalyzing(false);
                    setStep(3);
                  }
                }}
                disabled={!q3 || isAnalyzing}
                className="flex-1 h-12 rounded-2xl font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Reading your journey...</span>
                  </>
                ) : (
                  <>
                    <span>See My Reflection</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-5">
              {[0,1,2].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === 2 ? "w-6 bg-emerald-500" : "w-3 bg-slate-200"}`} />)}
            </div>
          </motion.div>
        )}

        {/* Reveal */}
        {step === 3 && archetype && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

            {/* Hero banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`bg-gradient-to-br ${archetype.color} rounded-3xl p-8 mb-6 text-white text-center relative overflow-hidden shadow-xl`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_70%)]" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25, type: "spring" }}
                className="text-5xl mb-4 select-none"
              >
                {archetype.emoji}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xs font-mono font-bold uppercase tracking-widest opacity-80 mb-2"
              >
                {archetype.superpower}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-3xl font-display font-medium tracking-tight mb-2"
              >
                {archetype.label}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-sm opacity-80 font-sans italic"
              >
                {archetype.tagline}
              </motion.p>
            </motion.div>

            {/* AI Analysis from Antigravity Agent */}
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                className="bg-emerald-50/90 border border-emerald-200/60 rounded-3xl p-6 mb-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-800/70">What the Agent Saw in Your Journey</span>
                </div>
                <p className="text-sm font-sans text-emerald-900 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
              </motion.div>
            )}

            {/* Reveal text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 mb-4 shadow-sm"
            >
              <p className="text-sm text-slate-700 font-sans leading-relaxed mb-4">{archetype.reveal}</p>
              <div className={`flex items-start gap-3 rounded-2xl p-4 border ${archetype.bgCard}`}>
                <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${archetype.accent}`} />
                <p className={`text-xs font-sans font-semibold leading-relaxed ${archetype.accent}`}>{archetype.challenge}</p>
              </div>
            </motion.div>

            {/* Next move */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`border rounded-3xl p-6 mb-4 shadow-sm ${archetype.bgCard}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className={`w-4 h-4 ${archetype.accent}`} />
                <span className={`text-[10px] font-mono font-extrabold uppercase tracking-widest ${archetype.accent}`}>Your Next Move</span>
              </div>
              <p className={`text-sm font-sans leading-relaxed font-medium ${archetype.accent}`}>{archetype.nextHint}</p>
            </motion.div>

            {/* Surprise quote */}
            {q2.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 mb-4 shadow-sm"
              >
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest block mb-3 text-amber-800/70">
                  What You Noticed About Yourself
                </span>
                <blockquote className="text-sm font-sans text-slate-700 leading-relaxed italic border-l-2 border-amber-300 pl-4">
                  "{q2}"
                </blockquote>
                <p className="text-xs font-sans text-slate-400 mt-3">That's worth remembering.</p>
              </motion.div>
            )}

            {/* Contrast card */}
            {hasMeaningfulContrast && originalArchetype && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-amber-50/80 border border-amber-200/60 rounded-3xl p-6 mb-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-800/70">Interesting Contrast</span>
                </div>
                <p className="text-sm font-sans text-amber-900 leading-relaxed">
                  You came in as <strong>{originalArchetype.label}</strong>, but <strong>{archetype.label}</strong> came through strongest here. Both are real parts of how you work — this project just pulled a different side out.
                </p>
              </motion.div>
            )}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={onNextAdventure}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs px-8 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Find My Next Adventure</span>
              </button>
              <button
                onClick={onRestart}
                className="h-12 bg-white hover:bg-slate-50 border border-orange-200/40 text-emerald-800 font-sans font-bold text-xs px-6 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer hover:scale-[1.01] shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Start Fresh</span>
              </button>
            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
