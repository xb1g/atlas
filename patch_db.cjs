const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

// Add firebase-admin import
code = code.replace('import express from "express";', `import express from "express";\nimport admin from "firebase-admin";`);

// Add Firebase initialization and helpers
const firebaseSetup = `
// -------------------------------------------------------------
// Firebase Database Setup
// -------------------------------------------------------------
let db: admin.firestore.Firestore | null = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    db = admin.firestore();
    console.log("Firebase Firestore initialized successfully.");
  } else {
    console.log("Firebase GOOGLE_APPLICATION_CREDENTIALS not set. Falling back to in-memory sessions.");
  }
} catch (error) {
  console.log("Firebase initialization failed. Falling back to in-memory sessions.", error);
}

const activeSessions: Record<string, SessionProfile> = {};

async function getSession(id: string): Promise<SessionProfile> {
  if (db) {
    try {
      const doc = await db.collection("sessions").doc(id).get();
      if (doc.exists) return doc.data() as SessionProfile;
    } catch(e) { console.error("Firestore get error", e); }
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
  return activeSessions[id];
}

async function saveSession(session: SessionProfile) {
  if (db) {
    try {
      await db.collection("sessions").doc(session.id).set(session);
    } catch(e) { console.error("Firestore save error", e); }
  } else {
    activeSessions[session.id] = session;
  }
}
`;

code = code.replace(/let activeSession: SessionProfile = \{[\s\S]*?activeProject: null,\n\};/m, firebaseSetup);

// Replace get /api/session
code = code.replace(/app\.get\("\/api\/session", \(req, res\) => \{[\s\S]*?\}\);/m, `app.get("/api/session", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  res.json({
    session,
    hasLiveKey: !!getGeminiClient()
  });
});`);

// Replace post /api/session/answers
code = code.replace(/app\.post\("\/api\/session\/answers", \(req, res\) => \{[\s\S]*?\}\);/m, `app.post("/api/session/answers", async (req, res) => {
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
});`);

// Plan API replacements
code = code.replace(/app\.get\("\/api\/opportunities\/plan", async \(req, res\) => \{[\s\S]*?const answers = activeSession\.answers;/m, `app.get("/api/opportunities/plan", async (req, res) => {
  const sessionId = req.headers["x-session-id"] as string || "session-maya";
  const session = await getSession(sessionId);
  const client = getGeminiClient();
  const answers = session.answers;`);

// replace all activeSession with session in the plan API (but be careful not to replace in other scopes)
// We can just globally replace `activeSession` with `session` since we replaced the global var, 
// BUT we need to make sure we extract sessionId properly in every route.
code = code.replace(/activeSession\.opportunities/g, "session.opportunities");
code = code.replace(/activeSession\.activeProject/g, "session.activeProject");
code = code.replace(/activeSession\.answers/g, "session.answers");

// For /api/opportunities/build
code = code.replace(/app\.post\("\/api\/opportunities\/build", async \(req, res\) => \{/m, `app.post("/api/opportunities/build", async (req, res) => {\n  const sessionId = req.headers["x-session-id"] as string || "session-maya";\n  const session = await getSession(sessionId);`);
code = code.replace(/const opportunity = session\.opportunities\.find\(\(o\) => o\.id === opportunityId\);/m, `const opportunity = session.opportunities.find((o: any) => o.id === opportunityId);`);
code = code.replace(/res\.json\(\{ success: true, opportunity \}\);/g, `await saveSession(session);\n    res.json({ success: true, opportunity });`);

// For /api/project/select
code = code.replace(/app\.post\("\/api\/project\/select", async \(req, res\) => \{/m, `app.post("/api/project/select", async (req, res) => {\n  const sessionId = req.headers["x-session-id"] as string || "session-maya";\n  const session = await getSession(sessionId);`);
code = code.replace(/res\.json\(\{ success: true, project: session\.activeProject \}\);/m, `await saveSession(session);\n  res.json({ success: true, project: session.activeProject });`);

// For /api/project/approve-step
code = code.replace(/app\.post\("\/api\/project\/approve-step", \(req, res\) => \{/m, `app.post("/api/project/approve-step", async (req, res) => {\n  const sessionId = req.headers["x-session-id"] as string || "session-maya";\n  const session = await getSession(sessionId);`);
code = code.replace(/res\.json\(\{ success: true, project \}\);/m, `await saveSession(session);\n  res.json({ success: true, project });`);

// We need to fix the mock opportunities function signature
code = code.replace(/function getPrebuiltMockOpportunities\(answers: typeof activeSession\.answers\)/, 'function getPrebuiltMockOpportunities(answers: SessionProfile["answers"])');


fs.writeFileSync('server.ts', code);
console.log('Patched server.ts successfully!');
