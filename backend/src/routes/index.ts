import { Router } from 'express';
import projectsRoutes from './projects.routes';
import promptsRoutes from './prompts.routes';
import blueprintsRoutes from './blueprints.routes';
import authRoutes from './auth.routes';

const router: ReturnType<typeof Router> = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/projects', projectsRoutes);
router.use('/prompts', promptsRoutes);
router.use('/blueprints', blueprintsRoutes);

export default router;
