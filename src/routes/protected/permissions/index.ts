import { Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { ResponseUtils } from '@/utils/response';
import { ValidationUtils } from '@/utils/validation';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/permissions
 * Get all permissions with pagination
 */
export const middleware = [authenticate, canAccess('permissions', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = ValidationUtils.validatePagination(
      req.query.page as string,
      req.query.limit as string
    );
    const search = req.query.search as string;
    const resource = req.query.resource as string;

    const result = await PermissionService.getAllPermissions(page, limit, search, resource);

    return ResponseUtils.paginated(
      res,
      result.permissions,
      page,
      limit,
      result.total,
      'Permissions retrieved successfully'
    );
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * POST /api/permissions
 * Create new permission
 */
export const post = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, resource, action, description } = req.body;

    const permission = await PermissionService.createPermission({
      name,
      slug,
      resource,
      action,
      description
    });

    return ResponseUtils.created(res, permission, 'Permission created successfully');
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
