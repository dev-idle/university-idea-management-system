/// <reference types="jest" />
/** E2E mock for Prisma client (avoids loading ESM-generated code in Jest). */
export const PrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
}));
