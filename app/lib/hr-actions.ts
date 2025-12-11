'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
const EmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  department: z.string().min(1),
  position: z.string().min(1),
  basicSalary: z.coerce.number().min(0),
  hireDate: z.string(),
});

const PayrollComponentSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().min(0),
  type: z.enum(['EARNING', 'DEDUCTION']),
});

const PayrollSchema = z.object({
  employeeId: z.string(),
  payPeriodStart: z.string(),
  payPeriodEnd: z.string(),
  components: z.array(PayrollComponentSchema),
});

// 1. CREATE EMPLOYEE
export async function createEmployee(prevState: any, formData: FormData) {
  const validated = EmployeeSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    department: formData.get('department'),
    position: formData.get('position'),
    basicSalary: formData.get('basicSalary'),
    hireDate: formData.get('hireDate'),
  });

  if (!validated.success) return { message: 'Validation Failed' };
  const data = validated.data;

  // Auto-generate Employee Number (EMP-001)
  const count = await prisma.employee.count();
  const employeeNumber = `EMP-${String(count + 1).padStart(3, '0')}`;

  // Get Default Currency
  const currency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!currency) return { message: 'No Base Currency Found' };

  try {
    await prisma.employee.create({
      data: {
        employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        department: data.department,
        position: data.position,
        basicSalary: data.basicSalary,
        hireDate: new Date(data.hireDate),
        currencyId: currency.id,
        status: 'ACTIVE',
      }
    });
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'Email already exists' };
    return { message: 'Database Error' };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Employee Hired Successfully', success: true };
}

// 2. RUN PAYROLL (Complex Calculation)
export async function createPayroll(prevState: any, formData: FormData) {
  const componentsJson = formData.get('components') as string;
  const components = componentsJson ? JSON.parse(componentsJson) : [];

  const validated = PayrollSchema.safeParse({
    employeeId: formData.get('employeeId'),
    payPeriodStart: formData.get('payPeriodStart'),
    payPeriodEnd: formData.get('payPeriodEnd'),
    components,
  });

  if (!validated.success) return { message: 'Invalid Payroll Data' };
  const { employeeId, payPeriodStart, payPeriodEnd, components: comps } = validated.data;

  // Fetch Employee for Basic Salary
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) return { message: 'Employee not found' };

  // Calculate Totals
  const basicSalary = Number(employee.basicSalary);
  const totalAllowances = comps
    .filter(c => c.type === 'EARNING')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const totalDeductions = comps
    .filter(c => c.type === 'DEDUCTION')
    .reduce((sum, c) => sum + c.amount, 0);

  const netPay = basicSalary + totalAllowances - totalDeductions;

  try {
    await prisma.payroll.create({
      data: {
        employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        basicSalary,
        totalAllowances,
        totalDeductions,
        netPay,
        currencyId: employee.currencyId,
        status: 'PROCESSED',
        paymentDate: new Date(),
        components: {
          create: comps.map(c => ({
            name: c.name,
            type: c.type,
            amount: c.amount
          }))
        }
      }
    });
  } catch (e) {
    return { message: 'Failed to process payroll' };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Payroll Processed Successfully', success: true };
}