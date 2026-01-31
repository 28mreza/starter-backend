import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { ResponseUtils } from '@/utils/response';

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
export const post = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseUtils.error(res, 'Refresh token is required', null, 400);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    return ResponseUtils.success(res, tokens, 'Token refreshed successfully');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message, null, 401);
  }
};
