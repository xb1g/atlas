export interface InterviewAnswers {
  name: string;
  age: number;
  grade: string;
  spark: string;
  medium: string;
  topic: string;
  freeTime: string;
  solveApproach?: string;
  notBoring?: string;
  access?: string;
  winFeeling?: string;
}

export interface Opportunity {
  id: string;
  type: "oss-doc-pr" | "publish-essay" | "eco-campaign" | "code-widget" | "wildlife-map" | "teach-skill" | "coming-soon";
  title: string;
  target: string;
  impact: string;
  difficulty: string;
  summary?: string;
  whyMatch?: string;
  estimatedMinutes: number;
  sourceUrl?: string;
  complexity?: string;
  imageUrl?: string; // Add an option for displaying a beautiful customized illustration card
  status?: "planned" | "building" | "completed" | "coming-soon";
}

export interface ProjectStep {
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
}

export interface ActiveProject {
  id: string;
  stepIndex: number;
  steps: ProjectStep[];
}

export interface SessionProfile {
  id: string;
  answers: InterviewAnswers;
  opportunities: Opportunity[];
  activeProject: ActiveProject | null;
}
