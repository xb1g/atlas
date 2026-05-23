import { useState, useEffect } from "react";
import { Sparkles, Terminal, Code, BookOpen, AlertCircle, RefreshCw, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SessionProfile, InterviewAnswers, Opportunity } from "./types";
import InterviewForm from "./components/InterviewForm";
import LandingHero from "./components/LandingHero";
import OpportunityMenu from "./components/OpportunityMenu";
import BlueprintPlan from "./components/BlueprintPlan";
import ProjectWorkbox from "./components/ProjectWorkbox";
import ArtifactSuccess from "./components/ArtifactSuccess";
import Logo from "./components/Logo";
// @ts-ignore
import monetBg from "./assets/images/monet_cliff_horizon_1779562138549.png";

type AppView = "LANDING" | "INTERVIEW" | "MINING" | "MENU" | "BLUEPRINT" | "PROJECT" | "ARTIFACT";

export default function App() {
  const [view, setView] = useState<AppView>("LANDING");
  const [session, setSession] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeOppId, setActiveOppId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [hasLiveKey, setHasLiveKey] = useState(false);

  // Mining terminal logs state for active visual feedback
  const [miningLogs, setMiningLogs] = useState<string[]>([]);

  // Fetch Session data on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setHasLiveKey(data.hasLiveKey);
      }
    } catch (err) {
      console.error("Failed to load sandbox session active state", err);
    }
  };

  // Submit interview answers to server
  const handleInterviewSubmit = async (answers: InterviewAnswers) => {
    setLoading(true);
    setView("MINING");
    
    // Simulate mining live logs for judges
    setMiningLogs([]);
    const logsSequence = [
      "🌸 Mapping your personalized micro-adventure on: " + answers.spark,
      "🎨 Finding matching projects with pretty blogs, websites, and maps...",
      "🖌️ Crafting custom steps perfect for " + answers.name + "'s schedule...",
      "🌿 Setting up a personal, safe creation laboratory...",
      "✨ Custom helper wizard is completely ready to guide you!"
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < logsSequence.length) {
        setMiningLogs((prev) => [...prev, logsSequence[count]]);
        count++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    try {
      // Save answers in backend
      await fetch("/api/session/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      // Fetch live-mined opportunities plan
      const resp = await fetch("/api/opportunities/plan");
      const minedData = await resp.json();

      // Shorten the wait time to just 1s to feel fast but still show logs
      setTimeout(() => {
        clearInterval(interval);
        setSession((prev: any) => ({
          ...prev,
          answers,
          opportunities: minedData.opportunities
        }));
        setLoading(false);
        setView("MENU");

        // Kick off progressive building for any planned opportunity
        if (minedData.opportunities && Array.isArray(minedData.opportunities)) {
          minedData.opportunities.forEach((opp: any) => {
            if (opp.status === "planned") {
              fetch("/api/opportunities/build", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ opportunityId: opp.id }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.opportunity) {
                    setSession((prev: any) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        opportunities: prev.opportunities.map((o: any) =>
                          o.id === data.opportunity.id ? data.opportunity : o
                        ),
                      };
                    });
                  }
                })
                .catch((e) => console.error("Failed building opportunity", e));
            }
          });
        }
      }, 1500);


    } catch (err) {
      console.error("Failed mining live opportunities", err);
      clearInterval(interval);
      setLoading(false);
      setView("INTERVIEW");
    }
  };

  // Select opportunity and compile project steps tailored to student
  const handleSelectOpportunity = async (oppId: string) => {
    setLoading(true);
    setActiveOppId(oppId);
    
    try {
      const res = await fetch("/api/project/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: oppId }),
      });
      const data = await res.json();
      
      if (data.success && data.project) {
        setSession((prev: any) => ({
          ...prev,
          activeProject: data.project
        }));
        setView("BLUEPRINT");
      }
    } catch (err) {
      console.error("Failed initializing project", err);
    } finally {
      setLoading(false);
    }
  };

  // Approve currently running step
  const handleApproveStep = async () => {
    if (!session?.activeProject) return;
    setIsApproving(true);

    try {
      const res = await fetch("/api/project/approve-step", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.project) {
        setSession((prev: any) => ({
          ...prev,
          activeProject: data.project
        }));
        
        // If we processed the final step (meaning next step is missing, stepIndex is out of bounds)
        const isFinished = data.project.stepIndex >= data.project.steps.length;
        if (isFinished) {
          setTimeout(() => {
            setView("ARTIFACT");
            setIsApproving(false);
          }, 1000);
        } else {
          setIsApproving(false);
        }
      }
    } catch (err) {
      console.error("Failed approving step", err);
      setIsApproving(false);
    }
  };

  const handleRestart = () => {
    setView("LANDING");
    setActiveOppId(null);
    setSession((prev: any) => prev ? { ...prev, activeProject: null } : null);
  };

  const getSelectedOpp = (): Opportunity | undefined => {
    if (!session || !activeOppId) return undefined;
    return session.opportunities.find((o) => o.id === activeOppId);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ee] text-slate-800 flex flex-col font-sans relative overflow-hidden" id="atlas-app-container">
      
      {/* 1. Immersive Full-Screen Impressionist blurred canvas underlayer */}
      <div 
        className="fixed inset-0 w-full h-full object-cover z-0 select-none pointer-events-none filter blur-[4px] scale-[1.03] opacity-65" 
        style={{ backgroundImage: `url(${monetBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
      />
      
      {/* 2. Soft watercolor sunset/lavender blending washes */}
      <div className="sunset-glow w-[550px] h-[550px] bg-rose-200/40 -top-20 right-10 pointer-events-none z-0" />
      <div className="lavender-glow w-[400px] h-[400px] bg-indigo-200/35 bottom-10 left-10 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[#fbf9f4]/45 z-0 pointer-events-none backdrop-blur-[1px]" />

      {/* Persistent App Header with light theme glassmorphism */}
      <header className="border-b border-orange-100/40 bg-white/60 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleRestart} className="flex items-center gap-3 text-left group cursor-pointer">
            <div className="bg-emerald-50/50 border border-emerald-300/25 p-1 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-300 group-hover:border-emerald-300/50 group-hover:bg-emerald-50">
              <Logo size={34} showBg={true} className="transition-transform duration-500 ease-out group-hover:rotate-12" />
            </div>
            <div>
              <span className="text-[15px] font-display font-bold tracking-wider text-emerald-950 uppercase group-hover:text-emerald-800 transition-colors">
                Atlas
              </span>
              <p className="text-[9px] font-mono text-emerald-800/70 uppercase tracking-widest leading-none mt-1 group-hover:text-emerald-600 transition-colors">
                Real Things &bull; Dream Big
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {/* Live API token connection health status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/70 border border-orange-100/40 rounded-xl text-xs font-sans text-amber-900 shadow-sm">
              <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span className="font-medium text-[11px]">
                {hasLiveKey ? "AI Spark Enabled" : "Simulation Goggles"}
              </span>
            </div>

            <button
              onClick={handleRestart}
              className="text-xs font-mono text-emerald-800 hover:text-emerald-950 hover:underline transition uppercase tracking-wider font-semibold"
            >
              Restart Survey
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-8 z-10 relative">
        <AnimatePresence mode="wait">
          {view === "LANDING" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
            >
              <LandingHero onStart={() => setView("INTERVIEW")} />
            </motion.div>
          )}

          {view === "INTERVIEW" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <InterviewForm onSuccess={handleInterviewSubmit} isLoading={loading} />
            </motion.div>
          )}

          {view === "MINING" && (
            <motion.div
              key="mining"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-lg mx-auto text-center py-12"
            >
              {/* Spinning compass loading state for crawler */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-xl animate-ping" />
                <Logo size={64} className="animate-spin-slow mx-auto relative z-10" />
              </div>

              <h2 className="text-2xl font-display font-medium text-emerald-950 mb-2">
                Scouting Your Adventures...
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-sans mb-6">
                Our custom mapper is looking through real web formats, templates, and map ideas that fit you perfectly.
              </p>

              {/* Crawl logs monitor screen */}
              <div className="bg-white/70 border border-orange-100/50 rounded-3xl p-6 text-left font-mono text-[11px] leading-relaxed text-slate-700 min-h-[180px] flex flex-col justify-end shadow-xl backdrop-blur-md">
                <div className="flex flex-col gap-2.5">
                  {miningLogs.map((log, i) => (
                    <div key={i} className="text-emerald-800 flex items-start gap-1.5 animate-fadeIn font-semibold">
                      <span className="text-emerald-500 shrink-0 select-none">&bull;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {miningLogs.length < 5 && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>_</span>
                      <span className="w-1.5 h-3.5 bg-emerald-500 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === "MENU" && session && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <OpportunityMenu
                opportunities={session.opportunities}
                answers={session.answers}
                onSelect={handleSelectOpportunity}
                isLiveAI={hasLiveKey}
                onRestart={handleRestart}
              />
            </motion.div>
          )}

          {view === "BLUEPRINT" && session && session.activeProject && (
            <motion.div
              key="blueprint"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BlueprintPlan
                opportunity={getSelectedOpp()!}
                project={session.activeProject}
                onConfirmStart={() => setView("PROJECT")}
                onBack={() => setView("MENU")}
              />
            </motion.div>
          )}

          {view === "PROJECT" && session && session.activeProject && (
            <motion.div
              key="project"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ProjectWorkbox
                project={session.activeProject}
                opportunity={getSelectedOpp()!}
                onApproveStep={handleApproveStep}
                isApproving={isApproving}
                onBack={handleRestart}
              />
            </motion.div>
          )}

          {view === "ARTIFACT" && session && (
            <motion.div
              key="artifact"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ArtifactSuccess
                opportunity={getSelectedOpp()!}
                answers={session.answers}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tiny clean footer */}
      <footer className="border-t border-orange-100/30 bg-white/40 px-4 py-5 text-center text-emerald-800/60 text-[10px] font-mono select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; Atlas. Designed with soft impressionist brushstrokes &bull; Kid Friendly &amp; Safe</span>
          <span className="italic block mt-1 sm:mt-0 font-hand text-base text-emerald-700 font-bold">"Every child is an artist - Pablo Picasso"</span>
        </div>
      </footer>
    </div>
  );
}

