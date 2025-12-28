import { Job } from 'bullmq';
import prisma from '../config/database';
import llmExecutionService from '../services/llmExecution.service';
import outputNormalizationService from '../services/outputNormalization.service';
import { notionPublishingQueue, LLMGenerationJob } from './jobQueue';
import logger from '../config/logger';

export async function processLLMGeneration(job: Job<LLMGenerationJob>) {
  const { projectId, chunks, prompt, outputType } = job.data;

  try {
    logger.info(`Starting LLM generation for project ${projectId}`);

    // Create output record
    const output = await prisma.generatedOutput.create({
      data: {
        projectId,
        type: outputType as any,
        status: 'GENERATING',
        rawContent: '',
      },
    });

    // Process chunks with LLM
    const llmResponse = await llmExecutionService.processChunks(chunks, prompt);

    // Normalize output to Notion blocks
    const normalizedContent = outputNormalizationService.normalizeToNotionBlocks(
      llmResponse.content
    );

    // Update output with generated content
    await prisma.generatedOutput.update({
      where: { id: output.id },
      data: {
        rawContent: llmResponse.content,
        normalizedContent: normalizedContent as any,
        status: 'NORMALIZING',
      },
    });

    // Queue Notion publishing
    await notionPublishingQueue.add('publish', {
      projectId,
      outputId: output.id,
      pageStructure: {
        title: `Generated ${outputType}`,
        blocks: normalizedContent,
      },
    });

    logger.info(`LLM generation completed for project ${projectId}`);
    return { success: true, outputId: output.id };
  } catch (error) {
    logger.error(`LLM generation failed for project ${projectId}:`, error);

    // Update output status to failed
    await prisma.generatedOutput.updateMany({
      where: { projectId, status: 'GENERATING' },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}
