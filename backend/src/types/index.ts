import { z } from 'zod';

// Document Upload Types
export const DocumentUploadSchema = z.object({
  type: z.enum(['PDF', 'URL', 'TEXT']),
  source: z.string(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
});

export type DocumentUpload = z.infer<typeof DocumentUploadSchema>;

// Prompt Types
export const PromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  isPublic: z.boolean().default(false),
});

export type PromptInput = z.infer<typeof PromptSchema>;

// Context Blueprint Types
export const ContextBlueprintSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['EXAM_SYLLABUS', 'EXAM_PATTERN', 'INTERVIEW_RUBRIC', 'SKILL_MATRIX', 'CUSTOM']),
  content: z.record(z.any()),
  isPublic: z.boolean().default(false),
});

export type ContextBlueprintInput = z.infer<typeof ContextBlueprintSchema>;

// Project Types
export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  documents: z.array(DocumentUploadSchema).min(1),
  promptId: z.string().optional(),
  promptContent: z.string().optional(),
  blueprintId: z.string().optional(),
  outputType: z.enum([
    'SUMMARY',
    'QUESTION_BANK',
    'MOCK_EXAM',
    'CRASH_COURSE',
    'REVISION_NOTES',
    'INTERVIEW_PREP',
    'CUSTOM',
  ]),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Chunk Metadata
export interface ChunkMetadata {
  pageNumber?: number;
  chapter?: string;
  section?: string;
  heading?: string;
  [key: string]: any;
}

// LLM Response Types
export interface LLMResponse {
  content: string;
  citations?: string[];
  confidence?: number;
}

// Notion Block Types
export interface NotionBlock {
  type: string;
  [key: string]: any;
}

export interface NotionPageStructure {
  title: string;
  blocks: NotionBlock[];
}
