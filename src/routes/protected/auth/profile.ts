import { Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate } from '@/middlewares/auth';

/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
export const middleware = [authenticate];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const profile = await AuthService.getProfile(userId);

    return ResponseUtils.success(res, profile, 'Profile retrieved successfully');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};
