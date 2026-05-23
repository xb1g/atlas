import { Opportunity, ActiveProject } from "../types";
import { Clock, Compass, ArrowRight, Shield, Award, Terminal, Code, Sparkles, FileText, CheckCircle2, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface BlueprintPlanProps {
  opportunity: Opportunity;
  project: ActiveProject;
  onConfirmStart: (selectedSteps: any[]) => void;
  onBack: () => void;
}

export default function BlueprintPlan({
  opportunity,
  project,
  onConfirmStart,
  onBack,
}: BlueprintPlanProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    project.steps.map((_, i) => i)
  );
  
  const typeLabel = opportunity.label || opportunity.type;

  const deliverable = {
    header: opportunity.impact || opportunity.title,
    output: opportunity.summary,
    skills: opportunity.complexity || "",
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
              {project.steps.map((st, i) => (
                <div key={i} className="flex gap-5 items-start relative pl-1 group">
                  
                  {/* Vertical connector line */}
                  {i < project.steps.length - 1 && (
                    <div className="absolute left-[34px] top-8 bottom-0 w-0.5 bg-orange-100" />
                  )}

                  {/* Bullet badge indicator & checkbox */}
                  <div className="flex items-center gap-3.5 shrink-0 relative z-10">
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(i)}
                      onChange={() => {
                        if (selectedIndices.includes(i)) {
                          // Prevent unchecking everything (must have at least 1 step)
                          if (selectedIndices.length > 1) {
                            setSelectedIndices(selectedIndices.filter((idx) => idx !== i));
                          }
                        } else {
                          setSelectedIndices([...selectedIndices, i].sort((a, b) => a - b));
                        }
                      }}
                      className="w-4 h-4 rounded accent-emerald-600 focus:ring-emerald-500 border-slate-300 transition duration-150 cursor-pointer shadow-sm"
                    />
                    <div className={`w-8 h-8 rounded-full border text-[11px] font-mono font-bold flex items-center justify-center transition-all duration-300 shadow-sm ${
                      selectedIndices.includes(i)
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold scale-105"
                        : "bg-slate-100 border-slate-200 text-slate-400 opacity-60"
                    }`}>
                      {i + 1}
                    </div>
                  </div>

                  {/* Step descriptions */}
                  <div className={`transition-all duration-200 ${
                    selectedIndices.includes(i) ? "" : "opacity-45 line-through decoration-slate-400/80 decoration-1"
                  }`}>
                    <h4 className="text-sm font-sans font-bold text-emerald-950 group-hover:text-emerald-700 transition duration-200">
                      {st.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans mt-1.5">
                      {st.description}
                    </p>
                    
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Action Call Confirmation Bar */}
          <div className="border-t border-orange-200/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <span className="text-[10px] font-mono text-emerald-800 uppercase block tracking-wider font-extrabold">
                READY TO START?
              </span>
              <p className="text-xs text-slate-500 font-sans mt-1">
                We will plan and set up only your {selectedIndices.length} selected steps in the sandbox files.
              </p>
            </div>

            <button
              onClick={() => onConfirmStart(project.steps.filter((_, i) => selectedIndices.includes(i)))}
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs px-6 rounded-xl uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99] cursor-pointer"
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
