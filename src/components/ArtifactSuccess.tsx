import { Sparkles, ArrowUpRight, CheckCircle2, Award, Clipboard, Copy, Search, CornerDownRight, RefreshCw, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Opportunity, InterviewAnswers } from "../types";

interface ArtifactSuccessProps {
  opportunity: Opportunity;
  answers: InterviewAnswers;
  onRestart: () => void;
}

export default function ArtifactSuccess({
  opportunity,
  answers,
  onRestart,
}: ArtifactSuccessProps) {
  const [copied, setCopied] = useState(false);

  // Generate a plausible final URL based on type
  const isPr = opportunity.type === "oss-doc-pr";
  const finalUrl = isPr 
    ? "https://github.com/inaturalist/turtle-db/pull/6249"
    : `https://${opportunity.target}/p/microplastics-sand-nurseries`;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto text-center py-6 sm:py-10 animate-fadeIn" id="artifact-success">
      
      {/* 1. Badge Accomplished Star Blast */}
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative bg-white border border-emerald-200/50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition duration-300">
          <Award className="w-10 h-10 text-emerald-600" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-mono px-4 py-1.5 rounded-full mb-6 select-none shadow-sm font-bold">
        <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-500" />
        <span className="tracking-wider text-[10.5px]">PROJECT SUCCESSFULLY CREATED! 🎉</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-display font-medium text-emerald-950 mb-3 tracking-tight">
        It's Live. You Did It!
      </h1>
      <p className="text-sm text-slate-700 max-w-lg mx-auto font-sans leading-relaxed">
        You just made a real project on the live internet! Anyone can see it, read it, or use it. That's a huge step toward making a real difference.
      </p>

      {/* 2. Shipped Artifact Card Box with Glassmorphism */}
      <div className="bg-white/85 border border-orange-100/60 rounded-3xl p-6 sm:p-8 my-10 text-left relative overflow-hidden shadow-lg backdrop-blur-md animate-fadeIn">
        <div className="absolute top-0 right-0 p-1.5 px-3 bg-emerald-100/80 border-l border-b border-emerald-200 text-[10px] font-mono text-emerald-900 font-bold tracking-wider rounded-bl-2xl">
          LIVE WEB PAGE
        </div>

        <span className="text-[10px] font-mono text-emerald-800 uppercase block mb-1 tracking-wider font-extrabold">
          YOUR PROJECT LINK
        </span>
        <h3 className="text-base font-display font-medium text-emerald-900 mb-2">
          {opportunity.title}
        </h3>
        <p className="text-xs text-slate-600 mb-6 font-sans leading-relaxed">
          This link is now live! You can copy it or click below to visit and show your friends.
        </p>

        {/* Input link paste holder */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1 bg-[#fcfbf7] border border-orange-200/60 px-4 py-3 rounded-xl flex items-center justify-between font-mono text-xs text-slate-700 shadow-inner">
            <span className="truncate pr-4 select-all font-bold" id="final-shipped-url">{finalUrl}</span>
            <button
              onClick={handleCopy}
              className="text-slate-500 hover:text-emerald-800 transition duration-200 p-1.5 rounded-lg hover:bg-slate-100 border border-transparent shrink-0 cursor-pointer"
              title="Copy Link Template"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="link-shipped-artifact"
            className="h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs px-6 rounded-xl transition-all duration-300 inline-flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg active:scale-[0.99]"
          >
            <span>Visit My Live Project! 🚀</span>
            <ArrowUpRight className="w-4 h-4 text-white font-bold" />
          </a>
        </div>
      </div>

      {/* 3. Personalized Accomplishments checkmarks log */}
      <div className="bg-white/70 border border-orange-100/50 rounded-3xl p-6 mb-10 text-left shadow-md">
        <h3 className="text-xs font-mono uppercase text-emerald-800 tracking-widest mb-4 border-b border-orange-100/40 pb-3 font-extrabold">
          What You Accomplished:
        </h3>
        <div className="flex flex-col gap-4 font-sans text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold">Found Your Spark:</strong> Turned your thoughts about <span className="text-emerald-800 font-semibold">"{answers.spark}"</span> into a beautiful active project.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold">Built Your Workspace:</strong> Created a safe sandbox, installed useful tools, and wrote the styling elements.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 font-bold">Approved Every Step:</strong> Checked each line and gave approval to publish it safely on the web.
            </div>
          </div>
        </div>
      </div>

      {/* Try another one */}
      <button
        onClick={onRestart}
        id="btn-restart"
        className="h-12 inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-orange-200/40 text-emerald-800 font-sans font-bold text-xs px-6 rounded-xl transition-all duration-300 uppercase tracking-widest cursor-pointer hover:scale-[1.01] active:scale-99 shadow-sm"
      >
        <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
        <span>Try Another Adventure!</span>
      </button>

    </div>
  );
}
