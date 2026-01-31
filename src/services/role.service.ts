import { PrismaClient } from '@/generated/ivendor_reborn';
import { ValidationUtils } from '@/utils/validation';

const prisma = new PrismaClient();

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRoleInput {
  name?: string;
  slug?: string;
  description?: string;
}

export class RoleService {
  /**
   * Get all roles with pagination
   */
  static async getAllRoles(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          role_permissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  resource: true,
                  action: true
                }
              }
            }
          },
          _count: {
            select: {
              user_roles: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      }),
      prisma.role.count({ where })
    ]);

    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      created_at: role.created_at,
      updated_at: role.updated_at,
      permissions: role.role_permissions.map(rp => rp.permission),
      users_count: role._count.user_roles
    }));

    return { roles: formattedRoles, total };
  }

  /**
   * Get role by ID
   */
  static async getRoleById(id: number) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                slug: true,
                resource: true,
                action: true,
                description: true
              }
            }
          }
        },
        user_roles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description,
      created_at: role.created_at,
      updated_at: role.updated_at,
      permissions: role.role_permissions.map(rp => rp.permission),
      users: role.user_roles.map(ur => ur.user)
    };
  }

  /**
   * Create new role
   */
  static async createRole(input: CreateRoleInput) {
    // Validate required fields
    const validation = ValidationUtils.validateRequired(input, ['name', 'slug']);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Check if role with same slug exists
    const existingRole = await prisma.role.findUnique({
      where: { slug: input.slug }
    });

    if (existingRole) {
      throw new Error('Role with this slug already exists');
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name: ValidationUtils.sanitizeString(input.name),
        slug: input.slug.toLowerCase().trim(),
        description: input.description ? ValidationUtils.sanitizeString(input.description) : null
      }
    });

    // Assign permissions if provided
    if (input.permissionIds && input.permissionIds.length > 0) {
      await Promise.all(
        input.permissionIds.map(permissionId =>
          prisma.rolePermission.create({
            data: {
              role_id: role.id,
              permission_id: permissionId
            }
          })
        )
      );
    }

    return await this.getRoleById(role.id);
  }

  /**
   * Update role
   */
  static async updateRole(id: number, input: UpdateRoleInput) {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new Error('Role not found');
    }

    // Check if slug is taken by another role
    if (input.slug) {
      const slugTaken = await prisma.role.findFirst({
        where: {
          slug: input.slug,
          id: { not: id }
        }
      });

      if (slugTaken) {
        throw new Error('Slug is already taken');
      }
    }

    const updateData: any = {};

    if (input.name) updateData.name = ValidationUtils.sanitizeString(input.name);
    if (input.slug) updateData.slug = input.slug.toLowerCase().trim();
    if (input.description !== undefined) {
      updateData.description = input.description ? ValidationUtils.sanitizeString(input.description) : null;
    }

    // Update role
    await prisma.role.update({
      where: { id },
      data: updateData
    });

    return await this.getRoleById(id);
  }

  /**
   * Delete role
   */
  static async deleteRole(id: number) {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            user_roles: true
          }
        }
      }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Check if role is assigned to any users
    if (role._count.user_roles > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    // Delete role (will cascade delete role_permissions)
    await prisma.role.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Assign permissions to role
   */
  static async assignPermissions(roleId: number, permissionIds: number[]) {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Role not found');
    }

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds }
      }
    });

    if (permissions.length !== permissionIds.length) {
      throw new Error('One or more permissions not found');
    }

    // Remove existing permissions
    await prisma.rolePermission.deleteMany({
      where: { role_id: roleId }
    });

    // Assign new permissions
    await Promise.all(
      permissionIds.map(permissionId =>
        prisma.rolePermission.create({
          data: {
            role_id: roleId,
            permission_id: permissionId
          }
        })
      )
    );

    return await this.getRoleById(roleId);
  }

  /**
   * Remove permission from role
   */
  static async removePermission(roleId: number, permissionId: number) {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role_id: roleId,
        permission_id: permissionId
      }
    });

    if (!rolePermission) {
      throw new Error('Role does not have this permission');
    }

    await prisma.rolePermission.delete({
      where: { id: rolePermission.id }
    });

    return await this.getRoleById(roleId);
  }
}
