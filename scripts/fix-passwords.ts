import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user passwords...');

  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Update test user
  await prisma.user.update({
    where: { email: 'test@example.com' },
    data: { password: hashedPassword },
  });
  console.log('✅ Updated test user password');

  // Update admin user
  await prisma.admin.update({
    where: { email: 'admin@besthotelrates.com' },
    data: { password: hashedPassword },
  });
  console.log('✅ Updated admin password');

  console.log('\n🎉 All passwords fixed!');
  console.log('\n📝 Login Credentials:');
  console.log('   User: test@example.com / password123');
  console.log('   Admin: admin@besthotelrates.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());




