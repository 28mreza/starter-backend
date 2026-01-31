import { Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate } from '@/middlewares/auth';

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
export const middleware = [authenticate];

export const post = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user!.userId;

    await AuthService.logout(userId, refreshToken);

    return ResponseUtils.success(res, null, 'Logout successful');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};
