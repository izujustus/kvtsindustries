'use server';

import { PrismaClient, ProformaStatus, InvoiceStatus } from '@prisma/client'; // [FIX] Imported Enums
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// 1. CREATE / UPDATE PROFORMA
export async function saveProforma(prevState: any, formData: FormData) {
  const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!baseCurrency) return { success: false, message: 'System Error: No Base Currency.' };

  // Fetch System User ID for Creator Link (Fallback)
  const systemUser = await prisma.user.findFirst();
  if (!systemUser) return { success: false, message: 'System Error: No Users found.' };

  const id = formData.get('id') as string;
  const customerId = formData.get('customerId') as string;
  const itemsJson = formData.get('items') as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];

  if (!items.length) return { success: false, message: 'No items added.' };

  // Financials
  const subTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const taxRate = 7.5; 
  const taxAmount = subTotal * (taxRate / 100);
  const totalAmount = subTotal + taxAmount;

  try {
    // [FIX] Clean Payload: Removed 'createdById' to avoid conflicts
    const dataPayload = {
      customerId,
      currencyId: baseCurrency.id,
      date: new Date(formData.get('date') as string),
      expiryDate: new Date(formData.get('expiryDate') as string),
      status: ProformaStatus.DRAFT, // [FIX] Use Enum, not string
      notes: formData.get('notes') as string,
      
      subTotal,
      taxAmount,
      totalAmount,
    };

    if (id) {
        // UPDATE EXISTING
        await prisma.proformaInvoice.update({
            where: { id },
            data: {
                ...dataPayload,
                items: {
                    deleteMany: {},
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                        description: item.description
                    }))
                }
            }
        })
    } else {
        // CREATE NEW
        const yearShort = new Date().getFullYear().toString().slice(-2);
        const rand = Math.floor(1000 + Math.random() * 9000);
        
        await prisma.proformaInvoice.create({
            data: {
                ...dataPayload,
                proformaNumber: `PROF-${yearShort}-${rand}`,
                createdById: systemUser.id, // [FIX] Use Scalar ID directly
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.quantity * item.unitPrice,
                        description: item.description
                    }))
                },
            }
        });
    }

    revalidatePath('/dashboard/sales/proforma');
    return { success: true, message: 'Proforma Saved Successfully' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to save Proforma' };
  }
}

// 2. CONVERT TO DRAFT INVOICE
export async function convertProformaToDraft(proformaId: string) {
    try {
        const proforma = await prisma.proformaInvoice.findUnique({
            where: { id: proformaId },
            include: { items: true }
        });

        if (!proforma) return { success: false, message: 'Proforma not found' };

        await prisma.$transaction(async (tx) => {
            // A. Create the Draft Invoice
            await tx.salesInvoice.create({
                data: {
                    customerId: proforma.customerId,
                    currencyId: proforma.currencyId,
                    date: new Date(),
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
                    status: InvoiceStatus.DRAFT, // [FIX] Use Enum
                    isPosted: false, 
                    
                    subTotal: proforma.subTotal,
                    taxAmount: proforma.taxAmount,
                    taxRate: 7.5,
                    totalAmount: proforma.totalAmount,
                    balanceDue: proforma.totalAmount,
                    
                    fromProformaId: proforma.id,
                    
                    items: {
                        create: proforma.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                            packageType: 'Piece'
                        }))
                    }
                }
            });

            // B. Update Proforma Status
            await tx.proformaInvoice.update({
                where: { id: proformaId },
                data: { status: ProformaStatus.CONVERTED_TO_INVOICE } // [FIX] Use Enum
            });
        });

        revalidatePath('/dashboard/sales/proforma');
        revalidatePath('/dashboard/sales'); 
        return { success: true, message: 'Converted to Draft Invoice' };
    } catch (e) {
        return { success: false, message: 'Conversion Failed' };
    }
}

// 3. DELETE
export async function deleteProforma(id: string) {
    try {
        await prisma.proformaInvoice.delete({ where: { id } });
        revalidatePath('/dashboard/sales/proforma');
        return { success: true, message: 'Deleted' };
    } catch (e) {
        return { success: false, message: 'Delete Failed' };
    }
}