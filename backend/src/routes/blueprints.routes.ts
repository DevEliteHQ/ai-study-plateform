import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { ContextBlueprintSchema } from '../types';
import contextBlueprintService from '../services/contextBlueprint.service';

const router = Router();

// Create blueprint
router.post(
  '/',
  authenticate,
  validate(ContextBlueprintSchema),
  asyncHandler(async (req, res) => {
    const userId = req.userId!;

    const blueprint = await contextBlueprintService.createBlueprint(userId, req.body);

    res.status(201).json({
      success: true,
      data: blueprint,
    });
  })
);

// Get all blueprints
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const { type } = req.query;

    const blueprints = await contextBlueprintService.getBlueprints(
      userId,
      type as string | undefined
    );

    res.json({
      success: true,
      data: blueprints,
    });
  })
);

// Get blueprint by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const blueprint = await contextBlueprintService.getBlueprintById(id);

    if (!blueprint) {
      return res.status(404).json({
        success: false,
        error: 'Blueprint not found',
      });
    }

    // Verify blueprint belongs to user or is public
    if (blueprint.userId && blueprint.userId !== userId && !blueprint.isPublic) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: blueprint,
    });
    return;
  })
);

// Update blueprint
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId!;

    const blueprint = await contextBlueprintService.updateBlueprint(id, userId, req.body);

    res.json({
      success: true,
      data: blueprint,
    });
  })
);

export default router;
