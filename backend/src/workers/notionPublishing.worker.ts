import { Job } from 'bullmq';
import prisma from '../config/database';
import notionPublishingService from '../services/notionPublishing.service';
import { NotionPublishingJob } from './jobQueue';
import logger from '../config/logger';

export async function processNotionPublishing(job: Job<NotionPublishingJob>) {
  const { projectId, outputId, pageStructure } = job.data;

  try {
    logger.info(`Starting Notion publishing for output ${outputId}`);

    // Update output status
    await prisma.generatedOutput.update({
      where: { id: outputId },
      data: { status: 'PUBLISHING' },
    });

    // Publish to Notion
    const { pageId, url } = await notionPublishingService.createPage(pageStructure);

    // Update output with Notion page info
    await prisma.generatedOutput.update({
      where: { id: outputId },
      data: {
        notionPageId: pageId,
        notionPageUrl: url,
        status: 'COMPLETED',
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
    });

    logger.info(`Notion publishing completed for output ${outputId}`);
    return { success: true, pageId, url };
  } catch (error) {
    logger.error(`Notion publishing failed for output ${outputId}:`, error);

    // Update output status to failed
    await prisma.generatedOutput.update({
      where: { id: outputId },
      data: { status: 'FAILED' },
    });

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}
