import { Job } from 'bullmq';
import prisma from '../config/database';
import chunkingService from '../services/chunking.service';
import { llmGenerationQueue, ContentChunkingJob } from './jobQueue';
import logger from '../config/logger';

export async function processContentChunking(job: Job<ContentChunkingJob>) {
  const { documentId, projectId, extractedText, metadata } = job.data;

  try {
    logger.info(`Starting content chunking for document ${documentId}`);

    // Chunk the content
    const chunks = await chunkingService.chunkContent(extractedText, metadata);

    // Save chunks to database
    await prisma.contentChunk.createMany({
      data: chunks.map((chunk, index) => ({
        documentId,
        chunkIndex: index,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        metadata: chunk.metadata,
      })),
    });

    // Get project to check if all documents are chunked
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        documents: {
          include: {
            chunks: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if all documents are extracted and chunked
    const allDocumentsReady = project.documents.every(
      doc => doc.status === 'EXTRACTED' && doc.chunks.length > 0
    );

    if (allDocumentsReady) {
      // Get all chunks from all documents
      const allChunks = project.documents.flatMap(doc =>
        doc.chunks.map(chunk => ({
          content: chunk.content,
          metadata: chunk.metadata,
        }))
      );

      // Get project output with prompt and blueprint
      const output = await prisma.generatedOutput.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: {
          project: true,
        },
      });

      if (!output) {
        throw new Error('Output record not found for project');
      }

      // Get prompt content
      let promptContent =
        output.rawContent || 'Transform this content into structured study material.';

      // If promptId exists, get the latest version
      if (output.promptId) {
        const prompt = await prisma.prompt.findUnique({
          where: { id: output.promptId },
        });
        if (prompt) {
          promptContent = prompt.content;
        }
      }

      // Get blueprint if exists
      let blueprint = null;
      if (output.blueprintId) {
        const blueprintDoc = await prisma.contextBlueprint.findUnique({
          where: { id: output.blueprintId },
        });
        if (blueprintDoc) {
          blueprint = blueprintDoc.content;
        }
      }

      // Queue LLM generation
      await llmGenerationQueue.add('generate', {
        projectId,
        chunks: allChunks,
        prompt: promptContent,
        outputType: output.type,
        blueprint,
      });
    }

    logger.info(`Content chunking completed for document ${documentId}`);
    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    logger.error(`Content chunking failed for document ${documentId}:`, error);
    throw error;
  }
}
