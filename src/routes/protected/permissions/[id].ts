import { Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/permissions/:id
 * Get permission by ID
 */
export const middleware = [authenticate, canAccess('permissions', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid permission ID');
    }

    const permission = await PermissionService.getPermissionById(id);

    return ResponseUtils.success(res, permission, 'Permission retrieved successfully');
  } catch (error: any) {
    if (error.message === 'Permission not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * PUT /api/permissions/:id
 * Update permission
 */
export const put = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid permission ID');
    }

    const { name, slug, resource, action, description } = req.body;

    const permission = await PermissionService.updatePermission(id, {
      name,
      slug,
      resource,
      action,
      description
    });

    return ResponseUtils.success(res, permission, 'Permission updated successfully');
  } catch (error: any) {
    if (error.message === 'Permission not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error.message.includes('already exists') || error.message.includes('already taken')) {
      return ResponseUtils.error(res, error.message, null, 409);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * DELETE /api/permissions/:id
 * Delete permission
 */
export const del = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid permission ID');
    }

    await PermissionService.deletePermission(id);

    return ResponseUtils.success(res, null, 'Permission deleted successfully');
  } catch (error: any) {
    if (error.message === 'Permission not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};
