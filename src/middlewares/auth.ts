import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '@/utils/jwt';
import { ResponseUtils } from '@/utils/response';
import { PrismaClient } from '@/generated/ivendor_reborn';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    roles?: string[];
    permissions?: string[];
  };
}

/**
 * Middleware to verify JWT access token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtils.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = JWTUtils.verifyAccessToken(token);

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        is_active: true,
        deleted_at: true
      }
    });

    if (!user || user.deleted_at) {
      return ResponseUtils.unauthorized(res, 'User not found');
    }

    if (!user.is_active) {
      return ResponseUtils.unauthorized(res, 'User account is inactive');
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email
    };

    next();
  } catch (error: any) {
    return ResponseUtils.unauthorized(res, error.message || 'Invalid token');
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
export const authorize = (...allowedRoles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.user) {
        return ResponseUtils.unauthorized(res, 'Authentication required');
      }

      // Get user roles
      const userRoles = await prisma.userRole.findMany({
        where: {
          user_id: req.user.userId
        },
        include: {
          role: true
        }
      });

      const roles = userRoles.map(ur => ur.role.slug);
      req.user.roles = roles;

      // Check if user has any of the allowed roles
      const hasRole = roles.some(role => allowedRoles.includes(role));

      if (!hasRole) {
        return ResponseUtils.forbidden(
          res,
          'You do not have permission to access this resource'
        );
      }

      next();
    } catch (error: any) {
      return ResponseUtils.serverError(res, 'Authorization check failed', error.message);
    }
  };
};

/**
 * Middleware to check if user has specific permission(s)
 */
export const can = (...requiredPermissions: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.user) {
        return ResponseUtils.unauthorized(res, 'Authentication required');
      }

      // Get user's roles
      const userRoles = await prisma.userRole.findMany({
        where: {
          user_id: req.user.userId
        },
        select: {
          role_id: true
        }
      });

      const roleIds = userRoles.map(ur => ur.role_id);

      if (roleIds.length === 0) {
        return ResponseUtils.forbidden(
          res,
          'You do not have any roles assigned'
        );
      }

      // Get permissions for these roles
      const rolePermissions = await prisma.rolePermission.findMany({
        where: {
          role_id: {
            in: roleIds
          }
        },
        include: {
          permission: true
        }
      });

      const permissions = rolePermissions.map(rp => rp.permission.slug);
      req.user.permissions = permissions;

      // Check if user has any of the required permissions
      const hasPermission = requiredPermissions.some(perm => permissions.includes(perm));

      if (!hasPermission) {
        return ResponseUtils.forbidden(
          res,
          `Required permission: ${requiredPermissions.join(' or ')}`
        );
      }

      next();
    } catch (error: any) {
      return ResponseUtils.serverError(res, 'Permission check failed', error.message);
    }
  };
};

/**
 * Middleware to check if user has specific permission for a resource and action
 */
export const canAccess = (resource: string, action: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      if (!req.user) {
        return ResponseUtils.unauthorized(res, 'Authentication required');
      }

      // Get user's roles
      const userRoles = await prisma.userRole.findMany({
        where: {
          user_id: req.user.userId
        },
        select: {
          role_id: true
        }
      });

      const roleIds = userRoles.map(ur => ur.role_id);

      if (roleIds.length === 0) {
        return ResponseUtils.forbidden(
          res,
          'You do not have any roles assigned'
        );
      }

      // Check if user has permission for this resource and action
      const hasPermission = await prisma.rolePermission.findFirst({
        where: {
          role_id: {
            in: roleIds
          },
          permission: {
            resource: resource,
            action: action
          }
        }
      });

      if (!hasPermission) {
        return ResponseUtils.forbidden(
          res,
          `You do not have permission to ${action} ${resource}`
        );
      }

      next();
    } catch (error: any) {
      return ResponseUtils.serverError(res, 'Access check failed', error.message);
    }
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTUtils.verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          is_active: true,
          deleted_at: true
        }
      });

      if (user && !user.deleted_at && user.is_active) {
        req.user = {
          userId: user.id,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors and continue without auth
    next();
  }
};
