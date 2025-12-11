'use server';

import { z } from 'zod';
import { PrismaClient, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
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
  destination: z.string().optional(),     // NEW
  loadingLocation: z.string().optional(), // NEW
  items: z.array(InvoiceItemSchema).min(1, "At least one item required"),
});

const PaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0.01),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
});

// 1. CREATE CUSTOMER
export async function createCustomer(prevState: any, formData: FormData) {
  const validated = CustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
  });

  if (!validated.success) return { message: 'Validation Failed' };

  try {
    await prisma.customer.create({ data: validated.data });
  } catch (e) {
    return { message: 'Database Error: Failed to create customer.' };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Customer Created', success: true };
}

// 2. CREATE INVOICE (Deducts Stock + Creates Debt)
export async function createInvoice(prevState: any, formData: FormData) {
  const itemsJson = formData.get('items') as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];

  const validated = InvoiceSchema.safeParse({
    customerId: formData.get('customerId'),
    date: formData.get('date'),
    dueDate: formData.get('dueDate'),
    destination: formData.get('destination'),         // NEW
    loadingLocation: formData.get('loadingLocation'), // NEW
    items: items,
  });

  if (!validated.success) return { message: 'Invalid Invoice Data' };
  
  const { 
    customerId, 
    date, 
    dueDate, 
    destination, 
    loadingLocation, 
    items: invoiceItems 
  } = validated.data;

  // Calculate Total
  const totalAmount = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Generate Professional Invoice Number: KVTS-YY-XXXX
  const yearShort = new Date().getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const invoiceNumber = `KVTS-${yearShort}-${randomSuffix}`;

  // Default Currency (Get ID of Base Currency - NGN/USD)
  const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!baseCurrency) return { message: 'System Error: No Base Currency Set' };

  try {
    await prisma.$transaction(async (tx) => {
      // A. Create Invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          invoiceNumber,
          customerId,
          date: new Date(date),
          dueDate: new Date(dueDate),
          destination: destination || 'N/A',
          loadingLocation: loadingLocation || 'Enugu KVTS Industries',
          currencyId: baseCurrency.id,
          totalAmount,
          balanceDue: totalAmount, // Initially, full amount is due
          status: 'SENT',
          items: {
            create: invoiceItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              packageType: 'Piece', // You can make this dynamic later if needed
              total: item.quantity * item.unitPrice
            }))
          }
        }
      });

      // B. Update Customer Balance (Increase Debt)
      await tx.customer.update({
        where: { id: customerId },
        data: { currentBalance: { increment: totalAmount } }
      });

      // C. Deduct Inventory (Auto-issue goods)
      for (const item of invoiceItems) {
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity, // Negative for removal
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
    return { message: 'Transaction Failed: Could not save invoice.' };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Invoice Generated Successfully', success: true };
}

// 3. RECORD PAYMENT (The Overpayment Logic)
export async function recordPayment(prevState: any, formData: FormData) {
  const validated = PaymentSchema.safeParse({
    invoiceId: formData.get('invoiceId'),
    amount: Number(formData.get('amount')),
    method: formData.get('method'),
    reference: formData.get('reference'),
  });

  if (!validated.success) return { message: 'Invalid Payment Data' };
  const { invoiceId, amount, method, reference } = validated.data;

  const invoice = await prisma.salesInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { message: 'Invoice not found' };

  // Determine Amounts
  const amountNeeded = Number(invoice.balanceDue);
  const amountApplied = Math.min(amount, amountNeeded); // Can't pay more than due on the invoice link
  const overpayment = amount > amountNeeded ? (amount - amountNeeded) : 0;
  
  // Status Logic
  const newStatus = (Number(invoice.paidAmount) + amountApplied) >= Number(invoice.totalAmount) 
    ? 'PAID' 
    : 'PARTIALLY_PAID';

  try {
    await prisma.$transaction(async (tx) => {
      // A. Create Payment Record
      const payment = await tx.customerPayment.create({
        data: {
          paymentNumber: `PAY-${Date.now().toString().slice(-6)}`,
          customerId: invoice.customerId,
          currencyId: invoice.currencyId,
          amount: amount,
          unusedAmount: overpayment, // STORE OVERPAYMENT HERE
          method,
          reference,
          date: new Date(),
        }
      });

      // B. Link to Invoice
      if (amountApplied > 0) {
        await tx.paymentApplication.create({
          data: {
            paymentId: payment.id,
            invoiceId: invoice.id,
            amountApplied: amountApplied
          }
        });

        // C. Update Invoice Stats
        await tx.salesInvoice.update({
          where: { id: invoice.id },
          data: {
            paidAmount: { increment: amountApplied },
            balanceDue: { decrement: amountApplied },
            status: newStatus
          }
        });
      }

      // D. Update Customer Balance (Decrease Debt)
      // They paid 'amount' total, so their debt reduces by 'amount'
      // If they paid 150 for 100 debt, balance goes -50 (Credit)
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { currentBalance: { decrement: amount } }
      });

    });
  } catch (e) {
    return { message: 'Payment processing failed.' };
  }

  revalidatePath('/dashboard/sales');
  return { message: 'Payment Recorded. Overpayment logged if applicable.', success: true };
}