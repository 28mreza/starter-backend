import { Response } from 'express';
import { UserService } from '@/services/user.service';
import { ResponseUtils } from '@/utils/response';
import { AuthRequest, authenticate, canAccess } from '@/middlewares/auth';

/**
 * POST /api/users/:id/roles
 * Assign roles to user
 */
export const middleware = [authenticate, canAccess('users', 'update')];

export const post = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleIds } = req.body;

    if (isNaN(userId)) {
      return ResponseUtils.error(res, 'Invalid user ID');
    }

    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      return ResponseUtils.error(res, 'roleIds must be a non-empty array');
    }

    const user = await UserService.assignRoles(userId, roleIds);

    return ResponseUtils.success(res, user, 'Roles assigned successfully');
  } catch (error: any) {
    if (error.message === 'User not found') {
      return ResponseUtils.notFound(res, error.message);
    }
    return ResponseUtils.error(res, error.message);
  }
};
