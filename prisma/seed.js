// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPass = await bcrypt.hash('Admin@1234', 12);
  const userPass  = await bcrypt.hash('User@1234', 12);

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@example.com' },
    update: {},
    create: {
      name:          'Admin User',
      email:         'admin@example.com',
      password:      adminPass,
      role:          'ADMIN',
      emailVerified: true,
    },
  });

  const user = await prisma.user.upsert({
    where:  { email: 'user@example.com' },
    update: {},
    create: {
      name:          'Test User',
      email:         'user@example.com',
      password:      userPass,
      role:          'USER',
      emailVerified: true,
    },
  });

  await prisma.task.createMany({
    data: [
      { title: 'Set up project structure',   status: 'COMPLETED',   userId: admin.id, description: 'Initialize repo with Express + Prisma' },
      { title: 'Implement JWT auth',          status: 'COMPLETED',   userId: admin.id, description: 'Login, register, protected routes' },
      { title: 'Add Redis caching',           status: 'IN_PROGRESS', userId: user.id,  description: 'Cache GET /tasks with 60s TTL' },
      { title: 'Write API documentation',     status: 'PENDING',     userId: user.id,  description: 'Document all endpoints in Swagger' },
      { title: 'Set up CI/CD pipeline',       status: 'PENDING',     userId: user.id,  description: 'GitHub Actions with test + lint' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete');
  console.log('   Admin → admin@example.com / Admin@1234');
  console.log('   User  → user@example.com  / User@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
