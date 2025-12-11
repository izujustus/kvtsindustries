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
  // UPDATE: Now expects ID strings for relations
  departmentId: z.string().min(1, "Department is required"),
  subDepartmentId: z.string().optional(),
  position: z.string().min(1),
  basicSalary: z.coerce.number().min(0),
  hireDate: z.string(),
  dateOfBirth: z.string().optional(),
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
  // Extract and validate
  const validated = EmployeeSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    // Map the form fields 'department' and 'subDepartment' to our schema IDs
    departmentId: formData.get('department'), 
    subDepartmentId: formData.get('subDepartment'),
    position: formData.get('position'),
    basicSalary: formData.get('basicSalary'),
    hireDate: formData.get('hireDate'),
    dateOfBirth: formData.get('dateOfBirth'),
  });

  if (!validated.success) {
    return { message: 'Validation Failed: Missing required fields' };
  }
  
  const data = validated.data;

  // Auto-generate Employee Number (EMP-001)
  const count = await prisma.employee.count();
  const employeeNumber = `EMP-${String(count + 1).padStart(3, '0')}`;

  // Get Default Currency
  const currency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!currency) return { message: 'No Base Currency Found. Please run seed.' };

  try {
    await prisma.employee.create({
      data: {
        employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        
        // --- RELATIONSHIPS ---
        // Connect to the Department Table using the ID
        departmentId: data.departmentId,
        // Connect to SubDepartment if provided (handle empty string as null)
        subDepartmentId: data.subDepartmentId || null,
        
        position: data.position,
        basicSalary: data.basicSalary,
        hireDate: new Date(data.hireDate),
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        currencyId: currency.id,
        status: 'ACTIVE',
      }
    });
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return { message: 'Email already exists' };
    if (e.code === 'P2003') return { message: 'Invalid Department selected' }; // Foreign Key Error
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

// ... existing imports and code

// 3. UPDATE EMPLOYEE STATUS (Fire, Suspend, etc.)
export async function updateEmployeeStatus(prevState: any, formData: FormData) {
  const employeeId = formData.get('employeeId') as string;
  const newStatus = formData.get('status') as string;

  if (!employeeId || !newStatus) return { message: 'Missing fields' };

  try {
    await prisma.employee.update({
      where: { id: employeeId },
      data: { 
        status: newStatus as any // Cast string to Enum
      }
    });
  } catch (e) {
    return { message: 'Failed to update status' };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Employee Status Updated', success: true };
}