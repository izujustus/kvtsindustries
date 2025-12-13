// 'use server';

// import { PrismaClient } from '@prisma/client';
// import { revalidatePath } from 'next/cache';
// import { z } from 'zod';

// const prisma = new PrismaClient();

// // --- STAGE 1: DRAFT (Create/Edit freely, No Stock Deduction) ---
// // --- STAGE 1: DRAFT (Create/Edit freely, No Stock Deduction) ---
// export async function saveDraftInvoice(formData: FormData) {
//   // 1. Fetch the Base Currency (REQUIRED FIX)
//   const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
//   if (!baseCurrency) {
//     return { success: false, message: 'System Error: No Base Currency configured in settings.' };
//   }

//   // Parsing logic
//   const itemsJson = formData.get('items') as string;
//   const items = itemsJson ? JSON.parse(itemsJson) : [];
//   const customerId = formData.get('customerId') as string;
  
//   if (!items || items.length === 0) {
//     return { success: false, message: 'Cannot save draft without items.' };
//   }

//   // Calculate totals
//   const subTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
//   const taxRate = Number(formData.get('taxRate') || 0);
//   const logisticsFee = Number(formData.get('logisticsFee') || 0);
//   const taxAmount = subTotal * (taxRate / 100);
//   const totalAmount = subTotal + taxAmount + logisticsFee;

//   try {
//     await prisma.salesInvoice.create({
//       data: {
//         customerId,
        
//         // --- THE FIX: ADD CURRENCY ID ---
//         currencyId: baseCurrency.id, 
//         // --------------------------------

//         date: new Date(formData.get('date') as string),
//         dueDate: new Date(formData.get('dueDate') as string),
//         destination: formData.get('destination') as string || 'N/A',
//         loadingLocation: formData.get('loadingLocation') as string || 'Enugu KVTS Industries',
        
//         status: 'DRAFT', 
//         isPosted: false, 
//         invoiceNumber: null, // Allowed because we made it optional in schema
        
//         subTotal, 
//         taxRate, 
//         taxAmount, 
//         logisticsFee, 
//         totalAmount, 
//         balanceDue: totalAmount, // Draft starts with full balance due

//         items: {
//             create: items.map((item: any) => ({
//               productId: item.productId,
//               quantity: item.quantity,
//               unitPrice: item.unitPrice,
//               total: item.quantity * item.unitPrice,
//               packageType: 'Piece' // Default package type
//             }))
//         }
//       }
//     });
//     revalidatePath('/dashboard/sales');
//     return { success: true, message: 'Draft saved. Inventory not touched.' };
//   } catch (e) {
//     console.error(e);
//     return { success: false, message: 'Failed to save draft.' };
//   }
// }

// // --- STAGE 2: CONFIRMATION (Manager approves the content) ---
// export async function confirmInvoice(invoiceId: string) {
//   try {
//     await prisma.salesInvoice.update({
//       where: { id: invoiceId },
//       data: { status: 'PENDING_CONFIRMATION' } // Or jump straight to CONFIRMED based on your role
//     });
//     revalidatePath('/dashboard/sales');
//     return { success: true, message: 'Invoice submitted for confirmation.' };
//   } catch (e) {
//     return { success: false, message: 'Error confirming invoice.' };
//   }
// }

// // --- STAGE 3: GENERATION (The "Post" Action) ---
// // This is where we deduct stock, generate Number, and create Waybill
// export async function postAndGenerateInvoice(invoiceId: string, driverDetails: any) {
//   const invoice = await prisma.salesInvoice.findUnique({
//     where: { id: invoiceId },
//     include: { items: true }
//   });

//   if (!invoice || invoice.isPosted) return { success: false, message: 'Invalid Invoice' };

//   // 1. Generate Official Numbers
//   const yearShort = new Date().getFullYear().toString().slice(-2);
//   const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
//   const officialInvoiceNumber = `KVTS-${yearShort}-${randomSuffix}`;
//   const waybillNumber = `WB-${yearShort}-${randomSuffix}`;
//   const gatePassCode = `GP-${Math.floor(100 + Math.random() * 900)}`;

//   try {
//     await prisma.$transaction(async (tx) => {
//       // 2. CHECK & DEDUCT INVENTORY
//       for (const item of invoice.items) {
//         const product = await tx.product.findUnique({ where: { id: item.productId }});
//         if (!product || product.stockOnHand < item.quantity) {
//           throw new Error(`Insufficient stock for product ID: ${item.productId}`);
//         }

//         // Deduct
//         await tx.product.update({
//           where: { id: item.productId },
//           data: { stockOnHand: { decrement: item.quantity } }
//         });

//         // Record Movement
//         await tx.inventoryMovement.create({
//           data: {
//             productId: item.productId,
//             type: 'SALE',
//             quantity: -item.quantity,
//             referenceId: invoice.id,
//             date: new Date()
//           }
//         });
//       }

//       // 3. UPDATE INVOICE (Lock it)
//       await tx.salesInvoice.update({
//         where: { id: invoiceId },
//         data: {
//           invoiceNumber: officialInvoiceNumber,
//           status: 'SENT', // Ready for customer
//           isPosted: true, // Locked
//         }
//       });

//       // 4. UPDATE CUSTOMER LEDGER (Debt is recognized NOW, not before)
//       await tx.customer.update({
//         where: { id: invoice.customerId },
//         data: { currentBalance: { increment: invoice.totalAmount } }
//       });

//       // 5. CREATE WAYBILL (Gate Pass)
//       await tx.waybill.create({
//         data: {
//           salesInvoiceId: invoice.id,
//           waybillNumber: waybillNumber,
//           gatePassCode: gatePassCode,
//           vehicleNumber: driverDetails.vehicleNumber,
//           driverName: driverDetails.driverName,
//           driverPhone: driverDetails.driverPhone,
//           preparedBy: 'System Admin', // Replace with session user
//         }
//       });
//     });

//     revalidatePath('/dashboard/sales');
//     return { success: true, message: 'Invoice Posted & Waybill Generated' };
//   } catch (error: any) {
//     return { success: false, message: error.message || 'Posting failed' };
//   }
// }
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- STAGE 1: DRAFT (Create/Edit freely, No Stock Deduction) ---
// [FIXED] Added 'prevState: any' as the first argument
export async function saveDraftInvoice(prevState: any, formData: FormData) {
  
  // 1. Fetch the Base Currency
  const baseCurrency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
  if (!baseCurrency) {
    return { success: false, message: 'System Error: No Base Currency configured in settings.' };
  }

  // Parsing logic
  const itemsJson = formData.get('items') as string;
  const items = itemsJson ? JSON.parse(itemsJson) : [];
  const customerId = formData.get('customerId') as string;
  
  if (!items || items.length === 0) {
    return { success: false, message: 'Cannot save draft without items.' };
  }

  // Calculate totals
  const subTotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  const taxRate = Number(formData.get('taxRate') || 0);
  const logisticsFee = Number(formData.get('logisticsFee') || 0);
  const taxAmount = subTotal * (taxRate / 100);
  const totalAmount = subTotal + taxAmount + logisticsFee;

  try {
    await prisma.salesInvoice.create({
      data: {
        customerId,
        
        // Link Base Currency
        currencyId: baseCurrency.id, 

        date: new Date(formData.get('date') as string),
        dueDate: new Date(formData.get('dueDate') as string),
        destination: formData.get('destination') as string || 'N/A',
        loadingLocation: formData.get('loadingLocation') as string || 'Enugu KVTS Industries',
        
        status: 'DRAFT', 
        isPosted: false, 
        invoiceNumber: null, 
        
        subTotal, 
        taxRate, 
        taxAmount, 
        logisticsFee, 
        totalAmount, 
        balanceDue: totalAmount, 

        items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              packageType: 'Piece' 
            }))
        }
      }
    });
    revalidatePath('/dashboard/sales');
    return { success: true, message: 'Draft saved. Inventory not touched.' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to save draft.' };
  }
}

// --- STAGE 2: CONFIRMATION (Manager approves the content) ---
// [FIXED] Added 'prevState: any' here as well for consistency if used in hooks
export async function confirmInvoice(prevState: any, invoiceId: string) {
  try {
    await prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: { status: 'PENDING_CONFIRMATION' } 
    });
    revalidatePath('/dashboard/sales');
    return { success: true, message: 'Invoice submitted for confirmation.' };
  } catch (e) {
    return { success: false, message: 'Error confirming invoice.' };
  }
}

// --- STAGE 3: GENERATION (The "Post" Action) ---
// This function is usually called via binding (bind), so it's fine,
// but we ensure it returns the same shape structure.
export async function postAndGenerateInvoice(invoiceId: string, prevState: any, formData: FormData) {
  // Note: When using .bind(null, invoiceId), the order of arguments received is:
  // 1. bound arguments (invoiceId)
  // 2. prevState (from useActionState)
  // 3. formData (from the form)
  
  const driverName = formData.get('driverName') as string;
  const vehicleNumber = formData.get('vehicleNumber') as string;
  const driverPhone = formData.get('driverPhone') as string;

  const invoice = await prisma.salesInvoice.findUnique({
    where: { id: invoiceId },
    include: { items: true }
  });

  if (!invoice || invoice.isPosted) return { success: false, message: 'Invalid Invoice' };

  // 1. Generate Official Numbers
  const yearShort = new Date().getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); 
  const officialInvoiceNumber = `KVTS-${yearShort}-${randomSuffix}`;
  const waybillNumber = `WB-${yearShort}-${randomSuffix}`;
  const gatePassCode = `GP-${Math.floor(100 + Math.random() * 900)}`;

  try {
    await prisma.$transaction(async (tx) => {
      // 2. CHECK & DEDUCT INVENTORY
      for (const item of invoice.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId }});
        if (!product || product.stockOnHand < item.quantity) {
          throw new Error(`Insufficient stock for product ID: ${item.productId}`);
        }

        // Deduct
        await tx.product.update({
          where: { id: item.productId },
          data: { stockOnHand: { decrement: item.quantity } }
        });

        // Record Movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            referenceId: invoice.id,
            date: new Date()
          }
        });
      }

      // 3. UPDATE INVOICE (Lock it)
      await tx.salesInvoice.update({
        where: { id: invoiceId },
        data: {
          invoiceNumber: officialInvoiceNumber,
          status: 'SENT', 
          isPosted: true, 
        }
      });

      // 4. UPDATE CUSTOMER LEDGER 
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: { currentBalance: { increment: invoice.totalAmount } }
      });

      // 5. CREATE WAYBILL (Gate Pass)
      await tx.waybill.create({
        data: {
          salesInvoiceId: invoice.id,
          waybillNumber: waybillNumber,
          gatePassCode: gatePassCode,
          vehicleNumber: vehicleNumber,
          driverName: driverName,
          driverPhone: driverPhone,
          preparedBy: 'System Admin', 
        }
      });
    });

    revalidatePath('/dashboard/sales');
    return { success: true, message: 'Invoice Posted & Waybill Generated' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Posting failed' };
  }
}