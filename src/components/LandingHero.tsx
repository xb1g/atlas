import React from "react";
import { motion } from "motion/react";
import { Code, Users, Compass, Palette, Search, ArrowRight, Sparkles } from "lucide-react";
// @ts-ignore
import monetBg from "../assets/images/monet_cliff_horizon_1779562138549.png";
// @ts-ignore
import archBuilderImg from "../assets/images/arch_builder_1779565345753.png";
// @ts-ignore
import archTalkerImg from "../assets/images/arch_talker_1779565361064.png";
// @ts-ignore
import archOrganizerImg from "../assets/images/arch_organizer_1779565377067.png";
// @ts-ignore
import archTastemakerImg from "../assets/images/arch_tastemaker_1779565390175.png";
// @ts-ignore
import archInvestigatorImg from "../assets/images/arch_investigator_1779565404008.png";

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  const archetypes = [
    {
      id: "builder",
      title: "The Builder",
      leverage: "Technical Leverage",
      desc: "The engineers, coders, and makers. They rapidly construct robust architectures and shippable web apps using tireless AI assistance.",
      icon: Code,
      img: archBuilderImg,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200/50",
      iconBox: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "talker",
      title: "The Talker",
      leverage: "Human Leverage",
      desc: "The storytellers, operators, and networkers. They look people in the eye, pitch authentic visions, tell compelling stories, and build human trust.",
      icon: Users,
      img: archTalkerImg,
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200/50",
      iconBox: "bg-blue-100 text-blue-700",
    },
    {
      id: "organizer",
      title: "The Organizer",
      leverage: "Systems Leverage",
      desc: "The systems architects and planners. They love setting up workflows, designing logistical databases, and orchestrating how APIs and teams fit together.",
      icon: Compass,
      img: archOrganizerImg,
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200/50",
      iconBox: "bg-purple-100 text-purple-700",
    },
    {
      id: "tastemaker",
      title: "The Tastemaker",
      leverage: "Taste Leverage",
      desc: "The deep feelers and aesthetic masters. Hyper-sensitive to quality, style, and human emotion. They look at AI outputs and ensure they have soul.",
      icon: Palette,
      img: archTastemakerImg,
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200/50",
      iconBox: "bg-rose-100 text-rose-700",
    },
    {
      id: "investigator",
      title: "The Investigator",
      leverage: "Insight Leverage",
      desc: "The truth seekers driven by insatiable curiosity. They spend hours diving deep into niche rabbit holes to ask entirely new, profound questions.",
      icon: Search,
      img: archInvestigatorImg,
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200/50",
      iconBox: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 animate-fadeIn" id="landing-hero">
      
      {/* 1. Stunning Main Aesthetic Header Section */}
      <div className="relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[400px] mb-12 flex flex-col justify-end p-6 sm:p-12 border border-orange-200/40 shadow-md">
        <img
          src={monetBg}
          alt="Monet Horizon Window of Opportunity"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-100 hover:scale-[1.02] transition-transform duration-1000"
        />
        {/* Sky styling warm transition gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9]/50 to-transparent" />
        
        <div className="relative z-10 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 border border-orange-200/50 rounded-full text-[10px] font-mono text-emerald-800 mb-4 tracking-widest uppercase font-bold shadow-sm select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Escape the traditional classroom &bull; Find Your Leverage</span>
          </div>

          <h1 className="text-3xl sm:text-5.51xl font-display font-medium text-emerald-950 tracking-tight leading-[1.1]">
            Stop being a cog. <br />
            <span className="text-emerald-700 font-sans font-bold">Uncover Your Zone of Genius.</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-705 mt-4 font-sans leading-relaxed max-w-xl">
            In an AI-driven, high-agency world, education is no longer about worksheets and uniform standards. Kids split naturally into distinct powerhouses of creativity. Discover your unique leverage today.
          </p>
          
          <div className="mt-8">
            <button
              onClick={onStart}
              id="btn-discovery-get-started"
              className="h-14 inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-sm px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-99 shadow-lg uppercase tracking-wider cursor-pointer"
            >
              <span>Launch Your Adventure</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Archetypes Grid Container */}
      <div className="mb-14">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-widest block font-extrabold bg-emerald-100/50 px-3 py-1 rounded-full w-max mx-auto border border-emerald-250/20">
            THE FIVE LEVERAGE SIGNATURES
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 mt-3 leading-tight">
            How Kids Segment in a High-Agency AI-Powered World
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-2">
            When given freedom to produce rather than memorize, kids naturally gravitate toward these vital zones of genius.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="archetypes-selector-grid">
          {archetypes.map((arch) => {
            const IconComponent = arch.icon;
            return (
              <div
                key={arch.id}
                className="bg-white/80 border border-orange-100/70 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-emerald-300 backdrop-blur-sm flex flex-col justify-between group"
              >
                {/* Visual Header / Generated 3D Illustration Area */}
                <div className="relative h-44 bg-gradient-to-br from-orange-50/40 to-slate-50 border-b border-dashed border-orange-100/60 overflow-hidden flex items-center justify-center">
                  <img
                    src={arch.img}
                    alt={arch.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/95 shadow-sm border border-orange-100/40">
                    <IconComponent className="w-4.5 h-4.5 text-emerald-800" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className={`text-[9.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border shadow-sm ${arch.badgeColor}`}>
                      {arch.leverage}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 mb-2 font-display">
                      {arch.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-600 font-sans leading-relaxed">
                      {arch.desc}
                    </p>
                  </div>
                  
                  <div className="pt-4 mt-5 border-t border-orange-100/30 flex items-center justify-between text-[10px] font-mono text-emerald-800/80 uppercase font-bold">
                    <span>Active Leverage Channel</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Symbiote explanation box */}
      <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-3xl p-6 sm:p-10 backdrop-blur-sm max-w-4xl mx-auto shadow-sm text-center">
        <h3 className="text-xs font-mono text-emerald-900 uppercase font-bold tracking-widest mb-3.5">
          ⚡ THE Symbiotic Loop Ecosystem
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-700 font-sans max-w-3xl mx-auto leading-relaxed">
          In a post-cog world, these segments don&apos;t compete—they form an extremely fast, high-leverage symbiotic production spiral: <br className="hidden sm:inline" />
          The <strong className="text-emerald-900">Investigator</strong> uncovers deep first-principles truths. The <strong className="text-emerald-900">Tastemaker</strong> defines premium user empathy. The <strong className="text-emerald-900">Organizer</strong> coordinates operational systems. The <strong className="text-emerald-900">Builder</strong> deploys smart web architectures. The <strong className="text-emerald-900">Talker</strong> connects with the network to tell the story and build deep trust.
        </p>
      </div>

    </div>
  );
}
