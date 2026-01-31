import { PrismaClient } from '@/generated/ivendor_reborn';
import { PasswordUtils } from '@/utils/password';
import { JWTUtils } from '@/utils/jwt';
import { ValidationUtils } from '@/utils/validation';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput) {
    // Validate input
    const validation = ValidationUtils.validateRequired(input, ['email', 'password', 'name']);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validateStrength(input.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: ValidationUtils.sanitizeString(input.name),
        is_active: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        is_active: true,
        created_at: true
      }
    });

    // Assign default role (user) if exists
    const defaultRole = await prisma.role.findFirst({
      where: { slug: 'user' }
    });

    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          user_id: user.id,
          role_id: defaultRole.id
        }
      });
    }

    // Generate tokens
    const tokens = JWTUtils.generateTokenPair(user.id, user.email);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: tokens.refreshToken,
        expires_at: refreshTokenExpiry
      }
    });

    return {
      user,
      tokens
    };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput) {
    // Validate input
    const validation = ValidationUtils.validateRequired(input, ['email', 'password']);
    if (!validation.isValid) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user || user.deleted_at) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = JWTUtils.generateTokenPair(user.id, user.email);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: tokens.refreshToken,
        expires_at: refreshTokenExpiry
      }
    });

    // Get user with roles and permissions
    const userWithRoles = await this.getUserWithRolesAndPermissions(user.id);

    return {
      user: userWithRoles,
      tokens
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    // Verify refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        user_id: decoded.userId,
        revoked_at: null,
        expires_at: {
          gte: new Date()
        }
      }
    });

    if (!storedToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.deleted_at || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate new tokens
    const tokens = JWTUtils.generateTokenPair(user.id, user.email);

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked_at: new Date() }
    });

    // Store new refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: tokens.refreshToken,
        expires_at: refreshTokenExpiry
      }
    });

    return tokens;
  }

  /**
   * Logout user
   */
  static async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      // Revoke specific refresh token
      await prisma.refreshToken.updateMany({
        where: {
          user_id: userId,
          token: refreshToken,
          revoked_at: null
        },
        data: {
          revoked_at: new Date()
        }
      });
    } else {
      // Revoke all user's refresh tokens
      await prisma.refreshToken.updateMany({
        where: {
          user_id: userId,
          revoked_at: null
        },
        data: {
          revoked_at: new Date()
        }
      });
    }

    return true;
  }

  /**
   * Get user with roles and permissions
   */
  static async getUserWithRolesAndPermissions(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        is_active: true,
        email_verified_at: true,
        created_at: true,
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Format roles and permissions
    const roles = user.user_roles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      slug: ur.role.slug,
      description: ur.role.description
    }));

    const permissionsMap = new Map();
    user.user_roles.forEach(ur => {
      ur.role.role_permissions.forEach(rp => {
        const perm = rp.permission;
        permissionsMap.set(perm.slug, {
          id: perm.id,
          name: perm.name,
          slug: perm.slug,
          resource: perm.resource,
          action: perm.action,
          description: perm.description
        });
      });
    });

    const permissions = Array.from(permissionsMap.values());

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      roles,
      permissions
    };
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: number) {
    return await this.getUserWithRolesAndPermissions(userId);
  }
}
