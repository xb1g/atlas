import { useState, useEffect, useRef } from "react";
import { Sparkles, Sun, Compass, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { SessionProfile, InterviewAnswers, Opportunity } from "./types";
import InterviewForm from "./components/InterviewForm";
import LandingHero from "./components/LandingHero";
import OpportunityMenu from "./components/OpportunityMenu";
import BlueprintPlan from "./components/BlueprintPlan";
import ProjectWorkbox from "./components/ProjectWorkbox";
import ArtifactSuccess from "./components/ArtifactSuccess";
import Reflection from "./components/Reflection";
import Logo from "./components/Logo";
import Profile from "./components/Profile";
// @ts-ignore
import monetBg from "./assets/images/monet_cliff_horizon_1779562138549.webp";

const getSessionId = () => {
  let sessionId = localStorage.getItem("atlas_session_id");
  if (!sessionId) {
    sessionId = `session-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("atlas_session_id", sessionId);
  }
  return sessionId;
};

const getImageCacheKey = () => `atlas_images_${getSessionId()}`;

const saveImageToCache = (oppId: string, imageUrl: string) => {
  try {
    const key = getImageCacheKey();
    const cache = JSON.parse(localStorage.getItem(key) || "{}");
    cache[oppId] = imageUrl;
    localStorage.setItem(key, JSON.stringify(cache));
  } catch {}
};

const loadImagesFromCache = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(getImageCacheKey()) || "{}");
  } catch {
    return {};
  }
};

const mergeImagesIntoOpportunities = (opportunities: any[]) => {
  const cache = loadImagesFromCache();
  return opportunities.map((o: any) =>
    cache[o.id] ? { ...o, imageUrl: cache[o.id] } : o
  );
};

const fetchApi = (url: string, options: RequestInit = {}) => {
  const sessionId = getSessionId();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "x-session-id": sessionId
    }
  });
};

function ProjectRoute({ session, onApproveStep, isApproving, onBack, onUpdateProject }: {
  session: any;
  onApproveStep: () => void;
  isApproving: boolean;
  onBack: () => void;
  onUpdateProject: (p: any) => void;
}) {
  const { oppId } = useParams<{ oppId: string }>();
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-300 border-t-emerald-700 animate-spin" />
      </div>
    );
  }

  if (!session.activeProject) {
    navigate("/opportunities");
    return null;
  }

  const opportunity = session.opportunities?.find((o: any) => o.id === oppId)
    ?? session.opportunities?.find((o: any) => o.id === session.activeProject?.id);

  return (
    <ProjectWorkbox
      project={session.activeProject}
      opportunity={opportunity}
      onApproveStep={onApproveStep}
      isApproving={isApproving}
      onBack={onBack}
      onUpdateProject={onUpdateProject}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const routedProjectId = location.pathname.match(/^\/(?:plan|project)\/([^/]+)/)?.[1] ?? null;

  const [session, setSession] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeOppId, setActiveOppId] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [hasLiveKey, setHasLiveKey] = useState(false);

  // Mining terminal logs state for active visual feedback
  const [miningLogs, setMiningLogs] = useState<string[]>([]);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [logMode, setLogMode] = useState<"craw" | "agent">("craw");

  // Chat steering state inside MINING view
  const [miningPhase, setMiningPhase] = useState<"CHAT_STEERING" | "MINING_LOGS">("CHAT_STEERING");
  const [chatMessages, setChatMessages] = useState<{ sender: "agent" | "student"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [steerFocus, setSteerFocus] = useState("");
  const [steerVibe, setSteerVibe] = useState("");
  const [steerKeywords, setSteerKeywords] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const hasUserSteeredRef = useRef(false);
  const selectingProjectRef = useRef<string | null>(null);
  const routedProjectSelectionAttemptsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [miningLogs, agentLogs, logMode]);

  useEffect(() => {
    if (!session || !routedProjectId || (!location.pathname.startsWith("/plan/") && !location.pathname.startsWith("/project/"))) return;
    if (session.activeProject?.id === routedProjectId || loading || selectingProjectRef.current === routedProjectId) return;
    if (routedProjectSelectionAttemptsRef.current.has(routedProjectId)) return;
    if (!session.opportunities?.some((opp) => opp.id === routedProjectId)) return;

    routedProjectSelectionAttemptsRef.current.add(routedProjectId);
    selectingProjectRef.current = routedProjectId;
    setActiveOppId(routedProjectId);
    setLoading(true);

    fetchApi("/api/project/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: routedProjectId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.project) {
          setSession((prev: any) => prev ? { ...prev, activeProject: data.project } : prev);
        }
      })
      .catch((err) => console.error("Failed initializing routed project", err))
      .finally(() => {
        selectingProjectRef.current = null;
        setLoading(false);
      });
  }, [session, routedProjectId, location.pathname, loading]);

  // Fetch Session data on mount
  useEffect(() => {
    fetchSession();
  }, []);

  const triggerPendingBuilds = async (opportunities: any[]) => {
    const pending = opportunities.filter(
      (opp: any) => (opp.status === "planned" || opp.status === "building") && !opp.imageUrl
    );

    // Process them sequentially in the background to prevent clogging the browser's 6-connection pool limit
    for (const opp of pending) {
      try {
        const res = await fetchApi("/api/opportunities/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportunityId: opp.id }),
        });
        const data = await res.json();
        if (data.opportunity) {
          if (data.opportunity.imageUrl) {
            saveImageToCache(data.opportunity.id, data.opportunity.imageUrl);
          }
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
      } catch (e) {
        console.error("Failed building opportunity sequentially", e);
      }
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetchApi("/api/session");
      const data = await res.json();
      if (data.session) {
        // Restore cached images from localStorage before setting session
        const sessionWithImages = {
          ...data.session,
          opportunities: mergeImagesIntoOpportunities(data.session.opportunities || []),
        };
        setSession(sessionWithImages);
        setHasLiveKey(data.hasLiveKey);

        // Restore active opportunity and correct screen view based on database state
        if (data.session.activeProject) {
          setActiveOppId(data.session.activeProject.id);
          if (data.session.activeProject.started) {
            navigate(`/project/${data.session.activeProject.id}`);
          } else {
            navigate(`/plan/${data.session.activeProject.id}`);
          }
        } else if (data.session.opportunities && data.session.opportunities.length > 0) {
          navigate("/opportunities");
          // Resume builds for cards still missing images (status "planned" after Firestore strip)
          triggerPendingBuilds(sessionWithImages.opportunities);
        } else if (data.session.answers && data.session.answers.spark) {
          navigate("/interview");
        }
      }
    } catch (err) {
      console.error("Failed to load sandbox session active state", err);
    }
  };

  // Submit interview answers to server and start live background scouting trace
  const handleInterviewSubmit = async (answers: InterviewAnswers) => {
    setLoading(true);
    navigate("/discover");
    setMiningPhase("CHAT_STEERING");

    setChatInput("");
    setIsAgentTyping(false);
    setSteerFocus("");
    setSteerVibe("");
    setSteerKeywords("");
    hasUserSteeredRef.current = false;

    // Simulate mining live logs immediately so agent is "doing and showing work"!
    setMiningLogs([]);
    setAgentLogs([]);
    setLogMode("craw");

    const logsSequence = [
      "🌸 Mapping your personalized micro-adventure on: " + answers.spark,
      "🎨 Finding matching projects with pretty blogs, websites, and maps...",
      "🖌️ Crafting custom steps perfect for " + answers.name + "'s schedule...",
      "🌿 Setting up a personal, safe creation laboratory...",
      "✨ Custom helper wizard is completely ready to guide you!"
    ];

    const agentLogsSequence = [
      "🤖 [Orchestrator] Initializing autonomous subagent 'atlas-mapper-v3'...",
      "💻 [Agent] Sandbox environment created: linux-x86_64 (debian-12)",
      "🔍 [Agent] Executing Gemini 3.5 analysis on user interests...",
      "🛠️ [Agent] Executing tool call: search_web(\"topics: " + answers.topic + " format: " + answers.medium + "\")",
      "📄 [Agent] Analyzing developer source repository documentation...",
      "🧠 [Agent] Synthesizing premium design systems & tailored step-by-step blueprints...",
      "⚡ [RTK Proxy] Hook intercept active: 12,490 prompt tokens cached & optimized!",
      "✅ [Orchestrator] Task accomplished. Returning compiled adventures."
    ];

    let count = 0;
    const interval = setInterval(() => {
      let active = false;
      if (count < logsSequence.length) {
        setMiningLogs((prev) => [...prev, logsSequence[count]]);
        active = true;
      }
      if (count < agentLogsSequence.length) {
        setAgentLogs((prev) => [...prev, agentLogsSequence[count]]);
        active = true;
      }

      if (!active) {
        clearInterval(interval);
      } else {
        count++;
      }
    }, 350);

    setChatMessages([
      {
        sender: "agent",
        text: `Hi ${answers.name}! 🌟 I am your Antigravity Agent. I see you want to tackle: "${answers.spark}". That is an amazing mission! Before I compile your customized adventure list, what type of projects are you in the mood to build?`
      }
    ]);

    try {
      // Save answers in backend
      await fetchApi("/api/session/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      setSession((prev: any) => {
        if (!prev) {
          return {
            id: getSessionId(),
            answers,
            opportunities: [],
            activeProject: null
          };
        }
        return { ...prev, answers };
      });

      // Get initial default planning results in background immediately
      const resp = await fetchApi("/api/opportunities/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focus: "", vibe: "", keywords: "" })
      });
      const minedData = await resp.json();
      setSession((prev: any) => prev ? { ...prev, opportunities: minedData.opportunities } : null);

      if (minedData.opportunities && Array.isArray(minedData.opportunities)) {
        triggerPendingBuilds(minedData.opportunities);
      }

      if (!hasUserSteeredRef.current) {
        navigate("/opportunities");
      }

    } catch (err) {
      console.error("Failed saving answers", err);
    } finally {
      setLoading(false);
    }
  };

  // Send student message to Agent Chat helper
  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    hasUserSteeredRef.current = true;

    const newStudentMsg = { sender: "student" as const, text };
    const updatedMessages = [...chatMessages, newStudentMsg];
    setChatMessages(updatedMessages);
    setChatInput("");

    // Parse focus or vibe triggers locally to steer mock compilation
    const textLower = text.toLowerCase();
    let currentFocus = steerFocus;
    let currentVibe = steerVibe;
    let currentKeywords = steerKeywords;

    if (textLower.includes("code") || textLower.includes("software") || textLower.includes("develop") || textLower.includes("program")) {
      currentFocus = "code";
      setSteerFocus("code");
      setMiningLogs((prev) => [...prev, "💻 Pivot request: focus on software development and coding products!"]);
      setAgentLogs((prev) => [...prev, "🔄 [Agent Pivot] Re-scouting web templates for software applications..."]);
    } else if (textLower.includes("map") || textLower.includes("coord") || textLower.includes("gis") || textLower.includes("marker") || textLower.includes("geospatial")) {
      currentFocus = "map";
      setSteerFocus("map");
      setMiningLogs((prev) => [...prev, "🗺️ Pivot request: focus on geospatial maps & coordinates!"]);
      setAgentLogs((prev) => [...prev, "🔄 [Agent Pivot] Querying regional geospatial data layers..."]);
    } else if (textLower.includes("campaign") || textLower.includes("council") || textLower.includes("letter") || textLower.includes("policy") || textLower.includes("civic")) {
      currentFocus = "campaign";
      setSteerFocus("campaign");
      setMiningLogs((prev) => [...prev, "📣 Pivot request: focus on civic advocacy campaigns & policy directives!"]);
      setAgentLogs((prev) => [...prev, "🔄 [Agent Pivot] Drafting policy templates & municipal contact routes..."]);
    }

    if (textLower.includes("short") || textLower.includes("easy") || textLower.includes("fast") || textLower.includes("quick") || textLower.includes("min")) {
      currentVibe = "quick";
      setSteerVibe("quick");
      setMiningLogs((prev) => [...prev, "⚡ Pivot request: keep projects quick & light!"]);
      setAgentLogs((prev) => [...prev, "🔄 [Agent Pivot] Truncating step counts to fit a light weekend schedule..."]);
    } else if (textLower.includes("complex") || textLower.includes("hard") || textLower.includes("deep") || textLower.includes("portfolio") || textLower.includes("prestigious")) {
      currentVibe = "portfolio";
      setSteerVibe("portfolio");
      setMiningLogs((prev) => [...prev, "🎓 Pivot request: make it a prestigious portfolio piece!"]);
      setAgentLogs((prev) => [...prev, "🔄 [Agent Pivot] Injecting advanced schema structures & policy guidelines..."]);
    }

    const quickSteerOptions = [
      "focus on software development",
      "focus on geospatial mapping",
      "focus on civic campaigns",
      "keep it quick & light",
      "make it a prestigious portfolio piece"
    ];
    const isChipMessage = quickSteerOptions.some(opt => textLower.includes(opt));
    if (!isChipMessage) {
      currentKeywords = text;
      setSteerKeywords(text);
      setMiningLogs((prev) => [...prev, `✨ Pivot request with custom keywords: "${text}"`]);
      setAgentLogs((prev) => [...prev, `🔄 [Agent Pivot] Custom search filter applied: "${text}"`]);
    }

    setIsAgentTyping(true);

    try {
      const res = await fetchApi("/api/opportunities/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "agent", text: data.reply }]);

      // Dynamically query `/api/opportunities/plan` in background to update opportunities
      const chatTranscript = updatedMessages
        .map((m) => `${m.sender === "student" ? "Student" : "Agent"}: ${m.text}`)
        .join("\n");

      const planResp = await fetchApi("/api/opportunities/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus: currentFocus,
          vibe: currentVibe,
          keywords: currentKeywords,
          chatTranscript
        })
      });
      const planData = await planResp.json();
      setSession((prev: any) => prev ? { ...prev, opportunities: planData.opportunities } : null);

    } catch (err) {
      console.error("Failed to chat with agent", err);
      setChatMessages((prev) => [...prev, { sender: "agent", text: "I love that idea! Let's make sure that's exactly what we scout." }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  // Finalize chat preference and transition to Opportunity Menu
  const handleLockInAndPlan = async () => {
    setLoading(true);

    const chatTranscript = chatMessages
      .map((m) => `${m.sender === "student" ? "Student" : "Agent"}: ${m.text}`)
      .join("\n");

    try {
      const resp = await fetchApi("/api/opportunities/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus: steerFocus,
          vibe: steerVibe,
          keywords: steerKeywords,
          chatTranscript
        })
      });
      const minedData = await resp.json();

      setSession((prev: any) => ({
        ...prev,
        opportunities: minedData.opportunities
      }));
      navigate("/opportunities");

      if (minedData.opportunities && Array.isArray(minedData.opportunities)) {
        triggerPendingBuilds(minedData.opportunities);
      }

    } catch (err) {
      console.error("Failed mining live opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  // Select opportunity and compile project steps tailored to student
  const handleSelectOpportunity = async (oppId: string) => {
    setActiveOppId(oppId);
    navigate(`/plan/${oppId}`);
    setLoading(true);

    try {
      const res = await fetchApi("/api/project/select", {
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
      }
    } catch (err) {
      console.error("Failed initializing project", err);
    } finally {
      setLoading(false);
    }
  };

  // Deselect/Clear active opportunity to return back to Menu (draft status)
  const handleDeselectOpportunity = async () => {
    setActiveOppId(null);
    navigate("/opportunities");
    setSession((prev: any) => prev ? { ...prev, activeProject: null } : null);
    try {
      await fetchApi("/api/project/deselect", {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed deselecting project", err);
    }
  };

  // Return back to Menu without clearing active project (started state)
  const handleBackToMenu = () => {
    navigate("/opportunities");
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
            navigate("/done");
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
    navigate("/");
    setActiveOppId(null);
    setSession((prev: any) => prev ? { ...prev, activeProject: null } : null);
  };

  const getSelectedOpp = (oppId = routedProjectId ?? activeOppId): Opportunity | undefined => {
    if (!session || !oppId) return undefined;
    return session.opportunities.find((o) => o.id === oppId);
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

          {/* Route-aware breadcrumb trail */}
          {(() => {
            const path = location.pathname;
            type Crumb = { label: string; path?: string };
            let crumbs: Crumb[] | null = null;
            if (path === "/interview") crumbs = [{ label: "Adventures", path: "/" }, { label: "Profile" }];
            else if (path === "/profile") crumbs = [{ label: "Adventures", path: "/" }, { label: "Profile" }];
            else if (path === "/discover") crumbs = [{ label: "Profile", path: "/interview" }, { label: "Scouting" }];
            else if (path === "/opportunities") crumbs = [{ label: "Scouting", path: "/discover" }, { label: "Choose" }];
            else if (path.startsWith("/plan/")) crumbs = [{ label: "Choose", path: "/opportunities" }, { label: "Plan" }];
            else if (path.startsWith("/project/")) crumbs = [{ label: "Plan", path: routedProjectId ? `/plan/${routedProjectId}` : "/opportunities" }, { label: "Building" }];
            else if (path === "/done") crumbs = [{ label: "Building" }, { label: "Done ✨" }];
            if (!crumbs) return null;
            return (
              <div className="hidden sm:flex items-center gap-1.5">
                {crumbs.map((crumb, i) => {
                  const isLast = i === crumbs!.length - 1;
                  return (
                    <span key={i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-emerald-300 font-mono text-[10px]">›</span>}
                      {!isLast && crumb.path ? (
                        <button
                          onClick={() => navigate(crumb.path!)}
                          className="font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-50/60"
                        >
                          {crumb.label}
                        </button>
                      ) : (
                        <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-lg ${isLast ? "text-emerald-700 font-bold bg-emerald-50/70 border border-emerald-200/50" : "text-slate-400"}`}>
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            );
          })()}

          <div className="flex items-center gap-4">
            {/* Live API token connection health status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/70 border border-orange-100/40 rounded-xl text-xs font-sans text-amber-900 shadow-sm">
              <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span className="font-medium text-[11px]">
                {hasLiveKey ? "AI Guide Active" : "Practice Lab"}
              </span>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="text-xs font-mono text-emerald-800 hover:text-emerald-950 hover:underline transition uppercase tracking-wider font-semibold"
            >
              Profile
            </button>

            <button
              onClick={() => navigate("/reflect")}
              className="text-xs font-mono text-emerald-800 hover:text-emerald-950 hover:underline transition uppercase tracking-wider font-semibold"
            >
              Reflect
            </button>

            <button
              onClick={handleRestart}
              className="text-xs font-mono text-slate-500 hover:text-slate-700 hover:underline transition uppercase tracking-wider font-semibold"
            >
              Restart
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 py-8 z-10 relative">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route
              path="/"
              element={
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                >
                  <LandingHero onStart={() => navigate("/interview")} />
                </motion.div>
              }
            />

            <Route
              path="/interview"
              element={
                <motion.div
                  key="interview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <InterviewForm onSuccess={handleInterviewSubmit} isLoading={loading} />
                </motion.div>
              }
            />

            <Route
              path="/discover"
              element={
                <motion.div
                  key="mining"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="max-w-5xl mx-auto py-4 px-2"
                >
                  {/* Header block */}
                  <div className="text-center mb-6 max-w-2xl mx-auto">
                    {/* Glowing spinning compass */}
                    <div className="relative inline-block mb-3.5">
                      <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-lg animate-ping" />
                      <Logo size={48} className="animate-spin-slow mx-auto relative z-10" />
                    </div>

                    <h2 className="text-2xl font-display font-bold text-emerald-950 mb-1.5">
                      Scouting Your Adventures...
                    </h2>
                    <p className="text-xs text-slate-600 font-sans leading-relaxed">
                      Atlas is already building your adventure list. Quick-steer is optional; if you do nothing, we will move forward as soon as scouting is ready.
                    </p>
                  </div>

                  {/* Side-by-Side Unified Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* 1. Doing & Showing Work: Live Crawler Monitor */}
                    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 text-left font-mono text-[11px] leading-relaxed text-slate-300 h-[380px] flex flex-col shadow-2xl backdrop-blur-lg relative overflow-hidden">
                      {/* Header Row with Tabs */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setLogMode("craw")}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                              logMode === "craw"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                            }`}
                          >
                            📡 Crawler Monitor
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogMode("agent")}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                              logMode === "agent"
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                            }`}
                          >
                            🤖 Antigravity Agent
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Live Trace
                        </div>
                      </div>

                      {/* Logs list (Scrollable) */}
                      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[300px] pr-1 custom-scrollbar">
                        {logMode === "craw" ? (
                          <>
                            {(miningLogs || []).map((log, i) => (
                              <div key={i} className="text-emerald-400 flex items-start gap-1.5 animate-fadeIn font-semibold">
                                <span className="text-emerald-500 shrink-0 select-none">&bull;</span>
                                <span>{log}</span>
                              </div>
                            ))}
                            {(miningLogs?.length || 0) < 5 && (
                              <div className="flex items-center gap-1.5 text-slate-500">
                                <span>_</span>
                                <span className="w-1.5 h-3.5 bg-emerald-500 animate-pulse" />
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {(agentLogs || []).map((log, i) => {
                              let logColor = "text-indigo-300";
                              if (log && log.includes("[Orchestrator]")) logColor = "text-indigo-400 font-bold";
                              else if (log && log.includes("[RTK Proxy]")) logColor = "text-amber-400 font-bold";
                              else if (log && log.includes("[Agent]")) logColor = "text-slate-300";

                              return (
                                <div key={i} className={`flex items-start gap-1.5 animate-fadeIn ${logColor}`}>
                                  <span className="text-indigo-500 shrink-0 select-none">&gt;_</span>
                                  <span>{log}</span>
                                </div>
                              );
                            })}
                            {(agentLogs?.length || 0) < 8 && (
                              <div className="flex items-center gap-1.5 text-indigo-500">
                                <span>_</span>
                                <span className="w-1.5 h-3.5 bg-indigo-500 animate-pulse" />
                              </div>
                            )}
                          </>
                        )}
                        <div ref={logEndRef} />
                      </div>
                    </div>

                    {/* 2. Talking to Steer: Active Steering Panel */}
                    <div className="bg-white/80 border border-orange-100/50 rounded-3xl p-5 flex flex-col h-[380px] justify-between backdrop-blur-md shadow-xl relative overflow-hidden">
                      {/* Panel Header */}
                      <div className="flex items-center gap-2 border-b border-emerald-100/20 pb-2 mb-3 shrink-0 text-left">
                        <Compass className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                        <div>
                          <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-wider font-bold">
                            Steering Board
                          </span>
                          <h4 className="text-sm font-display font-bold text-emerald-950 leading-tight">
                            Live Planning Adjustments
                          </h4>
                        </div>
                      </div>

                      {/* Message Feed (Scrollable) */}
                      <div className="flex-1 overflow-y-auto pr-1 mb-3 space-y-3 text-left max-h-[170px] custom-scrollbar">
                        {chatMessages.map((msg, index) => {
                          const isAgent = msg.sender === "agent";
                          return (
                            <div
                              key={index}
                              className={`flex gap-2.5 max-w-[90%] ${
                                isAgent ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
                              }`}
                            >
                              {isAgent && (
                                <div className="w-7 h-7 rounded-full bg-emerald-100/80 border border-emerald-200/40 flex items-center justify-center shrink-0 self-end shadow-sm">
                                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                              )}
                              {!isAgent && (
                                <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200/60 flex items-center justify-center shrink-0 self-end shadow-sm">
                                  <span className="text-[10px] font-mono font-bold text-amber-800">ME</span>
                                </div>
                              )}
                              <div
                                className={`p-2.5 px-3.5 rounded-2xl relative shadow-sm text-xs leading-relaxed ${
                                  isAgent
                                    ? "bg-emerald-50/75 border border-emerald-100 text-emerald-950 rounded-bl-sm"
                                    : "bg-white/95 border border-orange-100/80 text-emerald-950 rounded-br-sm"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}

                        {/* Agent typing feedback */}
                        {isAgentTyping && (
                          <div className="flex gap-2.5 max-w-[90%] mr-auto items-end">
                            <div className="w-7 h-7 rounded-full bg-emerald-100/80 border border-emerald-200/40 flex items-center justify-center shrink-0 shadow-sm">
                              <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                            </div>
                            <div className="bg-emerald-50/40 border border-emerald-100/50 p-2 px-3 rounded-2xl rounded-bl-sm text-emerald-800/80 text-[10px] font-medium flex items-center gap-1.5 shadow-sm italic">
                              <span>Agent is sketching plans... 🖌️</span>
                              <span className="flex gap-0.5">
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-75" />
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-150" />
                                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-225" />
                              </span>
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Quick-Steer Chips */}
                      <div className="shrink-0 mb-3 text-left">
                        <span className="text-[9px] font-mono text-emerald-800/60 uppercase tracking-widest font-semibold block mb-1.5">
                          💡 Optional Quick-Steer
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: "💻 Code", text: "I want to focus on software development and coding applications" },
                            { label: "🗺️ Maps", text: "I want to focus on geospatial mapping and spatial analysis" },
                            { label: "📣 Campaigns", text: "I want to focus on civic advocacy campaigns & policy design" },
                            { label: "⚡ Quick", text: "Keep it quick & light (under 20 minutes)" },
                            { label: "🎓 Portfolio", text: "Make it a prestigious portfolio piece" }
                          ].map((chip) => {
                            const isSelectedFocus =
                               (chip.label.includes("Code") && steerFocus === "code") ||
                               (chip.label.includes("Maps") && steerFocus === "map") ||
                               (chip.label.includes("Campaigns") && steerFocus === "campaign");
                            const isSelectedVibe =
                              (chip.text.includes("quick") && steerVibe === "quick") ||
                              (chip.text.includes("portfolio") && steerVibe === "portfolio");
                            const isSelected = isSelectedFocus || isSelectedVibe;

                            return (
                              <button
                                key={chip.label}
                                type="button"
                                onClick={() => sendChatMessage(chip.text)}
                                disabled={isAgentTyping}
                                className={`h-9 px-3 py-1.5 rounded-full text-[11px] font-display font-medium border active:scale-98 transition-all duration-150 cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/10"
                                    : "bg-white/60 text-emerald-950 border-emerald-100 hover:border-emerald-300 hover:bg-white"
                                }`}
                              >
                                {chip.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Free-form Input Row */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (chatInput.trim() && !isAgentTyping) {
                            sendChatMessage(chatInput);
                          }
                        }}
                        className="flex gap-1.5 shrink-0"
                      >
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={isAgentTyping ? "Please wait for Agent's response..." : "Type custom parameters (e.g. local beaches, tools)..."}
                          disabled={isAgentTyping}
                          className="flex-1 h-11 px-3 rounded-xl bg-white border border-emerald-100 text-emerald-950 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/30 transition-all font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isAgentTyping}
                          className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Central Complete Button */}
                  <div className="mt-8 text-center shrink-0">
                    <button
                      type="button"
                      onClick={handleLockInAndPlan}
                      disabled={loading}
                      className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white rounded-3xl text-sm font-display font-semibold shadow-lg shadow-emerald-500/25 active:scale-95 transition-all duration-150 inline-flex items-center gap-2 border border-emerald-400/30 cursor-pointer"
                    >
                      <span>{loading ? "✨ Scouting Adventures..." : "✨ View Adventures"}</span>
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                </motion.div>
              }
            />

            <Route
              path="/opportunities"
              element={
                session ? (
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
                ) : null
              }
            />

            <Route
              path="/plan/:oppId"
              element={
                session ? (
                  <motion.div
                    key="blueprint"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {(!routedProjectId || !getSelectedOpp(routedProjectId)) ? null : (
                      <BlueprintPlan
                        opportunity={getSelectedOpp(routedProjectId)!}
                        project={(!session.activeProject || session.activeProject.id !== routedProjectId) ? null : session.activeProject}
                        onUpdateProject={(updatedProject) => {
                          setSession((prev: any) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              activeProject: updatedProject
                            };
                          });
                        }}
                        onConfirmStart={(selectedSteps) => {
                          // Optimistically update the session profile locally in React memory
                          // so that the workspace and steps update and navigation happens instantly!
                          setSession((prev: any) => {
                            if (!prev || !prev.activeProject) return prev;

                            const currentSteps = prev.activeProject.steps || [];
                            const existingById = new Map(
                              currentSteps.filter((step: any) => step.id).map((step: any) => [step.id, step])
                            );

                            const mergedSteps = selectedSteps.map((incoming: any, idx: number) => {
                              const existing = incoming.id ? existingById.get(incoming.id) : currentSteps[idx];
                              return {
                                ...existing,
                                ...incoming,
                                tutorMessages: existing ? existing.tutorMessages ?? [] : incoming.tutorMessages ?? [],
                              };
                            });

                            const previousActiveTaskId = prev.activeProject.steps[prev.activeProject.stepIndex]?.id;
                            let newStepIndex = prev.activeProject.stepIndex;
                            if (previousActiveTaskId) {
                              const nextIndex = mergedSteps.findIndex((step: any) => step.id === previousActiveTaskId);
                              if (nextIndex !== -1) {
                                newStepIndex = nextIndex;
                              }
                            }
                            if (newStepIndex >= mergedSteps.length) {
                              newStepIndex = Math.max(0, mergedSteps.length - 1);
                            }

                            return {
                              ...prev,
                              activeProject: {
                                ...prev.activeProject,
                                steps: mergedSteps,
                                stepIndex: newStepIndex,
                                started: true,
                              },
                            };
                          });

                          // Navigate IMMEDIATELY
                          navigate(`/project/${routedProjectId}`);

                          // Fire the backend sync asynchronously in the background (non-blocking)
                          fetchApi("/api/project/update-steps", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ steps: selectedSteps }),
                          })
                            .then(async (res) => {
                              const data = await res.json();
                              if (data.success && data.project) {
                                setSession((prev: any) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    activeProject: data.project,
                                  };
                                });
                              }
                            })
                            .catch((err) => {
                              console.error("Background steps sync failed:", err);
                            });
                        }}
                        onBack={handleDeselectOpportunity}
                      />
                    )}
                  </motion.div>
                ) : null
              }
            />

            <Route
              path="/project/:oppId"
              element={
                <motion.div
                  key="project"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectRoute
                    session={session}
                    onApproveStep={handleApproveStep}
                    isApproving={isApproving}
                    onBack={handleBackToMenu}
                    onUpdateProject={(updatedProject) => {
                      setSession((prev: any) => {
                        if (!prev) return prev;
                        return { ...prev, activeProject: updatedProject };
                      });
                    }}
                  />
                </motion.div>
              }
            />

            <Route
              path="/done"
              element={
                session ? (
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
                      onReflect={() => navigate("/reflect")}
                    />
                  </motion.div>
                ) : null
              }
            />

            <Route
              path="/reflect"
              element={
                session ? (
                  <motion.div
                    key="reflect"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Reflection
                      opportunity={getSelectedOpp()}
                      answers={session.answers}
                      onNextAdventure={() => navigate("/opportunities")}
                      onRestart={handleRestart}
                    />
                  </motion.div>
                ) : null
              }
            />

            <Route
              path="/profile"
              element={
                session ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Profile
                      session={session}
                      onRestart={handleRestart}
                    />
                  </motion.div>
                ) : null
              }
            />
          </Routes>
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
