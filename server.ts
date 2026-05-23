import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

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
    steps: {
      title: string;
      description: string;
      status: "pending" | "running" | "approved" | "completed";
      actionType: "init" | "fetch" | "draft" | "diff" | "publish";
      payload?: {
        consoleLogs?: string[];
        diffHeader?: string;
        diffBefore?: string;
        diffAfter?: string;
        editorPreview?: string;
        destUrl?: string;
      };
    }[];
  } | null;
}

let activeSession: SessionProfile = {
  id: "session-maya",
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

// 1. API: Load Active Sandbox Session Profile
app.get("/api/session", (req, res) => {
  res.json({
    session: activeSession,
    hasLiveKey: !!getGeminiClient()
  });
});

// 2. API: Save Interview Answers and Reset Active Project State
app.post("/api/session/answers", (req, res) => {
  const { name, age, grade, spark, medium, topic, freeTime, solveApproach, notBoring, access, winFeeling } = req.body;
  
  activeSession.answers = {
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
  activeSession.opportunities = [];
  activeSession.activeProject = null;
  
  res.json({ success: true, session: activeSession });
});

// Helper for default premium mock opportunities matching standard prompt when API key is missing
function getPrebuiltMockOpportunities(answers: typeof activeSession.answers) {
  const n = answers.name || "Maya";
  const t = answers.topic || "marine ecology";
  const m = answers.medium || "writing";
  
  return [
    {
      id: "eco-campaign-1",
      type: "eco-campaign",
      title: `Coastal Council Cleanup Initiative Directive`,
      target: "hillsborough-county.gov/citizens-portal",
      impact: "Public Advocacy & Lobbying",
      difficulty: "Advocacy Action",
      summary: `Draft an official, highly convincing public letter and action guide directed at the City Environmental Council to seed community microplastic sieve kits at public parks.`,
      whyMatch: `Combines ${n}'s irritation with plastics in dunes with standard writing models to demand high-impact civic action from local councils.`,
      estimatedMinutes: 20,
      sourceUrl: "https://hillsborough-county.gov",
      complexity: "Generates custom public-record letter and lists targeted environmental counselors.",
      imageUrl: "https://picsum.photos/seed/campaign/400/300"
    },
    {
      id: "code-widget-1",
      type: "code-widget",
      title: `Decomposition Tracker Interactive Widget`,
      target: "highschoolline.github.io/pollution-sliders",
      impact: "Science Education Tech",
      difficulty: "Interactive Slide Deck",
      summary: `Develop an elegant React carbon & plastic degradation calculator allowing students to slide plastics and map decomposition outcomes in real soil.`,
      whyMatch: `Excellent opportunity for ${n} to create a shippable web calculator showing exact decades required for synthetic bags and cups to biodegrade.`,
      estimatedMinutes: 30,
      sourceUrl: "https://github.com/highschoolline/pollution-sliders",
      complexity: "Includes actual slider formula, customizable thresholds, and CSS meters.",
      imageUrl: "https://picsum.photos/seed/calculator/400/300"
    },
    {
      id: "wildlife-map-1",
      type: "wildlife-map",
      title: `Gulf Turtle Migrations Custom Layer Protocol`,
      target: "google.com/maps/mymaps/gulf-logger",
      impact: "Conservation Mapping",
      difficulty: "GIS data marker",
      summary: `Assemble a catalog of exact geo-coordinates detailing turtle nesting sites along the Florida shoreline to construct a shareable Google Maps ecosystem layer.`,
      whyMatch: `Matches your passion for marine turtle lifespans by creating visual map marker formats that volunteer beach loggers can load on mobile.`,
      estimatedMinutes: 25,
      sourceUrl: "https://google.com/maps/mymaps",
      complexity: "Generates KML coordinate tables and standard description overlays.",
      imageUrl: "https://picsum.photos/seed/maps/400/300"
    },
    {
      id: "oss-docs-1",
      type: "oss-doc-pr",
      title: `iNaturalist Turtle-DB Documentation Gap`,
      target: "github.com/inaturalist/turtle-db",
      impact: "Conservation Databases",
      difficulty: "Starter PR",
      summary: `Write the standard metadata descriptors and geo-tracking guides for the upcoming marine plastic logger. Resolves Missing Docs gap #482.`,
      whyMatch: `Puts ${n}'s input right inside iNaturalist's code registry. Gets you a real GitHub contribution mark on high-profile biodiversity databases.`,
      estimatedMinutes: 20,
      sourceUrl: "https://github.com/inaturalist/turtle-db/issues/482",
      complexity: "No advanced programming required. Focuses on writing concise markdown definitions and tables.",
      imageUrl: "https://picsum.photos/seed/turtledocs/400/300"
    },
    {
      id: "publish-essay-2",
      type: "publish-essay",
      title: `The Ocean Sentinel-Substack Guest Draft`,
      target: "ocean-sentinel.substack.com",
      impact: "Public Outreach",
      difficulty: "Public Column",
      summary: `Draft an editorial response focusing on the exact impact of coastal microplastics on marine sea turtle nesting temperatures.`,
      whyMatch: `Puts ${n}'s voice on an active email newsletter platform read by hundreds of local activists and oceanographers.`,
      estimatedMinutes: 25,
      sourceUrl: "https://ocean-sentinel.substack.com/about",
      complexity: "Interactive drafting helper guides structure and drafts captivating 200-word call-to-actions.",
      imageUrl: "https://picsum.photos/seed/coastalblog/400/300"
    },
    {
      id: "teach-skill-1",
      type: "teach-skill",
      title: "Teach Skill: Impeccable Mobile Touch Targets Directive",
      target: "github.com/pbakaus/impeccable/issues/12",
      impact: "AI Design Alignment",
      difficulty: "Skill Design PR",
      summary: `Write and submit a professional "Mobile Touch Safety Guide" addendum in impeccable design markdown to help AI agents build beautifully-spaced buttons and layouts.`,
      whyMatch: `An excellent opportunity for you to write an official design instruction guide for a leading open-source project, preventing low-quality "AI slop" widgets worldwide.`,
      estimatedMinutes: 20,
      sourceUrl: "https://github.com/pbakaus/impeccable",
      complexity: "Constructs custom system prompt rules and clean Tailwind CSS design principles.",
      imageUrl: "/src/assets/images/impeccable_skill_hero_1779560823416.png"
    }
  ];
}

// 3. API: Fast initial planning of 6 opportunities
app.get("/api/opportunities/plan", async (req, res) => {
  const client = getGeminiClient();
  const answers = activeSession.answers;

  if (!client) {
    console.log("No live GEMINI_API_KEY detected. Utilizing mock opportunities tailored to answers.");
    await new Promise((resolve) => setTimeout(resolve, 800));
    activeSession.opportunities = getPrebuiltMockOpportunities(answers).map(o => ({ ...o, status: "completed" }));
    return res.json({ opportunities: activeSession.opportunities, isLiveAI: false });
  }

  try {
    let backgroundStr = "";
    if (answers.solveApproach) backgroundStr += `\n- Problem-Solving Approach: "${answers.solveApproach}"`;
    if (answers.notBoring) backgroundStr += `\n- What they find engaging: "${answers.notBoring}"`;
    if (answers.access) backgroundStr += `\n- Access to tools: "${answers.access}"`;
    if (answers.winFeeling) backgroundStr += `\n- Definition of success/win: "${answers.winFeeling}"`;

    const prompt = `
Generate 6 micro-adventure titles and types for a ${answers.age || 16}-year-old named ${answers.name || "Maya"}.
Profile:
- What they care about: "${answers.spark || "Microplastics in turtle nests"}"
- Medium: "${answers.medium || "Writing laws or coding maps"}"
- Topic: "${answers.topic || "marine ecology issues"}"${backgroundStr}

Return exactly 6 options as a JSON array of objects with 'id', 'type', 'title', and 'target' (simulated URL).
Types must be exactly one of: 'oss-doc-pr', 'publish-essay', 'eco-campaign', 'code-widget', 'wildlife-map', 'teach-skill'.
Id should be unique, e.g., 'proj-1', 'proj-2', etc.

JSON structure:
{
  "opportunities": [
    {
      "id": "string",
      "type": "oss-doc-pr" | "publish-essay" | "eco-campaign" | "code-widget" | "wildlife-map" | "teach-skill",
      "title": "string",
      "target": "string"
    }
  ]
}
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
                required: ["id", "type", "title", "target"],
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  target: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    if (data.opportunities && Array.isArray(data.opportunities)) {
      activeSession.opportunities = data.opportunities.map((o: any) => ({
        ...o,
        status: "planned",
        impact: "Pending",
        difficulty: "Pending",
        estimatedMinutes: 30
      }));
    } else {
      activeSession.opportunities = getPrebuiltMockOpportunities(answers).map(o => ({ ...o, status: "completed" }));
    }

    res.json({ opportunities: activeSession.opportunities, isLiveAI: true });
  } catch (error: any) {
    console.error("Plan generation failed:", error);
    activeSession.opportunities = getPrebuiltMockOpportunities(answers).map(o => ({ ...o, status: "completed" }));
    res.json({ opportunities: activeSession.opportunities, isLiveAI: false });
  }
});

// 3.5 API: Progressively build a specific opportunity
app.post("/api/opportunities/build", async (req, res) => {
  const { opportunityId } = req.body;
  const client = getGeminiClient();
  const answers = activeSession.answers;

  const oppIndex = activeSession.opportunities.findIndex(o => o.id === opportunityId);
  if (oppIndex === -1) return res.status(404).json({ error: "Not found" });

  const opp = activeSession.opportunities[oppIndex];

  if (!client || opp.status === "completed") {
    // If no client, it's already mock and completed
    return res.json({ opportunity: opp });
  }

  // Mark as building
  activeSession.opportunities[oppIndex].status = "building";

  try {
    const prompt = `
Generate the missing details for this specific project opportunity for ${answers.name || "Maya"} (${answers.age || 16}):
Title: "${opp.title}"
Type: "${opp.type}"
Target: "${opp.target}"
User cares about: "${answers.spark || "Marine ecology"}"

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

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
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
    });

    const data = JSON.parse(response.text || "{}");
    const category = opp.type === "wildlife-map" ? "maps" : opp.type === "code-widget" ? "tech" : opp.type === "eco-campaign" ? "campaign" : "science";
    
    activeSession.opportunities[oppIndex] = {
      ...opp,
      ...data,
      imageUrl: \`https://picsum.photos/seed/\${category}-\${oppIndex}/400/300\`,
      status: "completed"
    };

    res.json({ opportunity: activeSession.opportunities[oppIndex] });
  } catch (error: any) {
    console.error("Build details failed:", error);
    activeSession.opportunities[oppIndex].status = "completed"; // fallback so it doesn't spin forever
    res.json({ opportunity: activeSession.opportunities[oppIndex], error: error.message });
  }
});

// 4. API: Build project steps for active opportunity Selection
app.post("/api/project/select", async (req, res) => {
  const { opportunityId } = req.body;
  const n = activeSession.answers.name || "Maya";
  const age = activeSession.answers.age || 16;
  const grade = activeSession.answers.grade || "Grade 11";
  
  // Find opportunity
  let opportunity = (activeSession.opportunities || []).find((o) => o.id === opportunityId);
  if (!opportunity) {
    // Generate opportunities on the fly if user refreshed
    activeSession.opportunities = getPrebuiltMockOpportunities(activeSession.answers);
    opportunity = activeSession.opportunities.find((o) => o.id === opportunityId);
  }
  
  if (!opportunity) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  // Generate tailored content live using Gemini!
  const client = getGeminiClient();
  let draftBefore = "";
  let draftAfter = "";
  let responseEssayPrompt = "";

  if (opportunity.type === "oss-doc-pr") {
    draftBefore = `# iNaturalist Turtle Logging Ecosystem Guide\n\nThis guide covers field reporting for nesting sites.\n\n## Marine Plastic Reports\n(Needs documentation on sea turtles and plastic toxicity metadata keys. Issue #482)`;
    
    if (client) {
      try {
        const generation = await (client as any).interactions.create({
          agent: "antigravity-preview-05-2026",
          input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, given a student named ${n} (${grade}) interested in: "${activeSession.answers.spark || "Plastics on beaches"}", write a simple 2-paragraph addition representing a documentation guide about microplastic toxicity metrics in nesting sand. Return ONLY the drafted text block to insert.`,
          environment: "remote"
        });
        draftAfter = `${draftBefore}\n\n## Microplastic Toxicity Protocol (Addendum via student ${n})\n${(generation.text || generation.outputText) || "No draft generated."}`;
      } catch (e) {
        draftAfter = `${draftBefore}\n\n## Microplastic Toxicity Protocol (Addendum via student ${n})\n- Metric: Nesting beach toxicity ratio (MP-Tox-Rating) is calculated via microplastic density per meter of nesting sand.\n- Safety levels: Any region with >10 microplastic shards per kilogram of nesting sand experiences significant incubation temperatures distortion.`;
      }
    } else {
      draftAfter = `${draftBefore}\n\n## Microplastic Toxicity Protocol (Addendum via student ${n})\n\n### MP-Toxicity sand metrics\n- Incubation distortion: Any nesting beach exceeding 10 microscopic plastic chips per pound experiences false heating curves, altering turtle hatchling gender ratios (extreme female skew).\n- Action metrics: Site coordinators must run pre-nesting soil sieve tests and report the MP-Tox metric flag in local metadata spreadsheets before major logger deployments.`;
    }
  } else if (opportunity.type === "publish-essay") {
    if (client) {
      try {
        const generation = await (client as any).interactions.create({
          agent: "antigravity-preview-05-2026",
          input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, Create an editorial essay (about 200 words) signed by ${n}, a ${age}-year-old environmental leader, covering "${activeSession.answers.spark}". Make the tone passionate, informative, containing three bulleted action proposals. The headline must belong to: "${opportunity.title}". Return ONLY the drafted markdown text.`,
          environment: "remote"
        });
        responseEssayPrompt = (generation.text || generation.outputText) || "Draft could not be initiated live.";
      } catch (e) {
        responseEssayPrompt = `# ${opportunity.title}\n\nBy ${n}, ${grade}\n\nWe look at the beach and see a canvas for sunset walks. But for nesting green sea turtles, it's a minefield of non-biodegradable particles. Microplastics are changing sand density, locking in solar radiation, and threatening upcoming turtle generations. Here are three quick protocols to implement in coastal schools today. Let's make nesting grounds real sanctuaries again.`;
      }
    } else {
      responseEssayPrompt = `# ${opportunity.title}\n\nBy ${n}, ${grade}\n\nWe look at the beautiful pristine sand and think it's clean. But beneath the surface, tiny microscopic shards of cups, bags, and straws are altering the soil warmth. For sea turtles, beach sand is the cradle of life. When microplastics heat the sand, they skew green sea turtle hatchling genders and lower survival rates.\n\nIf we wait for international laws, we lose the coastline. We must enforce local microplastic sieving, beach cleanups before nesting, and high-school lead conservation efforts.`;
    }
  } else if (opportunity.type === "eco-campaign") {
    // Public advocate lobbying letter
    draftBefore = "DRAFT ADVOCACY RESOLUTION FOR CITY COUNCIL\n\nAttn: Hillsborough Environmental Protection Board\nStaging environmental oversight directive.";
    if (client) {
      try {
        const generation = await (client as any).interactions.create({
          agent: "antigravity-preview-05-2026",
          input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, Create an official citizen communication letter from ${n} (Age ${age}, student in Hillsborough) directed to the local Environmental Council regarding the urgent need to establish community-accessible microplastic sieve kits at beach access gates. Focus on nesting sands temperature safety. Return ONLY the complete formal petition letter text.`,
          environment: "remote"
        });
        responseEssayPrompt = (generation.text || generation.outputText) || "Draft could not be completed live.";
        draftAfter = responseEssayPrompt;
      } catch (e) {
        responseEssayPrompt = `ADVOCACY RESOLUTION PRESENTED BY ${n.toUpperCase()} (${grade})\n\nTO THE HILLSBOROUGH ENVIRONMENT & PARKS SUPERINTENDENTS:\n\nSubject: Mandating Soil Sieve Hubs at Beach Boundary Dunes\n\nWe, the youth residents, ask for beach cleanup hubs to be equipped with soil sieve kits. Removing large trash is not enough. Turtle nests suffer from solar heat locks when micro-particles exceed 12%. Community led sieving is achievable and teaches valuable science.`;
        draftAfter = responseEssayPrompt;
      }
    } else {
      responseEssayPrompt = `ADVOCACY RESOLUTION PRESENTED BY ${n.toUpperCase()} (${grade})\n\nTO THE HILLSBOROUGH ENVIRONMENT & PARKS SUPERINTENDENTS:\n\nSubject: Mandating Soil Sieve Hubs at Beach Boundary Dunes\n\nWe, the youth residents, ask for beach cleanup hubs to be equipped with soil sieve kits. Removing large trash is not enough. Turtle nests suffer from solar heat locks when micro-particles exceed 12%. Community led sieving is achievable and teaches valuable science.`;
      draftAfter = responseEssayPrompt;
    }
  } else if (opportunity.type === "code-widget") {
    // React code widget logic representation
    draftBefore = `// Staging Initial Pollution Degradation Object structure\nconst PlasticsDecompositionRates = {\n  plasticBag: 20,\n  coffeeCup: 50,\n  waterBottle: 450\n};`;
    draftAfter = `// Developed Interactive Calculator Component by ${n}\n\nimport React, { useState } from 'react';\n\nexport default function MarineDecompositionCalculator() {\n  const [bagAmount, setBagAmount] = useState(5);\n  const breakTime = bagAmount * 20;\n\n  return (\n    <div className="card-custom">\n      <h3>Estimated Marine Dune Decay Factor</h3>\n      <p>Bags in sand: {bagAmount} units</p>\n      <p>Average toxic micro-fragments released: {breakTime} thousand particles</p>\n    </div>\n  );\n}`;
    responseEssayPrompt = draftAfter;
  } else if (opportunity.type === "wildlife-map") {
    // Geo logs coordinates mapping layer
    draftBefore = `<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>Turtle Nesting Empty Shell Nodes</name>\n  </Document>\n</kml>`;
    draftAfter = `<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>Atlantic Turtle Nesting Boundaries by ${n}</name>\n    <Placemark>\n      <name>Nest Marker #1 - ${activeSession.answers.topic || "Shore"}</name>\n      <description>Spotted Microplastic Concentration high. Beach temperature deviation detected.</description>\n      <Point>\n        <coordinates>-80.1242,25.7617,0</coordinates>\n      </Point>\n    </Placemark>\n  </Document>\n</kml>`;
    responseEssayPrompt = draftAfter;
  } else if (opportunity.type === "teach-skill") {
    // Impeccable Design Language addon
    draftBefore = `# Mobile Touch Target & Spacing Guidelines\n\nEnsure buttons are clickable.\n\n## Rules\n- Button size should be standard.`;
    
    if (client) {
      try {
        const generation = await (client as any).interactions.create({
          agent: "antigravity-preview-05-2026",
          input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, write a 2-paragraph markdown addition for an AI design guidelines file (for a project called pbakaus/impeccable). It must specify exact styling directives for touch target safety, recommending at least 44px minimum touch sizes and hover cursor cues for desktop. Keep the design language crisp and professional. Return ONLY the drafted markdown text.`,
          environment: "remote"
        });
        draftAfter = `${draftBefore}\n\n## Touch Targets & Hover Feedback (Addendum via student ${n})\n${(generation.text || generation.outputText) || "No draft generated."}`;
      } catch (e) {
        draftAfter = `${draftBefore}\n\n## Touch Targets & Hover Feedback (Addendum via student ${n})\n- Mobile minimum size: Touch targets MUST span at least 44x44px to prevent miss-clicks on mobile devices.\n- Hover feedbacks: Interactive nodes MUST specify a hover animation transition (e.g. hover:bg-opacity-80) to feed back cursor alignments.`;
      }
    } else {
      draftAfter = `${draftBefore}\n\n## Touch Targets & Hover Feedback (Addendum via student ${n})\n\n- Mobile touch safety: Interactive blocks must cover at least 44x44 pixels to preserve comfortable thumb mechanics on physical phone screens.\n- Hover feedback gestures: Implement active cursor reactions like hover:scale-[1.02] or hover:bg-slate-800 to indicate depth and physical click boundaries on desktop viewports.`;
    }
    responseEssayPrompt = draftAfter;
  }

  // Create customized multi-step task list for active project based on type
  if (opportunity.type === "oss-doc-pr") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Fork target codebase & start branch",
          description: `Initialize isolated sandbox environment for ${n}. Mirror ${opportunity.target} locally.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `$ git clone https://github.com/inaturalist/turtle-db.git`,
              `Clone success: 142 objects written to index.`,
              `$ cd turtle-db && git checkout -b agent/${n.toLowerCase()}-nesting-docs`,
              `Switched to new branch: 'agent/${n.toLowerCase()}-nesting-docs'`
            ]
          }
        },
        {
          title: "Browse target guides & parse gaps",
          description: "Scan indices and locate the focal markdown schema files in current repositories.",
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Searching directories... found Match: /docs/conservation/nestlogger-guide.md`,
              `Extracting current contribution schemas...`
            ]
          }
        },
        {
          title: "Draft tailored document addendum",
          description: `Formulate documentation parameters addressing sandbox criteria: "${activeSession.answers.spark}".`,
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Launching server side intelligence compiler...`,
              `Synthesizing custom instructions with gemini-3.5-flash...`,
              `Markdown additions drafted.`
            ],
            editorPreview: draftBefore,
          }
        },
        {
          title: "Review changes Unified Diff",
          description: "Evaluate exact git unified patch comparison before generating the Pull Request.",
          status: "pending",
          actionType: "diff",
          payload: {
            diffHeader: "diff --git a/docs/conservation/nestlogger-guide.md b/docs/conservation/nestlogger-guide.md",
            diffBefore: draftBefore,
            diffAfter: draftAfter,
          }
        },
        {
          title: "Propose Codebase Pull Request on GitHub",
          description: `Commit physical guides and submit a verified Open Source contribution signed by ${n}.`,
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `$ git add docs/conservation/nestlogger-guide.md`,
              `$ git commit -m "docs: add coastal microplastic toxicity guidelines by ${n}"`,
              `$ git push origin agent/${n.toLowerCase()}-nesting-docs`,
              `Opening Pull Request. Handshaking api.github.com/repos/inaturalist/turtle-db/pulls...`
            ],
            destUrl: "https://github.com/inaturalist/turtle-db/pull/6249"
          }
        }
      ]
    };
  } else if (opportunity.type === "publish-essay") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Scan Substack publication credentials",
          description: `Establish OAuth pathways for ${n}'s profile directed at publication platform database.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `Establishing handshakes with api.substack.com...`,
              `Workspace authenticated safely.`
            ]
          }
        },
        {
          title: "Synthesize outline with writing assistant",
          description: `Map out paragraphs, definitions, and headers tailored to your topic: ${activeSession.answers.topic}.`,
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Drafting newsletter layout outline sequence...`,
              `Incorporating age-safety and readability checks.`
            ]
          }
        },
        {
          title: "Edit and review editorial prose essay",
          description: "Read, edit, and approve final draft essay from editor board.",
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Assembled 210 words for Substack body draft...`,
              `Layout ready.`
            ],
            editorPreview: responseEssayPrompt,
          }
        },
        {
          title: "Deploy public article live",
          description: `Publish post. Generates a fully persistent Substack guest essay holding ${n}'s signature.`,
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `Submitting metadata, draft header, and markup tags...`,
              `Post successfully compiled and released.`
            ],
            destUrl: `https://${opportunity.target}/p/microplastics-sand-nurseries`
          }
        }
      ]
    };
  } else if (opportunity.type === "eco-campaign") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Verify Municipal Citizens Portal Endpoint",
          description: `Establish isolated sandbox container to handshake with local representative councils.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `$ curl -I https://${opportunity.target}/citizens-portal`,
              `HTTP/2 200 OK - Secure boundary validated.`,
              `Initializing advocacy petition container for user: ${n}`
            ]
          }
        },
        {
          title: "Establish local counselor board mailing list",
          description: `Scrape the public park supervisors directory coordinates matching your county zone database.`,
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Searching database grids... found 3 active councilors for Environmental Protection:`,
              `- Commissioner Ronald Davies (District 2)`,
              `- Director Martha K. Lopez (Parks & Coasts)`,
              `- Deputy Planner Sarah Chen`
            ]
          }
        },
        {
          title: "Draft tailored Advocacy Letter",
          description: `Run intelligence compiler to generate a convincing public communication signed by ${n} (Age ${age}).`,
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Structuring letter headers and incorporating user concerns: "${activeSession.answers.spark}"...`,
              `Advocacy petition letter generated.`
            ],
            editorPreview: responseEssayPrompt,
          }
        },
        {
          title: "Review letter changes and diff",
          description: "Validate the document outline parameters before submitting off-site.",
          status: "pending",
          actionType: "diff",
          payload: {
            diffHeader: "diff --git a/advocacy/letters/hillsborough-sand-sieves.txt b/advocacy/letters/hillsborough-sand-sieves.txt",
            diffBefore: draftBefore,
            diffAfter: draftAfter
          }
        },
        {
          title: "Publish document dispatch to county portal",
          description: "Submit petition package to the local board to initiate a community environmental motion.",
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `Transmitting advocacy packet to hillsborough-county.gov/citizens-portal...`,
              `Assigned Live Packet Tracking ID: #CIVIC-PR-2026-8801`,
              `Published and recorded. Council tracking page initialized.`
            ],
            destUrl: `https://${opportunity.target}/tracking/CIVIC-PR-2026-8801`
          }
        }
      ]
    };
  } else if (opportunity.type === "code-widget") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Initialize React app widget framework",
          description: `Spin up a component staging template inside the sandbox workspace for ${n}.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `$ npm init vite@latest pollution-calculator -- --template react-ts`,
              `Initialized React template correctly in local directory.`,
              `$ cd pollution-calculator && npm install lucide-react`
            ]
          }
        },
        {
          title: "Map custom chemical decomposition metrics",
          description: `Set up calculation algorithms using scientific metrics for Soil & Coastal water plastics.`,
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Registering standard biological timelines:`,
              `- Simple plastic bags: 20 years`,
              `- Synthetic coffee lids: 50 years`,
              `- Industrial foam coolers: 450 years`,
              `Binding equations onto component sliders.`
            ]
          }
        },
        {
          title: "Review interactive React Calculator code",
          description: "Review component state scripts and render functions to verify design matches.",
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Bundling component elements and styling using high-contrast Tailwind classes...`,
              `Interactive calculator sandbox code loaded.`
            ],
            editorPreview: responseEssayPrompt,
          }
        },
        {
          title: "Evaluate Code diff",
          description: "Compare baseline templates with your fully developed slide tool parameters.",
          status: "pending",
          actionType: "diff",
          payload: {
            diffHeader: "diff --git a/src/components/MarineDecompositionCalculator.tsx b/src/components/MarineDecompositionCalculator.tsx",
            diffBefore: draftBefore,
            diffAfter: draftAfter
          }
        },
        {
          title: "Ship Live React tracker to GitHub Pages",
          description: `Compile static client assets and deploy a fully reactive demo page for your portfolio.`,
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `$ npm run build`,
              `Build success: assets compiled in 1.1s (dist/ directory).`,
              `$ npx gh-pages -d dist`,
              `Successfully published widget node map at https://${opportunity.target}`
            ],
            destUrl: `https://${opportunity.target}`
          }
        }
      ]
    };
  } else if (opportunity.type === "wildlife-map") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Initialize GIS Map Layer nodes",
          description: `Scaffolding Map marker arrays mapping the ecological coordinate boundaries for ${n}.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `$ cat <<EOF > locations.kml`,
              `Created staging XML locations blueprint safely.`
            ]
          }
        },
        {
          title: "Mine geo-location marks and temperature indices",
          description: "Fetch coastal sighting loggers to set latitudinal markers on shore lines.",
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Pulling shoreline report tables...`,
              `Marker #1: Coral Cove beach (25.7617 N, -80.1242 W)`,
              `Marker #2: Loggerhead Dune site (25.8010 N, -80.1102 W)`,
              `Binding microplastic warning descriptions onto marker data structures.`
            ]
          }
        },
        {
          title: "Review assembled KML Map Layer code",
          description: "Review compiled geo-spatial datasets before committing maps.",
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Writing KML code tags... completed.`,
              `1 coordinate set compiled.`
            ],
            editorPreview: responseEssayPrompt,
          }
        },
        {
          title: "Check code differences against template",
          description: "Compare clean spatial XML markers database state.",
          status: "pending",
          actionType: "diff",
          payload: {
            diffHeader: "diff --git a/maps/locations.kml b/maps/locations.kml",
            diffBefore: draftBefore,
            diffAfter: draftAfter
          }
        },
        {
          title: "Publish Custom Map layer live",
          description: "Launch public coordinate overlay on Google MyMaps to support local dune volunteers.",
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `Uploading locations.kml package to google.com/maps/mymaps layers directory...`,
              `Layer compiled successfully. Google Maps integration handshakes finalized.`
            ],
            destUrl: `https://${opportunity.target}`
          }
        }
      ]
    };
  } else if (opportunity.type === "teach-skill") {
    activeSession.activeProject = {
      id: opportunityId,
      stepIndex: 0,
      steps: [
        {
          title: "Fork pbakaus/impeccable Repository",
          description: `Spin up student fork directories of the official design framework on the sandbox workspace.`,
          status: "pending",
          actionType: "init",
          payload: {
            consoleLogs: [
              `$ git clone https://github.com/pbakaus/impeccable.git`,
              `Clone success: 85 objects written to memory buffer.`,
              `$ cd impeccable && git checkout -b agent/teach-touch-targets-${n.toLowerCase()}`,
              `Branch created: 'agent/teach-touch-targets-${n.toLowerCase()}'`
            ]
          }
        },
        {
          title: "Scan design skill structures & guidelines",
          description: "Deconstruct guidelines folder structures to find impeccable.md hook lines.",
          status: "pending",
          actionType: "fetch",
          payload: {
            consoleLogs: [
              `Scanning root folders... matched target file: /impeccable.md`,
              `Extracting active formatting, padding, and layout instruction tables...`
            ]
          }
        },
        {
          title: "Draft Mobile target instruction",
          description: "Use LLM intelligence to formulate beautiful responsive guidelines addressing touch targets and cursor hover cues.",
          status: "pending",
          actionType: "draft",
          payload: {
            consoleLogs: [
              `Applying strict system instructions checks...`,
              `Combining preference topic parameters: "${activeSession.answers.spark || "Design parameters for AI tools"}"`,
              `Custom touch safety guidelines designed.`
            ],
            editorPreview: draftBefore,
          }
        },
        {
          title: "Review Markdown Diff File",
          description: "Analyze the exact unified code diff guidelines updates before sealing the contribution.",
          status: "pending",
          actionType: "diff",
          payload: {
            diffHeader: "diff --git a/impeccable.md b/impeccable.md",
            diffBefore: draftBefore,
            diffAfter: draftAfter
          }
        },
        {
          title: "Submit Contribution Pull Request",
          description: `Propose changes live to developer boards. Generates a formal public Pull Request signed by ${n}.`,
          status: "pending",
          actionType: "publish",
          payload: {
            consoleLogs: [
              `$ git add impeccable.md`,
              `$ git commit -m "docs: add mobile touch targets & hover guides by ${n}"`,
              `$ git push origin agent/teach-touch-targets-${n.toLowerCase()}`,
              `Creating git pull handshake with upstream repository...`
            ],
            destUrl: "https://github.com/pbakaus/impeccable/pull/48"
          }
        }
      ]
    };
  }

  // Pre-set the first step as active or completed
  activeSession.activeProject!.steps[0].status = "pending";

  res.json({ success: true, project: activeSession.activeProject });
});

// 5. API: Execute Step after approval
app.post("/api/project/approve-step", (req, res) => {
  if (!activeSession.activeProject) {
    return res.status(400).json({ error: "No active project" });
  }

  const project = activeSession.activeProject;
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
  }

  res.json({ success: true, project });
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

startServer();
