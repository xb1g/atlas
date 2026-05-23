import React, { useState } from "react";
import { Sparkles, ArrowRight, User, Flame, Code, Users, BookOpen, Map, Check, Clock, Search, Compass, Palette } from "lucide-react";
import { InterviewAnswers } from "../types";
// @ts-ignore
import monetBg from "../assets/images/monet_cliff_horizon_1779562138549.png";

interface InterviewFormProps {
  onSuccess: (answers: InterviewAnswers) => void;
  isLoading: boolean;
}

export default function InterviewForm({ onSuccess, isLoading }: InterviewFormProps) {
  const [name, setName] = useState("Maya");
  const [age, setAge] = useState<number>(16);
  const [spark, setSpark] = useState("I hate seeing plastic trash washed up on the beach where sea turtles lay eggs");
  const [selectedMediums, setSelectedMediums] = useState<string[]>(["coding", "tastemaking"]);
  const [freeTime, setFreeTime] = useState("A few hours this weekend");

  // New Questions A, B, C, D
  const [solveApproach, setSolveApproach] = useState("I Google it");
  const [notBoring, setNotBoring] = useState("Making something with my hands");
  const [access, setAccess] = useState("A laptop");
  const [winFeeling, setWinFeeling] = useState("Someone uses what I made");

  const ageOptions = [13, 14, 15, 16, 17, 18, 19, 20];

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

  // Options for Questions A, B, C, D
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

  // Friendly preset examples for quick-loading demo
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !spark.trim()) return;

    const mappedMedium = selectedMediums
      .map((id) => {
        const found = mediumOptions.find((o) => o.id === id);
        return found ? found.label : id;
      })
      .join(" & ");

    // Append rich vectors into the spark description so server AI reads it seamlessly!
    const contextTag = `\n\n[Context - Solve approach: ${solveApproach}. Interest zone: ${notBoring}. Resources: ${access}. Win definition: ${winFeeling}]`;
    const finalSpark = spark.trim() + contextTag;

    onSuccess({
      name,
      age: Number(age),
      grade: `Age ${age}`,
      spark: finalSpark,
      medium: mappedMedium,
      topic: spark.length > 50 ? spark.substring(0, 48) + "..." : spark,
      freeTime
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-4 animate-fadeIn" id="interview-form">
      
      {/* 1. Immersive Monet Canvas Intro Banner */}
      <div className="relative rounded-3xl overflow-hidden min-h-[190px] sm:min-h-[220px] mb-8 flex flex-col justify-end p-6 sm:p-8 border border-orange-200/40 shadow-md bg-[#fdfcf9]/30">
        <img
          src={monetBg}
          alt="Monet Horizon Window of Opportunity"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Sky styling warm transition gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfbf9]/95 via-white/20 to-transparent" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fffaec] border border-orange-200/50 rounded-full text-[10px] font-mono text-amber-800 mb-3 tracking-wider uppercase font-semibold shadow-sm select-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Discover your spark</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-medium text-emerald-950 tracking-tight leading-tight">
            Try real things. <br />
            <span className="text-emerald-700 font-sans font-bold">Discover what you love.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-sans leading-relaxed">
            Forget boring worksheets or textbooks. This is your personal creative helper. We match what bugs you with a real project you can launch on the live web today!
          </p>
        </div>
      </div>

      {/* 2. Interactive Adventure Form with Glassmorphism */}
      <div className="bg-white/70 border border-orange-100/50 rounded-3xl p-6 sm:p-10 backdrop-blur-md shadow-xl relative overflow-hidden">
        
        <form onSubmit={handleFormSubmit} className="space-y-8 relative z-10">
          
          {/* Section 1: Name and Age */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-orange-100/40">
            <div>
              <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-2 font-bold">
                1. What is your name?
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya"
                  required
                  id="input-name"
                  className="w-full h-12 bg-white/90 border border-orange-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl pl-12 pr-4 text-xs font-semibold text-emerald-950 focus:outline-none transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-1.5 font-bold">
                2. How old are you?
              </label>
              <div className="flex flex-wrap gap-1.5" id="age-selector">
                {ageOptions.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAge(Number(v))}
                    className={`text-xs font-mono w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-200 active:scale-95 ${
                      age === v
                        ? "bg-emerald-100/80 text-emerald-800 border-emerald-400 font-bold shadow-md"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    {v === 20 ? "20+" : v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: What bugs you */}
          <div>
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-2.5 font-bold">
              💡 3. What is something you want to fix or make better?
            </label>
            <div className="relative">
              <Flame className="absolute left-4 top-4 w-4 h-4 text-amber-500 animate-pulse" />
              <textarea
                value={spark}
                onChange={(e) => setSpark(e.target.value)}
                placeholder="e.g. I want to show kids where they can recycle plastic, or help people protect wild flowers..."
                rows={2}
                required
                id="input-spark"
                className="w-full bg-white/90 border border-orange-200 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl pl-12 pr-4 py-3.5 text-xs font-semibold text-emerald-950 placeholder-slate-400 focus:outline-none transition-all duration-200 leading-relaxed resize-none shadow-inner"
              />
            </div>
            <span className="text-[11px] text-emerald-900/90 font-sans block mt-1.5 italic font-medium">
              Tell us anything that bothers you or that you care about. We'll turn this into your project topic!
            </span>
          </div>

          {/* Section 4: Pick Archetypes/Zones of Genius */}
          <div>
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-1.5 font-bold">
              ⚡️ 4. Pick your personal archetypes or zones of genius:
            </label>
            <span className="text-[11px] text-emerald-800/65 font-sans block mb-3.5 italic">
              When kids stop being cogs, they naturally gravitate toward different leverage zones in an AI-driven, high-agency world.
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="preference-mediums">
              {mediumOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedMediums.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMedium(opt.id)}
                    className={`text-left p-3.5 h-auto rounded-xl border flex gap-3.5 transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? "bg-emerald-50/85 text-emerald-900 border-emerald-400 shadow-sm"
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

          {/* Section 5: How do you usually solve problems? */}
          <div className="pt-6 border-t border-orange-100/40">
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-3 px-1 font-bold">
              🧩 5. How do you usually solve problems?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="solve-approach-picker">
              {solveOptions.map((opt) => {
                const isSelected = solveApproach === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSolveApproach(opt)}
                    className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-semibold min-h-[52px] ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-bold shadow-sm"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: What sounds less boring right now? */}
          <div className="pt-6 border-t border-orange-100/40">
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-3 px-1 font-bold">
              🔥 6. What sounds less boring right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="interest-picker">
              {interestOptions.map((opt) => {
                const isSelected = notBoring === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setNotBoring(opt)}
                    className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-semibold min-h-[52px] ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-bold shadow-sm"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: What do you have access to? */}
          <div className="pt-6 border-t border-orange-100/40">
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-3 px-1 font-bold">
              💻 7. What do you have access to?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="access-picker">
              {accessOptions.map((opt) => {
                const isSelected = access === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAccess(opt)}
                    className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-semibold min-h-[52px] ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-bold shadow-sm"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 8: What would feel like a win? */}
          <div className="pt-6 border-t border-orange-100/40">
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-3 px-1 font-bold">
              🏆 8. What would feel like a win?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="win-feeling-picker">
              {winOptions.map((opt) => {
                const isSelected = winFeeling === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWinFeeling(opt)}
                    className={`text-[11px] font-sans p-3 rounded-xl border leading-snug transition-all duration-200 active:scale-95 text-center flex items-center justify-center font-semibold min-h-[52px] ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 font-bold shadow-sm"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 9: Time Commitments */}
          <div className="pt-6 border-t border-orange-100/40">
            <label className="text-xs font-mono text-emerald-900 uppercase tracking-widest block mb-3 px-1 font-bold">
              ⏱️ 9. What is your time availability?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="time-picker">
              {timeOptions.map((timeOption) => {
                const isSelected = freeTime === timeOption;
                return (
                  <button
                    key={timeOption}
                    type="button"
                    onClick={() => setFreeTime(timeOption)}
                    className={`text-[11px] font-mono h-[52px] px-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-900 border-emerald-400 shadow-sm font-bold"
                        : "bg-white text-slate-500 border-orange-100 hover:border-emerald-300"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-600 opacity-80" />
                    <span className="truncate">{timeOption}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Action Submit Button */}
          <div className="border-t border-orange-100/40 pt-6">
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !spark.trim()}
              id="btn-mine"
              className="w-full h-12 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs rounded-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest cursor-pointer"
            >
              <span>Build My Adventure List!</span>
              <ArrowRight className="w-4 h-4 font-bold" />
            </button>
          </div>

        </form>

        {/* Dynamic Preset Loaders as subtle card options */}
        <div className="mt-8 border-t border-orange-100/40 pt-6 bg-emerald-50/10 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6">
          <span className="text-[11px] font-mono text-emerald-950 uppercase block mb-3.5 tracking-wider font-bold text-center select-none">
            ⚡ QUICK TESTING PRESETS
          </span>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={() => loadPreset("MAYA")}
              type="button"
              className="w-full sm:w-auto text-left px-4 py-2.5 rounded-xl bg-white/90 border border-orange-100/50 hover:border-emerald-300 hover:bg-white transition duration-200 active:scale-95 shadow-sm font-sans text-xs text-slate-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Load <strong>Maya's Beach Project</strong> (Age 16)</span>
              </div>
            </button>
            <button
              onClick={() => loadPreset("JAKE")}
              type="button"
              className="w-full sm:w-auto text-left px-4 py-2.5 rounded-xl bg-white/90 border border-orange-100/50 hover:border-amber-400 hover:bg-white transition duration-200 active:scale-95 shadow-sm font-sans text-xs text-slate-700"
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
