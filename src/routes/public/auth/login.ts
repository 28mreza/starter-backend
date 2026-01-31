import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ResponseUtils } from '@/utils/response';

/**
 * POST /api/auth/login
 * Login user
 */
export const post = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    return ResponseUtils.success(res, result, 'Login successful');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message, null, 401);
  }
};
