import React from "react";
import { motion } from "motion/react";
import { Code, Users, Compass, Palette, Search, ArrowRight, Sparkles, Lightbulb, Map, Rocket, ShieldCheck, Eye, Terminal, CheckCircle2 } from "lucide-react";
// @ts-ignore
import monetBg from "../assets/images/monet_cliff_horizon_1779562138549.png";
// @ts-ignore
import archBuilderImg from "../assets/images/arch_builder_1779567097396.png";
// @ts-ignore
import archTalkerImg from "../assets/images/arch_talker_1779567124256.png";
// @ts-ignore
import archOrganizerImg from "../assets/images/arch_organizer_1779567159256.png";
// @ts-ignore
import archTastemakerImg from "../assets/images/arch_tastemaker_1779567222391.png";
// @ts-ignore
import archInvestigatorImg from "../assets/images/arch_investigator_1779567281134.png";

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
      <div className="group relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[460px] mb-12 flex flex-col justify-end p-6 sm:p-12 border border-orange-200/40 shadow-md">
        <img
          src={monetBg}
          alt="Monet Horizon Window of Opportunity"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-[1.04] group-hover:scale-100 transition-transform duration-[2000ms] ease-out"
        />
        
        {/* Magical warm atmospheric glow that fades in on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms] pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-[80px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-[100px]" />
        </div>

        {/* Sky styling warm transition gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9]/60 to-transparent" />
        
        <div className="relative z-10 max-w-2xl text-left">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 border border-orange-200/50 rounded-full text-[10px] font-mono text-emerald-800 mb-5 tracking-widest uppercase font-bold shadow-sm select-none hover:bg-white hover:border-emerald-300 transition-colors cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Escape the traditional classroom &bull; Find Your Leverage</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-4xl sm:text-6xl font-display font-medium text-emerald-950 tracking-tight leading-[1.05]"
          >
            Stop being a cog. <br />
            <span className="text-emerald-700 font-sans font-bold">Uncover Your Zone of Genius.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-sm sm:text-base text-slate-700 mt-5 font-sans leading-relaxed max-w-xl"
          >
            In an AI-driven, high-agency world, education is no longer about worksheets and uniform standards. Kids split naturally into distinct powerhouses of creativity. Discover your unique leverage today.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-8 flex items-center gap-6"
          >
            <button
              onClick={onStart}
              id="btn-discovery-get-started"
              className="group/btn relative overflow-hidden h-14 inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-sm px-8 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 shadow-lg shadow-emerald-900/20 uppercase tracking-wider cursor-pointer"
            >
              {/* Satisfying shine sweep effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1.5s] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              <span className="relative z-10">Launch Your Adventure</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
            
            {/* Whimsical handcrafted delight annotation */}
            <div className="hidden sm:block text-emerald-800/60 font-hand text-xl -rotate-3 select-none opacity-80 hover:opacity-100 hover:scale-105 hover:-rotate-6 transition-all cursor-default">
              * It's totally free!
            </div>
          </motion.div>
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
                className="bg-[#fcfbf9] border border-[#e0ddd0]/60 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-emerald-300 flex flex-col justify-between group relative"
              >
                {/* Immersive Faded Image Header */}
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={arch.img}
                    alt={arch.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 mix-blend-multiply [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] opacity-95"
                  />
                  <div className="absolute top-5 left-5 p-2.5 rounded-xl bg-[#f7f5ee]/80 backdrop-blur-md shadow-sm border border-[#e0ddd0]/50 z-10 group-hover:bg-white transition-colors duration-300">
                    <IconComponent className="w-4.5 h-4.5 text-emerald-800" />
                  </div>
                  <div className="absolute top-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                    <span className={`text-[9.5px] font-mono uppercase font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-xl ${arch.badgeColor.replace(/border-[a-z]+-\d+\/\d+/, 'border-white/20')} bg-white/40`}>
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

      {/* --- NEW SECTION: Problem & Audience --- */}
      <div className="mb-16 bg-[#fcfbf9] border border-[#e0ddd0]/60 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-widest block font-extrabold bg-emerald-100/50 px-3 py-1 rounded-full w-max mx-auto border border-emerald-250/20 mb-4">
            Built for the Next Generation of Creators
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 mb-6 leading-tight">
            The Problem with Traditional Learning
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-8">
            <div className="bg-white/60 p-6 rounded-2xl border border-orange-100/40">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-emerald-950">The Old Way</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Traditional coding is overwhelming. You are met with heavy registration walls, intimidating command-line logs, and boring sandbox quizzes that don't solve real problems in your community.
              </p>
            </div>
            
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-950">The Atlas Way</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Atlas flips the script. Bring a real-world problem you care about (your "spark"), and we guide you step-by-step to build a live, shippable web project—no computer science degree required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW SECTION: How Atlas Works --- */}
      <div className="mb-16">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 leading-tight">
            Turn What Bugs You Into Real Impact
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-3">
            From a raw idea to a live web project in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Lightbulb,
              title: "1. Find Your Spark",
              desc: "Tell us about a real-world problem you care about—whether it's cafeteria waste, local beach plastic, or organizing a club.",
              color: "text-amber-500",
              bg: "bg-amber-50"
            },
            {
              icon: Map,
              title: "2. Build Your Blueprint",
              desc: "Our AI assistant acts as your co-pilot, safely drafting a custom project plan. No scary terminals, just clear choices.",
              color: "text-blue-500",
              bg: "bg-blue-50"
            },
            {
              icon: Rocket,
              title: "3. Launch to Live Web",
              desc: "Approve the steps, and watch your project come to life. Get a real URL to share with your friends and community.",
              color: "text-emerald-500",
              bg: "bg-emerald-50"
            }
          ].map((step, i) => (
            <div key={i} className="bg-white/80 border border-orange-100/70 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${step.bg}`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-3 font-display">{step.title}</h3>
              <p className="text-sm text-slate-600 font-sans leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- NEW SECTION: Feature Highlights --- */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">Real Tech, Not Toys</h4>
            <p className="text-xs text-slate-500 font-sans">You aren't playing a simulation. You are deploying actual web applications to the live internet.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">You're The Boss</h4>
            <p className="text-xs text-slate-500 font-sans">Nothing happens without your approval. Review every single change before it goes live.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <Eye className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">Eye-Safe & Focus-Friendly</h4>
            <p className="text-xs text-slate-500 font-sans">Designed with warm Monet-inspired colors and readable layouts to keep you in the zone.</p>
          </div>
        </div>
      </div>

      {/* 3. Better Together explanation box */}
      <div className="bg-emerald-50/60 border border-emerald-100/60 rounded-3xl p-6 sm:p-10 backdrop-blur-sm max-w-4xl mx-auto shadow-sm text-center">
        <h3 className="text-xs font-mono text-emerald-900 uppercase font-bold tracking-widest mb-3.5">
          ⚡ Better Together
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-700 font-sans max-w-3xl mx-auto leading-relaxed">
          You don't have to be good at everything. In the real world, the best projects are built by teams who bring different strengths to the table: <br className="hidden sm:inline" />
          The <strong className="text-emerald-900">Investigator</strong> finds the facts. The <strong className="text-emerald-900">Tastemaker</strong> makes it look amazing. The <strong className="text-emerald-900">Organizer</strong> keeps the plan on track. The <strong className="text-emerald-900">Builder</strong> writes the code. The <strong className="text-emerald-900">Talker</strong> shares the story with the world. Find your strength, and team up with others to cover the rest.
        </p>
      </div>

    </div>
  );
}
