import React from "react";
import { motion } from "motion/react";
import { Code, Users, Compass, Palette, Search, ArrowRight, Sparkles, Lightbulb, Map, Rocket, ShieldCheck, Terminal, CheckCircle2 } from "lucide-react";
// @ts-ignore
import monetBg from "../assets/images/monet_cliff_horizon_1779562138549.webp";
// @ts-ignore
import archBuilderImg from "../assets/images/arch_builder_1779567097396.webp";
// @ts-ignore
import archTalkerImg from "../assets/images/arch_talker_1779567124256.webp";
// @ts-ignore
import archOrganizerImg from "../assets/images/arch_organizer_1779567159256.webp";
// @ts-ignore
import archTastemakerImg from "../assets/images/arch_tastemaker_1779567222391.webp";
// @ts-ignore
import archInvestigatorImg from "../assets/images/arch_investigator_1779567281134.webp";

interface LandingHeroProps {
  onStart: () => void;
}

export default function LandingHero({ onStart }: LandingHeroProps) {
  const archetypes = [
    {
      id: "builder",
      title: "The Builder",
      superpower: "You Make Things",
      desc: "The makers and coders. They love turning ideas into real things—websites, apps, and tools that people can actually use.",
      icon: Code,
      img: archBuilderImg,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200/50",
      iconBox: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "talker",
      title: "The Talker",
      superpower: "You Connect People",
      desc: "The storytellers and connectors. They pitch ideas, build trust, and get people genuinely excited about what they're creating.",
      icon: Users,
      img: archTalkerImg,
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200/50",
      iconBox: "bg-blue-100 text-blue-700",
    },
    {
      id: "organizer",
      title: "The Organizer",
      superpower: "You See the System",
      desc: "The planners and problem-solvers. They love figuring out how things fit together—step-by-step plans that actually work.",
      icon: Compass,
      img: archOrganizerImg,
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200/50",
      iconBox: "bg-purple-100 text-purple-700",
    },
    {
      id: "tastemaker",
      title: "The Tastemaker",
      superpower: "You Feel Everything",
      desc: "The designers and feelers. Hyper-sensitive to what looks right, sounds right, and feels right. They make things beautiful and human.",
      icon: Palette,
      img: archTastemakerImg,
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200/50",
      iconBox: "bg-rose-100 text-rose-700",
    },
    {
      id: "investigator",
      title: "The Investigator",
      superpower: "You Ask Better Questions",
      desc: "The curious truth-seekers. They dive deep into niche rabbit holes and find the insights nobody else noticed.",
      icon: Search,
      img: archInvestigatorImg,
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200/50",
      iconBox: "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 animate-fadeIn" id="landing-hero">

      {/* 1. Hero */}
      <div className="group relative rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[460px] mb-12 flex flex-col justify-end p-6 sm:p-12 border border-orange-200/40 shadow-md">
        <img
          src={monetBg}
          alt="Monet Horizon"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-[1.04] group-hover:scale-100 transition-transform duration-[2000ms] ease-out"
        />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms] pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/30 rounded-full blur-[80px] animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-[100px]" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9] via-[#fcfbf9]/60 to-transparent" />

        <div className="relative z-10 max-w-2xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 border border-orange-200/50 rounded-full text-[10px] font-mono text-emerald-800 mb-5 tracking-widest uppercase font-bold shadow-sm select-none hover:bg-white hover:border-emerald-300 transition-colors cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Every kid has a superpower &bull; Make Real Impact</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-4xl sm:text-5xl lg:text-[54px] font-display font-medium text-emerald-950 tracking-tight leading-[1.05]"
          >
            The world you want doesn't exist yet. <br />
            <span className="text-emerald-700 font-sans font-bold">You have the power to create it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-sm sm:text-base text-slate-700 mt-5 font-sans leading-relaxed max-w-xl"
          >
            You don't have to wait until you're older to make real change. Whether you code, tell stories, research, design, or organize—Atlas channels what you're naturally good at into something that matters.
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
              <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1.5s] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              <span className="relative z-10">Launch Your Adventure</span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>

            <div className="hidden sm:block text-emerald-800/60 font-hand text-xl -rotate-3 select-none opacity-80 hover:opacity-100 hover:scale-105 hover:-rotate-6 transition-all cursor-default">
              * It's totally free!
            </div>
          </motion.div>
        </div>
      </div>

      {/* 2. How Atlas Works */}
      <div className="mb-16">
        <div className="text-center max-w-lg mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 leading-tight">
            Turn What Bugs You Into Real Impact
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-3">
            From a spark to something real—in minutes. No matter what kind of creator you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Lightbulb,
              title: "1. Share What Bugs You",
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
              title: "3. Share Your Impact",
              desc: "Approve the steps and watch it come to life—a campaign, tool, report, or experience you can share with your school, community, or the world.",
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

      {/* 3. Problem & Audience */}
      <div className="mb-16 bg-[#fcfbf9] border border-[#e0ddd0]/60 rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden">
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
                Traditional learning tells you to wait—memorize this, pass that test, then maybe someday you'll be ready. Your ideas get filed away as "too big" or "for later." Nothing you create matters right now.
              </p>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-950">The Atlas Way</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">
                Atlas flips the script. Bring a real-world problem you care about, and we guide you step-by-step to create something that makes real impact—through code, campaigns, research, design, or organizing. No experience required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Feature Highlights */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">Real Wings for Your Ideas</h4>
            <p className="text-xs text-slate-500 font-sans">You aren't solving abstract puzzles. Together, we build and deploy actual, live web creations that your friends, family, and community can visit right now.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">Always in Your Hands</h4>
            <p className="text-xs text-slate-500 font-sans">Every step of your adventure is plan-then-approve. Nothing goes live without your conscious nod. You are in total control, supported by a gentle guide.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-950 text-sm mb-1">Learn by Doing Real Projects</h4>
            <p className="text-xs text-slate-500 font-sans">No abstract exercises or toy problems. Every lesson is a real project that solves something you actually care about—so every skill you pick up sticks.</p>
          </div>
        </div>
      </div>

      {/* 5. Archetypes Grid */}
      <div className="mb-14">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-widest block font-extrabold bg-emerald-100/50 px-3 py-1 rounded-full w-max mx-auto border border-emerald-250/20">
            WHAT KIND OF BUILDER ARE YOU?
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 mt-3 leading-tight">
            Find Your Creative Superpower
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-2">
            Every creator has a natural strength. Pick the one that sounds most like you.
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
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 mix-blend-multiply [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] opacity-95"
                  />
                  <div className="absolute top-5 left-5 p-2.5 rounded-xl bg-[#f7f5ee]/80 backdrop-blur-md shadow-sm border border-[#e0ddd0]/50 z-10 group-hover:bg-white transition-colors duration-300">
                    <IconComponent className="w-4.5 h-4.5 text-emerald-800" />
                  </div>
                  <div className="absolute top-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                    <span className={`text-[9.5px] font-mono uppercase font-bold px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-xl ${arch.badgeColor.replace(/border-[a-z]+-\d+\/\d+/, 'border-white/20')} bg-white/40`}>
                      {arch.superpower}
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
                    <span>Your Creative Strength</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Better Together */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="text-center mb-8">
          <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-widest font-extrabold bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200/30">
            No Great Impact Happens Alone
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 mt-3 leading-tight">
            Every strength matters.<br />
            <span className="text-emerald-700">Find yours. Find your team.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { icon: Code,    name: "The Builder",      contribution: "Turns the idea into something real",   iconBox: "bg-emerald-100", iconColor: "text-emerald-700", border: "border-emerald-200/60" },
            { icon: Users,   name: "The Talker",       contribution: "Gets people to care about it",         iconBox: "bg-blue-100",    iconColor: "text-blue-700",    border: "border-blue-200/60"    },
            { icon: Compass, name: "The Organizer",    contribution: "Makes sure it actually works",         iconBox: "bg-purple-100",  iconColor: "text-purple-700",  border: "border-purple-200/60"  },
            { icon: Palette, name: "The Tastemaker",   contribution: "Makes it beautiful enough to matter",  iconBox: "bg-rose-100",    iconColor: "text-rose-700",    border: "border-rose-200/60"    },
            { icon: Search,  name: "The Investigator", contribution: "Finds the truth others miss",          iconBox: "bg-amber-100",   iconColor: "text-amber-800",   border: "border-amber-200/60"   },
          ].map((a) => (
            <div key={a.name} className={`bg-[#fcfbf9] border ${a.border} rounded-2xl p-4 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconBox} shrink-0`}>
                <a.icon className={`w-5 h-5 ${a.iconColor}`} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-950 font-display mb-1">{a.name}</p>
                <p className="text-[10px] text-slate-500 font-sans leading-snug">{a.contribution}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 font-sans mt-5">
          The most impactful projects bring together all five.
        </p>
      </div>

      {/* 7. Bottom CTA */}
      <div className="text-center pb-4">
        <button
          onClick={onStart}
          className="group/btn relative overflow-hidden h-14 inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-sm px-10 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0.5 shadow-lg shadow-emerald-900/20 uppercase tracking-wider cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[1.5s] ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          <span className="relative z-10">Start Building Now</span>
          <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </button>
        <p className="text-xs text-slate-400 font-sans mt-3">Free to start. No account needed.</p>
      </div>

    </div>
  );
}
