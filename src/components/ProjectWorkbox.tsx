import React, { useState, useEffect, useRef } from "react";
import {
  Terminal, CheckCircle2, Circle, Play, ArrowRight, ShieldAlert,
  FileText, Check, Copy, Compass, Plus, Trash2, Edit3, MessageSquare,
  Award, Star, ChevronRight, ChevronLeft, BookOpen, Send, Sparkles, X, Clock, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveProject, ProjectStep, Opportunity } from "../types";
import ReactMarkdown from "react-markdown";
import { MarkdownErrorBoundary } from "./MarkdownErrorBoundary";

interface ProjectWorkboxProps {
  project: ActiveProject;
  opportunity: Opportunity;
  onApproveStep: () => void;
  isApproving: boolean;
  onBack: () => void;
  onUpdateProject: (updatedProject: ActiveProject) => void;
}

export default function ProjectWorkbox({
  project,
  opportunity,
  onApproveStep,
  isApproving,
  onBack,
  onUpdateProject,
}: ProjectWorkboxProps) {
  const currentStepIndex = project.stepIndex;
  
  console.log("DEBUG: ProjectWorkbox render", {
    projectId: project.id,
    stepsCount: project.steps?.length,
    steps: project.steps,
    coFounderMessages: project.coFounderMessages
  });
  
  // Dashboard view tabs: "quest" (simulated story quest/terminal) or "board" (Agile PM Scrum/Kanban)
  const [activeTab, setActiveTab] = useState<"quest" | "board">("board");

  // Terminal log simulator
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inspector and custom task creator states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [tutorInput, setTutorInput] = useState("");
  const [isTutorTyping, setIsTutorTyping] = useState(false);

  // AI Co-Founder Chat states
  const [chatMessages, setChatMessages] = useState<{ sender: "agent" | "student"; text: string }[]>(
    project.coFounderMessages && project.coFounderMessages.length > 0
      ? project.coFounderMessages
      : [
          {
            sender: "agent",
            text: `Hey co-founder! 🌟 We're working on "${opportunity.title}" together. I've designed our active steps on our Kanban board! You can ask me to add custom tasks (e.g. "add task to interview friends"), adjust priorities, or reflect on your project journal. What should we focus on?`
          }
        ]
  );
  const [chatInput, setChatInput] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Interactive Particle Confetti States
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; color: string; size: number; delay: number }[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const tutorEndRef = useRef<HTMLDivElement>(null);
  const selectedTask = selectedTaskId
    ? project.steps.find((step) => step.id === selectedTaskId) ?? null
    : null;

  console.log("DEBUG: resolved selectedTask", {
    selectedTaskId,
    found: !!selectedTask,
    title: selectedTask?.title,
    tutorMessages: selectedTask?.tutorMessages
  });

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  useEffect(() => {
    tutorEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTask?.tutorMessages, isTutorTyping]);

  useEffect(() => {
    if (selectedTaskId && !project.steps.some((step) => step.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [project.steps, selectedTaskId]);

  useEffect(() => {
    const seenIds = new Set<string>();
    let changed = false;
    const stepsWithIds = project.steps.map((step, idx) => {
      let id = step.id;
      if (!id || seenIds.has(id)) {
        id = `${project.id}-step-${idx}`;
        changed = true;
      }
      seenIds.add(id);
      if (step.tutorMessages === undefined) changed = true;
      return {
        ...step,
        id,
        tutorMessages: step.tutorMessages ?? []
      };
    });

    if (changed) {
      onUpdateProject({
        ...project,
        steps: stepsWithIds
      });
      const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
      fetch("/api/project/update-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({ steps: stepsWithIds })
      }).catch((e) => console.error("Failed to normalize task ids in Firebase", e));
    }
  }, [onUpdateProject, project]);

  // Find physical active step shown in Terminal
  const isCompletedProject = currentStepIndex >= project.steps.length;
  const activeStep = isCompletedProject 
    ? project.steps[project.steps.length - 1] 
    : project.steps[currentStepIndex];

  // Load and type terminal logs when core steps activate
  useEffect(() => {
    if (!activeStep?.payload?.consoleLogs) return;
    
    setIsTyping(true);
    setTerminalLines([]);
    
    const logs = activeStep.payload.consoleLogs;
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < logs.length) {
        setTerminalLines((prev) => [...prev, logs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentStepIndex, activeStep]);

  // Copyboard preview helper
  const handleCopy = () => {
    if (activeStep?.payload?.editorPreview) {
      navigator.clipboard.writeText(activeStep.payload.editorPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Dynamic sound effects: synthesize a warm major chord chime client-side!
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C major chord (C4, E4, G4, C5)
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05 + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7 + idx * 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.1);
      });
    } catch (e) {
      console.error("Web Audio failed", e);
    }
  };

  // Play a soft chiming notification sound for edits
  const playNotificationChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.error("Web Audio failed", e);
    }
  };

  // Particle confetti explosion trigger
  const triggerConfetti = () => {
    playChime();
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#f43f5e"];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: Math.random() + i,
      x: 30 + Math.random() * 40, // random screen percentage width
      y: 20 + Math.random() * 30, // random height
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 12,
      delay: Math.random() * 0.15
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 2800);
  };

  // Save current project steps list to Firebase Firestore database
  const syncStepsToDb = async (updatedSteps: ProjectStep[]) => {
    if (!onUpdateProject) return;
    
    // Immediately update React local/parent state
    onUpdateProject({
      ...project,
      steps: updatedSteps
    });

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    try {
      await fetch("/api/project/update-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({ steps: updatedSteps })
      });
    } catch (e) {
      console.error("Failed to persist steps in Firebase", e);
    }
  };

  // Gamification Metrics Engine
  const totalXp = project.steps
    .filter(s => s.status === "completed")
    .reduce((sum, s) => sum + (s.custom ? 35 : 50), 0);

  let rank = "Junior Creator 🛠️";
  let nextRankXp = 100;
  let prevRankXp = 0;
  if (totalXp >= 400) {
    rank = "Antigravity Champion 🌟";
    nextRankXp = 400;
    prevRankXp = 400;
  } else if (totalXp >= 250) {
    rank = "Product Architect 🚀";
    nextRankXp = 400;
    prevRankXp = 250;
  } else if (totalXp >= 100) {
    rank = "Agile Explorer 🎨";
    nextRankXp = 250;
    prevRankXp = 100;
  }
  const progressPercent = nextRankXp === prevRankXp 
    ? 100 
    : Math.min(100, Math.max(0, ((totalXp - prevRankXp) / (nextRankXp - prevRankXp)) * 100));

  const completedStepsCount = project.steps.filter(s => s.status === "completed").length;

  // Add a brand new custom sprint task
  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newStep: ProjectStep = {
      id: `custom-task-${Math.random().toString(36).substring(2, 7)}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || "User defined custom task on Agile sprint board.",
      status: "pending",
      actionType: "draft",
      custom: true,
      priority: newTaskPriority,
      notes: "",
      tutorMessages: []
    };

    const updatedSteps = [...project.steps, newStep];
    onUpdateProject({
      ...project,
      steps: updatedSteps
    });

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    fetch("/api/project/add-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ task: newStep })
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.project) onUpdateProject(data.project);
      })
      .catch((e) => console.error("Failed to add custom task in Firebase", e));

    // Reset Form
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskPriority("medium");
    setIsAddingTask(false);
    playNotificationChime();
  };

  // Delete custom sprint task
  const handleDeleteCustomTask = (id: string) => {
    const updatedSteps = project.steps.filter(s => s.id !== id);
    onUpdateProject({
      ...project,
      steps: updatedSteps
    });
    setSelectedTaskId(null);
    playNotificationChime();

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    fetch("/api/project/delete-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ taskId: id })
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.project) onUpdateProject(data.project);
      })
      .catch((e) => console.error("Failed to delete custom task in Firebase", e));
  };

  // Modify attributes of a task (like notes diary, priority)
  const handleUpdateTaskDetails = (id: string, updates: Partial<ProjectStep>) => {
    const updatedSteps = project.steps.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    });
    onUpdateProject({
      ...project,
      steps: updatedSteps
    });

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    fetch("/api/project/update-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ taskId: id, updates })
    })
      .catch((e) => console.error("Failed to patch task in Firebase", e));
  };

  // Toggle status of task in Kanban Board columns
  const handleMoveColumn = (id: string, newStatus: ProjectStep["status"]) => {
    let playedReward = false;
    const updatedSteps = project.steps.map(s => {
      if (s.id === id) {
        if (newStatus === "completed" && s.status !== "completed") {
          playedReward = true;
        }
        return { ...s, status: newStatus };
      }
      return s;
    });

    onUpdateProject({
      ...project,
      steps: updatedSteps
    });

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    fetch("/api/project/update-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ taskId: id, updates: { status: newStatus } })
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.project) onUpdateProject(data.project);
      })
      .catch((e) => console.error("Failed to move task in Firebase", e));

    if (playedReward) {
      triggerConfetti();
    } else {
      playNotificationChime();
    }
  };

  // AI Co-Founder Chat message handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAgentTyping) return;

    const studentMessage = chatInput.trim();
    setChatInput("");

    const updatedMessages = [...chatMessages, { sender: "student" as const, text: studentMessage }];
    setChatMessages(updatedMessages);
    setIsAgentTyping(true);

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";

    try {
      const res = await fetch("/api/project/chat-to-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          message: studentMessage,
          messages: updatedMessages
        })
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      let partialReply = "";
      setChatMessages((prev) => [...prev, { sender: "agent", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunkStr = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          
          if (chunkStr.startsWith("data: ")) {
            const dataStr = chunkStr.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "chunk") {
                partialReply += data.text;
                setChatMessages((prev) => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = partialReply;
                  return newMsgs;
                });
              } else if (data.type === "done") {
                if (data.updated && data.project) {
                  onUpdateProject(data.project);
                  playNotificationChime();
                  triggerConfetti();
                }
              }
            } catch (e) {
              console.error("SSE parse error", e, chunkStr);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (err) {
      console.error("AI Co-Founder chat failed", err);
      setChatMessages((prev) => [...prev, { sender: "agent", text: "I love that idea! Let's make sure it updates in our planning." }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleSendTutorMessage = async (text?: string) => {
    const activeTask = selectedTask;
    const studentMessage = (text ?? tutorInput).trim();
    if (!activeTask?.id || !studentMessage || isTutorTyping) return;

    setTutorInput("");
    setIsTutorTyping(true);

    onUpdateProject((prev: any) => ({
      ...prev,
      steps: prev.steps.map((step: any) =>
        step.id === activeTask.id
          ? {
              ...step,
              tutorMessages: [
                ...(step.tutorMessages ?? []),
                { sender: "student" as const, text: studentMessage }
              ]
            }
          : step
      )
    }));

    const sessionId = localStorage.getItem("atlas_session_id") || "session-maya";
    try {
      const res = await fetch("/api/project/task-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({
          taskId: activeTask.id,
          message: studentMessage
        })
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader from task tutor response");

      let buffer = "";
      let partialReply = "";
      
      // Optimistically insert an empty agent message to stream into
      const initialAgentMessage = { sender: "agent" as const, text: "" };
      onUpdateProject((prev: any) => ({
        ...prev,
        steps: prev.steps.map((step: any) =>
          step.id === activeTask.id
            ? {
                ...step,
                tutorMessages: [...(step.tutorMessages ?? []), initialAgentMessage]
              }
            : step
        )
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const chunkStr = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          
          if (chunkStr.startsWith("data: ")) {
            const dataStr = chunkStr.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "chunk") {
                partialReply += data.text;
                // update the specific tutor message array locally for UI feel without a full project state roundtrip if possible
                // but since we only have onUpdateProject, we have to call it
                onUpdateProject((prev: any) => ({
                  ...prev,
                  steps: prev.steps.map((step: any) => {
                    if (step.id === activeTask.id) {
                      const msgs = step.tutorMessages ? [...step.tutorMessages] : [];
                      if (msgs.length > 0) {
                        const newMsgs = [...msgs];
                        newMsgs[newMsgs.length - 1] = {
                          ...newMsgs[newMsgs.length - 1],
                          text: partialReply
                        };
                        return { ...step, tutorMessages: newMsgs };
                      }
                      return { ...step, tutorMessages: msgs };
                    }
                    return step;
                  })
                }));
              } else if (data.type === "done") {
                if (data.project) {
                  onUpdateProject(data.project);
                }
              }
            } catch (e) {
              console.error("SSE parse error in task tutor", e, chunkStr);
            }
          }
          boundary = buffer.indexOf('\n\n');
        }
      }
    } catch (err) {
      console.error("Task tutor chat failed", err);
      onUpdateProject((prev: any) => ({
        ...prev,
        steps: prev.steps.map((step: any) =>
          step.id === activeTask.id
            ? {
                ...step,
                tutorMessages: [
                  ...(step.tutorMessages ?? []).filter((m: any) => m.text !== ""),
                  {
                    sender: "agent" as const,
                    text: "Hmm, I couldn't get a reply just now. Your question was sent — please try again in a moment!"
                  }
                ]
              }
            : step
        )
      }));
    } finally {
      setIsTutorTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn relative" id="project-workbox">
      
      {/* 0. Custom Particles Confetti Splash */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="fixed pointer-events-none rounded-full z-50 animate-confetti"
          style={{
            left: `${c.x}vw`,
            top: `${c.y}vh`,
            backgroundColor: c.color,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDelay: `${c.delay}s`
          }}
        />
      ))}

      {/* 1. Header Navigation & Branding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-orange-100/60 pb-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 border border-emerald-200/50 text-emerald-800 hover:bg-white hover:border-emerald-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer mb-2.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Adventures
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-display font-medium text-emerald-950 tracking-tight">
              Adventure: <span className="text-emerald-700 font-sans font-extrabold">{opportunity.title}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Status Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300/30 px-3 py-1.5 rounded-xl text-emerald-900 text-[10px] font-mono font-bold shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>KANBAN DATABASE ACTIVE</span>
          </div>
          
          {/* Co-founder chat toggler button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-bold shadow-sm border active:scale-95 transition-all duration-200 cursor-pointer ${
              isChatOpen 
                ? "bg-indigo-600 text-white border-indigo-500" 
                : "bg-white text-indigo-950 border-indigo-100 hover:border-indigo-300"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Co-Founder</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </button>
        </div>
      </div>

      {/* 2. Gamified Analytics Board Dashboard Panel */}
      <div className="bg-white/80 border border-orange-100/40 rounded-3xl p-5 mb-8 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row items-stretch justify-between gap-6">
        {/* Watercolor sunrise wash behind progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-200 via-amber-200 to-emerald-200" />
        
        {/* Left: Rank & XP Progress */}
        <div className="flex-1 flex items-center gap-4 text-left">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-orange-100/80 rounded-2xl border border-orange-200/40 flex items-center justify-center shadow-inner shrink-0 relative">
            <Award className="w-8 h-8 text-amber-600" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-bold px-1 rounded">XP</div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-extrabold block">Current Rank</span>
            <h2 className="text-base font-display font-bold text-emerald-950 leading-tight mb-1">{rank}</h2>
            {/* Dynamic Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                {totalXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Agile Sprint Velocity Metrics */}
        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-orange-100/60 pt-4 md:pt-0 md:pl-6 text-left shrink-0">
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block">Sprint Completion</span>
            <span className="text-xl font-sans font-extrabold text-slate-800 leading-none">
              {completedStepsCount} <span className="text-xs font-mono text-slate-400">/ {project.steps.length}</span>
            </span>
            <div className="text-[9px] font-sans text-emerald-800 font-semibold mt-1">
              🎉 {Math.round((completedStepsCount / project.steps.length) * 100 || 0)}% Completed
            </div>
          </div>
          
          <div>
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider block">Co-Founder Badges</span>
            <div className="flex gap-1.5 mt-1">
              <div className="w-6 h-6 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center" title="First milestone done!">
                <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-200 animate-pulse" />
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                totalXp >= 150 ? "bg-amber-50 border-amber-100" : "bg-slate-100/50 border-slate-200/20 opacity-30"
              }`} title="Agile Planner Master Badge">
                <Sparkles className={`w-3.5 h-3.5 ${totalXp >= 150 ? "text-amber-500" : "text-slate-400"}`} />
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                totalXp >= 300 ? "bg-indigo-50 border-indigo-100" : "bg-slate-100/50 border-slate-200/20 opacity-30"
              }`} title="Perfect Code Deployment">
                <Terminal className={`w-3.5 h-3.5 ${totalXp >= 300 ? "text-indigo-500" : "text-slate-400"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Screen Switcher: Tab Buttons */}
      <div className="flex gap-1.5 mb-6 justify-start shrink-0">
        <button
          onClick={() => setActiveTab("board")}
          className={`h-10 px-5 rounded-2xl text-xs font-display font-bold border cursor-pointer transition-all duration-200 active:scale-98 ${
            activeTab === "board"
              ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/10"
              : "bg-white text-emerald-950 border-orange-100/45 hover:border-emerald-300"
          }`}
        >
          📋 Agile Sprint Board (Kanban)
        </button>
        <button
          onClick={() => setActiveTab("quest")}
          className={`h-10 px-5 rounded-2xl text-xs font-display font-bold border cursor-pointer transition-all duration-200 active:scale-98 ${
            activeTab === "quest"
              ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/10"
              : "bg-white text-emerald-950 border-orange-100/45 hover:border-emerald-300"
          }`}
        >
          🗺️ Story Quest Map & Console
        </button>
        {isCompletedProject && (
          <button
            onClick={() => window.location.href = "/reflect"}
            className="h-10 px-5 rounded-2xl text-xs font-display font-bold border cursor-pointer transition-all duration-200 active:scale-98 bg-amber-500 hover:bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/10 inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reflect</span>
          </button>
        )}
      </div>

      {/* 4. MAIN WORKSPACE PANELS GRID */}
      <div className="flex gap-8 items-start relative">
        
        {/* Left/Center Main Side */}
        <div className="w-full flex flex-col gap-6 min-w-0">
          <AnimatePresence mode="wait">
            
            {/* TAB A: KANBAN SPRINT BOARD */}
            {activeTab === "board" && (
              <motion.div
                key="board-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Board Top Actions */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 font-sans leading-relaxed text-left">
                    Manage your tasks on our interactive Scrum board! Write diary journal reflections inside any card.
                  </p>
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="h-9 px-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300/30 rounded-xl text-[11px] font-sans font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Custom Task</span>
                  </button>
                </div>

                {/* Grid 3-Column Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Column 1: TO DO (Backlog / Planned) */}
                  <div className="bg-white/40 border border-orange-100/30 rounded-3xl p-4 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-orange-100/40 pb-2 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="text-[11px] font-mono text-emerald-950 uppercase font-extrabold">📋 To Do</span>
                      </div>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                        {project.steps.filter(s => s.status === "pending").length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                      {project.steps.filter(s => s.status === "pending").map((step, idx) => {
                        const stepId = step.id ?? `${project.id}-step-${project.steps.findIndex((candidate) => candidate === step)}`;
                        return (
                          <KanbanCard
                            key={stepId}
                            step={{ ...step, id: stepId }}
                            onInspect={setSelectedTaskId}
                            onMove={(newStat) => handleMoveColumn(stepId, newStat)}
                          />
                        );
                      })}
                      {project.steps.filter(s => s.status === "pending").length === 0 && (
                        <div className="border border-dashed border-slate-300/40 rounded-2xl py-8 text-center text-slate-400 font-sans text-xs italic bg-slate-50/20">
                          Empty backlog list.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: IN PROGRESS (Working On) */}
                  <div className="bg-white/50 border border-amber-200/20 rounded-3xl p-4 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-amber-200/40 pb-2 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[11px] font-mono text-emerald-950 uppercase font-extrabold">⚡ Working On</span>
                      </div>
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                        {project.steps.filter(s => s.status === "running" || s.status === "approved").length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                      {project.steps.filter(s => s.status === "running" || s.status === "approved").map((step, idx) => {
                        const stepId = step.id ?? `${project.id}-step-${project.steps.findIndex((candidate) => candidate === step)}`;
                        return (
                          <KanbanCard
                            key={stepId}
                            step={{ ...step, id: stepId }}
                            onInspect={setSelectedTaskId}
                            onMove={(newStat) => handleMoveColumn(stepId, newStat)}
                          />
                        );
                      })}
                      {project.steps.filter(s => s.status === "running" || s.status === "approved").length === 0 && (
                        <div className="border border-dashed border-amber-300/30 rounded-2xl py-8 text-center text-amber-700/40 font-sans text-xs italic bg-amber-50/10">
                          Click step on Story Quest Map or drag a card here to start working!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 3: DONE (Completed) */}
                  <div className="bg-white/60 border border-emerald-200/20 rounded-3xl p-4 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between border-b border-emerald-200/40 pb-2 mb-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-mono text-emerald-950 uppercase font-extrabold">🎉 Done</span>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        {project.steps.filter(s => s.status === "completed").length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[580px] custom-scrollbar pr-1">
                      {project.steps.filter(s => s.status === "completed").map((step, idx) => {
                        const stepId = step.id ?? `${project.id}-step-${project.steps.findIndex((candidate) => candidate === step)}`;
                        return (
                          <KanbanCard
                            key={stepId}
                            step={{ ...step, id: stepId }}
                            onInspect={setSelectedTaskId}
                            onMove={(newStat) => handleMoveColumn(stepId, newStat)}
                          />
                        );
                      })}
                      {project.steps.filter(s => s.status === "completed").length === 0 && (
                        <div className="border border-dashed border-emerald-300/30 rounded-2xl py-8 text-center text-emerald-700/40 font-sans text-xs italic bg-emerald-50/10">
                          Complete some tasks to earn Spark XP and Level Up! 🌟
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB B: STORY QUEST SEQUENTIAL PROCESS (CONSOL / OUTPUT) */}
            {activeTab === "quest" && (
              <motion.div
                key="quest-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left"
              >
                {/* Left Timeline Checklist (span 5) */}
                <div className="md:col-span-5 flex flex-col gap-6">
                  <div className="bg-white/85 border border-orange-100/50 rounded-3xl p-6 backdrop-blur-md shadow-lg">
                    <h3 className="text-[10px] font-mono uppercase text-emerald-800/80 tracking-widest mb-4 border-b border-orange-100/60 pb-2 font-extrabold">
                      Interactive Story Quest Milestones
                    </h3>

                    <div className="relative pl-1">
                      <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-orange-100" />

                      <div className="flex flex-col gap-6">
                        {project.steps.map((step, idx) => {
                          const isCurrent = idx === currentStepIndex;
                          const isDone = idx < currentStepIndex;

                          return (
                            <div key={idx} className="flex gap-4 relative group">
                              <div className="z-10 bg-white rounded-full p-0.5 mt-0.5 flex items-center justify-center shrink-0">
                                {isDone ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-400 flex items-center justify-center text-emerald-700 shadow-sm">
                                    <Check className="w-3 h-3 stroke-[2.5]" />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/10">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                    <Circle className="w-1.5 h-1.5 fill-current" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <h4
                                  className={`text-xs font-sans font-bold leading-none ${
                                    isDone
                                      ? "text-slate-400 line-through font-normal"
                                      : isCurrent
                                      ? "text-emerald-950 font-extrabold"
                                      : "text-slate-400"
                                  }`}
                                >
                                  Step {idx + 1}: {step.title}
                                </h4>
                                <p className={`text-[11px] mt-1.5 leading-relaxed font-sans ${isCurrent ? "text-slate-700" : "text-slate-400"}`}>
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Workspace / Outputs (span 7) */}
                <div className="md:col-span-7 flex flex-col gap-6">
                  {/* Active Gate Action */}
                  {!isCompletedProject && (
                    <div className="bg-[#fffdf9] border border-emerald-400/20 rounded-3xl p-6 shadow-md relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/10 rounded-full blur-2xl pointer-events-none" />

                      <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest block mb-1 font-bold">
                        Step {currentStepIndex + 1} Interactive Sandbox
                      </span>
                      <h2 className="text-base font-display font-bold text-emerald-950 mb-1 leading-tight">
                        Compile: <span className="text-emerald-800 italic font-sans">"{activeStep.title}"</span>
                      </h2>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-4">
                        Press the green button below to compile and execute this step in your Sandbox server.
                      </p>

                      <button
                        onClick={() => {
                          if (activeStep?.id && activeStep.status !== "completed") {
                            const updatedSteps = project.steps.map((s, idx) => {
                              if (s.id === activeStep.id) return { ...s, status: "completed" as const };
                              if (idx === currentStepIndex + 1) return { ...s, status: "running" as const };
                              return s;
                            });
                            onUpdateProject({
                              ...project,
                              steps: updatedSteps,
                              stepIndex: Math.min(currentStepIndex + 1, project.steps.length)
                            });
                          }
                          onApproveStep();
                          triggerConfetti();
                        }}
                        disabled={isApproving}
                        id="btn-approve-step"
                        className="w-full h-11 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold text-xs rounded-xl shadow transition duration-200 uppercase tracking-widest active:scale-[0.99] disabled:opacity-40 cursor-pointer"
                      >
                        <span>Make This Step Real! ✨</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </button>

                      {/* Builder Diary / Submission Notes */}
                      <div className="mt-5">
                        <label className="text-[9px] font-mono uppercase text-emerald-800/70 tracking-widest font-bold block mb-2">
                          My Work Log — visible to AI Co-Founder
                        </label>
                        <textarea
                          value={activeStep?.notes || ""}
                          onChange={(e) => {
                            if (!activeStep?.id) return;
                            const updatedSteps = project.steps.map((s) =>
                              s.id === activeStep.id ? { ...s, notes: e.target.value } : s
                            );
                            onUpdateProject({ ...project, steps: updatedSteps });
                            // Debounced sync to server
                            handleUpdateTaskDetails(activeStep.id, { notes: e.target.value });
                          }}
                          placeholder="Describe what you built, what you learned, blockers you hit, or questions for your AI co-founder..."
                          rows={6}
                          className="w-full p-3.5 bg-white/80 border border-emerald-100 rounded-2xl text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-300/30 font-sans leading-relaxed text-[11px] shadow-inner placeholder-slate-400/70 text-left resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Simulated Terminal Shell */}
                  <div className="bg-[#121c17] border border-orange-100/20 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                    <div className="bg-[#0b120f] border-b border-[#24332b] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-200">
                          console@adventure-lab:~ (Step {currentStepIndex + 1})
                        </span>
                        {isTyping && (
                          <span className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-rose-500/80 rounded-full"></div>
                        <div className="w-2 h-2 bg-amber-500/80 rounded-full"></div>
                        <div className="w-2 h-2 bg-emerald-500/80 rounded-full"></div>
                      </div>
                    </div>

                    <div className="p-4 font-mono text-[11px] leading-relaxed text-slate-300 bg-[#0d1612] min-h-[140px] flex flex-col justify-end">
                      {terminalLines.length === 0 ? (
                        <div className="text-emerald-900/40 italic">Terminal awaiting script compiler triggers...</div>
                      ) : (
                        <div className="flex flex-col gap-1 text-left">
                          {terminalLines.map((line, idx) => (
                            <div key={idx} className={`${line.startsWith("$") ? "text-emerald-400 font-bold" : "text-amber-100"}`}>
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lined Notebook Paper Draft Preview */}
                    {activeStep?.payload?.editorPreview && activeStep.actionType === "draft" && (
                      <div className="border-t border-[#23352c] bg-[#fbfaf3] text-stone-800">
                        <div className="bg-[#fcfbf5] px-4 py-2 flex items-center justify-between border-b border-dashed border-stone-200">
                          <span className="text-[9px] font-mono uppercase text-stone-500 flex items-center gap-1.5 font-bold tracking-wider">
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            📝 Story / Draft Preview
                          </span>
                          <button
                            onClick={handleCopy}
                            className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 bg-white border border-stone-200 rounded-lg shadow-sm"
                          >
                            {copied ? "Copied!" : "Copy text"}
                          </button>
                        </div>
                        <div className="p-4 bg-[#faf9f1] max-h-[220px] overflow-y-auto text-left" style={{ 
                          backgroundImage: "linear-gradient(#eae7d8 1px, transparent 1px)", 
                          backgroundSize: "100% 1.4rem" 
                        }}>
                          <pre id="editor-preview-text" className="font-hand text-sm text-stone-800 whitespace-pre-wrap leading-[1.4rem] font-bold">
                            {activeStep.payload.editorPreview}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Code Diff Match */}
                    {activeStep?.payload?.diffAfter && activeStep.actionType === "diff" && (
                      <div className="border-t border-[#1e2e26] text-left">
                        <div className="bg-[#101b16] px-4 py-2 border-b border-[#22352b]">
                          <span className="text-[9px] font-mono uppercase text-[#9acbb1] font-bold tracking-wider">
                            Evaluating Code Diff
                          </span>
                        </div>
                        <div className="p-4 bg-[#09110d] max-h-[220px] overflow-y-auto font-mono text-[10px] leading-relaxed">
                          <div className="text-emerald-400 mb-2 select-all font-semibold">
                            {activeStep.payload.diffHeader}
                          </div>
                          
                          <div className="bg-rose-950/20 text-rose-300 border-l-2 border-rose-500/50 px-2.5 py-1">
                            - {activeStep.payload.diffBefore}
                          </div>

                          <div className="bg-emerald-950/20 text-[#a9fac8] border-l-2 border-emerald-500/50 px-2.5 py-1 mt-2">
                            + {activeStep.payload.diffAfter}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Chat Column if AI Co-Founder is active */}
        {isChatOpen && (
          <div className="fixed bottom-6 right-6 z-[100] w-[380px] bg-white/95 border border-indigo-200/60 rounded-3xl p-4 flex flex-col h-[600px] max-h-[85vh] shadow-2xl backdrop-blur-xl justify-between animate-fadeIn border-t-4 border-t-indigo-500 text-left">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-indigo-100/30 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/50 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-indigo-600 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="text-xs font-display font-extrabold text-indigo-950 leading-tight">AI Co-Founder Panel</h4>
                  <span className="text-[9px] font-mono text-indigo-700/80 uppercase font-bold tracking-wider">Sprint Coordinator</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable messages */}
            <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3.5 max-h-[440px] custom-scrollbar">
              {chatMessages.map((msg, index) => {
                const isAgent = msg.sender === "agent";
                return (
                  <div
                    key={index}
                    className={`flex gap-2 max-w-[90%] ${
                      isAgent ? "mr-auto flex-row" : "ml-auto flex-row-reverse"
                    }`}
                  >
                    <div
                      className={`p-2.5 px-3 rounded-2xl text-[11px] leading-relaxed relative text-left ${
                        isAgent
                          ? "bg-indigo-50/70 border border-indigo-100 text-indigo-950 rounded-bl-sm shadow-sm"
                          : "bg-white border border-orange-100/80 text-emerald-950 rounded-br-sm shadow-sm"
                      }`}
                    >
                      <div className="prose prose-sm prose-emerald max-w-none text-current font-sans leading-relaxed">
                        <MarkdownErrorBoundary fallbackText={msg.text}>
                          <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
                        </MarkdownErrorBoundary>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAgentTyping && (
                <div className="flex gap-2 max-w-[90%] mr-auto items-end">
                  <div className="bg-indigo-50/40 border border-indigo-100/30 p-2.5 px-3 rounded-2xl rounded-bl-sm text-indigo-800 text-[9px] font-medium flex items-center gap-1.5 italic">
                    <span>Co-Founder updating board... 🖌️</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-150" />
                      <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-225" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Suggestions / Prebuilts */}
            <div className="shrink-0 mb-2 border-t border-indigo-50/50 pt-2 text-left">
              <span className="text-[8px] font-mono text-indigo-700/60 uppercase tracking-widest block mb-1 font-bold">Suggested Actions</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "➕ Add task to draft logo", txt: "add a task to draft logo and branding" },
                  { label: "🔴 Make Step 1 High Priority", txt: "make Step 1 high priority" },
                  { label: "🏆 Reflect on my journal", txt: "reflect on my completed notes and achievements" }
                ].map((sug) => (
                  <button
                    key={sug.label}
                    onClick={() => {
                      setChatInput(sug.txt);
                    }}
                    disabled={isAgentTyping}
                    className="text-[9px] font-medium bg-indigo-50/30 text-indigo-950 border border-indigo-100/40 rounded-lg px-2 py-1 hover:bg-indigo-50 transition cursor-pointer"
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-1.5 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isAgentTyping ? "Co-founder is writing..." : "Chat to update plan or reflect..."}
                disabled={isAgentTyping}
                className="flex-1 h-10 px-3 bg-white border border-indigo-100 text-[11px] text-indigo-950 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300/30 text-left"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAgentTyping}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-45"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

      </div>

      {/* 5. ADD CUSTOM TASK DIALOG MODAL OVERLAY */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-orange-100 p-6 max-w-md w-full shadow-2xl text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-display font-extrabold text-emerald-950 text-base">Add Custom Sprint Task</h3>
                </div>
                <button 
                  onClick={() => setIsAddingTask(false)}
                  className="w-7 h-7 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomTask} className="space-y-4 font-sans text-xs text-left">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Task Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Sketch landing logo ideas..."
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200/50 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Task Description</label>
                  <textarea
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Describe what needs to be done..."
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200/50 text-left"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold">Priority Vibe</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((p) => {
                      const colorMap = {
                        low: "hover:border-emerald-500 text-emerald-700 bg-emerald-50/20",
                        medium: "hover:border-amber-500 text-amber-700 bg-amber-50/20",
                        high: "hover:border-rose-500 text-rose-700 bg-rose-50/20"
                      };
                      const activeColorMap = {
                        low: "border-emerald-500 bg-emerald-100/50 text-emerald-800 font-bold",
                        medium: "border-amber-500 bg-amber-100/50 text-amber-800 font-bold",
                        high: "border-rose-500 bg-rose-100/50 text-rose-800 font-bold"
                      };

                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTaskPriority(p)}
                          className={`flex-1 h-9 rounded-xl border capitalize transition cursor-pointer text-center ${
                            newTaskPriority === p ? activeColorMap[p] : `border-slate-200 text-slate-600 ${colorMap[p]}`
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 h-11 border border-slate-200 text-slate-600 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    Create Milestone
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. TASK SPLIT WORKSPACE DRAWER */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[200]">
            <button
              type="button"
              aria-label="Close task workspace"
              className="absolute inset-0 w-full h-full cursor-default bg-transparent border-0"
              onClick={() => setSelectedTaskId(null)}
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0.98 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full lg:w-[72vw] xl:w-[64vw] bg-[#fffdf9] border-l border-orange-100 shadow-2xl text-left grid grid-cols-1 md:grid-cols-2 overflow-y-auto md:overflow-hidden"
            >
              <button
                onClick={() => setSelectedTaskId(null)}
                className="absolute right-4 top-4 z-10 w-10 h-10 bg-white/95 hover:bg-slate-50 border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
                aria-label="Close task workspace"
              >
                <X className="w-5 h-5" />
              </button>

              <section className="min-h-screen md:h-full overflow-y-auto custom-scrollbar p-5 sm:p-7 md:border-r border-orange-100/70">
                <div className="pr-10">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border tracking-wider capitalize ${
                      selectedTask.priority === "high"
                        ? "bg-rose-50 border-rose-300 text-rose-700"
                        : selectedTask.priority === "medium"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-emerald-50 border-emerald-300 text-emerald-700"
                    }`}>
                      {selectedTask.priority || "medium"} Priority
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md capitalize">
                      {selectedTask.status}
                    </span>
                    {selectedTask.custom && (
                      <span className="text-[9px] font-mono font-bold bg-[#fbfdfa] border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        Custom Milestone
                      </span>
                    )}
                  </div>

                  {selectedTask.custom ? (
                    <input
                      type="text"
                      value={selectedTask.title}
                      onChange={(e) => handleUpdateTaskDetails(selectedTask.id!, { title: e.target.value })}
                      className="text-xl font-display font-extrabold text-slate-950 border-b border-dashed border-slate-200 hover:border-slate-400 focus:outline-none focus:border-emerald-500 w-full bg-transparent text-left leading-tight"
                    />
                  ) : (
                    <h3 className="text-xl font-display font-extrabold text-slate-950 leading-tight text-left">
                      {selectedTask.title}
                    </h3>
                  )}
                </div>

                <div className="mt-6 space-y-5 font-sans text-xs text-slate-800 text-left">
                  <div className="text-left">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold text-left">Milestone Brief</label>
                    {selectedTask.custom ? (
                      <textarea
                        value={selectedTask.description}
                        onChange={(e) => handleUpdateTaskDetails(selectedTask.id!, { description: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:border-emerald-500 text-left"
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed bg-white border border-slate-100/80 p-4 rounded-2xl text-left shadow-sm">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>

                  <div className="text-left">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-bold text-left">Priority</label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((p) => {
                        const isActive = selectedTask.priority === p;
                        const activeStyle = {
                          low: "border-emerald-500 bg-emerald-100/50 text-emerald-800 font-extrabold",
                          medium: "border-amber-500 bg-amber-100/50 text-amber-800 font-extrabold",
                          high: "border-rose-500 bg-rose-100/50 text-rose-800 font-extrabold"
                        };
                        return (
                          <button
                            key={p}
                            onClick={() => handleUpdateTaskDetails(selectedTask.id!, { priority: p })}
                            className={`flex-1 h-9 rounded-lg border capitalize transition cursor-pointer font-sans font-medium text-[11px] ${
                              isActive ? activeStyle[p] : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1 mb-1.5 justify-between">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1 text-left">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        Co-Founder Creation Diary
                      </label>
                      <span className="text-[8px] font-mono text-slate-400">Autosaved to database</span>
                    </div>
                    <textarea
                      value={selectedTask.notes || ""}
                      onChange={(e) => handleUpdateTaskDetails(selectedTask.id!, { notes: e.target.value })}
                      placeholder="Write down what you did on this step, what problems you solved, your feelings, or questions for your AI co-founder..."
                      rows={10}
                      className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300/30 font-sans leading-relaxed text-xs shadow-inner placeholder-slate-400/90 text-left resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    {selectedTask.custom ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomTask(selectedTask.id!)}
                        className="h-10 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl flex items-center gap-1.5 transition cursor-pointer font-bold border border-rose-200/50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Card</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono text-left">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        <span>Sandbox core template step</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="min-h-screen md:h-full bg-[#f8fafc] flex flex-col md:min-h-0">
                <div className="p-5 sm:p-7 border-b border-slate-200/80 pr-16">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/15">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-display font-extrabold text-indigo-950 leading-tight">Personal AI Tutor</h3>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                        Specialized for this milestone
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-4">
                  {(selectedTask.tutorMessages ?? []).length === 0 && (
                    <div className="bg-white border border-indigo-100 rounded-2xl p-4 text-slate-600 text-xs leading-relaxed shadow-sm">
                      I am focused only on <strong className="text-indigo-950">{selectedTask.title}</strong>. Ask me to break down the next move, explain the code or diff, draft an outline, or reflect on your diary notes.
                    </div>
                  )}

                  {(selectedTask.tutorMessages ?? []).map((msg, index) => {
                    const isAgent = msg.sender === "agent";
                    return (
                      <div key={`${msg.sender}-${index}`} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[86%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-wrap ${
                          isAgent
                            ? "bg-white border border-indigo-100 text-indigo-950 rounded-bl-sm"
                            : "bg-emerald-600 text-white rounded-br-sm"
                        }`}>
                          <div className="prose prose-sm prose-emerald max-w-none text-current font-sans leading-relaxed">
                            <MarkdownErrorBoundary fallbackText={msg.text}>
                              <ReactMarkdown>{msg.text || ""}</ReactMarkdown>
                            </MarkdownErrorBoundary>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isTutorTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-indigo-100 rounded-2xl rounded-bl-sm px-3.5 py-3 text-[10px] text-indigo-700 font-medium flex items-center gap-2 shadow-sm">
                        <span>Tutor is thinking</span>
                        <span className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-225" />
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={tutorEndRef} />
                </div>

                <div className="border-t border-slate-200/80 bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[
                      selectedTask.status === "completed"
                        ? { label: "What did I learn?", text: "What did I learn here?" }
                        : { label: "How do I start?", text: "How do I get started on this?" },
                      selectedTask.actionType === "diff" || selectedTask.actionType === "draft"
                        ? { label: "Explain this work", text: "Explain how this code or draft works." }
                        : { label: "Draft an outline", text: "Help me draft an outline." },
                      { label: "Reflect on notes", text: "Reflect on my notes for this milestone." }
                    ].map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => handleSendTutorMessage(suggestion.text)}
                        disabled={isTutorTyping}
                        className="text-[10px] font-bold bg-indigo-50 text-indigo-950 border border-indigo-100 rounded-lg px-2.5 py-1.5 hover:bg-indigo-100 transition cursor-pointer disabled:opacity-50"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendTutorMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      disabled={isTutorTyping}
                      placeholder={isTutorTyping ? "Tutor is writing..." : "Ask your task tutor..."}
                      className="flex-1 h-11 px-3 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300/30 text-left"
                    />
                    <button
                      type="submit"
                      disabled={!tutorInput.trim() || isTutorTyping}
                      className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center active:scale-95 transition shadow-sm cursor-pointer disabled:opacity-45"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </section>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* SUBCOMPONENT: KANBAN TASK CARD */
interface KanbanCardProps {
  key?: string;
  step: ProjectStep;
  onInspect: (id: string) => void;
  onMove: (newStatus: ProjectStep["status"]) => void;
}

function KanbanCard({ step, onInspect, onMove }: KanbanCardProps) {
  const isPending = step.status === "pending";
  const isWorking = step.status === "running" || step.status === "approved";
  const isDone = step.status === "completed";

  const priorityColor = {
    high: "bg-rose-500/10 text-rose-700 border-rose-200",
    medium: "bg-amber-500/10 text-amber-700 border-amber-200",
    low: "bg-emerald-500/10 text-emerald-700 border-emerald-200"
  };

  const handleInspectClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("select")) return;
    if (step.id) onInspect(step.id);
  };

  return (
    <motion.div
      layoutId={step.id}
      onClick={handleInspectClick}
      className={`border rounded-2xl p-3.5 text-left bg-white/95 hover:shadow-md hover:scale-[1.015] transition-all duration-200 cursor-pointer relative flex flex-col justify-between h-[155px] text-left ${
        isDone 
          ? "border-emerald-300/30 opacity-75 shadow-inner" 
          : isWorking
          ? "border-amber-400/50 shadow-sm shadow-amber-400/5"
          : "border-slate-200/60 shadow-sm"
      }`}
    >
      <div className="text-left">
        {/* Top Header Pill Row */}
        <div className="flex items-center justify-between gap-2 mb-2 shrink-0">
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${priorityColor[step.priority || "medium"]}`}>
            {step.priority || "medium"}
          </span>
          
          <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
            {step.custom ? "+35 XP" : "+50 XP"}
          </span>
        </div>

        {/* Task Title */}
        <h4 className={`text-xs font-sans font-bold leading-tight mb-1.5 text-left ${isDone ? "text-slate-400 line-through" : "text-emerald-950"}`}>
          {step.title}
        </h4>
        
        {/* Short Description */}
        <p className={`text-[10px] font-sans leading-relaxed text-slate-500 line-clamp-2 text-left`}>
          {step.description}
        </p>
      </div>

      {/* Footer Details & Action controls */}
      <div className="border-t border-slate-100 pt-2.5 mt-2 flex items-center justify-between shrink-0 gap-2 text-left">
        <div className="flex items-center gap-1 text-left">
          {step.notes && step.notes.trim().length > 0 ? (
            <div className="flex items-center gap-1 text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-200/40 rounded px-1.5 py-0.5 font-sans font-semibold text-left" title="Creation diary notes logged">
              <BookOpen className="w-3 h-3 text-indigo-500 animate-pulse" />
              <span>1 diary logged</span>
            </div>
          ) : (
            <div className="text-[9px] text-slate-400 flex items-center gap-0.5 text-left" title="No notes recorded yet. Click card to write.">
              <Edit3 className="w-3 h-3 text-slate-300" />
              <span className="font-sans">Add diary</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isPending && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove("running");
              }}
              className="h-6 px-2 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-sans font-extrabold rounded-lg flex items-center gap-0.5 active:scale-95 transition cursor-pointer"
            >
              <span>Work</span>
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          )}

          {isWorking && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("pending");
                }}
                className="h-6 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[9px] font-sans font-bold rounded-lg active:scale-95 transition cursor-pointer border border-slate-200/40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove("completed");
                }}
                className="h-6 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-sans font-extrabold rounded-lg flex items-center gap-0.5 active:scale-95 transition cursor-pointer"
              >
                <span>Done</span>
                <Check className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {isDone && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove("running");
              }}
              className="h-6 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[9px] font-sans font-bold rounded-lg active:scale-95 transition cursor-pointer border border-slate-200"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

    </motion.div>
  );
}
