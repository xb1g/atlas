import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client to prevent crash if key is missing helper
let devGeminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!devGeminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      devGeminiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return devGeminiClient;
}

/**
 * Antigravity Agent Helper
 * Wraps the Gemini Interactions API for the antigravity-preview-05-2026 agent.
 * Falls back gracefully to regular Gemini if the agent is not available.
 */
async function antigravityRun(
  client: GoogleGenAI,
  prompt: string,
  options?: {
    stream?: false;
    timeout?: number;
    tools?: Array<{ type: string }>;
    previousInteractionId?: string;
  }
): Promise<{ text: string; raw: any; id: string }>;
async function antigravityRun(
  client: GoogleGenAI,
  prompt: string,
  options: {
    stream: true;
    timeout?: number;
    tools?: Array<{ type: string }>;
    previousInteractionId?: string;
  }
): Promise<{ stream: AsyncIterable<any>; raw: any; id: string }>;
async function antigravityRun(
  client: GoogleGenAI,
  prompt: string,
  options?: {
    stream?: boolean;
    timeout?: number;
    tools?: Array<{ type: string }>;
    previousInteractionId?: string;
  }
): Promise<any> {
  try {
    const createParams: any = {
      agent: "antigravity-preview-05-2026",
      input: prompt,
      environment: "remote",
      store: true,
    };
    if (options?.tools) createParams.tools = options.tools;
    if (options?.stream) createParams.stream = true;
    if (options?.previousInteractionId) createParams.previous_interaction_id = options.previousInteractionId;

    const interaction = await (client as any).interactions.create(createParams);

    if (options?.stream) {
      return { stream: interaction, raw: interaction, id: interaction.id };
    }

    let result = interaction;
    if (result.status && result.status !== "completed") {
      const maxPolls = 30;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        result = await (client as any).interactions.get(result.id);
        if (result.status === "completed" || result.status === "failed" || result.status === "cancelled") {
          break;
        }
      }
    }

    const text = result.output_text || result.outputText || "";
    return { text, raw: result, id: result.id };
  } catch (err: any) {
    console.error("Antigravity agent call failed:", err.message || err);
    throw err;
  }
}

// -------------------------------------------------------------
// In-Memory Database / Sandbox state per Demo session
// -------------------------------------------------------------
interface SessionProfile {
  id: string;
  answers: {
    name: string;
    age: number;
    grade: string;
    spark: string;       // What sucks in the world
    medium: string;      // Writing, Coding, Visual, organizing 
    topic: string;       // Sea migration, plastic, forest, etc
    freeTime: string;    // Time availability
    solveApproach?: string;
    notBoring?: string;
    access?: string;
    winFeeling?: string;
  };
  opportunities: any[];
  activeProject: {
    id: string;
    stepIndex: number;
    started?: boolean;
    steps: {
      id?: string;
      title: string;
      description: string;
      status: "pending" | "running" | "approved" | "completed";
      actionType: "init" | "fetch" | "draft" | "diff" | "publish";
      custom?: boolean;
      notes?: string;
      tutorMessages?: { sender: "student" | "agent"; text: string }[];
      tutorInteractionId?: string;
      priority?: "low" | "medium" | "high";
      payload?: {
        consoleLogs?: string[];
        diffHeader?: string;
        diffBefore?: string;
        diffAfter?: string;
        editorPreview?: string;
        destUrl?: string;
      };
    }[];
    coFounderMessages?: { sender: "student" | "agent"; text: string }[];
    coFounderInteractionId?: string;
  } | null;
  chatInteractionId?: string;
  reflectionInteractionId?: string;
}

type ProjectStepData = NonNullable<SessionProfile["activeProject"]>["steps"][number];
type ActiveProjectData = NonNullable<SessionProfile["activeProject"]>;

function mergeIncomingSteps(currentSteps: ProjectStepData[], incomingSteps: ProjectStepData[]) {
  const existingById = new Map(currentSteps.filter((step) => step.id).map((step) => [step.id, step]));

  return incomingSteps.map((incoming, idx) => {
    const existing = incoming.id ? existingById.get(incoming.id) : currentSteps[idx];
    return {
      ...existing,
      ...incoming,
      tutorMessages: existing ? existing.tutorMessages ?? [] : incoming.tutorMessages ?? [],
    };
  });
}

function preserveCurrentStep(project: ActiveProjectData, previousActiveTaskId?: string) {
  if (previousActiveTaskId) {
    const nextIndex = project.steps.findIndex((step) => step.id === previousActiveTaskId);
    if (nextIndex !== -1) {
      project.stepIndex = nextIndex;
      return;
    }
  }

  // stepIndex === steps.length is the valid "all completed" sentinel.
  // Only clamp if it has overshot past the sentinel value.
  if (project.stepIndex > project.steps.length) {
    project.stepIndex = Math.max(0, project.steps.length - 1);
  }
}

function normalizeProjectSteps(session: SessionProfile) {
  if (!session.activeProject) return false;

  let changed = false;
  const seenIds = new Set<string>();
  session.activeProject.steps = session.activeProject.steps.map((step, idx) => {
    let id = step.id;
    if (!id || seenIds.has(id)) {
      id = `${session.activeProject!.id}-step-${idx}`;
      changed = true;
    }
    seenIds.add(id);

    const tutorMessages = step.tutorMessages ?? [];
    if (!step.id || step.tutorMessages === undefined) {
      changed = true;
    }

    return {
      ...step,
      id,
      tutorMessages,
    };
  });

  if (session.activeProject.stepIndex > session.activeProject.steps.length) {
    session.activeProject.stepIndex = session.activeProject.steps.length;
    changed = true;
  }

  return changed;
}

function makePracticeTutorReply(
  message: string,
  task: ProjectStepData,
  session: SessionProfile,
  opportunity: any
) {
  const lower = message.toLowerCase();
  const firstName = session.answers.name || "there";
  const projectTitle = opportunity?.title || "this adventure";

  if (lower.includes("start") || lower.includes("begin") || lower.includes("get started")) {
    return `Start with a tiny first move, ${firstName}: write one sentence that explains what "${task.title}" is trying to accomplish inside **${projectTitle}**. Then list 2 inputs you need, 1 thing you can create in 10 minutes, and 1 question you want to answer before moving on.`;
  }

  if (lower.includes("outline") || lower.includes("draft")) {
    return `Here is a clean outline for **${task.title}**:\n\n- Goal: ${task.description}\n- First step: collect the facts or starter code you already have.\n- Build step: create the smallest visible version.\n- Reflection: write what changed, what surprised you, and what you want help with next.`;
  }

  if (lower.includes("code") || lower.includes("diff")) {
    return `For this task, read the code like a story: identify the starting value, the transformation, and the final output. If there is a diff, focus on the changed line first, then ask: "What behavior would be different after this change?"`;
  }

  if (lower.includes("learn") || lower.includes("reflect") || lower.includes("notes")) {
    const notes = task.notes?.trim();
    return notes
      ? `Your notes show that you are practicing real builder habits: observing what happened, naming blockers, and turning the work into a reusable lesson. For **${task.title}**, I would summarize the learning as: you moved from idea to evidence, then captured the next decision.`
      : `For **${task.title}**, write a 3-line reflection: what you tried, what worked, and what you would do differently next time. That gives future-you a useful map instead of just a completed checkbox.`;
  }

  return `For **${task.title}**, I would keep this focused and practical: define the outcome, make the smallest useful version, then record one diary note about what you learned. Tell me where you feel stuck and I will break it into the next 2-3 moves.`;
}

function makePracticeCoFounderReply(message: string, session: SessionProfile, project: ActiveProjectData, opportunity: any) {
  const textLower = (message || "").toLowerCase();
  const name = session.answers.name || "there";
  const activeTask = project.steps.find((step) => step.status === "pending" || step.status === "running" || step.status === "approved")
    || project.steps[project.stepIndex]
    || project.steps[0];

  if (textLower.includes("start") || textLower.includes("begin") || textLower.includes("stuck") || textLower.includes("don't know") || textLower.includes("dont know")) {
    return `Start with the first visible milestone: **${activeTask?.title || opportunity.title}**.\n\n1. Open that card on the board.\n2. Write one diary sentence about what you think the task is asking for.\n3. Ask the Personal AI Tutor inside that card: "How do I get started on this?"\n\nFor this project, the goal is not to know everything upfront. The goal is to make the next tiny move.`;
  }

  if (textLower.includes("reflect") || textLower.includes("review") || textLower.includes("notes") || textLower.includes("done")) {
    const completedCount = project.steps.filter(s => s.status === "completed").length;
    const notesWithContent = project.steps.filter(s => s.notes && s.notes.trim().length > 0);
    const notesSummary = notesWithContent.map(s => `- **${s.title}**: ${s.notes}`).join("\n");
    return completedCount === 0
      ? `You are at the starting line, ${name}. Pick one card, make it "Working On", and write the first diary note. That creates momentum.`
      : `You have completed **${completedCount} milestone(s)** so far.\n\n${notesSummary || "Add a short diary note to a completed card, then I can help you turn it into a stronger reflection."}`;
  }

  return `Good question, ${name}. For **${opportunity.title}**, I would pick one card, move it to **Working On**, and use the card's Personal AI Tutor for the exact next step. The board-level chat can help plan the sprint; the task tutor helps you do the work.`;
}


// -------------------------------------------------------------
// Firebase Database Setup
// -------------------------------------------------------------
const firebaseApiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "atlas-84bc7.firebaseapp.com",
  projectId: "atlas-84bc7",
  storageBucket: "atlas-84bc7.firebasestorage.app",
  messagingSenderId: "257271521688",
  appId: "1:257271521688:web:c661460d40706242864bed",
  measurementId: "G-XMREWEXQCV"
};

let db: any = null;
if (firebaseApiKey && firebaseApiKey !== "MY_FIREBASE_API_KEY") {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log("Firebase Firestore Web SDK initialized successfully with project ID:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Firebase Web SDK initialization failed. Falling back to in-memory sessions.", error);
  }
} else {
  console.warn("No FIREBASE_API_KEY detected. Falling back to in-memory sessions.");
}

const activeSessions: Record<string, SessionProfile> = {};

async function getSession(id: string): Promise<SessionProfile> {
  if (db) {
    try {
      const docRef = doc(db, "sessions", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const session = snap.data() as SessionProfile;
        if (normalizeProjectSteps(session)) {
          await setDoc(docRef, session);
        }
        return session;
      }
    } catch(e) { 
      console.error("Firestore get error", e); 
    }
  }
  if (!activeSessions[id]) {
    activeSessions[id] = {
      id,
      answers: {
        name: "Maya",
        age: 16,
        grade: "Grade 11",
        spark: "Hate seeing microplastics wash up on sea turtle nesting beaches",
        medium: "writing advocacy letters & guest blogging",
        topic: "marine ecosystems & beach microplastics conservation",
        freeTime: "This weekend (2 hours)",
        solveApproach: "I draw it out first",
        notBoring: "Making it look good",
        access: "A laptop",
        winFeeling: "Someone uses what I made"
      },
      opportunities: [],
      activeProject: null,
    };
  }
  normalizeProjectSteps(activeSessions[id]);
  return activeSessions[id];
}

async function saveSession(session: SessionProfile) {
  if (db) {
    try {
      // Firestore max doc = 1MB. Strip all large binary/preview fields before writing.
      const firestoreSession = {
        ...session,
        opportunities: session.opportunities.map((o: any) => {
          const { imageUrl, ...rest } = o;
          return imageUrl ? { ...rest, status: "planned" } : rest;
        }),
        activeProject: session.activeProject ? {
          ...session.activeProject,
          steps: session.activeProject.steps.map((step: any) => {
            const { payload, ...rest } = step;
            // Keep only lightweight payload fields (destUrl, diffHeader)
            const slimPayload = payload ? {
              ...(payload.destUrl ? { destUrl: payload.destUrl } : {}),
              ...(payload.diffHeader ? { diffHeader: payload.diffHeader } : {}),
            } : undefined;
            return {
              ...rest,
              ...(slimPayload && Object.keys(slimPayload).length > 0 ? { payload: slimPayload } : {}),
            };
          }),
        } : null,
      };
      const docRef = doc(db, "sessions", session.id);
      await setDoc(docRef, firestoreSession);
    } catch(e) {
      console.error("Firestore save error", e);
    }
  } else {
    activeSessions[session.id] = session;
  }
}


// 1. API: Load Active Sandbox Session Profile
app.get("/api/session", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  res.json({
    session,
    hasLiveKey: !!getGeminiClient()
  });
});

// 2. API: Save Interview Answers and Reset Active Project State
app.post("/api/session/answers", async (req, res) => {
  const { name, age, grade, spark, medium, topic, freeTime, solveApproach, notBoring, access, winFeeling } = req.body;
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  
  session.answers = {
    name: name || "Maya",
    age: Number(age) || 16,
    grade: grade || "Grade 11",
    spark: spark || "",
    medium: medium || "",
    topic: topic || "",
    freeTime: freeTime || "",
    solveApproach: solveApproach || "",
    notBoring: notBoring || "",
    access: access || "",
    winFeeling: winFeeling || ""
  };
  session.opportunities = [];
  session.activeProject = null;
  
  await saveSession(session);
  res.json({ success: true, session });
});

// Helper to generate a beautiful Monet-themed flat-illustration SVG dynamically
function generatePrebuiltSvg(
  type: string,
  title: string,
  category: string,
  answers: SessionProfile["answers"]
): string {
  const name = answers.name || "Maya";
  const age = answers.age || 16;
  
  let bracket = "Hacker";
  if (age <= 14) bracket = "Explorer";
  if (age >= 18) bracket = "Champion";

  const upperCategory = category.toUpperCase();
  
  // Custom interactive graphic matching the category
  let iconContent = "";
  if (category === "maps") {
    iconContent = `
      <!-- Stylized Dotted GIS Path -->
      <path d="M 60,180 Q 150,90 230,220 T 340,140" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="6,6" opacity="0.8" />
      <!-- Gold Compass Frame -->
      <circle cx="230" cy="220" r="28" fill="none" stroke="#ffb020" stroke-width="2" opacity="0.75" />
      <circle cx="230" cy="220" r="4" fill="#ffb020" />
      <!-- Grid crosshairs -->
      <line x1="230" y1="180" x2="230" y2="260" stroke="#ffb020" stroke-width="1.5" stroke-dasharray="2,2" opacity="0.5" />
      <line x1="190" y1="220" x2="270" y2="220" stroke="#ffb020" stroke-width="1.5" stroke-dasharray="2,2" opacity="0.5" />
    `;
  } else if (category === "tech") {
    iconContent = `
      <!-- Code Terminal Box -->
      <rect x="90" y="110" width="220" height="120" rx="12" fill="#faf9f5" stroke="rgba(2, 44, 34, 0.1)" stroke-width="1.5" />
      <rect x="90" y="110" width="220" height="24" rx="12" fill="#e8eaf6" opacity="0.7" />
      <!-- Window Controls -->
      <circle cx="108" cy="122" r="5" fill="#f87171" />
      <circle cx="122" cy="122" r="5" fill="#fbbf24" />
      <circle cx="136" cy="122" r="5" fill="#34d399" />
      <!-- Code Lines -->
      <rect x="108" y="150" width="100" height="6" rx="3" fill="#818cf8" opacity="0.8" />
      <rect x="108" y="165" width="160" height="6" rx="3" fill="#60a5fa" opacity="0.8" />
      <rect x="124" y="180" width="120" height="6" rx="3" fill="#34d399" opacity="0.8" />
      <rect x="108" y="195" width="80" height="6" rx="3" fill="#f472b6" opacity="0.8" />
    `;
  } else if (category === "campaign") {
    iconContent = `
      <!-- Formal Document Scroll -->
      <rect x="100" y="100" width="200" height="130" rx="6" fill="#fcfbf9" stroke="rgba(2, 44, 34, 0.15)" stroke-width="2" transform="rotate(-2, 200, 165)" />
      <!-- Document Text Lines -->
      <line x1="120" y1="125" x2="280" y2="125" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" transform="rotate(-2, 200, 165)" />
      <line x1="120" y1="145" x2="280" y2="145" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" transform="rotate(-2, 200, 165)" />
      <line x1="120" y1="165" x2="260" y2="165" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" transform="rotate(-2, 200, 165)" />
      <line x1="120" y1="185" x2="240" y2="185" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" transform="rotate(-2, 200, 165)" />
      <!-- Emerald Ribbon & Wax Seal -->
      <path d="M 255,200 L 245,235 L 255,225 Z" fill="#059669" transform="rotate(-2, 200, 165)" />
      <path d="M 265,200 L 275,235 L 265,225 Z" fill="#059669" transform="rotate(-2, 200, 165)" />
      <circle cx="260" cy="200" r="14" fill="#10b981" stroke="#059669" stroke-width="1" transform="rotate(-2, 200, 165)" />
    `;
  } else {
    // default "science"
    iconContent = `
      <!-- Flask and Eco Plant Specimen -->
      <rect x="188" y="100" width="24" height="35" rx="2" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.7" />
      <path d="M 188,135 L 145,210 A 12,12 0 0 0 157,225 L 243,225 A 12,12 0 0 0 255,210 L 212,135 Z" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.8" />
      <!-- Water Liquid -->
      <path d="M 155,195 L 245,195 A 10,10 0 0 1 251,212 L 243,220 A 8,8 0 0 1 235,222 L 165,222 A 8,8 0 0 1 157,220 L 149,212 A 10,10 0 0 1 155,195 Z" fill="url(#liquid-gradient)" opacity="0.65" />
      <!-- Sparkles and bubbles -->
      <circle cx="185" cy="180" r="4.5" fill="#10b981" opacity="0.5" />
      <circle cx="212" cy="165" r="3.5" fill="#10b981" opacity="0.4" />
      <circle cx="198" cy="150" r="5.5" fill="#3b82f6" opacity="0.4" />
    `;
  }

  // Splitting title into multiple lines dynamically based on length to prevent SVG text clipping
  const isLong = title.length > 55;
  const charsPerLine = isLong ? 34 : 26;
  const fontSize = isLong ? 15 : 20;
  const lineHeight = isLong ? 22 : 28;
  const maxLines = isLong ? 4 : 3;

  const words = title.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= charsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Position title lines
  let titleYOffset = 80;
  if (isLong) {
    if (lines.length === 1) titleYOffset = 95;
    else if (lines.length === 2) titleYOffset = 85;
    else if (lines.length === 3) titleYOffset = 75;
    else titleYOffset = 65;
  } else {
    if (lines.length === 1) titleYOffset = 95;
    else if (lines.length === 2) titleYOffset = 85;
    else titleYOffset = 75;
  }

  const titleSvgText = lines.slice(0, maxLines).map((line, idx) => {
    return `<text x="40" y="${titleYOffset + (idx * lineHeight)}" font-family="Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="#022c22" letter-spacing="-0.01em">${line}</text>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <!-- Beautiful Impressionist Monet Gradients -->
    <linearGradient id="monet-sunset" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffaec" />
      <stop offset="50%" stop-color="#f5effa" />
      <stop offset="100%" stop-color="#e8f0fe" />
    </linearGradient>
    
    <radialGradient id="sun-glow" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#fff2cc" stop-opacity="1" />
      <stop offset="100%" stop-color="#fff2cc" stop-opacity="0" />
    </radialGradient>
    
    <radialGradient id="lavender-glow" cx="70%" cy="70%" r="60%">
      <stop offset="0%" stop-color="#e1bee7" stop-opacity="1" />
      <stop offset="100%" stop-color="#e1bee7" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="emerald-glow" cx="50%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="1" />
      <stop offset="100%" stop-color="#a7f3d0" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="liquid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>

    <!-- Drop Shadow for Glass Plate -->
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#022c22" flood-opacity="0.04" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="400" height="300" fill="url(#monet-sunset)" />

  <!-- Soft Watercolor Color Spot Layers -->
  <ellipse cx="100" cy="90" rx="150" ry="110" fill="url(#sun-glow)" opacity="0.45" />
  <ellipse cx="300" cy="210" rx="130" ry="100" fill="url(#lavender-glow)" opacity="0.5" />
  <ellipse cx="200" cy="250" rx="120" ry="70" fill="url(#emerald-glow)" opacity="0.18" />

  <!-- Cozy Rounded Glassmorphic Board Plateer -->
  <rect x="20" y="20" width="360" height="260" rx="22" fill="#ffffff" fill-opacity="0.5" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.75" filter="url(#shadow)" />

  <!-- Category Badge Capsule -->
  <g transform="translate(40, 42)">
    <rect width="80" height="20" rx="10" fill="#022c22" fill-opacity="0.08" />
    <text x="40" y="14" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="9" font-weight="800" fill="#022c22" letter-spacing="0.1em" text-anchor="middle">${upperCategory}</text>
  </g>

  <!-- Title Lines -->
  ${titleSvgText}

  <!-- Theme-specific graphic icon layout -->
  ${iconContent}

  <!-- Handwritten Student Branding Cursive Footer -->
  <g transform="translate(40, 248)">
    <!-- Small accent line -->
    <line x1="0" y1="-10" x2="40" y2="-10" stroke="#022c22" stroke-width="1" opacity="0.25" />
    <text x="0" y="6" font-family="'Caveat', 'Brush Script MT', cursive, sans-serif" font-size="14" font-weight="bold" fill="#059669" opacity="0.9">
      Drafted by ${name} (Age ${age}) • ${bracket} Track
    </text>
  </g>
</svg>`;
}

// Helper for default premium mock opportunities matching standard prompt when API key is missing
function getPrebuiltMockOpportunities(answers: SessionProfile["answers"]) {
  const n = answers.name || "Maya";
  const t = answers.topic || "marine ecology";
  const age = answers.age || 16;
  
  if (age <= 14) {
    // Explorer Bracket: Ages 13-14 (Fun, gamified, welcoming, but carry real tech-mentor weight!)
    return [
      {
        id: "eco-campaign-explorer",
        type: "eco-campaign",
        title: "Mobilize a Student Sieve Brigade: Local Sifting Instruction Poster",
        target: "hillsborough-county.gov/citizens-portal",
        impact: "Grassroots Product Launch",
        difficulty: "Friendly Action MVP",
        summary: `Formulate a clear community guidebook and campaign layout to launch organized dune-filtration brigades. Teaches you how to build clear instructions and assemble lightweight sand sieve filters to capture microplastics.`,
        whyMatch: `As a founder, I know that local activation is the ultimate proof-of-concept. This gets real users testing your sand-sieving ideas in the field, ${n}!`,
        estimatedMinutes: 20,
        sourceUrl: "https://hillsborough-county.gov",
        complexity: "Teaches grassroots community organization, instructional flowchart design, and physical sand filtration concepts.",
        imageUrl: ""
      },
      {
        id: "code-widget-explorer",
        type: "code-widget",
        title: "Forecast Plastic Lifespans: Interactive Debris Decay Calculator",
        target: "highschoolline.github.io/pollution-sliders",
        impact: "Interactive Data Interface",
        difficulty: "State-Driven Sandbox MVP",
        summary: `Architect a cozy interactive React slider sandbox. Users select different plastic debris materials and slide virtual timelines to watch them fragment into microplastics over decades.`,
        whyMatch: `Interactive code is how you capture attention, ${n}. Building a simulated decay meter is an elite way to show users why single-use plastics are design errors.`,
        estimatedMinutes: 25,
        sourceUrl: "https://github.com/highschoolline/pollution-sliders",
        complexity: "Teaches React hook-driven state transitions, custom timeline ranges, and visual decay meters.",
        imageUrl: ""
      },
      {
        id: "wildlife-map-explorer",
        type: "wildlife-map",
        title: "Keep Nesting Sea Turtles Safe: Coastal Sanctuary Landmark Map",
        target: "google.com/maps/mymaps/gulf-logger",
        impact: "Geospatial Operations Map",
        difficulty: "Friendly GIS Overlay",
        summary: `Map precise shoreline coordinate markers details representing local sea turtle nesting zones, attaching custom descriptions to structure watchman schedules.`,
        whyMatch: `Every location-based product begins with high-quality mapping. You'll structure geodetic coordinates that coordinate beach patrols, ${n}!`,
        estimatedMinutes: 20,
        sourceUrl: "https://google.com/maps/mymaps",
        complexity: "Teaches geodetic coordinate mapping, custom descriptions structuring, and regional nesting schedules.",
        imageUrl: ""
      },
      {
        id: "oss-docs-explorer",
        type: "oss-doc-pr",
        title: "Onboard iNaturalist Volunteers: Beginner Database Welcoming Guide",
        target: "github.com/inaturalist/turtle-db",
        impact: "Global Contributor Pipeline",
        difficulty: "Open Source Documentation",
        summary: `Draft an intuitive, clean onboarding guide instructing young volunteers how to correctly record microplastic variables in a repository. Resolves issue #482.`,
        whyMatch: `Excellent developer docs are the lifeblood of software scaling. Your work puts you directly into the core repository of iNaturalist, ${n}!`,
        estimatedMinutes: 20,
        sourceUrl: "https://github.com/inaturalist/turtle-db/issues/482",
        complexity: "Teaches markdown documentation, issue workflow routing, and clear scientific data submission guidelines.",
        imageUrl: ""
      },
      {
        id: "publish-essay-explorer",
        type: "publish-essay",
        title: "Uncover Synthetic Sand Warming: Heartfelt Community Substack Letter",
        target: "ocean-sentinel.substack.com",
        impact: "Thought Leadership Outreach",
        difficulty: "Scientific Blog Column",
        summary: `Write a compelling narrative essay exploring how accumulated plastics alter beach sand temperatures, skewing embryonic turtle development.`,
        whyMatch: `To build conviction, founders write high-agency analyses. This establishes your profile as a serious writer who understands physical ecology, ${n}!`,
        estimatedMinutes: 20,
        sourceUrl: "https://ocean-sentinel.substack.com/about",
        complexity: "Teaches scientific storytelling, thermal conductivity basics, and persuasive newsletter formatting.",
        imageUrl: ""
      },
      {
        id: "teach-skill-explorer",
        type: "teach-skill",
        title: "Design Better Buttons for Kids: Simple Screen Spacing Guideline",
        target: "atlas/design-system",
        impact: "Interface Usability Governance",
        difficulty: "Mobile Usability Rule Spec",
        summary: `Help write an official design instruction guide enforcing large touch target sizes and cozy padding ratios in modern frontend interfaces, helping AI agents build safer layouts.`,
        whyMatch: `Badly spaced buttons are AI-slop design bugs. Your guidelines help developers write clean, touch-friendly, high-accessibility UI widgets, ${n}!`,
        estimatedMinutes: 20,
        sourceUrl: "./DESIGN.md",
        complexity: "Teaches mobile target specifications, accessibility (a11y) spacing tokens, and clean design systems logic.",
        imageUrl: ""
      }
    ];
  } else if (age >= 18) {
    // Champion Bracket: Ages 18-20 (Professional, prestigious, deep, systemic, academic)
    return [
      {
        id: "eco-campaign-champion",
        type: "eco-campaign",
        title: "Secure Municipal Sieve Funding: Formal Policy Directive Memo",
        target: "hillsborough-county.gov/citizens-portal",
        impact: "Systemic Policy Directive",
        difficulty: "Formal Regulatory Proposal",
        summary: `Draft an exhaustive, professionally structured public policy proposal directed at the Municipal Environmental Council to fund and deploy standard sand sieve stations at public dune entrances.`,
        whyMatch: `To scale change, you have to write formal regulatory specifications. This teaches you to build policy cases that county commissioners can't ignore, ${n}.`,
        estimatedMinutes: 45,
        sourceUrl: "https://hillsborough-county.gov",
        complexity: "Handles executive summary formulation, legislative ROI framing, municipal logistics, and cost-benefit frameworks.",
        imageUrl: ""
      },
      {
        id: "code-widget-champion",
        type: "code-widget",
        title: "Predict Dune Toxicity Saturation: High-Fidelity Sand Simulation Sandbox",
        target: "highschoolline.github.io/pollution-sliders",
        impact: "Analytical Math Engine",
        difficulty: "State-Driven Math Architecture",
        summary: `Architect a state-driven React simulator employing real half-life decay equations to forecast micro-fragmentation saturation density within beachfront dune profiles.`,
        whyMatch: `Building mathematical sliders is how startups prove scientific models. This is an elite portfolio addition showing complex useMemo calculations, ${n}.`,
        estimatedMinutes: 45,
        sourceUrl: "https://github.com/highschoolline/pollution-sliders",
        complexity: "Integrates exponential chemical degradation formulas, React hooks optimization, dynamic charts rendering, and clean UI state management.",
        imageUrl: ""
      },
      {
        id: "wildlife-map-champion",
        type: "wildlife-map",
        title: "Standardize Oceanographic Nesting Coordinates: Verified Spatial GIS Data Layer",
        target: "google.com/maps/mymaps/gulf-logger",
        impact: "Geospatial GIS Engineering",
        difficulty: "Standardised Spatial Schema",
        summary: `Deconstruct raw environmental coordinate logs, compiling them into a validated, geodetic KML schema layer mapping turtle nesting zones on local beaches.`,
        whyMatch: `Geospatial engineering is critical for logistics startups. Your verified GIS output provides county patrol units with a production-ready spatial guide, ${n}.`,
        estimatedMinutes: 40,
        sourceUrl: "https://google.com/maps/mymaps",
        complexity: "Handles structuring valid KML specifications, lat/long attributes mapping, shoreline polygons definition, and spatial metadata standardisation.",
        imageUrl: ""
      },
      {
        id: "oss-docs-champion",
        type: "oss-doc-pr",
        title: "Standardize Oceanographic Debris Data: Official Database Schema Spec",
        target: "github.com/inaturalist/turtle-db",
        impact: "Global API Infrastructure Schema",
        difficulty: "Production JSON-Schema PR",
        summary: `Design and compile the official JSON-schema specification file defining attributes, data types, and validation constraints for crowd-sourced marine pollution. Resolves gap #482.`,
        whyMatch: `Schema design is standard backend engineering. This PR places a verified, production-level schema and integration guide right inside the iNaturalist registry under your name, ${n}!`,
        estimatedMinutes: 40,
        sourceUrl: "https://github.com/inaturalist/turtle-db/issues/482",
        complexity: "Drafts formal JSON schema properties, type constraints, coordinate format definitions, and backend PR descriptions.",
        imageUrl: ""
      },
      {
        id: "publish-essay-champion",
        type: "publish-essay",
        title: "Deconstruct Thermal Dune Thermodynamics: Rigorous Academic Column",
        target: "ocean-sentinel.substack.com",
        impact: "Academic Thought Leadership",
        difficulty: "Rigorous Scientific Editorial",
        summary: `Write an authoritative, research-backed guest column dissecting how synthetic dune contaminants change thermal conductivity rates, altering embryonic turtle genders.`,
        whyMatch: `Authoritative scientific writing drives sector alignment. This positions you as an expert analyst on local coastal thermodynamics on a leading conservation platform, ${n}.`,
        estimatedMinutes: 40,
        sourceUrl: "https://ocean-sentinel.substack.com/about",
        complexity: "Handles thermodynamic heat transfer principles, physical dune composition statistics, and clear environmental policy suggestions.",
        imageUrl: ""
      },
      {
        id: "teach-skill-champion",
        type: "teach-skill",
        title: "Govern AI UI Layout Spacing: Strict Interface Spacing Audit Specification",
        target: "atlas/design-system",
        impact: "Design System Governance Spec",
        difficulty: "Comprehensive UI/UX Audit Specification",
        summary: `Compile a strict, markdown-formatted design audit spec establishing exact pixel-level touch targets, padding tokens, and interactive guidelines to prevent low-quality UI generation.`,
        whyMatch: `Defining design system constraints is a critical design-engineering governance skill. Your specification establishes automated compliance rules for Atlas, ${n}.`,
        estimatedMinutes: 40,
        sourceUrl: "./DESIGN.md",
        complexity: "Structures strict layout specs, mobile tap target ratios, contrast variables, and automated prompt engineering specifications.",
        imageUrl: ""
      }
    ];
  } else {
    // Hacker Bracket: Ages 15-17 (Balanced, intermediate, creative, and highly technical)
    return [
      {
        id: "eco-campaign-hacker",
        type: "eco-campaign",
        title: "Ban Toxic Dune Contamination: Municipal Sifting Stations Action Proposal",
        target: "hillsborough-county.gov/citizens-portal",
        impact: "Civic Policy Initiative",
        difficulty: "Analytical Advocacy Proposal",
        summary: `Draft an official, highly convincing environmental proposal and public directive directed at the City Council to deploy community sand sifting kits at public beaches.`,
        whyMatch: `To change systems, you must write structured policy proposals. This teaches you how to design a municipal advocacy case that decision-makers cannot ignore, ${n}!`,
        estimatedMinutes: 30,
        sourceUrl: "https://hillsborough-county.gov",
        complexity: "Teaches policy directive formatting, local council target mapping, and physical community action blueprints.",
        imageUrl: ""
      },
      {
        id: "code-widget-hacker",
        type: "code-widget",
        title: "Forecast Dune Toxic Saturation: Dynamic Sand Composition Simulator",
        target: "highschoolline.github.io/pollution-sliders",
        impact: "Dynamic Simulation Interface",
        difficulty: "React Math Component Architecture",
        summary: `Develop an elegant React carbon & plastic degradation calculator allowing users to slide synthetics and watch decay timescales and sand heating ratios in real-time.`,
        whyMatch: `This is startup-level product building, ${n}. It proves you can write responsive React math widgets that convert static scientific data into interactive dashboards.`,
        estimatedMinutes: 35,
        sourceUrl: "https://github.com/highschoolline/pollution-sliders",
        complexity: "Teaches custom React slider math, decay timescales parsing, and responsive state synchronization.",
        imageUrl: ""
      },
      {
        id: "wildlife-map-hacker",
        type: "wildlife-map",
        title: "Optimize Nest Patrol Corridors: Interactive Shoreline GIS Map",
        target: "google.com/maps/mymaps/gulf-logger",
        impact: "Geospatial Watch Overlays",
        difficulty: "GIS Mapping and Coordinates Layer",
        summary: `Compile precise lat/long coordinates of active beach turtle nesting zones, structuring them into a custom, shareable Google Maps layer for volunteer patrollers.`,
        whyMatch: `Optimization of patrols is a real startup logistics problem. This delivers a highly functional GIS coordinate guide that local watchmen can use on mobile, ${n}!`,
        estimatedMinutes: 30,
        sourceUrl: "https://google.com/maps/mymaps",
        complexity: "Teaches GPS coordinates processing, geospatial layers organization, and patroller scheduling maps.",
        imageUrl: ""
      },
      {
        id: "oss-docs-hacker",
        type: "oss-doc-pr",
        title: "Standardize Crowdsourced Dune Logging: Technical API Metadata Schema",
        target: "github.com/inaturalist/turtle-db",
        impact: "Global Data Integration Standard",
        difficulty: "Technical API Schema Markdown",
        summary: `Formulate the exact metadata schemas, coordinate fields, and API ingestion formats to standardise community-submitted beachfront logs. Resolves Issue #482.`,
        whyMatch: `Backend developers love schemas. Your markdown PR establishes the official logging parameters on a high-profile citizen science database, ${n}!`,
        estimatedMinutes: 30,
        sourceUrl: "https://github.com/inaturalist/turtle-db/issues/482",
        complexity: "Teaches API JSON structure definitions, database schema markdown tables, and open-source contribution PR conventions.",
        imageUrl: ""
      },
      {
        id: "publish-essay-hacker",
        type: "publish-essay",
        title: "Expose Sand Thermal Skews: Analytical Guest Editorial on Turtle Genders",
        target: "ocean-sentinel.substack.com",
        impact: "Analytical Media Advocacy",
        difficulty: "Technical Column Draft",
        summary: `Draft an analytical guest column explaining how microplastics change sand thermal properties, skewing natural loggerhead nest temperatures.`,
        whyMatch: `Authoritative writing builds massive thought leadership. This publishes your research on a platform read by hundreds of coastal activists, ${n}.`,
        estimatedMinutes: 30,
        sourceUrl: "https://ocean-sentinel.substack.com/about",
        complexity: "Teaches thermal transfer principles, scientific essay organization, and targeted call-to-action newsletter copywriting.",
        imageUrl: ""
      },
      {
        id: "teach-skill-hacker",
        type: "teach-skill",
        title: "Harden Mobile Target Spacing: Advanced Touch safety Spec",
        target: "atlas/design-system",
        impact: "Design System Guidelines Standard",
        difficulty: "A11y Touch Spacing PR Specification",
        summary: `Write and submit a professional 'Mobile Spacing and Touch Safety Spec' checklist to govern how AI design agents structure layout buttons and touch zones.`,
        whyMatch: `UI accessibility is a premium skill, ${n}. Your spec helps clean up layout bugs across global web widgets.`,
        estimatedMinutes: 30,
        sourceUrl: "./DESIGN.md",
        complexity: "Teaches touch safety a11y criteria, design system tokens specification, and custom markdown template layouts.",
        imageUrl: ""
      }
    ];
  }
}

// Generates the customized list of opportunities with Base64 embedded tailored SVGs
function getTailoredOpportunities(answers: SessionProfile["answers"], prefs?: { focus?: string; vibe?: string; keywords?: string }) {
  let opps = getPrebuiltMockOpportunities(answers);
  
  const focus = prefs?.focus || "";
  const vibe = prefs?.vibe || "";
  const keywords = prefs?.keywords || "";

  // 1. Filter or reorder based on focus preference
  if (focus) {
    const focusLower = focus.toLowerCase();
    if (focusLower.includes("code") || focusLower.includes("widget") || focusLower.includes("tech")) {
      opps = [
        ...opps.filter(o => o.type === "code-widget"),
        ...opps.filter(o => o.type === "teach-skill"),
        ...opps.filter(o => o.type !== "code-widget" && o.type !== "teach-skill")
      ];
    } else if (focusLower.includes("story") || focusLower.includes("map") || focusLower.includes("essay")) {
      opps = [
        ...opps.filter(o => o.type === "wildlife-map"),
        ...opps.filter(o => o.type === "publish-essay"),
        ...opps.filter(o => o.type !== "wildlife-map" && o.type !== "publish-essay")
      ];
    } else if (focusLower.includes("campaign") || focusLower.includes("open-source") || focusLower.includes("docs") || focusLower.includes("petition")) {
      opps = [
        ...opps.filter(o => o.type === "eco-campaign"),
        ...opps.filter(o => o.type === "oss-doc-pr"),
        ...opps.filter(o => o.type !== "eco-campaign" && o.type !== "oss-doc-pr")
      ];
    }
  }

  // 2. Adjust estimatedMinutes and difficulty based on vibe preference
  if (vibe) {
    const vibeLower = vibe.toLowerCase();
    if (vibeLower.includes("quick") || vibeLower.includes("light") || vibeLower.includes("easy") || vibeLower.includes("short")) {
      opps = opps.map(o => ({
        ...o,
        estimatedMinutes: 15,
        difficulty: "Fun & Quick Quest"
      }));
    } else if (vibeLower.includes("deep") || vibeLower.includes("rigorous") || vibeLower.includes("portfolio") || vibeLower.includes("complex") || vibeLower.includes("prestigious")) {
      opps = opps.map(o => ({
        ...o,
        estimatedMinutes: 45,
        difficulty: "Prestigious Project"
      }));
    }
  }

  // 3. Dynamically replace generic placeholders with student custom keywords!
  if (keywords) {
    opps = opps.map(o => {
      let title = o.title;
      let summary = o.summary;
      
      const placeHolders = [
        "Hillsborough County", "Hillsborough", "Atlantic Shore", 
        "Florida shoreline", "Florida", "Gulf Logger", "iNaturalist", "Substack"
      ];
      for (const ph of placeHolders) {
        const regex = new RegExp(ph, "gi");
        title = title.replace(regex, keywords);
        if (summary) summary = summary.replace(regex, keywords);
      }
      
      return {
        ...o,
        title,
        summary
      };
    });
  }

  return opps.map((opp) => {
    const category = opp.type === "wildlife-map" ? "maps" : opp.type === "code-widget" ? "tech" : opp.type === "eco-campaign" ? "campaign" : "science";
    const svg = generatePrebuiltSvg(opp.type, opp.title, category, answers);
    const base64Svg = Buffer.from(svg).toString("base64");
    return {
      ...opp,
      imageUrl: `data:image/svg+xml;base64,${base64Svg}`
    };
  });
}

// 2.5 API: Real-time chat with Antigravity Agent to steer planning
app.post("/api/opportunities/chat", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const client = getGeminiClient();
  const { messages } = req.body;
  const answers = session.answers;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  const studentMessages = messages.filter((m) => m.sender === "student" || m.sender === "user");
  const lastStudentMsg = studentMessages[studentMessages.length - 1]?.text || "";

  if (!client) {
    // Practice Lab Mode - Contextual responses with expert founder/mentor energy
    const textLower = lastStudentMsg.toLowerCase();
    let reply = "";

    if (textLower.includes("code") || textLower.includes("software") || textLower.includes("develop") || textLower.includes("program")) {
      reply = `Love that decision, ${answers.name}! As a mentor, I know that software development is an elite way to build solutions. If we design a high-fidelity coding application or a simulation sandbox, we can let users model variables in real-time. What do you think about targeting '${answers.topic || "environmental issues"}' with this?`;
    } else if (textLower.includes("map") || textLower.includes("coord") || textLower.includes("gis") || textLower.includes("marker") || textLower.includes("geospatial")) {
      reply = `Maps are a stellar choice, ${answers.name}. Visualizing regional geospatial telemetry or creating coordinated maps changes the game. If we compile clean coordinate overlays, we can tell a high-impact story of where ecological issues are happening. What key regions should we map?`;
    } else if (textLower.includes("campaign") || textLower.includes("council") || textLower.includes("letter") || textLower.includes("policy") || textLower.includes("civic")) {
      reply = `Civic campaigning is essentially growth marketing and system lobbying, ${answers.name}. To get a city council to care, you need a highly structured, objective-oriented policy memo or formal proposal outlining immediate municipal actions. Let's draft a professional-grade proposal directed at decision-makers!`;
    } else if (textLower.includes("short") || textLower.includes("easy") || textLower.includes("fast") || textLower.includes("quick") || textLower.includes("min")) {
      reply = `Agreed, ${answers.name}. In the startup world, shipping a minimal viable product (MVP) fast beats over-engineering every time. Let's design a high-leverage, fast-paced quest (15-20 mins) focused on a single critical metric that you can build and deploy this weekend.`;
    } else if (textLower.includes("complex") || textLower.includes("hard") || textLower.includes("deep") || textLower.includes("portfolio") || textLower.includes("prestigious")) {
      reply = `That is the founder mindset right there, ${answers.name}. Let's raise the bar. Instead of toy apps, we'll design a highly rigorous, production-ready schema, API spec, or deep policy document. This will be a prestigious entry in your engineering portfolio that proves you can build at a senior level!`;
    } else {
      reply = `Excellent point, ${answers.name}. I'm recording '${lastStudentMsg}' as a product constraint. Integrating this into our scope is going to give this project real edge and utility. Ready to compile our list of custom-tailored product opportunities?`;
    }

    return res.json({ reply });
  }

  try {
    const chatHistory = messages.map((m) => {
      const role = (m.sender === "student" || m.sender === "user") ? "user" : "model";
      return { role, parts: [{ text: m.text }] };
    });

    const archetypeGuidance: Record<string, string> = {
      coding: "They like building tools and interactive things. Ask what the tool does for a real person — who uses it, what problem it solves, what they see when it works.",
      social: "They like storytelling and connecting people. Ask who their audience is, what they want those people to feel or do, and where they plan to reach them.",
      organizing: "They like planning and coordination. Ask what change they want to make happen, who needs to be involved, and what the first concrete step looks like.",
      tastemaking: "They care about aesthetics and feeling. Ask what emotion or experience they want to create, and what they want someone to feel the moment they see it.",
      investigating: "They like research and finding truth. Ask what question they're trying to answer, where they'd look for evidence, and who needs to hear what they find.",
    };
    const archetypeHint = archetypeGuidance[answers.medium] || "Ask what real change they want to make and who it would help.";

    const systemInstruction = `You are an Atlas mentor — someone who helps teens turn things they care about into real projects with actual impact.

Your student is ${answers.age || 16}-year-old ${answers.name || "Maya"}, passionate about: "${answers.spark || "making their community better"}".
They prefer working through: "${answers.medium || "a mix of approaches"}".

Your goal: help them get specific about what they want to make so we can generate project options that actually fit them.

How to help:
- ${archetypeHint}
- Get concrete: ask about their specific school, neighborhood, community, or target audience — not vague "impact".
- Keep it short: 2-3 sentences max. Validate what they said, then ask one focused question.
- Talk like a thoughtful mentor, not a pitch deck. No jargon. No corporate energy.
- Do NOT suggest specific project ideas yet — your job is to gather what they want, not decide for them.`;

    // Try Antigravity agent first with server-side conversation history
    let reply = "";
    try {
      const agPrompt = `${systemInstruction}\n\nRespond to the student.`;
      const agResult = await antigravityRun(client, agPrompt, {
        previousInteractionId: session.chatInteractionId,
      });
      reply = agResult.text;
      session.chatInteractionId = agResult.id;
      await saveSession(session);
    } catch (agErr) {
      console.log("Antigravity chat fallback to Gemini:", (agErr as Error).message);
      const chat = client.chats.create({
        model: "gemini-3.5-flash",
        history: chatHistory.slice(0, -1),
        config: { systemInstruction }
      });
      const response = await chat.sendMessage({ message: lastStudentMsg });
      reply = response.text || "";
    }

    if (!reply) {
      reply = `That sounds amazing, ${answers.name}! Let's make sure that's exactly what we scout.`;
    }
    return res.json({ reply });
  } catch (error: any) {
    console.error("Chat generation failed:", error);
    return res.json({
      reply: `That is a stellar product direction, ${answers.name || "Maya"}! I'm saving those specifications to customize our adventure list now!`
    });
  }
});

// 3. API: Fast initial planning of 6 opportunities (accepts GET or POST to process chat preferences)
app.all("/api/opportunities/plan", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const client = getGeminiClient();
  const answers = session.answers;

  const focus = (req.body?.focus || req.query?.focus) as string || "";
  const vibe = (req.body?.vibe || req.query?.vibe) as string || "";
  const keywords = (req.body?.keywords || req.query?.keywords) as string || "";
  const chatTranscript = (req.body?.chatTranscript || req.query?.chatTranscript) as string || "";

  if (!client) {
    console.log("No live GEMINI_API_KEY detected. Utilizing customized mock opportunities tailored to answers & chat.");
    await new Promise((resolve) => setTimeout(resolve, 800));
    session.opportunities = getTailoredOpportunities(answers, { focus, vibe, keywords }).map(o => ({ ...o, status: "completed" }));
    await saveSession(session);
    return res.json({ opportunities: session.opportunities, isLiveAI: false });
  }

  try {
    let backgroundStr = "";
    if (answers.solveApproach) backgroundStr += `\n- Problem-Solving Approach: "${answers.solveApproach}"`;
    if (answers.notBoring) backgroundStr += `\n- What they find engaging: "${answers.notBoring}"`;
    if (answers.access) backgroundStr += `\n- Access to tools: "${answers.access}"`;
    if (answers.winFeeling) backgroundStr += `\n- Definition of success/win: "${answers.winFeeling}"`;

    let steeringInstructions = "";
    if (focus) steeringInstructions += `\n- Student Preferred Project Focus: "${focus}"`;
    if (vibe) steeringInstructions += `\n- Student Preferred Vibe/Difficulty: "${vibe}"`;
    if (keywords) steeringInstructions += `\n- Student Custom Keywords/Request: "${keywords}"`;
    if (chatTranscript) {
      steeringInstructions += `\n- Real-Time Steering Chat History (strictly satisfy the student's requests and custom locations/styles from this conversation!): \n"""\n${chatTranscript}\n"""`;
    }

    let ageGuidelines = "";
    const age = answers.age || 16;
    if (age <= 14) {
      ageGuidelines = `
AGE NOTES (13-14 year olds):
- Projects should feel doable in one sitting or one weekend. Small and real beats big and abstract.
- Use plain, encouraging language. No jargon. If they need to Google something, say what.
- Title examples (vary by what they like doing):
  - Builder: "Warn Your School When Air Quality Is Bad: A Simple Color-Code Widget"
  - Writer: "Get Your School to Ban Plastic Bags: A Letter to the Principal"
  - Organizer: "Coordinate a 10-Person Beach Cleanup: A Simple Sign-Up Sheet System"
  - Designer: "Make Kids Care About Recycling: A Comic Strip Campaign"
  - Researcher: "Find Out What's Actually in Your School's Lunch: A 5-Question Survey"
`;
    } else if (age >= 18) {
      ageGuidelines = `
AGE NOTES (18-20 year olds):
- Projects can be more ambitious — longer time horizons, real stakeholders, publishable output.
- These students can handle real research, formal proposals, and tools with actual users.
- Title examples (vary by what they like doing):
  - Builder: "Let Locals Report Illegal Dumping on the Spot: A GPS-Tagged Incident Form"
  - Writer: "Make the Case for a City Composting Program: A Formal Policy Brief"
  - Organizer: "Run a Monthly Environmental Accountability Meeting: A Repeatable Agenda System"
  - Designer: "Rebrand Your City's Recycling Program So People Actually Use It: A Visual Identity Kit"
  - Researcher: "Track Where Your City's Recycled Plastic Actually Goes: A Data Investigation"
`;
    } else {
      ageGuidelines = `
AGE NOTES (15-17 year olds):
- Projects should feel real and specific — something they could share at school or post online.
- These students can handle some research, basic tools, or multi-step plans.
- Title examples (vary by what they like doing):
  - Builder: "Show Your Neighborhood Which Spots Have the Worst Air: An Interactive Map"
  - Writer: "Convince Your School Board to Go Solar: An Evidence-Based Proposal"
  - Organizer: "Build a Student Climate Club That Actually Does Stuff: A 4-Week Launch Plan"
  - Designer: "Make a Zine About Food Waste That People Actually Want to Read"
  - Researcher: "Find Out Why Your Local River Keeps Flooding: A Cause-and-Effect Investigation"
`;
    }

    const mediumLabel: Record<string, string> = {
      coding: "building tools and interactive things",
      social: "storytelling, persuading people, and spreading ideas",
      organizing: "planning, coordinating, and making things actually happen",
      tastemaking: "design, aesthetics, and making things feel right",
      investigating: "researching, asking questions, and finding truth",
    };
    const studentStyle = mediumLabel[answers.medium] || "a mix of approaches";

    const prompt = `
Generate 6 real-world project ideas for ${answers.age || 16}-year-old ${answers.name || "Maya"}.

Who they are:
- What they care about: "${answers.spark || "making things better in their community"}"
- How they like to work: ${studentStyle}
- Topic area: "${answers.topic || "environmental issues"}"${backgroundStr}${steeringInstructions}

${ageGuidelines}

WHAT MAKES A GOOD PROJECT:
Each project must:
1. Solve a specific, real problem — not a made-up scenario
2. Produce something the student can actually share, publish, or use in the real world
3. Match the student's preferred way of working — if they like storytelling, give them writing projects; if they like building, give them tool-building projects
4. Be completable in one focused session (20-45 minutes to make meaningful progress)

Mix it up: include projects across different types. Don't give them all the same kind. Types available:
- code-widget: An interactive tool or calculator that solves a real problem for a real person
- publish-essay: A well-argued article, letter, or report sent somewhere that matters (a school board, local paper, city website)
- eco-campaign: A social media, petition, or community campaign with a clear ask
- oss-doc-pr: Contributing to or improving a real open-source project or public community resource
- wildlife-map: A visual map or data story that shows something people couldn't see before
- teach-skill: A workshop, guide, or lesson that teaches others what they figured out

TITLE FORMAT: "[What problem this solves]: [What they will make]"
- Keep it under 80 characters
- No technology names in the title (not "React app", "Figma file", "Google Sheet")
- Specific enough that the student knows exactly what they're making
- Bad: "Build an Interactive Data Visualization for Environmental Data"
- Good: "Show Which Streets in Your City Have the Most Litter: A One-Page Map"
- Bad: "Develop a Schema for Wildlife Tracking API"
- Good: "Help Bird Watchers Log Their Sightings in One Place: A Simple Shared Tracker"

Write all text — titles, summaries, whyMatch — at an easy reading level. Short sentences. Plain words. A 15-year-old should immediately understand what this project is and why it matters.

For each project, return:
- id: unique string like 'proj-1'
- type: one of the 6 types above
- label: a 2-4 word phrase describing exactly what kind of thing they'll make for THIS project. Specific, not generic. Examples: "Online Petition", "Research Report", "Interactive Quiz", "Photo Campaign", "Community Workshop", "Neighborhood Map", "Op-Ed Article", "Email to Principal", "Social Media Kit", "Action Checklist". Match it to the actual project, not the category.
- title: specific, problem-first title under 80 characters, no tech names
- target: where this project lands in the real world — a specific school, org, community, subreddit, or local government (e.g., "Lincoln High School Student Council", "r/zerowaste community", "Austin City Council environmental committee")
- summary: 2-3 plain sentences. What will they actually make? Who is it for? What changes when it's done?
- whyMatch: 1-2 sentences explaining why this fits THIS student's interests and how they like to work
- estimatedMinutes: integer, 20-45
- impact: the real-world change this creates (e.g., "Your school changes its lunch packaging", "50 people see which local brands pollute", "A community org gets a tool they've been missing")
- difficulty: what's actually hard about this — the human challenge, not the tech (e.g., "Getting people to respond to your survey", "Making dry data feel urgent and shareable", "Convincing skeptical adults")
- complexity: what skills or ways of thinking they'll practice

Return exactly 6 options as a JSON array.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["opportunities"],
          properties: {
            opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "type", "label", "title", "target", "summary", "whyMatch", "estimatedMinutes", "impact", "difficulty", "complexity"],
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  label: { type: Type.STRING },
                  title: { type: Type.STRING },
                  target: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  whyMatch: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  impact: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  complexity: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    if (data.opportunities && Array.isArray(data.opportunities)) {
      session.opportunities = data.opportunities.map((o: any) => ({
        ...o,
        status: "planned"
      }));
    } else {
      session.opportunities = getTailoredOpportunities(answers, { focus, vibe, keywords }).map(o => ({ ...o, status: "completed" }));
    }

    await saveSession(session);
    res.json({ opportunities: session.opportunities, isLiveAI: true });
  } catch (error: any) {
    console.error("Plan generation failed:", error);
    session.opportunities = getTailoredOpportunities(answers, { focus, vibe, keywords }).map(o => ({ ...o, status: "completed" }));
    await saveSession(session);
    res.json({ opportunities: session.opportunities, isLiveAI: false });
  }
});

// 3.5 API: Progressively build a specific opportunity
app.post("/api/opportunities/build", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const { opportunityId } = req.body;
  const client = getGeminiClient();
  const answers = session.answers;

  const oppIndex = session.opportunities.findIndex(o => o.id === opportunityId);
  if (oppIndex === -1) return res.status(404).json({ error: "Not found" });

  const opp = session.opportunities[oppIndex];

  if (opp.status === "completed") {
    return res.json({ opportunity: opp });
  }

  // Mark as building
  session.opportunities[oppIndex].status = "building";

  try {
    let detailAgeGuidelines = "";
    if (answers.age <= 14) {
      detailAgeGuidelines = `
AGE-SPECIFIC DETAIL GUIDELINES (Ages 13-14):
- 'impact': Should use fun, gamified phrases like "Local Nature Hero" or "Family & Friends Science Quest".
- 'difficulty': Use encouraging levels like "Beginner Explorer" or "Fun & Quick Quest".
- 'summary': Maximum 2 simple, highly encouraging, cozy sentences. Focus on the fun of doing it.
- 'whyMatch': Enthusiastically explain why they will love it, mentioning their spark with child-friendly excitement.
- 'complexity': Keep it incredibly simple and accessible, avoiding advanced programming jargon.
- 'estimatedMinutes': Keep it under 20 minutes (e.g. 15 to 20).
`;
    } else if (answers.age >= 18) {
      detailAgeGuidelines = `
AGE-SPECIFIC DETAIL GUIDELINES (Ages 18-20):
- 'impact': Use prestigious, professional terms like "Systemic Civic Advocacy" or "GIS Database Optimization".
- 'difficulty': Use professional terms like "Advanced Schema Integration" or "State-Level Lobbying Directive".
- 'summary': 2 highly technical, dense, and prestigious sentences outlining real-world systemic impacts.
- 'whyMatch': Explain the rigorous matches to their aspirations, showing academic and industry alignment.
- 'complexity': Frame it around professional standards (e.g. data schema verification, legislative drafts, state-management algorithms).
- 'estimatedMinutes': Set it between 30 to 45 minutes to reflect its prestigious depth.
`;
    } else {
      detailAgeGuidelines = `
AGE-SPECIFIC DETAIL GUIDELINES (Ages 15-17):
- 'impact': Balanced educational titles like "Public Outreach" or "Science Tech Lab".
- 'difficulty': Clear educational tiers like "Starter PR" or "Interactive Slide".
- 'summary': 2 clear, inspiring sentences that teach a practical concept.
- 'whyMatch': Connect directly to their specific interests with an encouraging, mentorship-like tone.
- 'complexity': Mention learnable modern web standards (React hooks, REST queries, KML coordinates).
- 'estimatedMinutes': 20 to 30 minutes.
`;
    }

    let data = {};
    let finalImageUrl = "";
    const category = opp.type === "wildlife-map" ? "maps" : opp.type === "code-widget" ? "tech" : opp.type === "eco-campaign" ? "campaign" : "science";

    if (client) {
      try {
        const detailsPrompt = `
Generate the missing details for this specific project opportunity for ${answers.name || "Maya"} (${answers.age || 16}):
Title: "${opp.title}"
Type: "${opp.type}"
Target: "${opp.target}"
User cares about: "${answers.spark || "Marine ecology"}"

${detailAgeGuidelines}

Return JSON:
{
  "impact": "string (e.g. Advocacy, Databases)",
  "difficulty": "string (e.g. Starter PR / Civic Advocacy)",
  "summary": "string (2-sentence description of the task)",
  "whyMatch": "string (Direct address of why it matches them)",
  "estimatedMinutes": number (15 to 45),
  "sourceUrl": "string (simulated target url)",
  "complexity": "string (what skills it teaches or requires)"
}
`;

        const imagePrompt = `A premium, state-of-the-art flat vector-style minimalist illustration representing the project "${opp.title}" (topic: "${answers.topic || "conservation"}").
Styled in the Claude Monet impressionist design system. Incorporate warm golden sands (#fffaec), shifting lavenders and soft golds, and an antique paper texture background.
Use less than 15% foliage emerald green (#10b981) only for subtle accents. Ensure a warm, eye-safe, and luminous color palette with extremely smooth organic shapes and glowing gradients.
Visual element to show: ${category === "maps" ? "an organic compass, path line, or landscape map" : category === "tech" ? "a neat modern computer widget slider or code fragment" : category === "campaign" ? "an open scroll, envelope, or civic signature" : "a cute sea turtle or nature flask detail"}.
Do not include any text in the image. Highly artistic, cozy, premium asset, 4:3 aspect ratio.`;

        console.log(`Generating fresh details and illustration in parallel using Gemini for project: ${opp.title}...`);

        const [detailsResponse, imageResponse] = await Promise.all([
          client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: detailsPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                required: ["impact", "difficulty", "summary", "whyMatch", "estimatedMinutes", "sourceUrl", "complexity"],
                properties: {
                  impact: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  whyMatch: { type: Type.STRING },
                  estimatedMinutes: { type: Type.INTEGER },
                  sourceUrl: { type: Type.STRING },
                  complexity: { type: Type.STRING },
                }
              }
            }
          }).catch(err => {
            console.error("Gemini details generation failed inside parallel block:", err);
            return null;
          }),
          client.models.generateContent({
            model: "gemini-3.1-flash-image-preview",
            contents: [imagePrompt],
            config: {
              responseModalities: ["IMAGE"]
            }
          }).catch(err => {
            console.error("Gemini image generation failed inside parallel block:", err);
            return null;
          })
        ]);

        if (detailsResponse) {
          data = JSON.parse(detailsResponse.text || "{}");
        }

        if (imageResponse) {
          const parts = imageResponse.candidates?.[0]?.content?.parts || (imageResponse as any).parts || [];
          let base64Image: string | null = null;
          let mimeType = "image/png";

          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              base64Image = part.inlineData.data;
              if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
              break;
            }
          }

          if (base64Image) {
            finalImageUrl = `data:${mimeType};base64,${base64Image}`;
            console.log("Nano Banana 2 image generated successfully concurrently!");
          } else {
            console.log("No inline image data found in Nano Banana 2 response. Falling back to prebuilt SVG.");
          }
        }
      } catch (err: any) {
        console.error("Parallel details and illustration generation failed:", err);
      }
    }

    // Fallback details if Gemini details request failed or key is missing
    const defaultData = getPrebuiltMockOpportunities(answers).find(o => o.type === opp.type) || getPrebuiltMockOpportunities(answers)[0];
    data = {
      impact: (data as any).impact || defaultData.impact,
      difficulty: (data as any).difficulty || defaultData.difficulty,
      summary: (data as any).summary || defaultData.summary,
      whyMatch: (data as any).whyMatch || defaultData.whyMatch,
      estimatedMinutes: (data as any).estimatedMinutes || defaultData.estimatedMinutes,
      sourceUrl: (data as any).sourceUrl || defaultData.sourceUrl,
      complexity: (data as any).complexity || defaultData.complexity
    };

    if (!finalImageUrl) {
      console.log("Utilizing prebuilt tailored SVG fallback...");
      const svg = generatePrebuiltSvg(opp.type, opp.title, category, answers);
      finalImageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }

    session.opportunities[oppIndex] = {
      ...opp,
      ...data,
      imageUrl: finalImageUrl,
      status: "completed"
    };

    await saveSession(session);
    res.json({ opportunity: session.opportunities[oppIndex] });
  } catch (error: any) {
    console.error("Build details failed:", error);
    session.opportunities[oppIndex].status = "completed"; // fallback so it doesn't spin forever
    
    // Ensure an image URL exists even on error fallback
    if (!session.opportunities[oppIndex].imageUrl) {
      const category = opp.type === "wildlife-map" ? "maps" : opp.type === "code-widget" ? "tech" : opp.type === "eco-campaign" ? "campaign" : "science";
      const svg = generatePrebuiltSvg(opp.type, opp.title, category, answers);
      session.opportunities[oppIndex].imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    }
    
    await saveSession(session);
    res.json({ opportunity: session.opportunities[oppIndex], error: error.message });
  }
});

// 4. API: Build project steps for active opportunity Selection
app.post("/api/project/select", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const { opportunityId } = req.body;
  const n = session.answers.name || "Maya";
  const age = session.answers.age || 16;
  const grade = session.answers.grade || "Grade 11";

  // If the selected project matches the already active project, return it directly to preserve tutor/chat history
  if (session.activeProject && session.activeProject.id === opportunityId) {
    return res.json({ success: true, project: session.activeProject });
  }
  
  // Find opportunity
  let opportunity = (session.opportunities || []).find((o) => o.id === opportunityId);
  if (!opportunity) {
    // Generate opportunities on the fly if user refreshed
    session.opportunities = getPrebuiltMockOpportunities(session.answers);
    opportunity = session.opportunities.find((o) => o.id === opportunityId);
  }
  
  if (!opportunity) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const client = getGeminiClient();

  // Generate steps and content using Gemini based on the ACTUAL project
  let generatedSteps: any[] = [];

  if (client) {
    try {
      const stepPrompt = `You are helping ${n} (age ${age}) build a real-world project. This is NOT a software project — use plain real-world language. No "toolkit", "folder structure", "git", "sandbox", or tech jargon.

Project: "${opportunity.title}"
Type: "${opportunity.type}"
What they will make: "${opportunity.summary}"
Where it goes: "${opportunity.target}"
What they care about: "${session.answers.spark || "making a positive difference"}"

Generate exactly 5 steps. Return JSON:
{
  "draftContent": "Write 250-400 words of the ACTUAL content for this project (op-ed, letter, FAQ, petition, post — whatever matches the type). Use ${n}'s name naturally. Every sentence must be specific to their cause: '${session.answers.spark}'. No generic filler.",
  "steps": [
    {
      "title": "short real-world action phrase (max 6 words)",
      "description": "one sentence: what they specifically do and why it matters for this exact project",
      "actionType": "init",
      "consoleLogs": ["AI assistant log specific to this project, line 1", "line 2"]
    }
  ]
}

Step actionType order (5 steps):
1. "init" — read the destination site, understand format and audience for THIS project
2. "fetch" — find specific facts, quotes, or contacts needed for THIS project
3. "draft" — write the actual content
4. "diff" — review improvements, compare before/after
5. "publish" — post or submit to destination

Step title rules — be SPECIFIC, not generic:
- NOT "Set up toolkit workspace" → YES "Read 3 op-eds in local papers"
- NOT "Create folder structure" → YES "Find shelter adoption page gaps"
- NOT "Initialize project" → YES "Look up your local council email"

consoleLogs rules:
- 2-4 lines showing an AI doing real research for THIS project
- Example for shelter op-ed init: "Scanning local newspaper opinion section... found 2 recent animal welfare op-eds"
- Publish step: include realistic URL for ${opportunity.target}

Short sentences. Plain words. 15-year-old reading level.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: stepPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["draftContent", "steps"],
            properties: {
              draftContent: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["title", "description", "actionType", "consoleLogs"],
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    actionType: { type: Type.STRING },
                    consoleLogs: { type: Type.ARRAY, items: { type: Type.STRING } },
                  }
                }
              }
            }
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      const draftContent = parsed.draftContent || "";
      const steps = parsed.steps || [];

      generatedSteps = steps.map((step: any, idx: number) => {
        const isLast = idx === steps.length - 1;
        const isDraft = step.actionType === "draft";
        const isDiff = step.actionType === "diff";

        const payload: any = {};
        if (step.consoleLogs?.length) payload.consoleLogs = step.consoleLogs;
        if (isDraft) payload.editorPreview = draftContent;
        if (isDiff) {
          payload.diffHeader = `diff --git a/${opportunity.target} b/${opportunity.target}`;
          payload.diffBefore = `# ${opportunity.title}\n\n(empty — content not yet written)`;
          payload.diffAfter = draftContent;
        }
        if (isLast) {
          const slug = opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
          payload.destUrl = `https://${opportunity.target}/${slug}`;
        }

        return {
          title: step.title,
          description: step.description,
          status: "pending",
          actionType: step.actionType,
          payload,
        };
      });
    } catch (err) {
      console.error("Step generation failed, using fallback:", err);
    }
  }

  // Fallback if Gemini unavailable or failed
  if (generatedSteps.length === 0) {
    const slug = opportunity.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    generatedSteps = [
      {
        title: "Research the target",
        description: `Look at ${opportunity.target} and understand what's missing or needs improvement.`,
        status: "pending",
        actionType: "init",
        payload: { consoleLogs: [`Scanning ${opportunity.target}...`, `Found areas to improve.`] }
      },
      {
        title: "Gather facts and outline",
        description: `Collect the key information and structure for "${opportunity.title}".`,
        status: "pending",
        actionType: "fetch",
        payload: { consoleLogs: [`Gathering relevant information...`, `Outline ready.`] }
      },
      {
        title: "Write the content",
        description: `Draft the actual ${opportunity.label || "project"} content for ${opportunity.target}.`,
        status: "pending",
        actionType: "draft",
        payload: {
          consoleLogs: [`Drafting content...`, `Draft ready for review.`],
          editorPreview: `# ${opportunity.title}\n\nBy ${n}\n\n${opportunity.summary}\n\nTarget: ${opportunity.target}`
        }
      },
      {
        title: "Review changes",
        description: "Compare the before and after to make sure everything looks right.",
        status: "pending",
        actionType: "diff",
        payload: {
          diffHeader: `diff --git a/${opportunity.target} b/${opportunity.target}`,
          diffBefore: `(empty — not yet written)`,
          diffAfter: `# ${opportunity.title}\n\nBy ${n}\n\n${opportunity.summary}`
        }
      },
      {
        title: "Publish and share",
        description: `Send the finished ${opportunity.label || "project"} to ${opportunity.target}.`,
        status: "pending",
        actionType: "publish",
        payload: {
          consoleLogs: [`Submitting to ${opportunity.target}...`, `Published successfully.`],
          destUrl: `https://${opportunity.target}/${slug}`
        }
      }
    ];
  }

  session.activeProject = {
    id: opportunityId,
    stepIndex: 0,
    steps: generatedSteps,
  };

  // Pre-set the first step as active or completed and enrich steps with Agile metadata
  session.activeProject!.steps = session.activeProject!.steps.map((step, idx) => ({
    id: `${opportunityId}-step-${idx}`,
    priority: idx === 0 ? "high" : idx === session.activeProject!.steps.length - 1 ? "medium" : "low",
    notes: "",
    tutorMessages: [],
    custom: false,
    ...step,
  }));
  session.activeProject!.steps[0].status = "pending";
  session.activeProject!.started = false;

  await saveSession(session);
  res.json({ success: true, project: session.activeProject });
});

// API: Deselect/Clear active opportunity/project
app.post("/api/project/deselect", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  session.activeProject = null;
  await saveSession(session);
  res.json({ success: true });
});

// Helper: Update selected project steps interactively
app.post("/api/project/update-steps", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const { steps } = req.body;
  if (session && session.activeProject && Array.isArray(steps)) {
    const previousActiveTaskId = session.activeProject.steps[session.activeProject.stepIndex]?.id;
    session.activeProject.steps = mergeIncomingSteps(session.activeProject.steps, steps);
    preserveCurrentStep(session.activeProject, previousActiveTaskId);
    session.activeProject.started = true;
    await saveSession(session);
    res.json({ success: true, project: session.activeProject });
  } else {
    res.status(404).json({ error: "Active project not found" });
  }
});

// Helper: Add one custom task without replacing the full task list
app.post("/api/project/add-task", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  if (!session || !session.activeProject) {
    return res.status(404).json({ error: "Active project not found" });
  }

  const { task } = req.body;
  if (!task || typeof task !== "object" || typeof task.title !== "string") {
    return res.status(400).json({ error: "Valid task payload is required" });
  }

  const newTask: ProjectStepData = {
    id: typeof task.id === "string" ? task.id : `custom-task-${Math.random().toString(36).substring(2, 7)}`,
    title: task.title.trim(),
    description: typeof task.description === "string" && task.description.trim()
      ? task.description.trim()
      : "User defined custom task on Agile sprint board.",
    status: "pending",
    actionType: "draft",
    custom: true,
    priority: ["low", "medium", "high"].includes(task.priority) ? task.priority : "medium",
    notes: typeof task.notes === "string" ? task.notes : "",
    tutorMessages: [],
  };

  session.activeProject.steps.push(newTask);
  session.activeProject.started = true;

  await saveSession(session);
  res.json({ success: true, project: session.activeProject, task: newTask });
});

// Helper: Patch one task without replacing tutor chat or unrelated fields
app.post("/api/project/update-task", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  if (!session || !session.activeProject) {
    return res.status(404).json({ error: "Active project not found" });
  }

  const { taskId, updates } = req.body;
  if (!taskId || !updates || typeof updates !== "object") {
    return res.status(400).json({ error: "taskId and updates are required" });
  }

  const idx = session.activeProject.steps.findIndex((step) => step.id === taskId);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const allowed: Partial<ProjectStepData> = {};
  if (typeof updates.title === "string") allowed.title = updates.title;
  if (typeof updates.description === "string") allowed.description = updates.description;
  if (typeof updates.notes === "string") allowed.notes = updates.notes;
  if (["low", "medium", "high"].includes(updates.priority)) allowed.priority = updates.priority;
  if (["pending", "running", "approved", "completed"].includes(updates.status)) allowed.status = updates.status;

  session.activeProject.steps[idx] = {
    ...session.activeProject.steps[idx],
    ...allowed,
    tutorMessages: session.activeProject.steps[idx].tutorMessages ?? [],
  };
  session.activeProject.started = true;

  await saveSession(session);
  res.json({ success: true, project: session.activeProject, task: session.activeProject.steps[idx] });
});

// Helper: Delete a custom task explicitly instead of inferring deletes from stale arrays
app.post("/api/project/delete-task", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  if (!session || !session.activeProject) {
    return res.status(404).json({ error: "Active project not found" });
  }

  const { taskId } = req.body;
  if (!taskId) {
    return res.status(400).json({ error: "taskId is required" });
  }

  const task = session.activeProject.steps.find((step) => step.id === taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (!task.custom) {
    return res.status(400).json({ error: "Only custom tasks can be deleted" });
  }

  const previousActiveTaskId = session.activeProject.steps[session.activeProject.stepIndex]?.id;
  const deletedIndex = session.activeProject.steps.findIndex((step) => step.id === taskId);
  session.activeProject.steps = session.activeProject.steps.filter((step) => step.id !== taskId);
  if (previousActiveTaskId === taskId) {
    session.activeProject.stepIndex = Math.min(deletedIndex, Math.max(0, session.activeProject.steps.length - 1));
  } else {
    preserveCurrentStep(session.activeProject, previousActiveTaskId);
  }
  session.activeProject.started = true;

  await saveSession(session);
  res.json({ success: true, project: session.activeProject });
});

// 4.4 API: Task-specific AI Tutor chat, persisted on the server copy of the task
app.post("/api/project/task-tutor", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] as string || "session-maya";
    const session = await getSession(sessionId);
    if (!session || !session.activeProject) {
      return res.status(400).json({ error: "No active project found" });
    }

    const { taskId, message } = req.body;
    const cleanMessage = typeof message === "string" ? message.trim() : "";
    if (!taskId || !cleanMessage) {
      return res.status(400).json({ error: "taskId and message are required" });
    }

    const project = session.activeProject;
    const taskIndex = project.steps.findIndex((step) => step.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = project.steps[taskIndex];
    const opportunity = (session.opportunities || []).find(o => o.id === project.id) || {
      title: "Custom Project",
      summary: "",
      whyMatch: "",
    };
    const currentMessages = task.tutorMessages ?? [];
    const studentMessage = { sender: "student" as const, text: cleanMessage };
    const client = getGeminiClient();
    let finalReply = "";

    if (!client) {
      finalReply = makePracticeTutorReply(cleanMessage, task, session, opportunity);
      res.json({ reply: finalReply, project: session.activeProject, task: task });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
      const recentHistory = currentMessages.slice(-10).map((msg) => {
        const role = msg.sender === "student" ? "user" : "model";
        return { role, parts: [{ text: msg.text }] };
      });

      const systemInstruction = `You are the Atlas Personal AI Tutor for exactly one Kanban task.
You are tutoring ${session.answers.name || "the student"} (age ${session.answers.age || 16}, ${session.answers.grade || "student"}).
Student spark/interest: "${session.answers.spark || ""}".
Adventure title: "${opportunity.title}".
Adventure description: "${opportunity.summary || opportunity.whyMatch || ""}".

Specific task:
- Title: "${task.title}"
- Description: "${task.description}"
- Status: "${task.status}"
- Action type: "${task.actionType}"
- Custom task: ${task.custom ? "yes" : "no"}
- Priority: "${task.priority || "medium"}"
- Diary notes: "${task.notes || ""}"

Your job:
- Stay scoped to this one task.
- Help the student brainstorm, understand code/diffs, draft outlines, pick the next step, or reflect.
- Be warm, direct, and practical.
- Use short bullets or starter code only when useful.
- Keep the response under 160 words.`;

      // Try Antigravity agent first with per-task conversation history
      try {
        const agPrompt = `${systemInstruction}\n\nStudent asks: ${cleanMessage}\n\nProvide a helpful, practical response.`;
        const agResult = await antigravityRun(client, agPrompt, {
          previousInteractionId: task.tutorInteractionId,
        });
        finalReply = agResult.text;
        res.write(`data: ${JSON.stringify({ type: "chunk", text: finalReply })}\n\n`);
        task.tutorInteractionId = agResult.id;
      } catch (agErr) {
        console.log("Antigravity tutor fallback to Gemini:", (agErr as Error).message);
        const responseStream = await client.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: [
            ...recentHistory,
            { role: "user", parts: [{ text: cleanMessage }] }
          ],
          config: { systemInstruction }
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            finalReply += chunk.text;
            res.write(`data: ${JSON.stringify({ type: "chunk", text: chunk.text })}\n\n`);
          }
        }
      }
    } catch (error) {
      console.error("Task tutor stream failed; using practice reply.", error);
      if (!finalReply) {
        finalReply = makePracticeTutorReply(cleanMessage, task, session, opportunity);
        res.write(`data: ${JSON.stringify({ type: "chunk", text: finalReply })}\n\n`);
      }
    }

    const agentMessage = { sender: "agent" as const, text: finalReply.trim() };
    session.activeProject.steps[taskIndex] = {
      ...task,
      tutorMessages: [...(task.tutorMessages ?? []), studentMessage, agentMessage],
    };
    session.activeProject.started = true;
    await saveSession(session);

    res.write(`data: ${JSON.stringify({ type: "done", project: session.activeProject, task: session.activeProject.steps[taskIndex] })}\n\n`);
    res.end();

  } catch (err: any) {
    console.error("Unexpected task-tutor error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Tutor had a problem. Please try again!" });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Tutor had a problem." })}\n\n`);
      res.end();
    }
  }
});

// 4.5 API: Chat-to-Edit with AI Co-Founder to mutate planning & reflect
app.post("/api/project/chat-to-edit", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  if (!session || !session.activeProject) {
    return res.status(400).json({ error: "No active project found" });
  }

  const { message, messages } = req.body;
  const project = session.activeProject;
  const opportunity = (session.opportunities || []).find(o => o.id === project.id) || { title: "Custom Project", spark: session.answers.spark };
  const client = getGeminiClient();

  if (!client) {
    // Practice Lab Mode Fallback
    const textLower = (message || "").toLowerCase();
    let reply = "";
    let updatedSteps = [...project.steps];

    if (/\b(replace|rewrite|update|change|fix|swap|redo)\b/.test(textLower) && /\b(burn|burning|trash|waste|leaf|leaves|air|neighbor|neighbour|community|toolkit|poster|reporting|respectful)\b/.test(textLower)) {
      updatedSteps = [
        {
          id: `${project.id}-step-health-facts`,
          title: "Gather local burn rules and health facts",
          description: "Collect plain-language facts about smoke, asthma risk, local rules, and who residents can contact for official guidance.",
          status: "pending" as const,
          actionType: "fetch" as const,
          custom: true,
          priority: "high" as const,
          notes: "",
          tutorMessages: []
        },
        {
          id: `${project.id}-step-neighbor-message`,
          title: "Write respectful neighbor messaging",
          description: "Draft short posts and door-hanger copy that explains the problem without blaming people and points to safer alternatives.",
          status: "pending" as const,
          actionType: "draft" as const,
          custom: true,
          priority: "high" as const,
          notes: "",
          tutorMessages: []
        },
        {
          id: `${project.id}-step-graphics`,
          title: "Design ready-to-share graphics",
          description: "Create clean visuals for social posts, flyers, or a printable one-page toolkit about stopping leaf and trash burning.",
          status: "pending" as const,
          actionType: "draft" as const,
          custom: true,
          priority: "medium" as const,
          notes: "",
          tutorMessages: []
        },
        {
          id: `${project.id}-step-alternatives-reporting`,
          title: "Add alternatives and reporting instructions",
          description: "List composting, yard-waste pickup, drop-off options, and clear steps for reporting illegal burning to the correct city office.",
          status: "pending" as const,
          actionType: "draft" as const,
          custom: true,
          priority: "medium" as const,
          notes: "",
          tutorMessages: []
        },
        {
          id: `${project.id}-step-package`,
          title: "Review and package the toolkit",
          description: "Check the tone, facts, and visual clarity, then bundle the final posts and graphics into a shareable project folder.",
          status: "pending" as const,
          actionType: "diff" as const,
          custom: true,
          priority: "medium" as const,
          notes: "",
          tutorMessages: []
        }
      ];
      reply = "I replaced the plan with a focused community clean-air toolkit path. Review the new steps, deselect anything you do not want, then start when it matches your project.";
    } else if (/\b(add|create|insert)\b.*\b(task|milestone|card|step)\b|\b(add|create|insert) (task|step)\b/.test(textLower)) {
      const title = textLower.includes("interview") ? "Interview local dune volunteers" : textLower.includes("logo") ? "Sketch logo and branding notes" : "Draft social media announcement";
      const newStep = {
        id: `custom-step-${Math.random().toString(36).substring(2, 7)}`,
        title,
        description: "Custom milestone created based on your chat with the AI Co-Founder.",
        status: "pending" as const,
        actionType: "draft" as const,
        custom: true,
        priority: "medium" as const,
        notes: "",
        tutorMessages: []
      };
      updatedSteps.push(newStep);
      reply = `I've successfully added a new custom task to your backlog: **"${title}"**! It's currently in your **To Do** list. You can add your own diary notes or drag it around. What do you want to tackle next? 🚀`;
    } else if (textLower.includes("reflect") || textLower.includes("review") || textLower.includes("notes") || textLower.includes("think") || textLower.includes("done")) {
      const completedCount = project.steps.filter(s => s.status === "completed").length;
      const notesWithContent = project.steps.filter(s => s.notes && s.notes.trim().length > 0);
      
      if (completedCount === 0) {
        reply = `You're at the starting block, ${session.answers.name}! 🌟 That's perfectly fine—every great launch starts with a single step. Let's run Step 1 to get our momentum going!`;
      } else {
        const notesSummary = notesWithContent.map(s => `- *"${s.title}" notes: ${s.notes}*`).join("\n");
        reply = `Reflecting on your incredible progress, ${session.answers.name}! You have completed **${completedCount} milestone(s)** on your board. 🏆\n\n${notesWithContent.length > 0 ? `Here are your project diary reflections so far:\n${notesSummary}\n\nYour focus is truly stellar.` : "Your execution is great. Try writing down some notes inside your task cards so we can build a proper development journal together!"} Let's keep pushing towards the finish line!`;
      }
    } else if (textLower.includes("priority") || textLower.includes("make high priority") || textLower.includes("mark urgent")) {
      const idx = project.steps.findIndex(s => s.status === "pending" || s.status === "running");
      if (idx !== -1) {
        updatedSteps[idx].priority = "high";
        reply = `Understood! I've elevated the priority of **"${project.steps[idx].title}"** to **High 🔴** to keep our attention focused on it. Let's make it real!`;
      } else {
        reply = `I searched for a pending task to update, but all tasks are already completed! Outstanding speed! 🌟`;
      }
    } else {
      reply = makePracticeCoFounderReply(message, session, project, opportunity);
    }

    const stepsChanged = JSON.stringify(project.steps) !== JSON.stringify(updatedSteps);
    if (stepsChanged) project.steps = updatedSteps;
    project.coFounderMessages = [...(messages || []), { sender: "agent", text: reply }];
    await saveSession(session);
    return res.json({ reply, updated: stepsChanged, ...(stepsChanged ? { project } : {}) });
  }

  // Live Gemini mode
  try {
    const studentName = session.answers.name || "Maya";
    const studentAge = session.answers.age || 16;
    const notesWithContent = project.steps.filter(s => s.notes && s.notes.trim().length > 0);
    const notesSummaryText = notesWithContent.map(s => `- [Task: ${s.title}] Notes: "${s.notes}"`).join("\n");
    const completedCount = project.steps.filter(s => s.status === "completed").length;

    const systemInstruction = `You are a sharp, friendly co-founder helping ${studentName} (age ${studentAge}) build "${opportunity.title}".
Their focus: "${session.answers.spark}".

Completed steps: ${completedCount}. Notes: ${notesSummaryText || "none yet"}.
Steps: ${JSON.stringify(project.steps)}

VOICE RULES — follow these strictly:
- Write like a real person texting a smart friend. Short sentences. Conversational.
- Max 2-3 sentences per reply. Never use bullet points or bold for regular chat.
- No filler phrases: no "Great question!", no "Absolutely!", no "Of course!", no emojis unless truly needed.
- If they ask something practical, give one clear answer then offer ONE small next step.
- Never give a wall of text. If the answer needs more than 3 sentences, split it across 2 short paragraphs with a blank line between them.
- Sound like you know their project specifically — use the project title and their cause naturally.

ACTIONS:
- Default: just chat.
- Only update steps if student explicitly asks to add/edit/remove/reorder tasks. New tasks: custom=true, status="pending", actionType="draft", id="custom-"+5chars, priority="medium".

If you want to update the steps, you MUST output your conversational reply first. Then, AT THE VERY END of your message, output a JSON block wrapped in \`\`\`json ... \`\`\` with a single key "updatedSteps" containing the new array. Do NOT output JSON if you are just chatting.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Try Antigravity agent first for plan mutation with real research
    let reply = "";
    let data: any = {};
    let usedAntigravity = false;
    try {
      const agPrompt = `${systemInstruction}\n\n${messages.map(m => `${m.sender === "student" ? "Student" : "Co-Founder"}: ${m.text}`).join("\n")}\n\nStudent says: "${message}"\n\nRespond.`;
      const agResult = await antigravityRun(client, agPrompt, {
        previousInteractionId: project.coFounderInteractionId,
      });
      const fullText = agResult.text;
      usedAntigravity = true;
      project.coFounderInteractionId = agResult.id;

      // Parse JSON block if present
      const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          data = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error("Failed to parse JSON from Antigravity Co-Founder", e);
        }
      }
      // Remove JSON block from reply
      reply = fullText.replace(/```json\s*\{[\s\S]*?\}\s*```/, "").trim();
      if (!reply) reply = "Awesome work! Let's keep building.";

      // Stream to client (single chunk since Antigravity is non-streaming)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
      res.write(`data: ${JSON.stringify({ type: "chunk", text: reply })}\n\n`);
    } catch (agErr) {
      console.log("Antigravity co-founder fallback to Gemini:", (agErr as Error).message);

      // Fallback to Gemini streaming
      const chatHistory = (messages || []).slice(-8).map((m: any) => {
        const role = (m.sender === "student" || m.sender === "user") ? "user" : "model";
        return { role, parts: [{ text: m.text }] };
      });

      const responseStream = await client.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: [
          ...chatHistory,
          { role: "user", parts: [{ text: `The student says: "${message}"` }] }
        ],
        config: { systemInstruction }
      });

      let fullText = "";
      let streamedText = "";
      let isJsonBlockStarted = false;

      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullText += chunk.text;
          if (!isJsonBlockStarted && fullText.includes("```json")) {
            isJsonBlockStarted = true;
            const beforeJson = fullText.split("```json")[0];
            const newToStream = beforeJson.substring(streamedText.length);
            if (newToStream) {
              streamedText += newToStream;
              res.write(`data: ${JSON.stringify({ type: "chunk", text: newToStream })}\n\n`);
            }
          } else if (!isJsonBlockStarted) {
            const newToStream = chunk.text;
            streamedText += newToStream;
            res.write(`data: ${JSON.stringify({ type: "chunk", text: newToStream })}\n\n`);
          }
        }
      }

      reply = streamedText.trim();

      if (isJsonBlockStarted) {
        const jsonMatch = fullText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            data = JSON.parse(jsonMatch[1]);
          } catch (e) {
            console.error("Failed to parse JSON block from Co-Founder", e);
          }
        }
      }
      if (!reply) reply = "Awesome work! Let's keep building.";
    }

    let stepsChanged = false;
    if (data.updatedSteps && Array.isArray(data.updatedSteps)) {
      const previousActiveTaskId = project.steps[project.stepIndex]?.id;
      const mergedSteps = mergeIncomingSteps(project.steps, data.updatedSteps);
      if (JSON.stringify(mergedSteps) !== JSON.stringify(project.steps)) {
        project.steps = mergedSteps;
        preserveCurrentStep(project, previousActiveTaskId);
        stepsChanged = true;
      }
    }

    project.coFounderMessages = [...(messages || []), { sender: "agent", text: reply }];
    await saveSession(session);

    res.write(`data: ${JSON.stringify({ type: "done", reply, updated: stepsChanged, ...(stepsChanged ? { project } : {}) })}\n\n`);
    res.end();

  } catch (error: any) {
    console.error("Chat to Edit endpoint failed; using practice reply.", error);
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();
    }
    const reply = makePracticeCoFounderReply(message, session, project, opportunity);
    project.coFounderMessages = [...(messages || []), { sender: "agent", text: reply }];
    await saveSession(session);
    res.write(`data: ${JSON.stringify({ type: "chunk", text: reply })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done", project, reply, fallback: true })}\n\n`);
    res.end();
  }
});

// 5. API: Execute Step after approval
app.post("/api/project/approve-step", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  if (!session.activeProject) {
    return res.status(400).json({ error: "No active project" });
  }

  const project = session.activeProject;
  const currentIndex = project.stepIndex;

  if (currentIndex >= project.steps.length) {
    return res.status(400).json({ error: "All steps already completed" });
  }

  // Transition current step to completed
  project.steps[currentIndex].status = "completed";

  // If there's a next step, transition its status to running/pending-action
  if (currentIndex + 1 < project.steps.length) {
    project.stepIndex = currentIndex + 1;
    project.steps[project.stepIndex].status = "pending";
  } else {
    // If we've finished all steps, keep the index at the last one
    project.stepIndex = project.steps.length; // signifies fully completed project
    
    // Mark corresponding opportunity as completed
    const oppIndex = (session.opportunities || []).findIndex((o) => o.id === project.id);
    if (oppIndex !== -1) {
      session.opportunities[oppIndex].status = "completed";
    }
  }

  await saveSession(session);
  res.json({ success: true, project });
});

// 4.6 API: Reflection — AI-powered archetype analysis with full project context
app.post("/api/project/reflect", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const client = getGeminiClient();

  if (!session || !session.activeProject) {
    return res.status(400).json({ error: "No active project found" });
  }

  const { q1, q2, q3 } = req.body;
  const project = session.activeProject;
  const opportunity = (session.opportunities || []).find(o => o.id === project.id) || { title: "Custom Project" };

  const completedSteps = project.steps.filter(s => s.status === "completed");
  const notesWithContent = project.steps.filter(s => s.notes && s.notes.trim().length > 0);
  const notesSummary = notesWithContent.map(s => `- ${s.title}: ${s.notes}`).join("\n");

  const archetypeMap: Record<string, string> = {
    builder: "building tools and interactive things",
    talker: "storytelling, persuading people, and spreading ideas",
    organizer: "planning, coordinating, and making things actually happen",
    tastemaker: "design, aesthetics, and making things feel right",
    investigator: "researching, asking questions, and finding truth",
  };

  const chosenArchetype = archetypeMap[q1] || "a mix of approaches";
  const nextDirection = q3 === "deeper" ? "go deeper into this same topic" : q3 === "different" ? "try a different kind of project on the same cause" : "explore a completely new cause";

  const reflectionPrompt = `
You are the Atlas Reflection Analyst. You've watched ${session.answers.name || "this student"} complete their entire project journey.

PROJECT CONTEXT:
- Title: "${opportunity.title}"
- Description: ${opportunity.summary || opportunity.whyMatch || ""}
- What they care about: "${session.answers.spark || ""}"
- How they said they like to work: "${session.answers.medium || ""}"

WHAT THEY ACTUALLY DID (from project diary):
${notesSummary || "They completed the project but didn't write detailed diary notes."}

Completed steps: ${completedSteps.length}/${project.steps.length}
Step titles completed: ${completedSteps.map(s => s.title).join(", ")}

THEIR REFLECTION ANSWERS:
- What felt most natural: "${chosenArchetype}" (archetype: ${q1})
- Surprise observation: "${q2 || "(no answer given)"}"
- Where they want to go next: "${nextDirection}"

YOUR JOB:
Write a warm, personal reflection that:
1. Acknowledges what they actually accomplished (reference specific steps/notes)
2. Connects their chosen archetype to their real project behavior
3. Addresses their surprise observation if they gave one
4. Suggests one specific next move based on their "where next" choice
5. Keeps it under 200 words. No bullet points. Sound like a thoughtful mentor texting.
6. If they chose "deeper", suggest how to build on this project. If "different", suggest a new format for the same cause. If "new", suggest a related cause area.

Do NOT use generic phrases like "Great job!" or "You did amazing!". Be specific about what they made.`;

  let analysis = "";

  if (!client) {
    analysis = `You completed ${completedSteps.length} steps on "${opportunity.title}". You said ${chosenArchetype} felt most natural${q2 ? `, and noticed: "${q2}"` : ""}. For your next move: ${nextDirection}.`;
    return res.json({ analysis });
  }

  try {
    const agResult = await antigravityRun(client, reflectionPrompt, {
      previousInteractionId: session.reflectionInteractionId,
    });
    analysis = agResult.text;
    session.reflectionInteractionId = agResult.id;
    await saveSession(session);
  } catch (agErr) {
    console.log("Antigravity reflection fallback:", (agErr as Error).message);
    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: reflectionPrompt,
      });
      analysis = response.text || "";
    } catch (geminiErr) {
      analysis = `You completed ${completedSteps.length} steps on "${opportunity.title}". You said ${chosenArchetype} felt most natural${q2 ? `, and noticed: "${q2}"` : ""}. For your next move: ${nextDirection}.`;
    }
  }

  res.json({ analysis });
});

// Vite server setup logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

