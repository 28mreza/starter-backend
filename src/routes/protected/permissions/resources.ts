import { Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/permissions/resources
 * Get all unique resources
 */
export const middleware = [authenticate, canAccess('permissions', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const resources = await PermissionService.getAllResources();

    return ResponseUtils.success(res, resources, 'Resources retrieved successfully');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};
