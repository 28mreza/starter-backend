import { PrismaClient } from '@/generated/ivendor_reborn';
import { ValidationUtils } from '@/utils/validation';

const prisma = new PrismaClient();

export interface CreatePermissionInput {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionInput {
  name?: string;
  slug?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export class PermissionService {
  /**
   * Get all permissions with pagination
   */
  static async getAllPermissions(page: number = 1, limit: number = 10, search?: string, resource?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { resource: { contains: search } },
        { action: { contains: search } }
      ];
    }

    if (resource) {
      where.resource = resource;
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              role_permissions: true
            }
          }
        },
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' }
        ]
      }),
      prisma.permission.count({ where })
    ]);

    const formattedPermissions = permissions.map(permission => ({
      id: permission.id,
      name: permission.name,
      slug: permission.slug,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      created_at: permission.created_at,
      updated_at: permission.updated_at,
      roles_count: permission._count.role_permissions
    }));

    return { permissions: formattedPermissions, total };
  }

  /**
   * Get permission by ID
   */
  static async getPermissionById(id: number) {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        role_permissions: {
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
      }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return {
      id: permission.id,
      name: permission.name,
      slug: permission.slug,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
      created_at: permission.created_at,
      updated_at: permission.updated_at,
      roles: permission.role_permissions.map(rp => rp.role)
    };
  }

  /**
   * Get all unique resources
   */
  static async getAllResources() {
    const permissions = await prisma.permission.findMany({
      select: {
        resource: true
      },
      distinct: ['resource'],
      orderBy: {
        resource: 'asc'
      }
    });

    return permissions.map(p => p.resource);
  }

  /**
   * Get permissions grouped by resource
   */
  static async getPermissionsByResource() {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    const grouped: Record<string, any[]> = {};

    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
        action: permission.action,
        description: permission.description
      });
    });

    return grouped;
  }

  /**
   * Create new permission
   */
  static async createPermission(input: CreatePermissionInput) {
    // Validate required fields
    const validation = ValidationUtils.validateRequired(input, ['name', 'slug', 'resource', 'action']);
    if (!validation.isValid) {
      throw new Error(JSON.stringify(validation.errors));
    }

    // Check if permission with same slug exists
    const existingPermission = await prisma.permission.findUnique({
      where: { slug: input.slug }
    });

    if (existingPermission) {
      throw new Error('Permission with this slug already exists');
    }

    // Check if permission with same resource and action exists
    const existingResourceAction = await prisma.permission.findFirst({
      where: {
        resource: input.resource,
        action: input.action
      }
    });

    if (existingResourceAction) {
      throw new Error('Permission with this resource and action already exists');
    }

    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name: ValidationUtils.sanitizeString(input.name),
        slug: input.slug.toLowerCase().trim(),
        resource: input.resource.toLowerCase().trim(),
        action: input.action.toLowerCase().trim(),
        description: input.description ? ValidationUtils.sanitizeString(input.description) : null
      }
    });

    return await this.getPermissionById(permission.id);
  }

  /**
   * Update permission
   */
  static async updatePermission(id: number, input: UpdatePermissionInput) {
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });

    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    // Check if slug is taken by another permission
    if (input.slug) {
      const slugTaken = await prisma.permission.findFirst({
        where: {
          slug: input.slug,
          id: { not: id }
        }
      });

      if (slugTaken) {
        throw new Error('Slug is already taken');
      }
    }

    // Check if resource and action combination is taken
    if (input.resource || input.action) {
      const resource = input.resource || existingPermission.resource;
      const action = input.action || existingPermission.action;

      const resourceActionTaken = await prisma.permission.findFirst({
        where: {
          resource,
          action,
          id: { not: id }
        }
      });

      if (resourceActionTaken) {
        throw new Error('Permission with this resource and action already exists');
      }
    }

    const updateData: any = {};

    if (input.name) updateData.name = ValidationUtils.sanitizeString(input.name);
    if (input.slug) updateData.slug = input.slug.toLowerCase().trim();
    if (input.resource) updateData.resource = input.resource.toLowerCase().trim();
    if (input.action) updateData.action = input.action.toLowerCase().trim();
    if (input.description !== undefined) {
      updateData.description = input.description ? ValidationUtils.sanitizeString(input.description) : null;
    }

    // Update permission
    await prisma.permission.update({
      where: { id },
      data: updateData
    });

    return await this.getPermissionById(id);
  }

  /**
   * Delete permission
   */
  static async deletePermission(id: number) {
    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            role_permissions: true
          }
        }
      }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if permission is assigned to any roles
    if (permission._count.role_permissions > 0) {
      throw new Error('Cannot delete permission that is assigned to roles');
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Bulk create permissions for a resource
   */
  static async bulkCreatePermissions(resource: string, actions: string[]) {
    const results = [];

    for (const action of actions) {
      const slug = `${resource}.${action}`;
      const name = `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;

      try {
        // Check if already exists
        const existing = await prisma.permission.findFirst({
          where: { resource, action }
        });

        if (!existing) {
          const permission = await prisma.permission.create({
            data: {
              name,
              slug,
              resource: resource.toLowerCase().trim(),
              action: action.toLowerCase().trim(),
              description: `Permission to ${action} ${resource}`
            }
          });
          results.push(permission);
        }
      } catch (error) {
        // Continue with next permission
      }
    }

    return results;
  }
}
