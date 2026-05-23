import { useState, useEffect } from "react";
import { Terminal, CheckCircle2, Circle, Play, ArrowRight, ShieldAlert, FileText, Check, Copy, Compass } from "lucide-react";
import { motion } from "motion/react";
import { ActiveProject, ProjectStep, Opportunity } from "../types";

interface ProjectWorkboxProps {
  project: ActiveProject;
  opportunity: Opportunity;
  onApproveStep: () => void;
  isApproving: boolean;
  onBack: () => void;
}

export default function ProjectWorkbox({
  project,
  opportunity,
  onApproveStep,
  isApproving,
  onBack,
}: ProjectWorkboxProps) {
  const currentStepIndex = project.stepIndex;
  
  // Terminal log simulator streaming text dynamically
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  // We find the physical active step shown
  const isCompletedProject = currentStepIndex >= project.steps.length;
  // Fallback step if index is pointing to completed state
  const activeStep = isCompletedProject 
    ? project.steps[project.steps.length - 1] 
    : project.steps[currentStepIndex];

  // Load and type matching terminal logs whenever step increases or starts
  useEffect(() => {
    if (!activeStep?.payload?.consoleLogs) return;
    
    setIsTyping(true);
    setTerminalLines([]);
    
    const logs = activeStep.payload.consoleLogs;
    let currentLine = 0;
    
    // Simulate line by line print
    const interval = setInterval(() => {
      if (currentLine < logs.length) {
        setTerminalLines((prev) => [...prev, logs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentStepIndex, activeStep]);

  const handleCopy = () => {
    if (activeStep?.payload?.editorPreview) {
      navigator.clipboard.writeText(activeStep.payload.editorPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn" id="project-workbox">
      
      {/* 1. Header Navigation & Dynamic Tracker Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-orange-100/60 pb-5">
        <div>
          <button
            onClick={onBack}
            className="text-emerald-800 hover:text-emerald-950 font-mono text-xs font-bold uppercase mb-3 inline-flex items-center gap-2 tracking-widest transition duration-200 active:scale-95 bg-transparent border-none cursor-pointer"
          >
            &larr; Back to Adventures
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-display font-medium text-emerald-950 tracking-tight">
              Adventure Lab: <span className="text-emerald-700 font-sans font-extrabold">{opportunity.title}</span>
            </h1>
            <span className="text-[10px] font-mono px-2.5 py-1 bg-[#fbfdfa]/90 border border-emerald-100/70 text-emerald-800 rounded-lg shadow-sm">
              Material: {opportunity.target}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-emerald-100/70 border border-emerald-300/30 px-4 py-2 rounded-xl text-emerald-900 text-xs font-mono font-bold shadow-sm">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          <span>CREATION ZONE ACTIVE &bull; {project.steps.length} STEPS TOTAL</span>
        </div>
      </div>

      {/* 2. Primary columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column (lg:5): Child Progress Tracker */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/85 border border-orange-100/50 rounded-3xl p-6 backdrop-blur-md shadow-lg">
            <h3 className="text-[10px] font-mono uppercase text-emerald-800/80 tracking-widest mb-6 border-b border-orange-100/60 pb-3 font-extrabold">
              Your Journey Milestones
            </h3>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-orange-100" />

              <div className="flex flex-col gap-8">
                {project.steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  const isFuture = idx > currentStepIndex;

                  return (
                    <div key={idx} className="flex gap-5 relative group">
                      
                      {/* Circle Step Status indicator badge */}
                      <div className="z-10 bg-white rounded-full p-0.5 mt-0.5 flex items-center justify-center">
                        {isDone ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-400 flex items-center justify-center text-emerald-700 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-7 h-7 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                            <Circle className="w-2 h-2 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Step Text Details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-sm font-display leading-none ${
                              isDone
                                ? "text-slate-400 line-through font-normal"
                                : isCurrent
                                ? "text-emerald-950 font-bold"
                                : "text-slate-400"
                            }`}
                          >
                            Step {idx + 1}: {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-100/60 text-emerald-800 border border-emerald-400/20 rounded-md font-bold tracking-wider">
                              ACTIVE GATE
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1.5 leading-relaxed font-sans ${isCurrent ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Child-Friendly Advice */}
          <div className="bg-emerald-50/80 border border-emerald-200/50 rounded-2xl p-5 flex gap-4 text-xs leading-relaxed font-sans text-emerald-900 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold block mb-1">Completely Private &amp; Safe</strong>
              Our system runs custom code and layouts draft buffers in a secure virtual workspace. Nothing goes public until you are 100% happy and tap approval.
            </div>
          </div>
        </div>

        {/* Right Column (lg:7): Code workspace and outputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Action Callout Card */}
          {!isCompletedProject && (
            <div className="bg-[#fffdf9] border border-emerald-400/20 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/20 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-2 font-bold">
                TAP THE GREEN BUTTON TO TAKE THIS STEP {currentStepIndex + 1}
              </span>
              <h2 className="text-xl font-display font-medium text-emerald-950 mb-2 tracking-tight">
                Let's Make: <span className="text-emerald-800 font-sans font-bold italic">"{activeStep.title}"</span>
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-sans mb-6">
                See the code generators printing in the dark output window below. Then, click the big green button to make this progress permanent!
              </p>

              <button
                onClick={onApproveStep}
                disabled={isApproving}
                id="btn-approve-step"
                className="w-full h-13 inline-flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs rounded-xl shadow transition-all duration-300 uppercase tracking-widest active:scale-[0.99] disabled:opacity-40 cursor-pointer"
              >
                <span>Make This Step Real! ✨</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Code Execution Shell Screen container */}
          <div className="bg-[#121c17] border border-orange-100/20 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            
            {/* Toolbar Header of Console */}
            <div className="bg-[#0b120f] border-b border-[#24332b] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-emerald-200">
                  console@adventure-lab:~ (Step {currentStepIndex + 1})
                </span>
                {isTyping && (
                  <span className="w-1.5 h-3.5 bg-emerald-400 animate-pulse inline-block" />
                )}
              </div>

              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-rose-500/80 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-amber-500/80 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-emerald-500/80 rounded-full"></div>
              </div>
            </div>

            {/* Console output display */}
            <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 bg-[#0d1612] min-h-[160px] flex flex-col justify-end">
              {terminalLines.length === 0 ? (
                <div className="text-emerald-900/40 italic">Waiting to process staging file generators...</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {terminalLines.map((line, idx) => (
                    <div key={idx} className={`${line.startsWith("$") ? "text-emerald-500 font-bold" : "text-amber-100"}`}>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lined-Notebook Visual Paper for Draft Previews */}
            {activeStep?.payload?.editorPreview && activeStep.actionType === "draft" && (
              <div className="border-t border-[#23352c] mt-0 bg-[#fbfaf3] text-stone-800 p-1">
                <div className="bg-[#fcfbf5] px-5 py-3 flex items-center justify-between border-b border-dashed border-stone-200">
                  <span className="text-[10px] font-mono uppercase text-stone-500 flex items-center gap-2 font-bold tracking-wider">
                    <FileText className="w-4 h-4 text-amber-600" />
                    📝 Beautiful Draft preview
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 bg-white border border-stone-200 rounded-lg transition duration-200 active:scale-95 cursor-pointer shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied Copybook!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-600" />
                        Copy text
                      </>
                    )}
                  </button>
                </div>
                {/* Visual lined story paper lines */}
                <div className="p-6 bg-[#faf9f1] max-h-[290px] overflow-y-auto" style={{ 
                  backgroundImage: "linear-gradient(#eae7d8 1px, transparent 1px)", 
                  backgroundSize: "100% 1.6rem" 
                }}>
                  <pre id="editor-preview-text" className="font-hand text-base text-stone-800 whitespace-pre-wrap leading-[1.6rem] select-all font-bold">
                    {activeStep.payload.editorPreview}
                  </pre>
                </div>
              </div>
            )}

            {/* Unified Changes Diff Preview (Rendered on Step 4 for PRs) */}
            {activeStep?.payload?.diffAfter && activeStep.actionType === "diff" && (
              <div className="border-t border-[#1e2e26] mt-0">
                <div className="bg-[#101b16] px-5 py-3 border-b border-[#22352b]">
                  <span className="text-[10px] font-mono uppercase text-[#9acbb1] font-bold tracking-wider">
                    See What's Changing!
                  </span>
                </div>
                <div className="p-5 bg-[#09110d] max-h-[300px] overflow-y-auto font-mono text-xs leading-relaxed">
                  <div className="text-emerald-400 mb-3 select-all text-[11px]">
                    {activeStep.payload.diffHeader}
                  </div>
                  
                  {/* Before */}
                  <div className="bg-rose-950/20 text-rose-300 border-l-2 border-rose-500/50 px-3 py-2 select-text text-[11px]">
                    <span className="text-rose-500/60 font-bold inline-block w-4 mr-0.5">-</span> 
                    {activeStep.payload.diffBefore}
                  </div>

                  {/* After */}
                  <div className="bg-emerald-950/20 text-[#a9fac8] border-l-2 border-emerald-500/50 px-3 py-2 mt-3 select-text text-[11px]">
                    <span className="text-emerald-500/60 font-bold inline-block w-4 mr-0.5">+</span>
                    {activeStep.payload.diffAfter}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
