import { PrismaClient } from '../src/generated/ivendor_reborn';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Cleaning database...');
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Create Permissions
  console.log('📝 Creating permissions...');
  const resources = ['users', 'roles', 'permissions', 'dashboard', 'settings', 'reports'];
  const actions = ['create', 'read', 'update', 'delete', 'view'];

  const permissions = [];
  for (const resource of resources) {
    for (const action of actions) {
      const permission = await prisma.permission.create({
        data: {
          name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
          slug: `${resource}.${action}`,
          resource: resource,
          action: action,
          description: `Permission to ${action} ${resource}`
        }
      });
      permissions.push(permission);
    }
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Roles
  console.log('👥 Creating roles...');
  
  // Super Admin Role - Full access
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access with all permissions'
    }
  });

  // Assign all permissions to super admin
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        role_id: superAdminRole.id,
        permission_id: permission.id
      }
    });
  }

  // Admin Role - Most access
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with most permissions'
    }
  });

  // Assign most permissions to admin (exclude some critical permissions)
  const adminPermissions = permissions.filter(p => 
    !p.slug.includes('roles.delete') && 
    !p.slug.includes('permissions.delete')
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        role_id: adminRole.id,
        permission_id: permission.id
      }
    });
  }

  // Manager Role - Limited management access
  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      slug: 'manager',
      description: 'Management access with limited permissions'
    }
  });

  // Assign read and view permissions to manager
  const managerPermissions = permissions.filter(p => 
    p.action === 'read' || 
    p.action === 'view' || 
    (p.resource === 'reports' && (p.action === 'create' || p.action === 'update'))
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.create({
      data: {
        role_id: managerRole.id,
        permission_id: permission.id
      }
    });
  }

  // User Role - Basic access
  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      slug: 'user',
      description: 'Basic user access'
    }
  });

  // Assign view and read dashboard permissions to user
  const userPermissions = permissions.filter(p => 
    (p.resource === 'dashboard' && p.action === 'view') ||
    (p.resource === 'reports' && p.action === 'view')
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.create({
      data: {
        role_id: userRole.id,
        permission_id: permission.id
      }
    });
  }

  console.log('✅ Created 4 roles');

  // Create Users
  console.log('👤 Creating users...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Super Admin User
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      is_active: true,
      email_verified_at: new Date()
    }
  });

  await prisma.userRole.create({
    data: {
      user_id: superAdmin.id,
      role_id: superAdminRole.id
    }
  });

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      is_active: true,
      email_verified_at: new Date()
    }
  });

  await prisma.userRole.create({
    data: {
      user_id: admin.id,
      role_id: adminRole.id
    }
  });

  // Manager User
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Manager User',
      is_active: true,
      email_verified_at: new Date()
    }
  });

  await prisma.userRole.create({
    data: {
      user_id: manager.id,
      role_id: managerRole.id
    }
  });

  // Regular User
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Regular User',
      is_active: true,
      email_verified_at: new Date()
    }
  });

  await prisma.userRole.create({
    data: {
      user_id: regularUser.id,
      role_id: userRole.id
    }
  });

  console.log('✅ Created 4 users');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Default Users:');
  console.log('-----------------------------------');
  console.log('Super Admin:');
  console.log('  Email: superadmin@example.com');
  console.log('  Password: Password123!');
  console.log('\nAdmin:');
  console.log('  Email: admin@example.com');
  console.log('  Password: Password123!');
  console.log('\nManager:');
  console.log('  Email: manager@example.com');
  console.log('  Password: Password123!');
  console.log('\nUser:');
  console.log('  Email: user@example.com');
  console.log('  Password: Password123!');
  console.log('-----------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
