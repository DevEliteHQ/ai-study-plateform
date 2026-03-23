import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import authService from '../services/auth.service';
import { z } from 'zod';

const router: ReturnType<typeof Router> = Router();

// Validation schemas
const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Signup
router.post(
  '/signup',
  validate(SignupSchema),
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    const result = await authService.signup({ email, password, name });

    res.status(201).json({
      success: true,
      data: result,
    });
  })
);

// Login
router.post(
  '/login',
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      data: result,
    });
  })
);

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.userId!);

    res.json({
      success: true,
      data: user,
    });
  })
);

export default router;
