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
