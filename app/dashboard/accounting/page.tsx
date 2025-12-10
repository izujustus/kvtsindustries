import { PrismaClient } from '@prisma/client';
// import { auth } from '@/auth';
import AccountingClientWrapper from './client-wrapper';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function AccountingPage() {
  const session = await auth();
  const userId = session?.user?.id || '';

  // 1. Fetch Chart of Accounts
  const rawAccounts = await prisma.chartOfAccount.findMany({
    orderBy: { code: 'asc' },
    include: {
      entries: { select: { debit: true, credit: true } }
    }
  });

  // TRANSFORM: Calculate Balance & Sanitizing Data
  // We strip out 'entries' after calculation so we don't pass Decimals to the client
  const accounts = rawAccounts.map(acc => {
    const totalDebit = acc.entries.reduce((sum, e) => sum + Number(e.debit), 0);
    const totalCredit = acc.entries.reduce((sum, e) => sum + Number(e.credit), 0);
    
    let balance = 0;
    if (['ASSET', 'EXPENSE'].includes(acc.type)) {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }
    
    // Return a clean object (Plain JSON)
    return { 
      id: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      balance 
    };
  });

  // 2. Fetch Journal Entries & Serialize
  const rawEntries = await prisma.journalEntry.findMany({
    take: 50,
    orderBy: { date: 'desc' },
    include: {
      lines: { include: { account: true } }
    }
  });

  // TRANSFORM: Convert Decimals to Numbers
  const journalEntries = rawEntries.map(entry => ({
    ...entry,
    lines: entry.lines.map(line => ({
      ...line,
      debit: line.debit.toNumber(),
      credit: line.credit.toNumber()
    }))
  }));

  // 3. Fetch Expenses & Serialize
  const rawExpenses = await prisma.expense.findMany({
    orderBy: { incurredDate: 'desc' },
    take: 50
  });

  // TRANSFORM: Convert Decimals to Numbers
  const expenses = rawExpenses.map(exp => ({
    ...exp,
    amount: exp.amount.toNumber(),
    // If you had taxAmount, you would convert it here too
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Accounting & General Ledger</h1>
      </div>

      <AccountingClientWrapper 
        accounts={accounts}
        journalEntries={journalEntries}
        expenses={expenses}
        userId={userId}
      />
    </div>
  );
}