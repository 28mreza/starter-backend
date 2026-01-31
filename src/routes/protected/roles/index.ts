import { Response } from 'express';
import { RoleService } from '@/services/role.service';
import { ResponseUtils } from '@/utils/response';
import { ValidationUtils } from '@/utils/validation';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/roles
 * Get all roles with pagination
 */
export const middleware = [authenticate, canAccess('roles', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = ValidationUtils.validatePagination(
      req.query.page as string,
      req.query.limit as string
    );
    const search = req.query.search as string;

    const result = await RoleService.getAllRoles(page, limit, search);

    return ResponseUtils.paginated(
      res,
      result.roles,
      page,
      limit,
      result.total,
      'Roles retrieved successfully'
    );
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * POST /api/roles
 * Create new role
 */
export const post = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, permissionIds } = req.body;

    const role = await RoleService.createRole({
      name,
      slug,
      description,
      permissionIds
    });

    return ResponseUtils.created(res, role, 'Role created successfully');
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return ResponseUtils.error(res, error.message, null, 409);
    }

    try {
      const errors = JSON.parse(error.message);
      return ResponseUtils.validationError(res, errors);
    } catch {
      return ResponseUtils.error(res, error.message);
    }
  }
};
