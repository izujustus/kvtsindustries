'use server';

import { z } from 'zod';
import { PrismaClient, AccountType, ExpenseStatus, ExpensePaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
const AccountSchema = z.object({
  code: z.string().min(1, "Code required (e.g. 1000)"),
  name: z.string().min(1, "Name required"),
  type: z.nativeEnum(AccountType),
});

const JournalLineSchema = z.object({
  accountId: z.string(),
  debit: z.number().min(0),
  credit: z.number().min(0),
});

const JournalEntrySchema = z.object({
  date: z.string(),
  description: z.string().optional(),
  reference: z.string().optional(),
  lines: z.array(JournalLineSchema).min(2, "At least 2 lines required for double entry"),
});

const ExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().min(0.01),
  category: z.string(),
  paymentMethod: z.nativeEnum(ExpensePaymentMethod),
  date: z.string(),
  description: z.string().optional(),
});

// 1. CREATE CHART OF ACCOUNT
export async function createAccount(prevState: any, formData: FormData) {
  const validated = AccountSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    type: formData.get('type'),
  });

  if (!validated.success) return { message: 'Invalid Data' };

  try {
    await prisma.chartOfAccount.create({ data: validated.data });
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'Account Code already exists.' };
    return { message: 'Database Error' };
  }

  revalidatePath('/dashboard/accounting');
  return { message: 'Ledger Account Created', success: true };
}

// 2. POST MANUAL JOURNAL ENTRY (Strict Double Entry)
export async function createJournalEntry(prevState: any, formData: FormData) {
  const linesJson = formData.get('lines') as string;
  const lines = linesJson ? JSON.parse(linesJson) : [];

  const validated = JournalEntrySchema.safeParse({
    date: formData.get('date'),
    description: formData.get('description'),
    reference: formData.get('reference'),
    lines,
  });

  if (!validated.success) return { message: 'Invalid Entry Data' };
  const { date, description, reference, lines: entryLines } = validated.data;

  // Validation: DEBITS MUST EQUAL CREDITS
  const totalDebit = entryLines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = entryLines.reduce((sum, line) => sum + line.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return { message: `Imbalanced Entry! Debits: ${totalDebit}, Credits: ${totalCredit}` };
  }

  try {
    const entryNumber = `JE-${Date.now().toString().slice(-6)}`;
    
    // Base Currency ID (Simplified)
    const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
    if (!baseCurrency) return { message: 'No Base Currency Configured' };

    await prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(date),
        description,
        reference,
        posted: true,
        createdById: formData.get('userId') as string,
        lines: {
          create: entryLines.map(line => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit
          }))
        }
      }
    });
  } catch (e) {
    return { message: 'Failed to post journal entry.' };
  }

  revalidatePath('/dashboard/accounting');
  return { message: 'Journal Entry Posted', success: true };
}

// 3. SUBMIT EXPENSE
export async function createExpense(prevState: any, formData: FormData) {
  const validated = ExpenseSchema.safeParse({
    title: formData.get('title'),
    amount: Number(formData.get('amount')),
    category: formData.get('category'),
    paymentMethod: formData.get('paymentMethod'),
    date: formData.get('date'),
    description: formData.get('description'),
  });

  if (!validated.success) return { message: 'Validation Failed' };
  
  // Base Currency ID
  const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!baseCurrency) return { message: 'System Error: No Base Currency' };

  try {
    await prisma.expense.create({
      data: {
        expenseCode: `EXP-${Date.now().toString().slice(-6)}`,
        title: validated.data.title,
        amount: validated.data.amount,
        category: validated.data.category,
        paymentMethod: validated.data.paymentMethod,
        incurredDate: new Date(validated.data.date),
        description: validated.data.description,
        currencyId: baseCurrency.id,
        status: 'PENDING',
      }
    });
  } catch (e) {
    return { message: 'Failed to submit expense.' };
  }

  revalidatePath('/dashboard/accounting');
  return { message: 'Expense Submitted for Approval', success: true };
}

// 4. APPROVE EXPENSE (Auto-Create Journal Entry)
export async function approveExpense(expenseId: string, approverId: string) {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.status !== 'PENDING') return { message: 'Invalid Expense' };

    // Get Accounting Mappings (Simplified: Needs a "Cash" and "Expense" account)
    // In a real app, you'd let the accountant choose the accounts. 
    // Here we auto-fetch based on naming convention for demo perfection.
    const expenseAccount = await prisma.chartOfAccount.findFirst({ where: { type: 'EXPENSE' } });
    const cashAccount = await prisma.chartOfAccount.findFirst({ where: { type: 'ASSET', code: '1000' } }); // Assuming 1000 is Cash

    if (!expenseAccount || !cashAccount) return { message: 'COA Setup Incomplete: Need Expense & Cash accounts.' };

    await prisma.$transaction(async (tx) => {
      // A. Update Expense Status
      await tx.expense.update({
        where: { id: expenseId },
        data: { status: 'APPROVED', approvedById: approverId }
      });

      // B. Auto-Post Journal Entry
      await tx.journalEntry.create({
        data: {
          entryNumber: `JE-EXP-${expense.expenseCode}`,
          date: new Date(),
          description: `Auto-generated for Expense: ${expense.title}`,
          reference: expense.expenseCode,
          posted: true,
          createdById: approverId,
          lines: {
            create: [
              { accountId: expenseAccount.id, debit: expense.amount, credit: 0 }, // Debit Expense
              { accountId: cashAccount.id, debit: 0, credit: expense.amount }     // Credit Cash
            ]
          }
        }
      });
    });
  } catch (e) {
    return { message: 'Approval Failed' };
  }
  revalidatePath('/dashboard/accounting');
  return { message: 'Expense Approved & Posted', success: true };
}