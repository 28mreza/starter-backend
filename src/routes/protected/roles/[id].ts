import { Response } from 'express';
import { RoleService } from '@/services/role.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/roles/:id
 * Get role by ID
 */
export const middleware = [authenticate, canAccess('roles', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid role ID');
    }

    const role = await RoleService.getRoleById(id);

    return ResponseUtils.success(res, role, 'Role retrieved successfully');
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * PUT /api/roles/:id
 * Update role
 */
export const put = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid role ID');
    }

    const { name, slug, description } = req.body;

    const role = await RoleService.updateRole(id, {
      name,
      slug,
      description
    });

    return ResponseUtils.success(res, role, 'Role updated successfully');
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error.message.includes('already taken')) {
      return ResponseUtils.error(res, error.message, null, 409);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * DELETE /api/roles/:id
 * Delete role
 */
export const del = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid role ID');
    }

    await RoleService.deleteRole(id);

    return ResponseUtils.success(res, null, 'Role deleted successfully');
  } catch (error: any) {
    if (error.message === 'Role not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};
