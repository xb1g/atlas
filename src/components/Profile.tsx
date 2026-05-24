import { SessionProfile } from "../types";
import { motion } from "motion/react";
import { User, Sparkles, Target, Activity, ArrowRight, Compass, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile({ session, onRestart }: { session: SessionProfile | null; onRestart: () => void }) {
  const navigate = useNavigate();

  if (!session || !session.answers) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-center">
        <Compass className="w-12 h-12 text-emerald-300 animate-spin-slow mb-4" />
        <h2 className="text-2xl font-display font-bold text-emerald-900 mb-2">No Profile Found</h2>
        <p className="text-slate-600 mb-6">Let's start your journey to create your profile.</p>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-semibold shadow-sm hover:bg-emerald-600 transition-colors"
        >
          Start Interview
        </button>
      </div>
    );
  }

  const { answers, activeProject, opportunities } = session;
  const activeOpportunity = activeProject 
    ? opportunities.find(o => o.id === activeProject.id)
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100/80 border-2 border-emerald-200 flex items-center justify-center shadow-md">
          <User className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-emerald-950">
            {answers.name}'s Profile
          </h1>
          <p className="text-sm font-mono text-emerald-800/70 uppercase tracking-widest mt-1">
            Grade {answers.grade} • Explorer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Explorer Traits */}
        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-md border border-emerald-100/50 rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-emerald-900 text-lg">Your Spark</h3>
            </div>
            <p className="text-slate-700 leading-relaxed italic bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
              "{answers.spark}"
            </p>
            
            <div className="mt-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-800/60 uppercase tracking-widest font-bold block mb-1">Focus Area</span>
                <span className="inline-block px-3 py-1 bg-white border border-orange-100 rounded-lg text-sm text-emerald-900 font-medium">
                  {answers.topic}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-800/60 uppercase tracking-widest font-bold block mb-1">Preferred Medium</span>
                <span className="inline-block px-3 py-1 bg-white border border-orange-100 rounded-lg text-sm text-emerald-900 font-medium">
                  {answers.medium}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Active Plan & Progress */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md border border-emerald-100/50 rounded-3xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-display font-bold text-emerald-900 text-xl">Current Mission</h3>
            </div>

            {activeOpportunity ? (
              <div className="space-y-6 relative z-10">
                <div className="bg-gradient-to-br from-emerald-50/80 to-white/90 border border-emerald-100/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-display font-bold text-lg text-emerald-950">
                      {activeOpportunity.title}
                    </h4>
                    {activeOpportunity.status === "completed" ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-bold rounded-md">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {activeOpportunity.summary}
                  </p>
                  
                  {activeProject && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 mb-1.5 uppercase font-bold">
                        <span>Project Progress</span>
                        <span>{Math.round((activeProject.stepIndex / (activeProject.steps.length || 1)) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-emerald-100/50 rounded-full overflow-hidden border border-emerald-200/30">
                        <motion.div 
                          className="h-full bg-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(activeProject.stepIndex / (activeProject.steps.length || 1)) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/project/${activeProject?.id}`)}
                    className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Open Kanban Board
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-700 font-semibold mb-1">No Active Plan</h4>
                <p className="text-sm text-slate-500 mb-5">You haven't selected a project to work on yet.</p>
                <button
                  onClick={() => navigate("/opportunities")}
                  className="px-6 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-sm font-semibold shadow-sm transition-colors inline-flex items-center gap-2"
                >
                  Explore Opportunities
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Footer Navigation */}
      <div className="mt-8 flex justify-between items-center px-2 border-t border-emerald-100/50 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-mono text-emerald-800/70 hover:text-emerald-900 transition-colors uppercase tracking-wider font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
