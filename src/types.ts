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
  label?: string;
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
  id?: string;         // Unique ID for product management board
  title: string;
  description: string;
  status: "pending" | "running" | "approved" | "completed";
  actionType: "init" | "fetch" | "draft" | "diff" | "publish";
  custom?: boolean;    // Flag for custom tasks added on the PM dashboard
  notes?: string;      // Student journal/progress diary notes for this task
  tutorMessages?: { sender: "student" | "agent"; text: string }[]; // Task-specific AI tutor history
  priority?: "low" | "medium" | "high"; // Priority level of the task
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
  started?: boolean;
}

export interface SessionProfile {
  id: string;
  answers: InterviewAnswers;
  opportunities: Opportunity[];
  activeProject: ActiveProject | null;
}
