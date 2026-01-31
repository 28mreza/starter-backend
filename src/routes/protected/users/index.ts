import { Response } from 'express';
import { UserService } from '@/services/user.service';
import { ResponseUtils } from '@/utils/response';
import { ValidationUtils } from '@/utils/validation';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/users
 * Get all users with pagination
 */
export const middleware = [authenticate, canAccess('users', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit } = ValidationUtils.validatePagination(
      req.query.page as string,
      req.query.limit as string
    );
    const search = req.query.search as string;

    const result = await UserService.getAllUsers(page, limit, search);

    return ResponseUtils.paginated(
      res,
      result.users,
      page,
      limit,
      result.total,
      'Users retrieved successfully'
    );
  } catch (error: any) {
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * POST /api/users
 * Create new user
 */
export const post = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, is_active, roleIds } = req.body;

    const user = await UserService.createUser({
      email,
      password,
      name,
      is_active,
      roleIds
    });

    return ResponseUtils.created(res, user, 'User created successfully');
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
