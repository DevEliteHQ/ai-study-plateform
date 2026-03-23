import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { PromptSchema } from '../types';
import promptManagementService from '../services/promptManagement.service';

const router: ReturnType<typeof Router> = Router();

// Create prompt
router.post(
  '/',
  authenticate,
  validate(PromptSchema),
  asyncHandler(async (req, res) => {
    const userId = req.userId!;

    const prompt = await promptManagementService.createPrompt(userId, req.body);

    res.status(201).json({
      success: true,
      data: prompt,
    });
  })
);

// Get all prompts
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;

    const prompts = await promptManagementService.getPrompts(userId);

    res.json({
      success: true,
      data: prompts,
    });
  })
);

// Get prompt by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const prompt = await promptManagementService.getPromptById(id);

    if (!prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found',
      });
    }

    // Verify prompt belongs to user or is public
    if (prompt.userId && prompt.userId !== userId && !prompt.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: prompt,
    });
    return;
  })
);

// Update prompt
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const prompt = await promptManagementService.updatePrompt(id, userId, req.body);

    res.json({
      success: true,
      data: prompt,
    });
  })
);

export default router;
