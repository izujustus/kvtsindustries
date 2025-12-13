
'use server';

import { z } from 'zod';
import { PrismaClient, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS (Unchanged) ---
const CustomerSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const InvoiceItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const InvoiceSchema = z.object({
  customerId: z.string(),
  date: z.string(),
  dueDate: z.string(),
  destination: z.string().optional(),
  loadingLocation: z.string().optional(),
  taxRate: z.coerce.number().min(0).default(7.5),
  logisticsFee: z.coerce.number().min(0).default(0),
  items: z.array(InvoiceItemSchema).min(1, "At least one item required"),
});

const PaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
});

// 1. CREATE CUSTOMER (Unchanged)
export async function createCustomer(prevState: any, formData: FormData) {
  const validated = CustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  });

  if (!validated.success) return { message: 'Validation Failed', success: false };

  try {
    await prisma.customer.create({ data: validated.data });
  } catch (e) {
    return { message: 'Database Error: Failed to create customer.', success: false };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Customer Created', success: true };
}

// 2. CREATE INVOICE (UPDATED: AUTO-APPLY CREDIT)
export async function createInvoice(prevState: any, formData: FormData) {
  const itemsJson = formData.get('items') as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];

  const validated = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    date: formData.get('date'),
    dueDate: formData.get('dueDate'),
    destination: formData.get('destination'),
    loadingLocation: formData.get('loadingLocation'),
    taxRate: formData.get('taxRate'),
    logisticsFee: formData.get('logisticsFee'),
    items: items,
  });

  if (!validated.success) return { message: 'Invalid Invoice Data', success: false };
  
  const { 
    customerId, date, dueDate, destination, loadingLocation, 
    taxRate, logisticsFee, items: invoiceItems 
  } = validated.data;

  // 1. Financial Calculations
  const subTotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subTotal * (taxRate / 100);
  const totalAmount = subTotal + taxAmount + logisticsFee;
  
  // Generate Invoice Number
  const yearShort = new Date().getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
  const invoiceNumber = `KVTS-${yearShort}-${randomSuffix}`;

  const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!baseCurrency) return { message: 'System Error: No Base Currency Set', success: false };

  try {
    await prisma.$transaction(async (tx) => {
      // 2. FETCH CUSTOMER TO CHECK CREDIT
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new Error("Customer not found");

      // Check if they have credit (Negative Balance)
      const currentBalance = Number(customer.currentBalance);
      let creditToApply = 0;

      if (currentBalance < 0) {
        const availableCredit = Math.abs(currentBalance);
        // We can only use as much credit as the invoice total
        creditToApply = Math.min(availableCredit, totalAmount);
      }

      // 3. Determine Initial Stats
      // If we used credit, the invoice starts as partially or fully paid
      const initialPaidAmount = creditToApply;
      const initialBalanceDue = totalAmount - creditToApply;
      const initialStatus = initialBalanceDue <= 0 ? 'PAID' : (initialPaidAmount > 0 ? 'PARTIALLY_PAID' : 'SENT');

      // 4. Create Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNumber,
          customerId,
          date: new Date(date),
          dueDate: new Date(dueDate),
          destination: destination || 'N/A',
          loadingLocation: loadingLocation || 'Enugu KVTS Industries',
          currencyId: baseCurrency.id,
          
          subTotal,
          taxRate,
          taxAmount,
          logisticsFee,
          totalAmount,
          
          // Apply the credit here
          paidAmount: initialPaidAmount, 
          balanceDue: initialBalanceDue,
          status: initialStatus,

          items: {
            create: invoiceItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              packageType: 'Piece',
              total: item.quantity * item.unitPrice
            }))
          }
        }
      });

      // 5. Update Customer Balance (Ledger Logic)
      // Regardless of credit use, we mathematically ADD the invoice total to their balance.
      // Example: Balance is -1000 (Credit). Invoice is 5000.
      // New Balance = -1000 + 5000 = 4000 (Debt). 
      // This is mathematically correct and requires no special "if" logic.
      await tx.customer.update({
        where: { id: customerId },
        data: { currentBalance: { increment: totalAmount } }
      });

      // 6. Deduct Inventory
      for (const item of invoiceItems) {
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            referenceId: invoice.id,
            date: new Date(date),
          }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stockOnHand: { decrement: item.quantity } }
        });
      }
    });
  } catch (e) {
    console.error(e);
    return { message: 'Transaction Failed', success: false };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Invoice Generated Successfully', success: true };
}

// 3. RECORD PAYMENT (Unchanged - Keeps overpayment logic)
export async function recordPayment(prevState: any, formData: FormData) {
  const validated = PaymentSchema.safeParse({
    invoiceId: formData.get('invoiceId'),
    amount: Number(formData.get('amount')),
    method: formData.get('method'),
    reference: formData.get('reference'),
  });

  if (!validated.success) return { message: 'Invalid Payment Data', success: false };
  const { invoiceId, amount, method, reference } = validated.data;

  const invoice = await prisma.salesInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { message: 'Invoice not found', success: false };

  const amountApplied = amount; 
  const unusedAmount = 0; 

  const newPaidAmount = Number(invoice.paidAmount) + amountApplied;
  const newStatus = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';

  try {
    await prisma.$transaction(async (tx) => {
      // Create Payment
      const payment = await tx.customerPayment.create({
        data: {
          paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
          customerId: invoice.customerId,
          currencyId: invoice.currencyId,
          amount: amount,
          unusedAmount: unusedAmount,
          method,
          reference,
          date: new Date(),
        }
      });

      // Link Payment
      await tx.paymentApplication.create({
        data: {
          paymentId: payment.id,
          invoiceId: invoice.id,
          amountApplied: amountApplied
        }
      });

      // Update Invoice
      await tx.salesInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: { increment: amountApplied },
          balanceDue: { decrement: amountApplied }, 
          status: newStatus
        }
      });

      // Update Customer Ledger
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { currentBalance: { decrement: amount } }
      });

    });
  } catch (e) {
    return { message: 'Payment processing failed.', success: false };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Payment Recorded.', success: true };
}