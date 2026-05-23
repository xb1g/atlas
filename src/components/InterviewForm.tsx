import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Flame, 
  Code, 
  Users, 
  Check, 
  Clock, 
  Search, 
  Compass, 
  Palette, 
  HelpCircle, 
  Trophy, 
  Laptop, 
  Brain,
  Lightbulb
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { InterviewAnswers } from "../types";
// @ts-ignore
import monetBg from "../assets/images/monet_cliff_horizon_1779562138549.png";

interface InterviewFormProps {
  onSuccess: (answers: InterviewAnswers) => void;
  isLoading: boolean;
}

export default function InterviewForm({ onSuccess, isLoading }: InterviewFormProps) {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1); // 1 for Next, -1 for Back

  // Input states
  const [name, setName] = useState("Maya");
  const [age, setAge] = useState<number>(16);
  const [spark, setSpark] = useState("I hate seeing plastic trash washed up on the beach where sea turtles lay eggs");
  const [selectedMediums, setSelectedMediums] = useState<string[]>(["coding", "tastemaking"]);
  const [freeTime, setFreeTime] = useState("A few hours this weekend");

  // Cognitive Profile Questions
  const [solveApproach, setSolveApproach] = useState("");
  const [notBoring, setNotBoring] = useState("");
  const [access, setAccess] = useState("");
  const [winFeeling, setWinFeeling] = useState("");

  const ageOptions = [13, 14, 15, 16, 17, 18, 19, 20];

  const steps = [
    { num: 1, label: "Identity", desc: "Who you are" },
    { num: 2, label: "Mission", desc: "What bugs you" },
    { num: 3, label: "Style", desc: "Your style" },
    { num: 4, label: "Thinking", desc: "How you work" },
    { num: 5, label: "Logistics", desc: "Setup & time" }
  ];

  const mediumOptions = [
    { 
      id: "coding", 
      label: "The Builder (Technical Leverage)", 
      desc: "Code websites, apps, and calculators using tireless AI tools.", 
      icon: Code 
    },
    { 
      id: "social", 
      label: "The Talker (Human Leverage)", 
      desc: "Tell compelling stories, pitch authentic visions, and build human trust.", 
      icon: Users 
    },
    { 
      id: "organizing", 
      label: "The Organizer (Systems Leverage)", 
      desc: "Orchestrate Notion plans, connect database APIs, and sync workflows.", 
      icon: Compass 
    },
    { 
      id: "tastemaking", 
      label: "The Tastemaker (Taste Leverage)", 
      desc: "Refine aesthetics, design beautiful UI/UX, and hold the bar for high soul.", 
      icon: Palette 
    },
    { 
      id: "investigating", 
      label: "The Investigator (Insight Leverage)", 
      desc: "Research wikipedia rabbit holes, trace first-principles, and ask new profound questions.", 
      icon: Search 
    }
  ];

  const timeOptions = [
    "A few hours this weekend",
    "1 hour every afternoon",
    "Dedicated afternoon trip",
    "Go at my own pace"
  ];

  const solveOptions = [
    "I Google it",
    "I ask someone",
    "I just start doing it",
    "I draw it out first"
  ];

  const interestOptions = [
    "Talking to people",
    "Making something with my hands",
    "Figuring out how stuff works",
    "Making it look good"
  ];

  const accessOptions = [
    "A laptop",
    "Just my phone",
    "Some free time but no tools",
    "People who can help me"
  ];

  const winOptions = [
    "Someone uses what I made",
    "I learned something new",
    "I impressed someone",
    "I finished something"
  ];

  // Creative preset ideas for Step 2
  const suggestions = [
    { id: "beach-plastic", emoji: "🌊", label: "Beach Plastic", text: "I hate seeing plastic trash washed up on the beach where sea turtles lay eggs" },
    { id: "food-waste", emoji: "🍎", label: "School Food Waste", text: "I want to stop our school cafeteria from throwing away clean leftover food every afternoon" },
    { id: "stray-pets", emoji: "🐾", label: "Stray Animal Help", text: "I want to help local stray animal shelters get more adoption page visits" },
    { id: "safe-parks", emoji: "🛹", label: "Safe Skate Parks", text: "I want to petition city council to build a safe skate park with modern benches in our neighborhood" },
    { id: "solar-saver", emoji: "⚡", label: "Local Solar Saving", text: "I want to show people in our community how much electricity costs they save by using solar roofs" }
  ];

  const loadPreset = (presetType: "MAYA" | "JAKE") => {
    if (presetType === "MAYA") {
      setName("Maya");
      setAge(16);
      setSpark("I hate seeing plastic trash washed up on the beach where sea turtles lay eggs");
      setSelectedMediums(["tastemaking", "social"]);
      setFreeTime("A few hours this weekend");
      setSolveApproach("I draw it out first");
      setNotBoring("Making it look good");
      setAccess("A laptop");
      setWinFeeling("Someone uses what I made");
    } else {
      setName("Jake");
      setAge(17);
      setSpark("I want to help everyone see where state creeks have broken flows and old spreadsheets");
      setSelectedMediums(["coding", "organizing"]);
      setFreeTime("Dedicated afternoon trip");
      setSolveApproach("I just start doing it");
      setNotBoring("Figuring out how stuff works");
      setAccess("A laptop");
      setWinFeeling("I learned something new");
    }
    // Return to first step when loading preset for testing
    setDirection(-1);
    setStep(1);
  };

  const toggleMedium = (id: string) => {
    if (selectedMediums.includes(id)) {
      if (selectedMediums.length > 1) {
        setSelectedMediums(selectedMediums.filter((m) => m !== id));
      }
    } else {
      setSelectedMediums([...selectedMediums, id]);
    }
  };

  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step === 1 && !name.trim()) return;
    if (step === 2 && !spark.trim()) return;
    
    if (step < 5) {
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const submitForm = () => {
    const mappedMedium = selectedMediums
      .map((id) => {
        const found = mediumOptions.find((o) => o.id === id);
        return found ? found.label : id;
      })
      .join(" & ");

    onSuccess({
      name,
      age: Number(age),
      grade: `Age ${age}`,
      spark: spark.trim(), // Keep clean, decoupled!
      medium: mappedMedium,
      topic: spark.length > 50 ? spark.substring(0, 48) + "..." : spark,
      freeTime,
      solveApproach,
      notBoring,
      access,
      winFeeling
    });
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step === 1 && name.trim()) {
      e.preventDefault();
      handleNext();
    }
  };

  // Slide Variants for beautiful card transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -100,
      opacity: 0,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 20 },
        opacity: { duration: 0.15 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 120,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 20 },
        opacity: { duration: 0.12 }
      }
    })
  };

  // Dynamic feedback messages for Step 1
  const getAgeFeedback = () => {
    if (age <= 14) return "🌱 Starting early is a superpower! You'll build awesome digital creations.";
    if (age <= 17) return "⚡ The golden age of hacking! Perfect for custom micro-pages and maps.";
    return "💼 Academic & Civic Portfolio style: Let's build a prestigious project to show the world.";
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-4" id="interview-form" onKeyDown={handleKeyDown}>
      
      {/* 1. Immersive Monet Canvas Intro Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[160px] sm:min-h-[180px] mb-8 flex flex-col justify-end p-6 border border-orange-200/40 shadow-sm bg-[#fdfcf9]/30">
        <img
          src={monetBg}
          alt="Monet Horizon Window of Opportunity"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9]/95 via-white/10 to-transparent" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fffaec] border border-orange-200/50 rounded-full text-[10px] font-mono text-amber-800 mb-2.5 tracking-wider uppercase font-semibold shadow-sm select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Onboarding Map</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-semibold text-emerald-950 tracking-tight leading-tight">
            Try real things. <br />
            <span className="text-emerald-700 font-sans font-bold">Discover what you care about.</span>
          </h1>
          <p className="text-xs text-slate-700 mt-1 font-sans leading-relaxed">
            No dry worksheets or generic multiple-choice dashboards. Tell us about a real problem you care about, and we will tailor custom web opportunities for you.
          </p>
        </div>
      </div>

      {/* 2. Custom Visual Stepper nodes */}
      <div className="mb-8 bg-white/50 border border-orange-100/45 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex justify-between items-center relative">
          {/* Background Connector Line */}
          <div className="absolute top-[18px] left-[4%] right-[4%] h-[2px] bg-orange-100/50 -z-0" />
          <div 
            className="absolute top-[18px] left-[4%] h-[2px] bg-gradient-to-r from-emerald-400 to-teal-400 -z-0 transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 92}%` }}
          />

          {steps.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < step || (s.num > step && (step === 1 ? name.trim() : step === 2 ? spark.trim() : true))) {
                    setDirection(s.num > step ? 1 : -1);
                    setStep(s.num);
                  }
                }}
                className="flex flex-col items-center flex-1 relative z-10 cursor-pointer focus:outline-none"
              >
                <div 
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-mono text-xs border transition-all duration-300 active:scale-95 ${
                    isActive 
                      ? "bg-emerald-500 text-white border-emerald-400 ring-4 ring-emerald-100/60 font-bold shadow-md"
                      : isCompleted
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm"
                        : "bg-white text-slate-400 border-orange-100"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3px]" />
                  ) : isActive ? (
                    <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
                  ) : (
                    <span>{s.num}</span>
                  )}
                </div>
                <span className={`text-[10px] sm:text-[11px] font-sans mt-2 hidden md:block font-bold tracking-tight ${
                  isActive ? "text-emerald-950" : isCompleted ? "text-emerald-800" : "text-slate-400"
                }`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Active Card Box with Glassmorphism */}
      <div className="bg-white/80 border border-orange-100/50 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-xl relative overflow-hidden min-h-[350px] flex flex-col justify-between">
        
        {/* Step Cards with AnimatePresence */}
        <div className="flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full"
            >
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1.5 font-extrabold">
                      Step 1 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-950 tracking-tight mb-4">
                      Let's start your story. <span className="text-emerald-700">Who is creating today?</span>
                    </h2>
                    
                    <label className="text-[11px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 font-bold">
                      What is your name?
                    </label>
                    <div className="relative max-w-md">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya"
                        required
                        id="input-name"
                        autoFocus
                        className="w-full h-12 bg-white/90 border border-orange-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl pl-12 pr-4 text-xs font-semibold text-emerald-950 focus:outline-none transition-all duration-200 shadow-inner"
                      />
                    </div>
                    
                    <p className={`text-xs mt-2.5 font-sans italic font-medium transition duration-200 ${name.trim() ? "text-emerald-700" : "text-slate-400"}`}>
                      {name.trim() 
                        ? `✨ Wonderful, ${name}! Let's design your adventure.` 
                        : "👋 Type your name to begin..."
                      }
                    </p>
                  </div>

                  <div className="pt-4 border-t border-orange-100/30">
                    <label className="text-[11px] font-mono text-emerald-900 uppercase tracking-widest block mb-3 font-bold">
                      How old are you?
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2" id="age-selector">
                      {ageOptions.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setAge(Number(v))}
                          className={`text-xs font-mono w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                            age === v
                              ? "bg-emerald-500 text-white border-emerald-400 font-bold shadow-md scale-[1.03]"
                              : "bg-white text-slate-500 border-orange-100/80 hover:border-emerald-300"
                          }`}
                        >
                          {v === 20 ? "20+" : v}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 font-sans leading-relaxed">
                      {getAgeFeedback()}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: MISSION (WHAT BUGS YOU) */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1.5 font-extrabold">
                      Step 2 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-950 tracking-tight mb-2">
                      What is something in the real world <span className="text-emerald-700 font-sans font-bold">that bugs you or that you want to fix?</span>
                    </h2>
                    <p className="text-xs text-slate-600 font-sans mb-4">
                      Think of anything in your community or in the environment that gets on your nerves. It can be small or huge. We will transform this into your project!
                    </p>

                    <div className="relative">
                      <Flame className="absolute left-4 top-4 w-4 h-4 text-amber-500 animate-pulse" />
                      <textarea
                        value={spark}
                        onChange={(e) => setSpark(e.target.value)}
                        placeholder="e.g. Plastic trash wash-up on beaches, clean school lunches being thrown out, shelter dogs not getting adopted..."
                        rows={3}
                        required
                        id="input-spark"
                        autoFocus
                        className="w-full bg-white/90 border border-orange-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl pl-12 pr-4 py-3.5 text-xs font-semibold text-emerald-950 placeholder-slate-400 focus:outline-none transition-all duration-200 leading-relaxed resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Suggestion Chips to defeat blank page anxiety */}
                  <div>
                    <span className="text-[10px] font-mono text-emerald-900 uppercase block mb-2.5 font-bold select-none tracking-widest">
                      💡 Click a topic suggestion to instantly try:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSpark(s.text)}
                          className={`text-xs font-sans px-3.5 py-2 rounded-full border flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
                            spark === s.text
                              ? "bg-emerald-100/80 text-emerald-900 border-emerald-400 font-bold"
                              : "bg-white text-slate-600 border-orange-100 hover:border-emerald-200 hover:bg-slate-50"
                          }`}
                        >
                          <span>{s.emoji}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CREATIVE ARCHETYPES */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1.5 font-extrabold">
                      Step 3 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-950 tracking-tight mb-2">
                      Pick your <span className="text-emerald-700">personal archetypes or zones of genius:</span>
                    </h2>
                    <p className="text-xs text-slate-600 font-sans mb-4">
                      How do you naturally express yourself? You can select multiple boxes to blend your style.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1" id="preference-mediums">
                    {mediumOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = selectedMediums.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleMedium(opt.id)}
                          className={`text-left p-3.5 h-auto rounded-xl border flex gap-3.5 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                            isSelected
                              ? "bg-emerald-50/90 text-emerald-900 border-emerald-400 shadow-sm ring-2 ring-emerald-100"
                              : "bg-white/80 text-slate-500 border-orange-100/70 hover:border-emerald-200"
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center ${
                            isSelected ? "bg-emerald-100 text-emerald-800" : "bg-slate-50 text-slate-400"
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-xs font-bold text-emerald-950 block leading-tight">{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                            <p className="text-[10.5px] text-emerald-900/80 leading-relaxed mt-1 font-sans">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: THINKING (SOLVE APPROACH & INTEREST) */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1.5 font-extrabold">
                      Step 4 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-950 tracking-tight mb-4">
                      How do you <span className="text-emerald-700">prefer to think and work?</span>
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-[11px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 px-1 font-bold flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A. How do you usually solve problems?</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5" id="solve-approach-picker">
                        {solveOptions.map((opt) => {
                          const isSelected = solveApproach === opt;
                          return (
                            <button
                              key={opt}
                              type="button; button"
                              onClick={() => setSolveApproach(opt)}
                              className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-bold min-h-[48px] cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-extrabold shadow-sm ring-2 ring-emerald-100"
                                  : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-orange-100/30">
                      <label className="text-[11px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 px-1 font-bold flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>B. What sounds less boring right now?</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2.5" id="interest-picker">
                        {interestOptions.map((opt) => {
                          const isSelected = notBoring === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setNotBoring(opt)}
                              className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-bold min-h-[48px] cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-extrabold shadow-sm ring-2 ring-emerald-100"
                                  : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: LOGISTICS & TIME */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest block mb-1.5 font-extrabold">
                      Step 5 of 5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-display font-medium text-emerald-950 tracking-tight mb-4">
                      Final touches! <span className="text-emerald-700">What tools and time do you have?</span>
                    </h2>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    <div>
                      <label className="text-[10px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 px-1 font-bold flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A. What do you have access to?</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2" id="access-picker">
                        {accessOptions.map((opt) => {
                          const isSelected = access === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setAccess(opt)}
                              className={`text-[10.5px] font-sans p-2 rounded-lg border leading-tight transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-bold min-h-[42px] cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-extrabold shadow-sm"
                                  : "bg-white text-slate-500 border-orange-100 hover:border-emerald-200"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-orange-100/30">
                      <label className="text-[10px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 px-1 font-bold flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span>B. What would feel like a win?</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2" id="win-feeling-picker">
                        {winOptions.map((opt) => {
                          const isSelected = winFeeling === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setWinFeeling(opt)}
                              className={`text-[10.5px] font-sans p-2 rounded-lg border leading-tight transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-bold min-h-[42px] cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-extrabold shadow-sm"
                                  : "bg-white text-slate-500 border-orange-100 hover:border-emerald-200"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-orange-100/30">
                      <label className="text-[10px] font-mono text-emerald-900 uppercase tracking-widest block mb-2 px-1 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>C. What is your time availability?</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2" id="time-picker">
                        {timeOptions.map((timeOption) => {
                          const isSelected = freeTime === timeOption;
                          return (
                            <button
                              key={timeOption}
                              type="button"
                              onClick={() => setFreeTime(timeOption)}
                              className={`text-[10.5px] font-mono p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 min-h-[42px] cursor-pointer ${
                                isSelected
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-extrabold shadow-sm"
                                  : "bg-white text-slate-500 border-orange-100 hover:border-emerald-200"
                              }`}
                            >
                              <span className="truncate">{timeOption}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Wizard Action Buttons (Back & Next) */}
        <div className="border-t border-orange-100/40 pt-6 mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 z-20 relative">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-white border border-orange-200/50 text-emerald-800 font-sans font-bold text-xs rounded-xl transition duration-300 hover:bg-slate-50 active:scale-95 cursor-pointer uppercase tracking-wider select-none shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="hidden sm:block" /> // Placeholder to keep spacing
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Conditional "Skip" or "Add Background Style" Buttons */}
            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-11 inline-flex items-center justify-center gap-1.5 px-4 bg-white hover:bg-slate-50 text-emerald-800 font-sans font-bold text-xs rounded-xl border border-orange-200/40 hover:border-emerald-300 transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-wider select-none shadow-sm"
                >
                  <span>Add Background Style (Optional)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-11 inline-flex items-center justify-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-extrabold text-xs rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer select-none"
                >
                  <span>✨ Build My Adventure List!</span>
                </button>
              </>
            )}

            {step === 4 && (
              <>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-11 inline-flex items-center justify-center gap-1.5 px-4 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-sans font-bold text-xs rounded-xl border border-orange-200/40 hover:border-slate-300 transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-wider select-none shadow-sm"
                >
                  <span>Skip &amp; Build List</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-11 inline-flex items-center justify-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-extrabold text-xs rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer select-none"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </>
            )}

            {step === 5 && (
              <>
                <button
                  type="button"
                  onClick={submitForm}
                  className="h-11 inline-flex items-center justify-center gap-1.5 px-4 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-sans font-bold text-xs rounded-xl border border-orange-200/40 hover:border-slate-300 transition-all duration-300 active:scale-95 cursor-pointer uppercase tracking-wider select-none shadow-sm"
                >
                  <span>Skip Optional &amp; Build</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-11 inline-flex items-center justify-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-extrabold text-xs rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer select-none"
                >
                  <span>Build My Adventure List!</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </>
            )}

            {/* Standard step 1 & 2 buttons */}
            {(step === 1 || step === 2) && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading || (step === 1 && !name.trim()) || (step === 2 && !spark.trim())}
                className="h-11 inline-flex items-center justify-center gap-2 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-extrabold text-xs rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer select-none"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Preset Loaders for testing, integrated beautifully at footer */}
        <div className="mt-8 border-t border-orange-100/45 pt-4 bg-emerald-50/5 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-4 rounded-b-3xl">
          <span className="text-[10px] font-mono text-emerald-950 uppercase block mb-2 tracking-wider font-extrabold text-center select-none opacity-80">
            ⚡ QUICK TESTING PRESETS
          </span>
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
            <button
              onClick={() => loadPreset("MAYA")}
              type="button"
              className="w-full sm:w-auto text-left px-3.5 py-1.5 rounded-xl bg-white/90 border border-orange-100/50 hover:border-emerald-300 hover:bg-white transition duration-200 active:scale-95 shadow-sm font-sans text-[11px] text-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Load <strong>Maya's Beach Project</strong> (Age 16)</span>
              </div>
            </button>
            <button
              onClick={() => loadPreset("JAKE")}
              type="button"
              className="w-full sm:w-auto text-left px-3.5 py-1.5 rounded-xl bg-white/90 border border-orange-100/50 hover:border-amber-400 hover:bg-white transition duration-200 active:scale-95 shadow-sm font-sans text-[11px] text-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Load <strong>Jake's Creek Map</strong> (Age 17)</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
