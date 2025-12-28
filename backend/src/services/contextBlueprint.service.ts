import prisma from '../config/database';
import logger from '../config/logger';
import { ContextBlueprintInput } from '../types';

export class ContextBlueprintService {
  /**
   * Create a new context blueprint
   */
  async createBlueprint(userId: string | null, input: ContextBlueprintInput) {
    try {
      const blueprint = await prisma.contextBlueprint.create({
        data: {
          userId: userId || null,
          name: input.name,
          description: input.description,
          type: input.type,
          content: input.content,
          isPublic: input.isPublic,
        },
      });

      logger.info(`Created blueprint: ${blueprint.id}`);
      return blueprint;
    } catch (error) {
      logger.error('Failed to create blueprint:', error);
      throw error;
    }
  }

  /**
   * Get blueprint by ID
   */
  async getBlueprintById(blueprintId: string) {
    return prisma.contextBlueprint.findUnique({
      where: { id: blueprintId },
    });
  }

  /**
   * Get public blueprints or user's blueprints
   */
  async getBlueprints(userId?: string, type?: string) {
    return prisma.contextBlueprint.findMany({
      where: {
        AND: [
          {
            OR: [
              { isPublic: true, isActive: true },
              ...(userId ? [{ userId, isActive: true }] : []),
            ],
          },
          ...(type ? [{ type: type as any }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update blueprint
   */
  async updateBlueprint(
    blueprintId: string,
    userId: string,
    input: Partial<ContextBlueprintInput>
  ) {
    const blueprint = await prisma.contextBlueprint.findUnique({
      where: { id: blueprintId },
    });

    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    if (blueprint.userId !== userId) {
      throw new Error('Unauthorized to update this blueprint');
    }

    return prisma.contextBlueprint.update({
      where: { id: blueprintId },
      data: input,
    });
  }
}

export default new ContextBlueprintService();
