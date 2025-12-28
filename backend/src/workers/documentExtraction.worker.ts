import { Job } from 'bullmq';
import prisma from '../config/database';
import contentExtractionService from '../services/contentExtraction.service';
import { contentChunkingQueue, DocumentExtractionJob } from './jobQueue';
import logger from '../config/logger';

export async function processDocumentExtraction(job: Job<DocumentExtractionJob>) {
  const { documentId, projectId, type, source } = job.data;

  try {
    logger.info(`Starting document extraction for document ${documentId}`);

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'EXTRACTING' },
    });

    // Extract content
    const { text, metadata } = await contentExtractionService.extract(type, source);

    // Update document with extracted text
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'EXTRACTED',
        extractedText: text,
        metadata: metadata,
      },
    });

    // Queue chunking job
    await contentChunkingQueue.add('chunk', {
      documentId,
      projectId,
      extractedText: text,
      metadata,
    });

    logger.info(`Document extraction completed for document ${documentId}`);
    return { success: true, textLength: text.length };
  } catch (error) {
    logger.error(`Document extraction failed for document ${documentId}:`, error);

    // Update document status to failed
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}
