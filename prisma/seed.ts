// import { PrismaClient, Role } from '@prisma/client'
// import * as bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('🌱 Starting Database Seeding...')

//   // 1. Hash the password
//   // Default password for everyone: Freedom@2024
//   const password = "Freedom@2024"
//   const passwordHash = await bcrypt.hash(password, 12)

//   // 2. Define Users
//   const usersToCreate = [
//     {
//       role: Role.SUPER_ADMIN,
//       name: 'Super Administrator',
//       email: 'super_admin@kvtsindustries.com',
//     },
//     {
//       role: Role.ADMIN,
//       name: 'System Admin',
//       email: 'admin@kvtsindustries.com',
//     },
//     {
//       role: Role.ACCOUNTANT,
//       name: 'Chief Accountant',
//       email: 'accountant@kvtsindustries.com',
//     },
//     {
//       role: Role.PRODUCTION_MANAGER,
//       name: 'Production Head',
//       email: 'production@kvtsindustries.com',
//     },
//     {
//       role: Role.SALES_MANAGER,
//       name: 'Sales Manager',
//       email: 'sales@kvtsindustries.com',
//     },
//     {
//       role: Role.STORE_KEEPER,
//       name: 'Inventory Manager',
//       email: 'store@kvtsindustries.com',
//     },
//     {
//       role: Role.HR,
//       name: 'Human Resources',
//       email: 'hr@kvtsindustries.com',
//     },
//     {
//       role: Role.USER,
//       name: 'General Staff',
//       email: 'staff@kvtsindustries.com',
//     },
//   ]

//   // 3. Create Users
//   for (const user of usersToCreate) {
//     const upsertedUser = await prisma.user.upsert({
//       where: { email: user.email },
//       update: {
//         role: user.role,
//         name: user.name,
//         passwordHash: passwordHash, // Reset password
//         isActive: true,
//       },
//       create: {
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         passwordHash: passwordHash,
//         isActive: true,
//       },
//     })
//     console.log(`✅ User: ${upsertedUser.email} [${upsertedUser.role}]`)
//   }

//   // 4. Create Base Currency (CRITICAL for App Functionality)
//   // Without this, the Sales/HR pages will throw "No Base Currency" errors.
//   const baseCurrency = await prisma.currency.upsert({
//     where: { code: 'NGN' }, 
//     update: {},
//     create: {
//       code: 'NGN',
//       name: 'Nigerian Naira',
//       symbol: '₦',
//       isBaseCurrency: true,
//       isActive: true
//     }
//   })
//   console.log(`✅ Base Currency: ${baseCurrency.code}`)

//   // 5. Create System Settings (Optional but good for Invoice generation)
//   const settings = await prisma.systemSetting.findFirst();
//   if (!settings) {
//     await prisma.systemSetting.create({
//       data: {
//         companyName: 'KVTS INDUSTRIES CO., LTD.',
//         companyAddress: 'Plot 15 Industrial Layout, Emene, Enugu State',
//         defaultTaxRate: 7.5
//       }
//     });
//     console.log(`✅ System Settings Initialized`)
//   }

//   console.log('✨ Formatting & Seeding Completed.')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔥 Wiping Database Clean...')

  // 1. DELETE EVERYTHING (Order Matters! Delete Children first, then Parents)
  // This ensures we don't hit Foreign Key constraints errors.
  
  // Level 1: Deepest Children (Depend on others)
  await prisma.announcement.deleteMany()
  await prisma.payroll.deleteMany()
  await prisma.assetMaintenance.deleteMany()
  await prisma.productionDefect.deleteMany()
  await prisma.inventoryMovement.deleteMany() // Links to Products/Invoices
  await prisma.salesInvoiceItem.deleteMany()  // Links to Products/Invoices
  await prisma.paymentApplication.deleteMany() // Links to Payments/Invoices
  await prisma.journalEntryLine.deleteMany()   // Links to Journal/Accounts

  // Level 2: Transactional Tables
  await prisma.asset.deleteMany()
  await prisma.customerPayment.deleteMany()
  await prisma.salesInvoice.deleteMany()
  await prisma.productionReport.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.journalEntry.deleteMany()

  // Level 3: Master Data (Products, People, Accounts)
  await prisma.chartOfAccount.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.employee.deleteMany()
  
  // Level 4: Core Config (Users, Settings, Currencies)
  await prisma.systemSetting.deleteMany()
  await prisma.user.deleteMany()
  await prisma.currency.deleteMany()

  console.log('✅ Database Cleared.')
  console.log('🌱 Starting Fresh Seeding...')

  // 2. Hash the password
  const password = "Freedom@2024"
  const passwordHash = await bcrypt.hash(password, 12)

  // 3. Define Users
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

  // 4. Create Users (Using create because we just wiped the DB)
  for (const user of usersToCreate) {
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: passwordHash,
        isActive: true,
      },
    })
    console.log(`✅ User Created: ${newUser.email} [${newUser.role}]`)
  }

  // 5. Create Base Currency (Required for App to work)
  const baseCurrency = await prisma.currency.create({
    data: {
      code: 'NGN',
      name: 'Nigerian Naira',
      symbol: '₦',
      isBaseCurrency: true,
      isActive: true
    }
  })
  console.log(`✅ Base Currency Created: ${baseCurrency.code}`)

  // 6. Create Default System Settings
  await prisma.systemSetting.create({
    data: {
      companyName: 'KVTS INDUSTRIES CO., LTD.',
      companyAddress: 'Plot 15 Industrial Layout, Emene, Enugu State',
      defaultTaxRate: 7.5
    }
  });
  console.log(`✅ System Settings Initialized`)

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