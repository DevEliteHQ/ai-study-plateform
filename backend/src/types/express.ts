import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

// Export empty object to make this a module
export {};

