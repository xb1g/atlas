import { Opportunity, ActiveProject } from "../types";
import { Clock, Compass, ArrowRight, Shield, Award, Terminal, Code, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface BlueprintPlanProps {
  opportunity: Opportunity;
  project: ActiveProject;
  onConfirmStart: () => void;
  onBack: () => void;
}

export default function BlueprintPlan({
  opportunity,
  project,
  onConfirmStart,
  onBack,
}: BlueprintPlanProps) {
  
  // Custom text summary explaining exactly what the student will develop
  const getDeliverableSummary = () => {
    switch (opportunity.type) {
      case "oss-doc-pr":
        return {
          header: "Unified Git Documentation Patch",
          output: "A physical contribution draft and validated code diff added to iNaturalist's actual open-source database. Once approved, this adds crucial soil and microplastic hazard telemetry definitions.",
          skills: "Markdown structures, documentation pipelines, Git branches, and fork schemas."
        };
      case "publish-essay":
        return {
          header: "Signed Substack Guest Editorial Post",
          output: "A fully styled 200+ word ecological opinion newsletter piece, complete with proper headers and local student call-to-actions, published live under your signature.",
          skills: "Public outreach, persuasive essay writing, digital blogging structures, and citations."
        };
      case "eco-campaign":
        return {
          header: "Formal Citizens Petition & Council Resolution Packet",
          output: "An official public representational letter, with specific sand sieving kits procurement proposals, direct-dispatched to current county environmental planners.",
          skills: "Civic leadership, lobbying structures, local government handshakes, and policy petitioning."
        };
      case "code-widget":
        return {
          header: "Interactive React Slider Decomposition Tracker",
          output: "A fully reactive web application showing exact material decomposition sliders and microplastic breakdown calculators, deployed directly on a live GitHub Pages link.",
          skills: "React functional states, JSX layouts, dynamic slider math formulas, and cloud build compilation."
        };
      case "wildlife-map":
        return {
          header: "Atlantic Shore Sighting KML Map Layer",
          output: "A GIS coordinate dataset mapping marine turtle nesting temperature points and coastal plastic counts, ready to overlay directly on public Google Maps layers.",
          skills: "GIS boundary nodes, XML coordinate hierarchies, spatial geography, and map marker bindings."
        };
      case "teach-skill":
        return {
          header: "Official Impeccable Mobile Touch-Target Safety Guidelines",
          output: "A professional, open-source documentation module formulated to instruct AI agents on responsive padding, 44px min-height targets, and desktop cursor actions.",
          skills: "Technical guides, system instruction design, Tailwind layout structures, and Markdown prose."
        };
      default:
        return {
          header: "Custom Sandbox Project Artifact",
          output: "A functional ecosystem contribution matching your interest spark guidelines.",
          skills: "Problem solving, micro-project management, and digital agency."
        };
    }
  };

  const deliverable = getDeliverableSummary();

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn" id="blueprint-plan">
      
      {/* Header Back Link & Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-emerald-800 hover:text-emerald-950 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition duration-300 active:scale-95 font-bold cursor-pointer"
        >
          &larr; Choose Different Opportunity
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
                  TYPE: {opportunity.type.replace("-", " ")}
                </span>
              </div>
            )}

            <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest block mb-1 font-extrabold">
              What You Are Making
            </span>
            <h3 className="text-xl font-display font-medium text-emerald-950 mb-3 leading-tight">
              {deliverable.header}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-sans mb-6">
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
                    <div className="absolute left-[18px] top-8 bottom-0 w-0.5 bg-orange-100" />
                  )}

                  {/* Bullet badge indicator */}
                  <div className="w-8 h-8 rounded-full bg-[#fefdf9] border border-orange-100 text-[11px] font-mono font-bold flex items-center justify-center text-slate-500 shrink-0 group-hover:border-emerald-400 group-hover:text-emerald-600 transition-all duration-300 hover:scale-105 shadow-sm">
                    {i + 1}
                  </div>

                  {/* Step descriptions */}
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-950 tracking-wider uppercase group-hover:text-emerald-700 transition duration-200">
                      {st.title}
                    </h4>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed font-sans mt-1">
                      {st.description}
                    </p>
                    
                    {/* Visual action markers based on kind */}
                    <div className="flex gap-3 mt-2 text-[10px] font-mono text-emerald-800/60 select-none">
                      <span>Action Type: <strong className="text-emerald-900 uppercase font-bold">{st.actionType}</strong></span>
                      <span>&bull;</span>
                      <span>Target: <strong className="text-emerald-900 font-bold">{st.actionType === "publish" ? "Live Web Page" : "Virtual Sandbox"}</strong></span>
                    </div>
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
                We will set up everything for you in private, sandbox files.
              </p>
            </div>

            <button
              onClick={onConfirmStart}
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
