import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Sparkles, Star, RefreshCw } from "lucide-react";
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
    color: "bg-blue-50 border-blue-200/60 text-blue-900",
    accent: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    superpower: "You Make Things",
    reveal: "You come alive when you're actually building — turning an idea into something real people can touch, use, or see. Your next project should involve creating the tool, not just describing it.",
    nextHint: "Build something with a real interface — a calculator, a map, a live tracker.",
  },
  talker: {
    label: "The Talker",
    color: "bg-amber-50 border-amber-200/60 text-amber-900",
    accent: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    superpower: "You Connect People",
    reveal: "You come alive when you're communicating — shaping a message, convincing someone, or making people care about something. Your next project should center your voice and your audience.",
    nextHint: "Write a piece that goes somewhere real — an op-ed, a pitch, a campaign that asks for something specific.",
  },
  organizer: {
    label: "The Organizer",
    color: "bg-emerald-50 border-emerald-200/60 text-emerald-900",
    accent: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
    superpower: "You See the System",
    reveal: "You come alive when you're figuring out how all the pieces connect — who does what, in what order, and why it works. Your next project should involve coordinating people or designing a repeatable process.",
    nextHint: "Create a plan that others can actually follow — a step-by-step guide, a repeatable event, a community system.",
  },
  tastemaker: {
    label: "The Tastemaker",
    color: "bg-rose-50 border-rose-200/60 text-rose-900",
    accent: "text-rose-700",
    badge: "bg-rose-100 text-rose-800",
    superpower: "You Feel Everything",
    reveal: "You come alive when things feel right — the right visual, the right tone, the right experience. Your next project should let your aesthetic judgment drive the work.",
    nextHint: "Create something where look and feel is the whole point — a zine, a visual campaign, a brand identity.",
  },
  investigator: {
    label: "The Investigator",
    color: "bg-purple-50 border-purple-200/60 text-purple-900",
    accent: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    superpower: "You Ask Better Questions",
    reveal: "You come alive when you're digging — finding the fact nobody noticed, tracing something back to its real cause, or surfacing what everyone assumed but nobody checked. Your next project should start with a question.",
    nextHint: "Pick a claim that's treated as obvious in your community and find out if it's actually true.",
  },
};

const q1Options = [
  { id: "builder", text: "I was in the zone building or making the actual thing" },
  { id: "talker", text: "I loved explaining, convincing, or connecting with people" },
  { id: "organizer", text: "I enjoyed figuring out how all the pieces fit together" },
  { id: "tastemaker", text: "I wanted it to look and feel exactly right" },
  { id: "investigator", text: "I kept digging to find the real answer or data" },
];

const q3Options = [
  { id: "deeper", text: "Go deeper into this same topic", desc: "Build on what I just made" },
  { id: "different", text: "Try a different kind of project", desc: "Same cause, new format" },
  { id: "new", text: "Explore a completely new cause", desc: "Fresh start, new mission" },
];

export default function Reflection({ opportunity, answers, onNextAdventure, onRestart }: ReflectionProps) {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setSurprise] = useState("");
  const [q3, setQ3] = useState<string | null>(null);
  const [phase, setPhase] = useState<"questions" | "reveal">("questions");

  const canSubmit = q1 && q3;
  const archetype = archetypes[q1 as keyof typeof archetypes];

  const handleSubmit = () => {
    if (!canSubmit) return;
    setPhase("reveal");
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fadeIn">
      <AnimatePresence mode="wait">

        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[10px] font-mono px-4 py-1.5 rounded-full mb-5 font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-amber-500" />
                3 Quick Questions
              </span>
              <h1 className="text-3xl font-display font-medium text-emerald-950 tracking-tight mb-3">
                What did you learn<br />about yourself?
              </h1>
              <p className="text-sm text-slate-600 font-sans leading-relaxed max-w-md mx-auto">
                {opportunity
                  ? `You just finished "${opportunity.title}". Your honest answers help us understand your strengths and guide your next adventure.`
                  : "Your honest answers help us understand your strengths and guide your next adventure."}
              </p>
            </div>

            <div className="space-y-6">

              {/* Q1 */}
              <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 shadow-sm">
                <p className="text-sm font-sans font-bold text-emerald-950 mb-4">
                  What part of this project felt most natural to you?
                </p>
                <div className="space-y-2.5">
                  {q1Options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQ1(opt.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border text-sm font-sans transition-all duration-200 cursor-pointer ${
                        q1 === opt.id
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-sm"
                          : "bg-[#fefdf9] border-orange-100/60 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30"
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 */}
              <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 shadow-sm">
                <p className="text-sm font-sans font-bold text-emerald-950 mb-1">
                  What surprised you about yourself? <span className="font-normal text-slate-400 text-xs">(optional)</span>
                </p>
                <p className="text-xs text-slate-400 mb-4 font-sans">Something you didn't expect — good or hard.</p>
                <textarea
                  value={q2}
                  onChange={(e) => setSurprise(e.target.value)}
                  placeholder="e.g. I thought I'd hate the writing part but I actually loved it..."
                  rows={3}
                  className="w-full bg-[#fefdf9] border border-orange-100/60 rounded-2xl px-4 py-3 text-sm font-sans text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-300 resize-none transition-colors"
                />
              </div>

              {/* Q3 */}
              <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 shadow-sm">
                <p className="text-sm font-sans font-bold text-emerald-950 mb-4">
                  Where do you want to go next?
                </p>
                <div className="space-y-2.5">
                  {q3Options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQ3(opt.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        q3 === opt.id
                          ? "bg-emerald-50 border-emerald-300 shadow-sm"
                          : "bg-[#fefdf9] border-orange-100/60 hover:border-emerald-200 hover:bg-emerald-50/30"
                      }`}
                    >
                      <span className={`text-sm font-sans font-semibold block ${q3 === opt.id ? "text-emerald-900" : "text-slate-700"}`}>
                        {opt.text}
                      </span>
                      <span className="text-xs font-sans text-slate-400 mt-0.5 block">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full h-13 py-4 rounded-2xl font-sans font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 ${
                  canSubmit
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>See My Reflection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {phase === "reveal" && archetype && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Star burst */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-amber-300/25 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 bg-white border border-orange-200/60 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Star className="w-9 h-9 text-amber-500 fill-amber-400" />
              </div>
            </div>

            <span className={`inline-block text-xs font-mono font-bold px-4 py-1.5 rounded-full border mb-5 uppercase tracking-widest ${archetype.badge} border-current/20`}>
              {archetype.superpower}
            </span>

            <h1 className="text-3xl font-display font-medium text-emerald-950 tracking-tight mb-3">
              {archetype.label}<br />showed up in this project.
            </h1>

            <p className="text-sm text-slate-600 font-sans leading-relaxed max-w-md mx-auto mb-10">
              {archetype.reveal}
            </p>

            {/* Resonance card */}
            <div className={`border rounded-3xl p-6 sm:p-8 mb-6 text-left shadow-sm ${archetype.color}`}>
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest block mb-2 opacity-60">
                Your Next Move
              </span>
              <p className={`text-sm font-sans leading-relaxed font-medium ${archetype.accent}`}>
                {archetype.nextHint}
              </p>
            </div>

            {/* Surprise if they wrote one */}
            {q2.trim() && (
              <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-5 mb-6 text-left shadow-sm">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest block mb-2 text-amber-800/70">
                  What You Noticed About Yourself
                </span>
                <p className="text-sm font-sans text-slate-700 leading-relaxed italic">
                  "{q2}"
                </p>
                <p className="text-xs font-sans text-slate-400 mt-2">
                  That's worth remembering.
                </p>
              </div>
            )}

            {/* Original archetype vs reveal */}
            {answers.medium && q1 && answers.medium !== q1 && (
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-3xl p-5 mb-8 text-left shadow-sm">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest block mb-2 text-amber-800/70">
                  Interesting Contrast
                </span>
                <p className="text-sm font-sans text-amber-900 leading-relaxed">
                  You came in as <strong>{archetypes[answers.medium as keyof typeof archetypes]?.label || answers.medium}</strong>, but your <strong>{archetype.label}</strong> came through strongest in this project. Both are real parts of how you work.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onNextAdventure}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs px-8 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
