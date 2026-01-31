import { Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/permissions/grouped
 * Get permissions grouped by resource
 */
export const middleware = [authenticate, canAccess('permissions', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const grouped = await PermissionService.getPermissionsByResource();

    return ResponseUtils.success(res, grouped, 'Grouped permissions retrieved successfully');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};
