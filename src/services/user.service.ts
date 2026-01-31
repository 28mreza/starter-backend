import { PrismaClient } from '@/generated/ivendor_reborn';
import { PasswordUtils } from '@/utils/password';
import { ValidationUtils } from '@/utils/validation';

const prisma = new PrismaClient();

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  is_active?: boolean;
  roleIds?: number[];
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  is_active?: boolean;
  password?: string;
}

export class UserService {
  /**
   * Get all users with pagination
   */
  static async getAllUsers(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null
    };

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          is_active: true,
          email_verified_at: true,
          created_at: true,
          updated_at: true,
          user_roles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.user_roles.map(ur => ur.role)
    }));

    return { users: formattedUsers, total };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        is_active: true,
        email_verified_at: true,
        created_at: true,
        updated_at: true,
        user_roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      is_active: user.is_active,
      email_verified_at: user.email_verified_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles: user.user_roles.map(ur => ur.role)
    };
  }

  /**
   * Create new user
   */
  static async createUser(input: CreateUserInput) {
    // Validate required fields
    const validation = ValidationUtils.validateRequired(input, ['email', 'password', 'name']);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Validate email
    if (!ValidationUtils.isValidEmail(input.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password
    const passwordValidation = PasswordUtils.validateStrength(input.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: ValidationUtils.sanitizeString(input.name),
        is_active: input.is_active !== undefined ? input.is_active : true
      },
      select: {
        id: true,
        email: true,
        name: true,
        is_active: true,
        created_at: true
      }
    });

    // Assign roles if provided
    if (input.roleIds && input.roleIds.length > 0) {
      await Promise.all(
        input.roleIds.map(roleId =>
          prisma.userRole.create({
            data: {
              user_id: user.id,
              role_id: roleId
            }
          })
        )
      );
    }

    return await this.getUserById(user.id);
  }

  /**
   * Update user
   */
  static async updateUser(id: number, input: UpdateUserInput) {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null
      }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate email if provided
    if (input.email) {
      if (!ValidationUtils.isValidEmail(input.email)) {
        throw new Error('Invalid email format');
      }

      // Check if email is already taken by another user
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: input.email,
          id: { not: id }
        }
      });

      if (emailTaken) {
        throw new Error('Email is already taken');
      }
    }

    const updateData: any = {};

    if (input.email) updateData.email = input.email;
    if (input.name) updateData.name = ValidationUtils.sanitizeString(input.name);
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    // Update password if provided
    if (input.password) {
      const passwordValidation = PasswordUtils.validateStrength(input.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
      }
      updateData.password = await PasswordUtils.hash(input.password);
    }

    // Update user
    await prisma.user.update({
      where: { id },
      data: updateData
    });

    return await this.getUserById(id);
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(id: number) {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        id,
        deleted_at: null
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false
      }
    });

    return true;
  }

  /**
   * Assign roles to user
   */
  static async assignRoles(userId: number, roleIds: number[]) {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deleted_at: null
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify all roles exist
    const roles = await prisma.role.findMany({
      where: {
        id: { in: roleIds }
      }
    });

    if (roles.length !== roleIds.length) {
      throw new Error('One or more roles not found');
    }

    // Remove existing roles
    await prisma.userRole.deleteMany({
      where: { user_id: userId }
    });

    // Assign new roles
    await Promise.all(
      roleIds.map(roleId =>
        prisma.userRole.create({
          data: {
            user_id: userId,
            role_id: roleId
          }
        })
      )
    );

    return await this.getUserById(userId);
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: number, roleId: number) {
    const userRole = await prisma.userRole.findFirst({
      where: {
        user_id: userId,
        role_id: roleId
      }
    });

    if (!userRole) {
      throw new Error('User does not have this role');
    }

    await prisma.userRole.delete({
      where: { id: userRole.id }
    });

    return await this.getUserById(userId);
  }
}
