import { Opportunity, InterviewAnswers } from "../types";
import { Sparkles, Terminal, Code, Notebook, Map, Clock, Compass, ShieldAlert, BadgeCheck, FileCode, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface OpportunityMenuProps {
  opportunities: Opportunity[];
  answers: InterviewAnswers;
  onSelect: (id: string) => void;
  isLiveAI: boolean;
  onRestart: () => void;
}

export default function OpportunityMenu({
  opportunities,
  answers,
  onSelect,
  isLiveAI,
  onRestart,
}: OpportunityMenuProps) {
  return (
    <div className="max-w-6xl mx-auto animate-fadeIn" id="opportunity-menu">
      
      {/* 1. Header Summary Card of Student's Active Profile */}
      <div className="bg-white/80 border border-orange-100/60 rounded-3xl p-6 sm:p-8 mb-10 backdrop-blur-md relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1 font-bold">
              🌻 YOUR CUSTOM ADVENTURES
            </span>
            <h2 className="text-2xl font-display font-medium text-emerald-950 tracking-tight">
              Adventure Tailor for: <span className="text-emerald-700 font-sans font-extrabold">{answers.name || "Maya"}</span> ({answers.grade?.startsWith("Age") ? answers.grade : `Age ${answers.age || 16}`})
            </h2>
            <div className="flex flex-wrap gap-2.5 mt-4 font-sans text-xs">
              <span className="bg-emerald-50/85 text-emerald-900 px-3 py-1.5 rounded-xl border border-emerald-100/70 shadow-sm">
                💡 <strong>What you care about:</strong> "{answers.spark || "Coastal trash"}"
              </span>
              <span className="bg-[#fff9ec] text-amber-900 px-3 py-1.5 rounded-xl border border-orange-100/80 shadow-sm">
                🎨 <strong>Your Style:</strong> {answers.medium || "Stories & Writing"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRestart}
              className="h-11 bg-white hover:bg-slate-50 text-emerald-800 hover:text-emerald-950 font-mono text-xs uppercase tracking-widest border border-orange-200/40 hover:border-emerald-300 px-4 rounded-xl transition duration-300 active:scale-95 cursor-pointer shadow-sm"
            >
              Change Topics
            </button>
            <div className="flex items-center h-11 gap-2 px-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-sm border border-emerald-200/50">
              <BadgeCheck className="w-4 h-4 text-emerald-700" />
              <span>{isLiveAI ? "AI Guide Active" : "Practice Lab"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Title Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-medium text-emerald-950 mb-3 tracking-tight">
          Choose Your Favorite Adventure!
        </h1>
         <p className="text-xs sm:text-sm text-emerald-900/80 max-w-xl mx-auto font-sans leading-relaxed">
          Pick one of the cool ideas below. Our friendly wizard will guide you through each step to build and share it online!
        </p>
      </div>

      {/* 3. Personalized Adventures Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {opportunities.map((opp, idx) => {
          const isComingSoon = opp.type === "coming-soon";
          const isLoading = opp.status === "planned" || opp.status === "building";

          if (isLoading) {
            const loadingText = 
              opp.type === "oss-doc-pr" ? "✍️ Drafting docs PR..." :
              opp.type === "publish-essay" ? "📖 Drafting your essay..." :
              opp.type === "eco-campaign" ? "🌸 Customizing campaign..." :
              opp.type === "code-widget" ? "⚡ Configuring widget..." :
              opp.type === "wildlife-map" ? "🗺️ Drawing map layers..." :
              "✨ Planning session...";

            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col h-full bg-white/50 border border-orange-100/40 rounded-2xl overflow-hidden shadow-sm relative group animate-pulse"
              >
                <div className="h-1.5 w-full bg-slate-200" />
                <div className="relative aspect-[16/10] w-full bg-slate-100 border-b border-orange-100/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-24 h-5 rounded-lg bg-slate-200" />
                      <div className="w-16 h-5 rounded-lg bg-slate-200" />
                    </div>
                    <div className="mb-3">
                      <h3 className="text-[14px] font-sans font-extrabold text-emerald-950/70 line-clamp-2 leading-tight">
                        {opp.title}
                      </h3>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1 truncate">
                        Targeting: {opp.target}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-3 bg-slate-200 rounded w-5/6" />
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-xs font-mono text-emerald-600/80 font-bold block tracking-wider">
                       {loadingText}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/30 border-t border-orange-100/20">
                  <div className="w-full h-11 rounded-xl bg-slate-200" />
                </div>
              </motion.div>
            );
          }
          
          // Style assignments based on kind of action for pleasant light aesthetic

          let badgeText = "Document PR";
          let badgeColor = "bg-teal-50 text-teal-800 border-teal-200/50";
          let borderColor = "border-orange-100 hover:border-emerald-300/60";
          let focusColor = "bg-teal-400/45";
          let visualIcon = <Code className="w-3.5 h-3.5 text-teal-700" />;

          if (opp.type === "publish-essay") {
            badgeText = "Stories & Blogs";
            badgeColor = "bg-[#fffbeb] text-amber-800 border-amber-200/50";
            borderColor = "border-orange-100 hover:border-amber-350/60";
            focusColor = "bg-amber-400/40";
            visualIcon = <Notebook className="w-3.5 h-3.5 text-amber-700" />;
          } else if (opp.type === "eco-campaign") {
            badgeText = "Community Action";
            badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200/50";
            borderColor = "border-orange-100 hover:border-emerald-300/60";
            focusColor = "bg-emerald-400/40";
            visualIcon = <Sparkles className="w-3.5 h-3.5 text-emerald-700" />;
          } else if (opp.type === "code-widget") {
            badgeText = "Interactive Calculators";
            badgeColor = "bg-blue-50 text-blue-800 border-blue-200/50";
            borderColor = "border-orange-100 hover:border-blue-300/60";
            focusColor = "bg-blue-400/40";
            visualIcon = <FileCode className="w-3.5 h-3.5 text-blue-700" />;
          } else if (opp.type === "wildlife-map") {
            badgeText = "Ecology Maps";
            badgeColor = "bg-purple-50 text-purple-800 border-purple-200/50";
            borderColor = "border-orange-100 hover:border-purple-300/60";
            focusColor = "bg-purple-400/40";
            visualIcon = <Map className="w-3.5 h-3.5 text-purple-700" />;
          } else if (opp.type === "teach-skill") {
            badgeText = "Guide & Presentation";
            badgeColor = "bg-rose-50 text-rose-800 border-rose-200/50";
            borderColor = "border-orange-100 hover:border-rose-300/60";
            focusColor = "bg-rose-400/45";
            visualIcon = <Sparkles className="w-3.5 h-3.5 text-rose-700" />;
          } else if (isComingSoon) {
            badgeText = "Level 2 Options";
            badgeColor = "bg-slate-100 text-slate-500 border border-slate-200";
            borderColor = "border-orange-200/40 opacity-60";
            focusColor = "bg-slate-300";
          }

          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`flex flex-col h-full bg-white/85 border ${borderColor} rounded-2xl overflow-hidden shadow-md backdrop-blur-md relative group transition-all duration-300`}
            >
              {/* Top accent line */}
              <div className={`h-1.5 w-full ${focusColor}`} />

              {/* Graphical Card Image */}
              {opp.imageUrl && (
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden border-b border-orange-100/30">
                  <img
                    src={opp.imageUrl}
                    alt={opp.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent" />
                </div>
              )}

              {/* Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  
                  {/* Category and Estimated time */}
                  <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
                    <span className={`px-2.5 py-1 rounded-lg font-bold tracking-wider flex items-center gap-1.5 ${badgeColor}`}>
                      {visualIcon}
                      <span>{badgeText}</span>
                    </span>
                    <span className="text-emerald-900 font-sans font-bold flex items-center gap-1 bg-[#fefdf9] px-2 py-1 rounded-lg border border-orange-100/60 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {opp.estimatedMinutes} mins
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <h3 className="text-[14px] font-sans font-extrabold text-emerald-950 group-hover:text-emerald-700 transition duration-200 line-clamp-2 leading-tight">
                      {opp.title}
                    </h3>
                    <span className="text-[9px] font-mono text-emerald-800/60 block mt-1 truncate">
                      Source Material: {opp.target}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-700 leading-relaxed font-sans mb-4 min-h-[48px]">
                    {opp.summary}
                  </p>

                  {/* Matching Factor Quote */}
                  <div className="bg-[#fffdf8] border border-orange-100 rounded-xl p-3.5 relative mb-3">
                    <span className="absolute -top-1.5 left-2.5 px-1.5 bg-[#fffcf3] text-[8.5px] font-mono uppercase text-amber-800 font-bold">
                      💡 Why this is for you:
                    </span>
                    <p className="text-[10.5px] text-emerald-900 italic leading-relaxed">
                      "{opp.whyMatch}"
                    </p>
                  </div>

                </div>

                {/* Technical stats lines */}
                <div className="border-t border-orange-100/50 pt-3 mt-1 flex items-center justify-between font-mono text-[9px] text-slate-400">
                  <span>Scope: <strong className="text-emerald-800 uppercase">{opp.impact}</strong></span>
                  <span>Requires: <strong className="text-emerald-800">{opp.difficulty}</strong></span>
                </div>
              </div>

              {/* Interactive buttons with 44px hit-box */}
              <div className="p-4 bg-slate-50/45 border-t border-orange-100/30">
                {isComingSoon ? (
                  <span className="text-xs font-mono text-slate-400 block text-center py-2 font-medium">
                    🔒 Locks on completion
                  </span>
                ) : (
                  <button
                    onClick={() => onSelect(opp.id)}
                    id={`deploy-agent-${opp.id}`}
                    className="w-full h-11 text-xs font-mono font-bold tracking-wider uppercase rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 border border-transparent shadow shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                  >
                    ✨ Start This Adventure!
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
