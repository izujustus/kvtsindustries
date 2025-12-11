import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Database Seeding...')

  // 1. Hash the password
  // Default password for everyone: Freedom@2024
  const password = "Freedom@2024"
  const passwordHash = await bcrypt.hash(password, 12)

  // 2. Define Users
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

  // 3. Create Users
  for (const user of usersToCreate) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        name: user.name,
        passwordHash: passwordHash, // Reset password
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
    console.log(`✅ User: ${upsertedUser.email} [${upsertedUser.role}]`)
  }

  // 4. Create Base Currency (CRITICAL for App Functionality)
  // Without this, the Sales/HR pages will throw "No Base Currency" errors.
  const baseCurrency = await prisma.currency.upsert({
    where: { code: 'NGN' }, 
    update: {},
    create: {
      code: 'NGN',
      name: 'Nigerian Naira',
      symbol: '₦',
      isBaseCurrency: true,
      isActive: true
    }
  })
  console.log(`✅ Base Currency: ${baseCurrency.code}`)

  // 5. Create System Settings (Optional but good for Invoice generation)
  const settings = await prisma.systemSetting.findFirst();
  if (!settings) {
    await prisma.systemSetting.create({
      data: {
        companyName: 'KVTS INDUSTRIES CO., LTD.',
        companyAddress: 'Plot 15 Industrial Layout, Emene, Enugu State',
        defaultTaxRate: 7.5
      }
    });
    console.log(`✅ System Settings Initialized`)
  }

  console.log('✨ Formatting & Seeding Completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })