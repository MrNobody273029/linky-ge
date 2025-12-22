import { PrismaClient, Role, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('LinkyAdmin123!', 12);
  const userPassword = await bcrypt.hash('UserDemo123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@linky.ge' },
    update: {},
    create: {
      role: Role.ADMIN,
      username: 'admin',
      email: 'admin@linky.ge',
      passwordHash: adminPassword,
      fullAddress: 'Tbilisi, Vake, Demo street 1',
      phone: '+995555000000'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@linky.ge' },
    update: {},
    create: {
      role: Role.USER,
      username: 'giorgi',
      email: 'demo@linky.ge',
      passwordHash: userPassword,
      fullAddress: 'Tbilisi, Saburtalo, Demo block 2',
      phone: '+995555111222'
    }
  });

  // Create some demo requests/offers so the dashboard looks alive
  const req1 = await prisma.request.create({
    data: {
      userId: user.id,
      productUrl: 'https://alta.ge/phones/iphone-15-pro-max-256gb',
      titleHint: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      originalPrice: 3500,
      status: RequestStatus.OFFERED,
      offer: {
        create: {
          imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
          linkyPrice: 2900,
          etaDays: 7,
          note: 'Sourcing from EU. Includes delivery to your address.'
        }
      }
    }
  });

  await prisma.request.create({
    data: {
      userId: user.id,
      productUrl: 'https://zoomer.ge/audio/sony-wh-1000xm5',
      titleHint: 'Sony WH-1000XM5 Headphones',
      originalPrice: 950,
      status: RequestStatus.SCOUTING
    }
  });

  await prisma.request.create({
    data: {
      userId: user.id,
      productUrl: 'https://example.ge/lego/millennium-falcon',
      titleHint: 'LEGO Star Wars Millennium Falcon',
      originalPrice: 1550,
      status: RequestStatus.COMPLETED,
      offer: {
        create: {
          imageUrl: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=800&q=80',
          linkyPrice: 1290,
          etaDays: 10,
          note: 'Delivered successfully.'
        }
      }
    }
  });

  console.log('Seeded:', { adminEmail: admin.email, demoUserEmail: user.email, offeredRequestId: req1.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
