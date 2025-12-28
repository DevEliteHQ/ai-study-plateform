export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
  outputs?: GeneratedOutput[];
}

export interface Document {
  id: string;
  type: 'PDF' | 'URL' | 'TEXT';
  source: string;
  fileName?: string;
  status: 'PENDING' | 'EXTRACTING' | 'EXTRACTED' | 'FAILED';
}

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  content: string;
  version: number;
  isActive: boolean;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

export interface ContextBlueprint {
  id: string;
  name: string;
  description?: string;
  type: 'EXAM_SYLLABUS' | 'EXAM_PATTERN' | 'INTERVIEW_RUBRIC' | 'SKILL_MATRIX' | 'CUSTOM';
  content: Record<string, any>;
  isActive: boolean;
  isPublic: boolean;
}

export interface GeneratedOutput {
  id: string;
  type:
    | 'SUMMARY'
    | 'QUESTION_BANK'
    | 'MOCK_EXAM'
    | 'CRASH_COURSE'
    | 'REVISION_NOTES'
    | 'INTERVIEW_PREP'
    | 'CUSTOM';
  status: 'PENDING' | 'GENERATING' | 'NORMALIZING' | 'PUBLISHING' | 'COMPLETED' | 'FAILED';
  notionPageId?: string;
  notionPageUrl?: string;
}

export type OutputType =
  | 'SUMMARY'
  | 'QUESTION_BANK'
  | 'MOCK_EXAM'
  | 'CRASH_COURSE'
  | 'REVISION_NOTES'
  | 'INTERVIEW_PREP'
  | 'CUSTOM';

export type BlueprintType =
  | 'EXAM_SYLLABUS'
  | 'EXAM_PATTERN'
  | 'INTERVIEW_RUBRIC'
  | 'SKILL_MATRIX'
  | 'CUSTOM';
