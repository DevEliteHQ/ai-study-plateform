import { Queue, Worker, Job } from 'bullmq';
import redis from '../config/redis';
import logger from '../config/logger';
import { processDocumentExtraction } from './documentExtraction.worker';
import { processContentChunking } from './contentChunking.worker';
import { processLLMGeneration } from './llmGeneration.worker';
import { processNotionPublishing } from './notionPublishing.worker';

// Job queues
export const documentExtractionQueue = new Queue('document-extraction', {
  connection: redis,
});

export const contentChunkingQueue = new Queue('content-chunking', {
  connection: redis,
});

export const llmGenerationQueue = new Queue('llm-generation', {
  connection: redis,
});

export const notionPublishingQueue = new Queue('notion-publishing', {
  connection: redis,
});

// Job data types
export interface DocumentExtractionJob {
  documentId: string;
  projectId: string;
  type: 'PDF' | 'URL' | 'TEXT';
  source: string;
}

export interface ContentChunkingJob {
  documentId: string;
  projectId: string;
  extractedText: string;
  metadata: any;
}

export interface LLMGenerationJob {
  projectId: string;
  chunks: Array<{ content: string; metadata: any }>;
  prompt: string;
  outputType: string;
  blueprint?: any;
}

export interface NotionPublishingJob {
  projectId: string;
  outputId: string;
  pageStructure: {
    title: string;
    blocks: any[];
  };
}

// Workers
export const documentExtractionWorker = new Worker<DocumentExtractionJob>(
  'document-extraction',
  async (job: Job<DocumentExtractionJob>) => {
    return processDocumentExtraction(job);
  },
  { connection: redis }
);

export const contentChunkingWorker = new Worker<ContentChunkingJob>(
  'content-chunking',
  async (job: Job<ContentChunkingJob>) => {
    return processContentChunking(job);
  },
  { connection: redis }
);

export const llmGenerationWorker = new Worker<LLMGenerationJob>(
  'llm-generation',
  async (job: Job<LLMGenerationJob>) => {
    return processLLMGeneration(job);
  },
  { connection: redis }
);

export const notionPublishingWorker = new Worker<NotionPublishingJob>(
  'notion-publishing',
  async (job: Job<NotionPublishingJob>) => {
    return processNotionPublishing(job);
  },
  { connection: redis }
);

// Error handling
documentExtractionWorker.on('failed', (job, err) => {
  logger.error(`Document extraction job ${job?.id} failed:`, err);
});

contentChunkingWorker.on('failed', (job, err) => {
  logger.error(`Content chunking job ${job?.id} failed:`, err);
});

llmGenerationWorker.on('failed', (job, err) => {
  logger.error(`LLM generation job ${job?.id} failed:`, err);
});

notionPublishingWorker.on('failed', (job, err) => {
  logger.error(`Notion publishing job ${job?.id} failed:`, err);
});
