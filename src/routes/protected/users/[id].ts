import { Response } from 'express';
import { UserService } from '@/services/user.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * GET /api/users/:id
 * Get user by ID
 */
export const middleware = [authenticate, canAccess('users', 'read')];

export const get = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid user ID');
    }

    const user = await UserService.getUserById(id);

    return ResponseUtils.success(res, user, 'User retrieved successfully');
  } catch (error: any) {
    if (error.message === 'User not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * PUT /api/users/:id
 * Update user
 */
export const put = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid user ID');
    }

    const { email, name, is_active, password } = req.body;

    const user = await UserService.updateUser(id, {
      email,
      name,
      is_active,
      password
    });

    return ResponseUtils.success(res, user, 'User updated successfully');
  } catch (error: any) {
    if (error.message === 'User not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    if (error.message.includes('already taken')) {
      return ResponseUtils.error(res, error.message, null, 409);
    }
    return ResponseUtils.error(res, error.message);
  }
};

/**
 * DELETE /api/users/:id
 * Delete user
 */
export const del = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return ResponseUtils.error(res, 'Invalid user ID');
    }

    await UserService.deleteUser(id);

    return ResponseUtils.success(res, null, 'User deleted successfully');
  } catch (error: any) {
    if (error.message === 'User not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};
