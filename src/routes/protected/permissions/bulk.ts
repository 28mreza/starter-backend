import { Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * POST /api/permissions/bulk
 * Bulk create permissions for a resource
 */
export const middleware = [authenticate, canAccess('permissions', 'create')];

export const post = async (req: AuthRequest, res: Response) => {
  try {
    const { resource, actions } = req.body;

    if (!resource || !actions || !Array.isArray(actions)) {
      return ResponseUtils.error(res, 'resource and actions array are required');
    }

    const permissions = await PermissionService.bulkCreatePermissions(resource, actions);

    return ResponseUtils.created(res, permissions, 'Permissions created successfully');
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};
