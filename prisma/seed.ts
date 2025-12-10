import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Seeding...')

  // 1. Hash the password once
  // This ensures all users have the same hashed password in the DB
  const password = "Freedom@2024"
  const passwordHash = await bcrypt.hash(password, 12)

  // 2. Define the users to create based on your Enum
  const usersToCreate = [
    {
      role: Role.SUPER_ADMIN,
      name: 'Super Administrator',
      email: 'super_admin@kvtsindustries.com',
    },
    {
      role: Role.ADMIN,
      name: 'System Admin',
      email: 'admin@kvtsindustries.com',
    },
    {
      role: Role.ACCOUNTANT,
      name: 'Chief Accountant',
      email: 'accountant@kvtsindustries.com',
    },
    {
      role: Role.PRODUCTION_MANAGER,
      name: 'Production Head',
      email: 'production@kvtsindustries.com',
    },
    {
      role: Role.SALES_MANAGER,
      name: 'Sales Manager',
      email: 'sales@kvtsindustries.com',
    },
    {
      role: Role.STORE_KEEPER,
      name: 'Inventory Manager',
      email: 'store@kvtsindustries.com',
    },
    {
      role: Role.HR,
      name: 'Human Resources',
      email: 'hr@kvtsindustries.com',
    },
    {
      role: Role.USER,
      name: 'General Staff',
      email: 'staff@kvtsindustries.com',
    },
  ]

  // 3. Loop through and create/update each user
  for (const user of usersToCreate) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        // If user exists, we just reset their role and name to be sure
        role: user.role,
        name: user.name,
        passwordHash: passwordHash, // Reset password to default if re-seeded
        isActive: true,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: passwordHash,
        isActive: true,
      },
    })
    
    console.log(`✅ Created/Updated user: ${upsertedUser.email} [${upsertedUser.role}]`)
  }

  // 4. (Optional) Seed a Base Currency so the app doesn't crash on financial views
  const baseCurrency = await prisma.currency.upsert({
    where: { code: 'NGN' }, // Assuming Nigerian Naira based on your previous messages, or change to USD
    update: {},
    create: {
      code: 'NGN',
      name: 'Nigerian Naira',
      symbol: '₦',
      isBaseCurrency: true,
      isActive: true
    }
  })
  console.log(`✅ Created Base Currency: ${baseCurrency.code}`)

  console.log('✨ Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })