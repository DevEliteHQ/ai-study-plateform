import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { CreateProjectSchema } from '../types';
import prisma from '../config/database';
import promptManagementService from '../services/promptManagement.service';
import contextBlueprintService from '../services/contextBlueprint.service';
import { documentExtractionQueue } from '../workers/jobQueue';

const router: ReturnType<typeof Router> = Router();

// Create a new project
router.post(
  '/',
  authenticate,
  validate(CreateProjectSchema),
  asyncHandler(async (req, res) => {
    const { name, description, documents, promptId, promptContent, blueprintId, outputType } =
      req.body;

    const userId = req.userId!;

    // Create project
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        description,
        status: 'PENDING',
      },
    });

    // Get prompt
    let prompt = '';
    if (promptId) {
      const promptDoc = await promptManagementService.getPromptById(promptId);
      if (!promptDoc) {
        throw new Error('Prompt not found');
      }
      prompt = promptDoc.content;
    } else if (promptContent) {
      prompt = promptContent;
    } else {
      throw new Error('Either promptId or promptContent must be provided');
    }

    // Get blueprint if provided
    let blueprint = null;
    if (blueprintId) {
      blueprint = await contextBlueprintService.getBlueprintById(blueprintId);
    }

    // Build prompt with context
    const finalPrompt = promptManagementService.buildPromptWithContext(prompt, {
      blueprint: blueprint?.content,
      outputType,
    });

    // Create initial output record to store prompt and blueprint references
    await prisma.generatedOutput.create({
      data: {
        projectId: project.id,
        promptId: promptId || null,
        blueprintId: blueprintId || null,
        type: outputType as
          | 'SUMMARY'
          | 'QUESTION_BANK'
          | 'MOCK_EXAM'
          | 'CRASH_COURSE'
          | 'REVISION_NOTES'
          | 'INTERVIEW_PREP'
          | 'CUSTOM',
        status: 'PENDING',
        rawContent: finalPrompt, // Store the final prompt for reference
      },
    });

    // Process documents
    for (const doc of documents) {
      const document = await prisma.document.create({
        data: {
          projectId: project.id,
          type: doc.type,
          source: doc.source,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          size: doc.size,
          status: 'PENDING',
        },
      });

      // Queue document extraction
      await documentExtractionQueue.add('extract', {
        documentId: document.id,
        projectId: project.id,
        type: doc.type,
        source: doc.source,
      });
    }

    // Update project status to processing
    await prisma.project.update({
      where: { id: project.id },
      data: { status: 'PROCESSING' },
    });

    res.status(201).json({
      success: true,
      data: {
        projectId: project.id,
        status: project.status,
      },
    });
  })
);

// Get project by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        documents: true,
        outputs: true,
        jobStatuses: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Verify project belongs to user
    if (project.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: project,
    });
    return;
  })
);

// Get all projects
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            documents: true,
            outputs: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: projects,
    });
  })
);

export default router;
