// src/types/problemas.ts

export interface SolutionData {
  title: string;
  description: string;
}

export interface ProblemData {
  title: string;
  description: string;
  solutions: SolutionData[];
}

export interface ProblemCategory {
  title: string;
  subtitle: string;
  problems: ProblemData[];
}