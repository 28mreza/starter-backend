import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest } from '@/middlewares/auth';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const post = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const result = await AuthService.register({ email, password, name });

    return ResponseUtils.created(res, result, 'User registered successfully');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return ResponseUtils.error(res, error.message, null, 409);
    }

    try {
      const errors = JSON.parse(error.message);
      return ResponseUtils.validationError(res, errors);
    } catch {
      return ResponseUtils.error(res, error.message);
    }
  }
};
