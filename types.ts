
export type Role = 'Frontend' | 'Backend' | 'Full Stack' | 'DevOps' | 'Mobile';
export type Level = 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
export type DashboardTab = 'roadmap' | 'interviews' | 'analysis' | 'news' | 'settings';

export interface UserProfile {
  role: Role;
  level: Level;
  skills: string[];
  confidenceLevels: Record<string, 'Confident' | 'Somewhat' | 'Not Familiar'>;
  resumeContent?: string;
  resumeFileName?: string;
}

export interface SkillGap {
  skill: string;
  gapLevel: 'Low' | 'Medium' | 'High';
  reason: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'MultipleChoice' | 'Scenario';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: number;
}

export interface RoadmapItem {
  id: string;
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Learn' | 'Revise';
  resources: string[];
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface InterviewFeedback {
  score: number;
  critique: string;
  improvedAnswer: string;
}

export interface TechNewsItem {
  title: string;
  uri: string;
  snippet?: string;
}

export interface TechNewsResponse {
  text: string;
  sources: TechNewsItem[];
}
