import { Response } from 'express';
import { RoleService } from '@/services/role.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * POST /api/roles/:id/permissions
 * Assign permissions to role
 */
export const middleware = [authenticate, canAccess('roles', 'update')];

export const post = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    const { permissionIds } = req.body;

    if (isNaN(roleId)) {
      return ResponseUtils.error(res, 'Invalid role ID');
    }

    if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
      return ResponseUtils.error(res, 'permissionIds must be a non-empty array');
    }

    const role = await RoleService.assignPermissions(roleId, permissionIds);

    return ResponseUtils.success(res, role, 'Permissions assigned successfully');
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};
