import prisma from '../config/database';
import logger from '../config/logger';
import { PromptInput } from '../types';

export class PromptManagementService {
  /**
   * Create a new prompt
   */
  async createPrompt(userId: string | null, input: PromptInput) {
    try {
      const prompt = await prisma.prompt.create({
        data: {
          userId: userId || null,
          name: input.name,
          description: input.description,
          content: input.content,
          metadata: input.metadata || {},
          isPublic: input.isPublic,
        },
      });

      logger.info(`Created prompt: ${prompt.id}`);
      return prompt;
    } catch (error) {
      logger.error('Failed to create prompt:', error);
      throw error;
    }
  }

  /**
   * Get prompt by ID
   */
  async getPromptById(promptId: string) {
    return prisma.prompt.findUnique({
      where: { id: promptId },
    });
  }

  /**
   * Get public prompts or user's prompts
   */
  async getPrompts(userId?: string) {
    return prisma.prompt.findMany({
      where: {
        OR: [{ isPublic: true, isActive: true }, ...(userId ? [{ userId, isActive: true }] : [])],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update prompt
   */
  async updatePrompt(promptId: string, userId: string, input: Partial<PromptInput>) {
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
    });

    if (!prompt) {
      throw new Error('Prompt not found');
    }

    if (prompt.userId !== userId) {
      throw new Error('Unauthorized to update this prompt');
    }

    return prisma.prompt.update({
      where: { id: promptId },
      data: {
        ...input,
        version: prompt.version + 1,
      },
    });
  }

  /**
   * Build prompt with context injection
   */
  buildPromptWithContext(
    basePrompt: string,
    context?: {
      blueprint?: any;
      outputType?: string;
      documentMetadata?: any;
    }
  ): string {
    let finalPrompt = basePrompt;

    // Inject context blueprint if provided
    if (context?.blueprint) {
      const blueprintContext = `\n\n## Context Blueprint:\n${JSON.stringify(context.blueprint, null, 2)}\n`;
      finalPrompt += blueprintContext;
    }

    // Inject output type requirements
    if (context?.outputType) {
      finalPrompt += `\n\n## Output Type: ${context.outputType}\n`;
      finalPrompt += `Please structure your response according to the ${context.outputType} format.\n`;
    }

    // Inject document metadata if available
    if (context?.documentMetadata) {
      finalPrompt += `\n\n## Source Document Information:\n${JSON.stringify(context.documentMetadata, null, 2)}\n`;
    }

    // Add accuracy requirements
    finalPrompt += `\n\n## Important Guidelines:\n`;
    finalPrompt += `- If information is not found in the source material, clearly state "Not found in source" rather than guessing.\n`;
    finalPrompt += `- Maintain clear separation between extracted facts and generated insights.\n`;
    finalPrompt += `- Include source references when possible.\n`;

    return finalPrompt;
  }
}

export default new PromptManagementService();
