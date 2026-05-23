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
