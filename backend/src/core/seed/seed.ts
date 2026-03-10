/**
 * Seed: bootstraps Nest to use PrismaService (with adapter), then runs seed logic.
 * Invoked via: RUN_SEED=1 node -r dotenv/config dist/main.js  or  npm run prisma:seed
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../../common/crypto/password.util';
import type { PrismaClient } from '@generated/prisma';

const FIXED_ROLES = ['ADMIN', 'QA_MANAGER', 'QA_COORDINATOR', 'STAFF'] as const;
const DEFAULT_ADMIN_EMAIL = 'admin@gre.ac.uk';
const DEFAULT_ADMIN_PASSWORD = 'ChangeMeInProduction';
const DEFAULT_DEPARTMENT_NAMES = [
  'IT Services / System Administration Department',
  'Quality Assurance Office',
] as const;

async function seedRoles(prisma: PrismaClient): Promise<Map<string, string>> {
  const roleIds = new Map<string, string>();
  for (const name of FIXED_ROLES) {
    const role = await prisma.role.upsert({
      where: { name },
      create: { name },
      update: {},
      select: { id: true, name: true },
    });
    roleIds.set(role.name, role.id);
  }
  return roleIds;
}

async function seedDefaultDepartments(
  prisma: PrismaClient,
): Promise<string | null> {
  let firstDepartmentId: string | null = null;
  for (const name of DEFAULT_DEPARTMENT_NAMES) {
    const existing = await prisma.department.findFirst({
      where: { name },
      select: { id: true },
    });
    const id = existing
      ? existing.id
      : (await prisma.department.create({ data: { name }, select: { id: true } })).id;
    if (firstDepartmentId == null) firstDepartmentId = id;
  }
  return firstDepartmentId;
}

async function seedAdminUser(
  prisma: PrismaClient,
  roleIds: Map<string, string>,
  departmentId: string | null,
): Promise<void> {
  const adminRoleId = roleIds.get('ADMIN');
  if (!adminRoleId) throw new Error('ADMIN role not found');

  const email =
    process.env.ADMIN_SEED_EMAIL != null &&
    process.env.ADMIN_SEED_EMAIL.length > 0
      ? process.env.ADMIN_SEED_EMAIL
      : DEFAULT_ADMIN_EMAIL;
  const password =
    process.env.ADMIN_SEED_PASSWORD != null &&
    process.env.ADMIN_SEED_PASSWORD.length > 0
      ? process.env.ADMIN_SEED_PASSWORD
      : DEFAULT_ADMIN_PASSWORD;

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      roleId: adminRoleId,
      departmentId,
      isActive: true,
    },
    update: {
      passwordHash,
      roleId: adminRoleId,
      departmentId,
      isActive: true,
    },
  });
}

export async function runSeed(): Promise<void> {
  console.log('Seed: starting...');
  const ctx = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const prisma = ctx.get(PrismaService);

  try {
    const roleIds = await seedRoles(prisma);
    console.log('Seed: roles upserted:', [...roleIds.keys()]);
    const departmentId = await seedDefaultDepartments(prisma);
    console.log('Seed: default departments:', [...DEFAULT_DEPARTMENT_NAMES]);
    await seedAdminUser(prisma, roleIds, departmentId);
    const email = process.env.ADMIN_SEED_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL;
    console.log('Seed: admin user upserted:', email);
  } finally {
    await ctx.close();
  }
  console.log('Seed: done.');
}
