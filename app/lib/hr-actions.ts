// 'use server';

// import { z } from 'zod';
// import { PrismaClient } from '@prisma/client';
// import { revalidatePath } from 'next/cache';
// import { EmployeeStatus } from '@prisma/client'; 

// const prisma = new PrismaClient();

// // --- SCHEMAS ---
// const EmployeeSchema = z.object({
//   firstName: z.string().min(1),
//   lastName: z.string().min(1),
//   email: z.string().email().optional().or(z.literal('')),
//   phone: z.string().optional(),
//   // UPDATE: Now expects ID strings for relations
//   departmentId: z.string().min(1, "Department is required"),
//   subDepartmentId: z.string().optional(),
//   position: z.string().min(1),
//   basicSalary: z.coerce.number().min(0),
//   hireDate: z.string(),
//   dateOfBirth: z.string().optional(),
// });

// const PayrollComponentSchema = z.object({
//   name: z.string().min(1),
//   amount: z.coerce.number().min(0),
//   type: z.enum(['EARNING', 'DEDUCTION']),
// });

// const PayrollSchema = z.object({
//   employeeId: z.string(),
//   payPeriodStart: z.string(),
//   payPeriodEnd: z.string(),
//   components: z.array(PayrollComponentSchema),
// });

// // 1. CREATE EMPLOYEE
// export async function createEmployee(prevState: any, formData: FormData) {
//   // Extract and validate
//   const validated = EmployeeSchema.safeParse({
//     firstName: formData.get('firstName'),
//     lastName: formData.get('lastName'),
//     email: formData.get('email'),
//     phone: formData.get('phone'),
//     // Map the form fields 'department' and 'subDepartment' to our schema IDs
//     departmentId: formData.get('department'), 
//     subDepartmentId: formData.get('subDepartment'),
//     position: formData.get('position'),
//     basicSalary: formData.get('basicSalary'),
//     hireDate: formData.get('hireDate'),
//     dateOfBirth: formData.get('dateOfBirth'),
//   });

//   if (!validated.success) {
//     return { message: 'Validation Failed: Missing required fields' };
//   }
  
//   const data = validated.data;

//   // Auto-generate Employee Number (EMP-001)
//   const count = await prisma.employee.count();
//   const employeeNumber = `EMP-${String(count + 1).padStart(3, '0')}`;

//   // Get Default Currency
//   const currency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
//   if (!currency) return { message: 'No Base Currency Found. Please run seed.' };

//   try {
//     await prisma.employee.create({
//       data: {
//         employeeNumber,
//         firstName: data.firstName,
//         lastName: data.lastName,
//         email: data.email || null,
//         phone: data.phone,
        
//         // --- RELATIONSHIPS ---
//         // Connect to the Department Table using the ID
//         departmentId: data.departmentId,
//         // Connect to SubDepartment if provided (handle empty string as null)
//         subDepartmentId: data.subDepartmentId || null,
        
//         position: data.position,
//         basicSalary: data.basicSalary,
//         hireDate: new Date(data.hireDate),
//         dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
//         currencyId: currency.id,
//         status: 'ACTIVE',
//       }
//     });
//   } catch (e: any) {
//     console.error(e);
//     if (e.code === 'P2002') return { message: 'Email already exists' };
//     if (e.code === 'P2003') return { message: 'Invalid Department selected' }; // Foreign Key Error
//     return { message: 'Database Error' };
//   }

//   revalidatePath('/dashboard/hr');
//   return { message: 'Employee Hired Successfully', success: true };
// }

// // 2. RUN PAYROLL (Complex Calculation)
// export async function createPayroll(prevState: any, formData: FormData) {
//   const componentsJson = formData.get('components') as string;
//   const components = componentsJson ? JSON.parse(componentsJson) : [];

//   const validated = PayrollSchema.safeParse({
//     employeeId: formData.get('employeeId'),
//     payPeriodStart: formData.get('payPeriodStart'),
//     payPeriodEnd: formData.get('payPeriodEnd'),
//     components,
//   });

//   if (!validated.success) return { message: 'Invalid Payroll Data' };
//   const { employeeId, payPeriodStart, payPeriodEnd, components: comps } = validated.data;

//   // Fetch Employee for Basic Salary
//   const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
//   if (!employee) return { message: 'Employee not found' };

//   // Calculate Totals
//   const basicSalary = Number(employee.basicSalary);
//   const totalAllowances = comps
//     .filter(c => c.type === 'EARNING')
//     .reduce((sum, c) => sum + c.amount, 0);
  
//   const totalDeductions = comps
//     .filter(c => c.type === 'DEDUCTION')
//     .reduce((sum, c) => sum + c.amount, 0);

//   const netPay = basicSalary + totalAllowances - totalDeductions;

//   try {
//     await prisma.payroll.create({
//       data: {
//         employeeId,
//         payPeriodStart: new Date(payPeriodStart),
//         payPeriodEnd: new Date(payPeriodEnd),
//         basicSalary,
//         totalAllowances,
//         totalDeductions,
//         netPay,
//         currencyId: employee.currencyId,
//         status: 'PROCESSED',
//         paymentDate: new Date(),
//         components: {
//           create: comps.map(c => ({
//             name: c.name,
//             type: c.type,
//             amount: c.amount
//           }))
//         }
//       }
//     });
//   } catch (e) {
//     return { message: 'Failed to process payroll' };
//   }

//   revalidatePath('/dashboard/hr');
//   return { message: 'Payroll Processed Successfully', success: true };
// }

// // ... existing imports and code

// // 3. UPDATE EMPLOYEE STATUS (Fire, Suspend, etc.)


// // ... imports including EmployeeStatus


// // 3. UPDATE EMPLOYEE STATUS (With History Logging)
// export async function updateEmployeeStatus(prevState: any, formData: FormData) {
//   const employeeId = formData.get('employeeId') as string;
//   const newStatus = formData.get('status') as EmployeeStatus; // Ensure type safety

//   if (!employeeId || !newStatus) return { message: 'Missing fields' };

//   try {
//     // 1. Fetch current employee to get the OLD status
//     const currentEmployee = await prisma.employee.findUnique({
//       where: { id: employeeId }
//     });

//     if (!currentEmployee) return { message: 'Employee not found' };
    
//     // If status hasn't changed, do nothing
//     if (currentEmployee.status === newStatus) {
//       return { message: 'Status is already set to ' + newStatus };
//     }

//     // 2. Perform Transaction: Update Employee AND Create Log
//     await prisma.$transaction([
//       prisma.employee.update({
//         where: { id: employeeId },
//         data: { status: newStatus }
//       }),
//       prisma.employeeStatusLog.create({
//         data: {
//           employeeId,
//           oldStatus: currentEmployee.status,
//           newStatus: newStatus
//         }
//       })
//     ]);

//   } catch (e) {
//     return { message: 'Failed to update status' };
//   }

//   revalidatePath('/dashboard/hr');
//   return { message: 'Status Updated & Logged', success: true };
// }



'use server';

import { z } from 'zod';
import { PrismaClient, EmploymentType, Gender, EmployeeStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
const EmployeeSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),

  emergencyContactName: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),

  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),

  departmentId: z.string().min(1, "Department is required"),
  subDepartmentId: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  hireDate: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  workSchedule: z.string().optional().nullable(),
  basicSalary: z.coerce.number().optional().nullable(),
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
  const rawData: Record<string, any> = Object.fromEntries(formData.entries());

  // Clean empty strings to null
  Object.keys(rawData).forEach(key => {
    if (rawData[key] === '') rawData[key] = null;
  });

  const validated = EmployeeSchema.safeParse(rawData);
  
  if (!validated.success) {
    const errorMsg = validated.error.issues.map(e => e.message).join(', ');
    return { message: `Validation Error: ${errorMsg}`, success: false };
  }
  
  const data = validated.data;

  try {
    const count = await prisma.employee.count();
    const employeeNumber = `EMP-${String(count + 1).padStart(3, '0')}`;
    
    // Fetch Base Currency (Required)
    const currency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
    if (!currency) return { message: 'System Error: No Base Currency configured.', success: false };

    // Prepare Create Data Object
    const createData: any = {
      employeeNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      imageUrl: data.imageUrl,
      
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender ? (data.gender as Gender) : null,
      nationality: data.nationality,

      emergencyContactName: data.emergencyContactName,
      emergencyContactRelation: data.emergencyContactRelation,
      emergencyContactPhone: data.emergencyContactPhone,

      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
      bankBranch: data.bankBranch,

      position: data.position || 'TBD',
      hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
      employmentType: (data.employmentType as EmploymentType) || 'FULL_TIME',
      workSchedule: data.workSchedule,
      basicSalary: data.basicSalary || 0,
      status: 'ACTIVE',
      
      // Relations
      currency: { connect: { id: currency.id } },
      department: { connect: { id: data.departmentId } },
    };

    // Only connect subDepartment if it exists
    if (data.subDepartmentId) {
      createData.subDepartment = { connect: { id: data.subDepartmentId } };
    }

    await prisma.employee.create({ data: createData });

  } catch (e: any) {
    console.error("Create Employee Error:", e);
    if (e.code === 'P2002') return { message: 'Employee with this Email or Number already exists.', success: false };
    return { message: 'Database Error: Failed to create employee.', success: false };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Employee Hired Successfully', success: true };
}

// 2. UPDATE EMPLOYEE
export async function updateEmployee(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) return { message: 'Missing Employee ID', success: false };

  const rawData: Record<string, any> = Object.fromEntries(formData.entries());
  const updateData: any = {};

  // Fields allowed to update
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'address', 'nationality',
    'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
    'bankName', 'bankAccountNumber', 'bankAccountName', 'bankBranch',
    'departmentId', 'subDepartmentId', 'position', 'workSchedule', 'imageUrl'
  ];

  fields.forEach(f => {
    const val = rawData[f];
    // Only update if field is present in formData. Convert empty strings to null.
    if (val !== undefined) updateData[f] = val === '' ? null : val;
  });

  // Type Conversions
  if (rawData.dateOfBirth !== undefined) updateData.dateOfBirth = rawData.dateOfBirth ? new Date(rawData.dateOfBirth as string) : null;
  if (rawData.hireDate !== undefined) updateData.hireDate = rawData.hireDate ? new Date(rawData.hireDate as string) : null;
  if (rawData.basicSalary !== undefined) updateData.basicSalary = rawData.basicSalary ? Number(rawData.basicSalary) : 0;
  if (rawData.gender !== undefined) updateData.gender = rawData.gender === '' ? null : rawData.gender;
  if (rawData.employmentType !== undefined) updateData.employmentType = rawData.employmentType;

  // Prevent nulling required fields if they are sent as empty strings
  if (!updateData.firstName) delete updateData.firstName;
  if (!updateData.lastName) delete updateData.lastName;

  // --- RELATION HANDLING ---
  // We must destructure IDs and use `connect` logic
  const { departmentId, subDepartmentId, ...scalarData } = updateData;
  const prismaUpdateData = { ...scalarData };

  // 1. Department (Required Relation)
  if (departmentId) {
    prismaUpdateData.department = { connect: { id: departmentId } };
  }

  // 2. SubDepartment (Optional Relation)
  if (subDepartmentId !== undefined) {
    if (subDepartmentId) {
      prismaUpdateData.subDepartment = { connect: { id: subDepartmentId } };
    } else {
      // Explicitly disconnect if user selects "None" or sends empty value
      prismaUpdateData.subDepartment = { disconnect: true };
    }
  }

  try {
    await prisma.employee.update({
      where: { id },
      data: prismaUpdateData
    });
  } catch (e) {
    console.error("Update Employee Error:", e);
    return { message: 'Update Failed. Check server logs.', success: false };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Profile Updated', success: true };
}

// 3. RUN PAYROLL
export async function createPayroll(prevState: any, formData: FormData) {
  const componentsJson = formData.get('components') as string;
  const components = componentsJson ? JSON.parse(componentsJson) : [];

  const validated = PayrollSchema.safeParse({
    employeeId: formData.get('employeeId'),
    payPeriodStart: formData.get('payPeriodStart'),
    payPeriodEnd: formData.get('payPeriodEnd'),
    components,
  });

  if (!validated.success) return { message: 'Invalid Payroll Data', success: false };
  const { employeeId, payPeriodStart, payPeriodEnd, components: comps } = validated.data;

  try {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return { message: 'Employee not found', success: false };

    const basicSalary = Number(employee.basicSalary);
    const totalAllowances = comps
      .filter(c => c.type === 'EARNING')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalDeductions = comps
      .filter(c => c.type === 'DEDUCTION')
      .reduce((sum, c) => sum + c.amount, 0);

    const netPay = basicSalary + totalAllowances - totalDeductions;

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
    console.error(e);
    return { message: 'Failed to process payroll', success: false };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Payroll Processed Successfully', success: true };
}

// 4. UPDATE STATUS
export async function updateEmployeeStatus(prevState: any, formData: FormData) {
  const employeeId = formData.get('employeeId') as string;
  const newStatus = formData.get('status') as EmployeeStatus;

  if (!employeeId || !newStatus) return { message: 'Missing fields', success: false };

  try {
    const currentEmployee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!currentEmployee) return { message: 'Employee not found', success: false };
    
    if (currentEmployee.status === newStatus) {
      return { message: 'Status is already set to ' + newStatus, success: false };
    }

    await prisma.$transaction([
      prisma.employee.update({
        where: { id: employeeId },
        data: { status: newStatus }
      }),
      prisma.employeeStatusLog.create({
        data: {
          employeeId,
          oldStatus: currentEmployee.status,
          newStatus: newStatus
        }
      })
    ]);

  } catch (e) {
    return { message: 'Failed to update status', success: false };
  }

  revalidatePath('/dashboard/hr');
  return { message: 'Status Updated & Logged', success: true };
}