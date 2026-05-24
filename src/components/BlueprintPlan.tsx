import { Opportunity, ActiveProject } from "../types";
import { Clock, Compass, ArrowRight, Shield, Award, Terminal, Code, Sparkles, FileText, CheckCircle2, ChevronLeft, MessageSquare, Send } from "lucide-react";
import { motion } from "motion/react";
import { FormEvent, useEffect, useRef, useState } from "react";

interface BlueprintPlanProps {
  opportunity: Opportunity;
  project: ActiveProject | null;
  onConfirmStart: (selectedSteps: any[]) => void;
  onBack: () => void;
  onUpdateProject: (updatedProject: ActiveProject) => void;
}

export default function BlueprintPlan({
  opportunity,
  project,
  onConfirmStart,
  onBack,
  onUpdateProject,
}: BlueprintPlanProps) {
  const getStepKey = (step: ActiveProject["steps"][number], index: number) => step.id ?? `${project?.id}-step-${index}`;
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>(
    project ? project.steps.map((step, i) => getStepKey(step, i)) : []
  );
  const [chatMessages, setChatMessages] = useState<{ sender: "agent" | "student"; text: string }[]>([
    {
      sender: "agent",
      text: "Tell me what to change before we start. I can rewrite, add, remove, or reorder the steps on this plan.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const knownStepIdsRef = useRef<Set<string>>(new Set(project ? project.steps.map((step, i) => getStepKey(step, i)) : []));
  
  const typeLabel = opportunity.label || opportunity.type;
  const selectedSteps = project ? project.steps.filter((step, i) => selectedStepIds.includes(getStepKey(step, i))) : [];

  const deliverable = {
    header: opportunity.impact || opportunity.title,
    output: opportunity.summary,
    skills: opportunity.complexity || "",
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  useEffect(() => {
    if (!project) return;
    const visibleIds = project.steps.map((step, i) => getStepKey(step, i));
    const previousKnownIds = knownStepIdsRef.current;
    const nextKnownIds = new Set(visibleIds);

    setSelectedStepIds((prev) => {
      const kept = prev.filter((id) => nextKnownIds.has(id));
      const newlyAdded = visibleIds.filter((id) => !previousKnownIds.has(id));
      const unique = new Set([...kept, ...newlyAdded]);
      const next = visibleIds.filter((id) => unique.has(id));
      return next.length > 0 ? next : visibleIds.slice(0, 1);
    });

    knownStepIdsRef.current = nextKnownIds;
  }, [project?.steps, project?.id]);

  const toggleStepSelection = (stepId: string) => {
    setSelectedStepIds((prev) => {
      if (prev.includes(stepId)) {
        return prev.length > 1 ? prev.filter((id) => id !== stepId) : prev;
      }

      const next = [...prev, stepId];
      return project.steps
        .map((step, i) => getStepKey(step, i))
        .filter((id) => next.includes(id));
    });
  };

  const handleSendPlanChat = async (e: FormEvent) => {
    e.preventDefault();
    const studentMessage = chatInput.trim();
    if (!studentMessage || isAgentTyping) return;

    const updatedMessages = [...chatMessages, { sender: "student" as const, text: studentMessage }];
    setChatInput("");
    setChatMessages(updatedMessages);
    setIsAgentTyping(true);

    try {
      const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
      const res = await fetch("/api/project/chat-to-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          message: studentMessage,
          messages: updatedMessages,
        }),
      });
      const data = await res.json();

      if (data.project?.steps) {
        onUpdateProject(data.project);
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: data.reply || "I updated the plan. Review the steps above before starting.",
        },
      ]);
    } catch (err) {
      console.error("Plan editor chat failed", err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "I could not update the plan just now. Try a shorter request like 'replace these with community toolkit steps'.",
        },
      ]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn" id="blueprint-plan">
      
      {/* Header Back Link & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-emerald-200/50 text-emerald-800 hover:bg-white hover:border-emerald-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Adventures
        </button>
        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-lg border border-emerald-200/50 uppercase tracking-widest font-bold shadow-sm">
          YOUR ADVENTURE PLAN
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left COLUMN - What You Are Making Card (lg:5) */}
        <div className="lg:col-span-5 bg-white/80 border border-orange-100/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/10 via-transparent to-transparent opacity-55 pointer-events-none" />
          
          <div className="relative z-10">
            {/* Project illustration */}
            {opportunity.imageUrl && (
              <div className="rounded-2xl overflow-hidden aspect-[16/11] border border-orange-100/50 relative bg-slate-50 shadow-sm mb-6">
                <img
                  src={opportunity.imageUrl}
                  alt={opportunity.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 bg-emerald-100 text-emerald-800 font-mono text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold shadow-sm border border-emerald-200/50">
                  {typeLabel}
                </span>
              </div>
            )}

            <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest block mb-1 font-extrabold">
              What You Are Making
            </span>
            <h3 className="text-xl font-display font-medium text-emerald-950 mb-3 leading-tight">
              {deliverable.header}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed font-sans mb-6">
              {deliverable.output}
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-orange-200/40">
            <span className="text-[10px] font-mono text-emerald-900/60 uppercase block tracking-wider font-bold mb-3">
              Skills You will Learn:
            </span>
            <div className="flex flex-wrap gap-2 mb-6">
              {deliverable.skills.split(", ").map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-sans font-semibold text-emerald-900 bg-[#fffdf8] px-3 py-1.5 rounded-xl border border-orange-100/70 shadow-sm"
                >
                  &rsaquo; {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3.5 bg-[#fefdf9] rounded-2xl p-4 border border-orange-100/70 shadow-sm">
              <Award className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-emerald-950 block font-sans font-bold">Special Achievement Badge</strong>
                <span className="text-slate-500 font-sans">You will get a beautiful digital badge to display in your art and project folder!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right COLUMN - Map of Journey timeline (lg:7) */}
        <div className="lg:col-span-7 bg-white/70 border border-orange-100/40 rounded-3xl p-6 sm:p-9 flex flex-col justify-between backdrop-blur-md relative shadow-lg">
          
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-mono text-emerald-800 uppercase tracking-widest font-extrabold">
                  Your Project Steps
                </span>
                <h2 className="text-2xl font-display font-medium text-emerald-950 mt-1 tracking-tight">
                  Map of Your Journey
                </h2>
              </div>
              <div className="flex items-center gap-2 bg-[#fefdf9] text-emerald-800 px-3 py-1.5 rounded-xl border border-orange-100/60 text-xs font-mono shadow-sm">
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span className="font-bold">{opportunity.estimatedMinutes} Mins Plan</span>
              </div>
            </div>

            <p className="text-xs text-slate-800/80 mb-8 font-sans leading-relaxed">
              We structured a step-by-step path to compile the files. Let's make this together:
            </p>

            {/* Timelines of compiled steps */}
            <div className="space-y-6 mb-10">
              {!project ? (
                // Skeleton cards while AI generates steps
                [1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="flex gap-5 items-start relative pl-1"
                  >
                    {i < 5 && <div className="absolute left-[34px] top-8 bottom-0 w-0.5 bg-orange-100" />}
                    <div className="flex items-center gap-3.5 shrink-0 relative z-10">
                      <div className="w-4 h-4 rounded bg-slate-200 animate-pulse" />
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/50 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-300 animate-pulse">
                        {i}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-48 bg-emerald-950/12 rounded animate-pulse" />
                      <span className="text-[9px] font-mono text-amber-700/60 uppercase tracking-wider font-bold block">Milestone Brief</span>
                      <div className="h-3 w-11/12 bg-slate-400/12 rounded animate-pulse" />
                      <div className="h-3 w-5/6 bg-slate-400/10 rounded animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : (
                project.steps.map((st, i) => {
                  const stepId = getStepKey(st, i);
                  const isSelected = selectedStepIds.includes(stepId);
                  return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    className="flex gap-5 items-start relative pl-1 group"
                  >
                    {/* Vertical connector line */}
                    {i < project.steps.length - 1 && (
                      <div className="absolute left-[34px] top-8 bottom-0 w-0.5 bg-orange-100" />
                    )}

                    {/* Bullet badge indicator & checkbox */}
                    <div className="flex items-center gap-3.5 shrink-0 relative z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStepSelection(stepId)}
                        className="w-4 h-4 rounded accent-emerald-600 focus:ring-emerald-500 border-slate-300 transition duration-150 cursor-pointer shadow-sm"
                      />
                      <div className={`w-8 h-8 rounded-full border text-[11px] font-mono font-bold flex items-center justify-center transition-all duration-300 shadow-sm ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold scale-105"
                          : "bg-slate-100 border-slate-200 text-slate-400 opacity-60"
                      }`}>
                        {i + 1}
                      </div>
                    </div>

                    {/* Step descriptions */}
                    <div className={`transition-all duration-200 ${
                      isSelected ? "" : "opacity-45 line-through decoration-slate-400/80 decoration-1"
                    }`}>
                      <h4 className="text-sm font-sans font-bold text-emerald-950 group-hover:text-emerald-700 transition duration-200">
                        {st.title}
                      </h4>
                      <span className="text-[9px] font-mono text-amber-700/70 uppercase tracking-wider font-bold block mt-0.5">Milestone Brief</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1">
                        {st.description}
                      </p>
                    </div>

                  </motion.div>
                )})
              )}
            </div>
          </div>

          <div className="border-t border-orange-200/40 pt-5 mb-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-emerald-950 leading-tight">AI Plan Editor</h3>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Update this plan before starting</p>
                </div>
              </div>
            </div>

            <div className="bg-[#fefdf9] border border-orange-100/70 rounded-2xl p-3 shadow-sm">
              <div className="max-h-36 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar mb-3">
                {chatMessages.map((msg, index) => {
                  const isAgent = msg.sender === "agent";
                  return (
                    <div
                      key={index}
                      className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed text-left ${
                          isAgent
                            ? "bg-indigo-50 border border-indigo-100 text-indigo-950 rounded-bl-sm"
                            : "bg-white border border-orange-100 text-emerald-950 rounded-br-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {isAgentTyping && (
                  <div className="text-[10px] text-indigo-700 font-mono uppercase tracking-wider font-bold">
                    Updating plan...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  "Replace these with community toolkit steps",
                  "Add a reporting instructions step",
                  "Make the messaging more respectful",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setChatInput(suggestion)}
                    disabled={isAgentTyping || !project}
                    className="text-[9px] font-mono font-bold uppercase tracking-wide bg-white text-indigo-900 border border-indigo-100 rounded-lg px-2 py-1 hover:bg-indigo-50 transition cursor-pointer disabled:opacity-45"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendPlanChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={!project ? "Generating your steps..." : "Ask AI to rewrite, add, remove, or reorder steps..."}
                  disabled={isAgentTyping || !project}
                  className="min-w-0 flex-1 h-10 rounded-xl border border-orange-100 bg-white px-3 text-xs text-emerald-950 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentTyping || !project}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Action Call Confirmation Bar */}
          <div className="border-t border-orange-200/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <span className="text-[10px] font-mono text-emerald-800 uppercase block tracking-wider font-extrabold">
                READY TO START?
              </span>
              <p className="text-xs text-slate-500 font-sans mt-1">
                {!project
                  ? "✨ Generating your personalized steps..."
                  : `We will plan and set up only your ${selectedSteps.length} selected steps in the sandbox files.`}
              </p>
            </div>

            <button
              onClick={() => onConfirmStart(selectedSteps)}
              disabled={!project || selectedSteps.length === 0}
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-sans font-bold text-xs px-6 rounded-xl uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] cursor-pointer"
            >
              <span>Let's Start Building!</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
