
// 'use client';

// import { useActionState, useEffect, useState, useRef } from 'react';
// import { createCustomer, createInvoice, recordPayment } from '@/app/lib/sales-actions';
// import { Plus, Trash, Search, X, ChevronDown, Wallet } from 'lucide-react'; // Added Wallet icon
// import clsx from 'clsx';

// // 1. CUSTOMER FORM (Unchanged)
// export function CustomerForm({ onClose }: { onClose: () => void }) {
//   const [state, action, isPending] = useActionState(createCustomer, undefined);
//   useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

//   return (
//     <form action={action} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Company / Customer Name</label>
//         <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//       </div>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//            <label className="block text-sm font-medium text-gray-700">Email</label>
//            <input name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//         </div>
//         <div>
//            <label className="block text-sm font-medium text-gray-700">Phone</label>
//            <input name="phone" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//         </div>
//       </div>
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Billing Address</label>
//         <textarea name="address" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//       </div>
//       <div className="flex justify-end gap-2 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
//         <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
//           {isPending ? 'Saving...' : 'Create Customer'}
//         </button>
//       </div>
//     </form>
//   );
// }

// // 2. INVOICE FORM (Updated: Shows Customer Balance/Credit)
// export function InvoiceForm({ customers, products, onClose }: { customers: any[], products: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState(createInvoice, undefined);
  
//   // Cart State
//   const [items, setItems] = useState<{productId: string, quantity: number, unitPrice: number}[]>([]);
  
//   // Customer Selection State
//   const [customerSearch, setCustomerSearch] = useState('');
//   const [selectedCustomerId, setSelectedCustomerId] = useState('');
//   const [customerBalance, setCustomerBalance] = useState(0); // NEW: To track balance
//   const [isCustOpen, setIsCustOpen] = useState(false);
//   const custWrapperRef = useRef<HTMLDivElement>(null);

//   // Product Selection State
//   const [productSearch, setProductSearch] = useState('');
//   const [currentProduct, setCurrentProduct] = useState('');
//   const [isProdOpen, setIsProdOpen] = useState(false);
//   const prodWrapperRef = useRef<HTMLDivElement>(null);

//   // Item Builder State
//   const [qty, setQty] = useState(1);
//   const [price, setPrice] = useState(0);
//   const [maxStock, setMaxStock] = useState(0);

//   // Financial State
//   const [taxRate, setTaxRate] = useState(7.5);
//   const [logisticsFee, setLogisticsFee] = useState(0);

//   useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

//   // Handle Outside Click
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (custWrapperRef.current && !custWrapperRef.current.contains(event.target as Node)) setIsCustOpen(false);
//       if (prodWrapperRef.current && !prodWrapperRef.current.contains(event.target as Node)) setIsProdOpen(false);
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // --- LOGIC: CUSTOMER ---
//   const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  
//   const selectCustomer = (c: any) => {
//     setSelectedCustomerId(c.id);
//     setCustomerSearch(c.name);
//     setCustomerBalance(Number(c.currentBalance)); // Capture balance
//     setIsCustOpen(false);
//   };
//   const clearCustomer = () => {
//     setSelectedCustomerId('');
//     setCustomerSearch('');
//     setCustomerBalance(0);
//     setIsCustOpen(true);
//   };

//   // --- LOGIC: PRODUCT & DYNAMIC STOCK ---
//   const getRemainingStock = (product: any) => {
//     const inCartQty = items
//       .filter(item => item.productId === product.id)
//       .reduce((sum, item) => sum + item.quantity, 0);
//     return product.stockOnHand - inCartQty;
//   };

//   const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

//   const handleProductSelect = (p: any) => {
//     const available = getRemainingStock(p);
//     setCurrentProduct(p.id);
//     setProductSearch(p.name);
//     setIsProdOpen(false);
//     setPrice(Number(p.sellingPrice));
//     setMaxStock(available);
//     setQty(1); 
//   }

//   const clearProduct = () => {
//     setCurrentProduct('');
//     setProductSearch('');
//     setPrice(0);
//     setMaxStock(0);
//     setQty(0);
//     setIsProdOpen(true);
//   }

//   const addItem = () => {
//     if (!currentProduct) return;
//     if (qty > maxStock) return;

//     setItems([...items, { productId: currentProduct, quantity: qty, unitPrice: price }]);
//     clearProduct(); 
//     setProductSearch(''); 
//     setIsProdOpen(false);
//   };

//   const removeItem = (idx: number) => {
//     setItems(items.filter((_, i) => i !== idx));
//   };

//   // Live Calculations
//   const subTotal = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
//   const taxAmount = subTotal * (taxRate / 100);
//   const grandTotal = subTotal + taxAmount + logisticsFee;

//   return (
//     <form action={action} className="flex flex-col h-[80vh]">
//       <input type="hidden" name="items" value={JSON.stringify(items)} />
//       <input type="hidden" name="customerId" value={selectedCustomerId} />

//       {/* --- SCROLLABLE CONTENT AREA --- */}
//       <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-48">
        
//         {/* TOP ROW: Customer & Date */}
//         <div className="grid grid-cols-2 gap-4">
          
//           {/* CUSTOMER SELECT WITH BALANCE INDICATOR */}
//           <div className="relative" ref={custWrapperRef}>
//             <label className="block text-sm font-medium text-gray-700">Customer</label>
//             <div className="relative mt-1">
//               <input
//                 type="text"
//                 placeholder="Search Customer..."
//                 className="block w-full rounded-md border border-gray-300 pl-3 pr-8 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]"
//                 value={customerSearch}
//                 onChange={(e) => { setCustomerSearch(e.target.value); setIsCustOpen(true); }}
//                 onFocus={() => setIsCustOpen(true)}
//                 required={!selectedCustomerId}
//               />
//               <div className="absolute inset-y-0 right-0 flex items-center pr-2">
//                 {selectedCustomerId ? (
//                   <button type="button" onClick={clearCustomer} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
//                 ) : (
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 )}
//               </div>
//             </div>

//             {/* BALANCE INDICATOR (Shows when customer is selected) */}
//             {selectedCustomerId && (
//                <div className="mt-1 flex items-center gap-1.5 text-xs">
//                  <Wallet className="w-3 h-3 text-gray-400" />
//                  {customerBalance > 0 ? (
//                     <span className="text-red-600 font-medium">Owes: ₦{customerBalance.toLocaleString()}</span>
//                  ) : customerBalance < 0 ? (
//                     <span className="text-green-600 font-bold">Credit Available: ₦{Math.abs(customerBalance).toLocaleString()}</span>
//                  ) : (
//                     <span className="text-gray-500">Balance: ₦0.00</span>
//                  )}
//                </div>
//             )}

//             {isCustOpen && (
//               <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
//                 {filteredCustomers.length === 0 ? <div className="py-2 px-4 text-gray-500">No customers found.</div> : 
//                   filteredCustomers.map(c => {
//                     const bal = Number(c.currentBalance);
//                     return (
//                       <div key={c.id} onClick={() => selectCustomer(c)} className="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 flex justify-between">
//                         <span className="block truncate">{c.name}</span>
//                         {/* Show balance in dropdown too */}
//                         {bal !== 0 && (
//                             <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", bal > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
//                                 {bal > 0 ? `Debtor` : `Credit`}
//                             </span>
//                         )}
//                       </div>
//                     )
//                   })
//                 }
//               </div>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
//             <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//           </div>
//         </div>
        
//         {/* Due Date & Logistics */}
//         <div>
//            <label className="block text-sm font-medium text-gray-700">Due Date</label>
//            <input name="dueDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//         </div>
//         <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase">Location of Loading</label>
//             <input name="loadingLocation" defaultValue="Enugu KVTS Industries" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//           </div>
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase">Destination</label>
//             <input name="destination" placeholder="e.g. Kano State" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
//           </div>
//         </div>

//         {/* --- ITEM BUILDER --- */}
//         <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
//           <div className="flex gap-2 items-end">
//             <div className="flex-1 relative" ref={prodWrapperRef}>
//               <label className="text-xs font-medium text-gray-500">Product</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search Product..."
//                   className="w-full text-sm rounded-md border-gray-300 pl-3 pr-8"
//                   value={productSearch}
//                   onChange={(e) => { setProductSearch(e.target.value); setIsProdOpen(true); }}
//                   onFocus={() => setIsProdOpen(true)}
//                 />
//                 <div className="absolute inset-y-0 right-0 flex items-center pr-2">
//                    {currentProduct ? (
//                      <button type="button" onClick={clearProduct} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
//                    ) : (
//                      <Search className="w-4 h-4 text-gray-400" />
//                    )}
//                 </div>
//               </div>
              
//               {isProdOpen && (
//                 <div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
//                   {filteredProducts.length === 0 ? <div className="py-2 px-4 text-gray-500">No products found.</div> : 
//                     filteredProducts.map(p => {
//                       const remaining = getRemainingStock(p);
//                       const isOutOfStock = remaining <= 0;
//                       return (
//                         <div 
//                           key={p.id} 
//                           onClick={() => !isOutOfStock && handleProductSelect(p)}
//                           className={clsx(
//                             "cursor-pointer select-none relative py-2 pl-3 pr-9 border-b border-gray-50 last:border-0",
//                             isOutOfStock ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-red-50"
//                           )}
//                         >
//                           <div className="flex justify-between items-center">
//                              <span className="font-medium">{p.name}</span>
//                              <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", isOutOfStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
//                                 {remaining} left
//                              </span>
//                           </div>
//                         </div>
//                       )
//                     })
//                   }
//                 </div>
//               )}
//             </div>

//             <div className="w-20">
//               <label className="text-xs font-medium text-gray-500">Qty</label>
//               <input 
//                 type="number" 
//                 value={qty} 
//                 min="1" 
//                 max={maxStock}
//                 onChange={(e) => {
//                   const val = Number(e.target.value);
//                   if (val <= maxStock) setQty(val);
//                 }} 
//                 disabled={!currentProduct || maxStock === 0}
//                 className="w-full text-sm rounded-md border-gray-300" 
//               />
//             </div>
//             <div className="w-24">
//               <label className="text-xs font-medium text-gray-500">Price</label>
//               <input type="number" value={price} readOnly className="w-full text-sm rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" />
//             </div>
//             <button 
//               type="button" 
//               onClick={addItem} 
//               disabled={!currentProduct || qty > maxStock || qty <= 0}
//               className="bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Plus className="w-4 h-4"/>
//             </button>
//           </div>

//           <div className="mt-3 space-y-1">
//             {items.map((item, idx) => {
//               const pName = products.find(p => p.id === item.productId)?.name;
//               return (
//                 <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 border rounded">
//                   <span>{item.quantity} x {pName}</span>
//                   <div className="flex items-center gap-3">
//                     <span className="font-mono">{(item.quantity * item.unitPrice).toFixed(2)}</span>
//                     <button type="button" onClick={() => removeItem(idx)}><Trash className="w-3 h-3 text-red-500"/></button>
//                   </div>
//                 </div>
//               )
//             })}
//             {items.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No items added yet.</p>}
//           </div>
//         </div>
//       </div>

//       {/* --- FIXED FOOTER (TOTALS & ACTIONS) --- */}
//       <div className="border-t border-gray-200 pt-4 mt-auto bg-white z-20 relative">
//         <div className="space-y-2 mb-4 px-1">
//            <div className="flex justify-between items-center text-sm">
//                 <span>Subtotal:</span>
//                 <span className="font-mono">₦{subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
//             <div className="flex justify-between items-center text-sm">
//                <div className="flex items-center gap-2">
//                  <span>VAT / Tax (%):</span>
//                  <input name="taxRate" type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-16 h-7 text-right text-xs border border-gray-300 rounded"/>
//                </div>
//                <span className="font-mono text-gray-600">+ ₦{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
//             <div className="flex justify-between items-center text-sm">
//                <div className="flex items-center gap-2">
//                  <span>Logistics Fee:</span>
//                  <input name="logisticsFee" type="number" value={logisticsFee} onChange={(e) => setLogisticsFee(Number(e.target.value))} className="w-24 h-7 text-right text-xs border border-gray-300 rounded"/>
//                </div>
//                <span className="font-mono text-gray-600">+ ₦{logisticsFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
//             <div className="flex justify-between items-center pt-2 border-t border-gray-200">
//                 <span className="font-bold">Total Amount:</span>
//                 <span className="text-xl font-bold text-[#E30613]">₦{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
//         </div>

//         {state?.message && !state.success && (
//            <p className="text-sm text-red-600 text-right bg-red-50 p-2 rounded mb-2">{state.message}</p>
//         )}

//         <div className="flex justify-end gap-2">
//           <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
//           <button disabled={isPending || items.length === 0 || !selectedCustomerId} className="bg-[#E30613] text-white px-4 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50">
//             {isPending ? 'Generating...' : 'Generate Invoice'}
//           </button>
//         </div>
//       </div>
//     </form>
//   );
// }

// // 3. PAYMENT FORM (Searchable - Kept as is)
// export function PaymentForm({ invoices, onClose }: { invoices: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState(recordPayment, undefined);
  
//   const [selectedInv, setSelectedInv] = useState<any>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isOpen, setIsOpen] = useState(false);
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const filteredInvoices = invoices.filter(inv => 
//     inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleSelect = (inv: any) => {
//     setSelectedInv(inv);
//     setSearchTerm(`${inv.invoiceNumber} - ${inv.customer.name}`);
//     setIsOpen(false);
//   };

//   const clearSelection = () => {
//     setSelectedInv(null);
//     setSearchTerm('');
//     setIsOpen(true);
//   };

//   return (
//     <form action={action} className="space-y-4 h-[400px] flex flex-col">
//       <input type="hidden" name="invoiceId" value={selectedInv?.id || ''} />

//       <div className="relative" ref={wrapperRef}>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Search Outstanding Invoice</label>
        
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-4 w-4 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#E30613] focus:border-[#E30613]"
//             placeholder="Type Invoice # or Customer Name..."
//             value={searchTerm}
//             onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
//             onFocus={() => setIsOpen(true)}
//             autoComplete="off"
//           />
//           {searchTerm && (
//             <button type="button" onClick={clearSelection} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500">
//               <X className="h-4 w-4" />
//             </button>
//           )}
//         </div>

//         {isOpen && (
//           <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
//             {filteredInvoices.length === 0 ? (
//               <div className="cursor-default select-none relative py-2 px-4 text-gray-500">
//                 No outstanding invoices found.
//               </div>
//             ) : (
//               filteredInvoices.map((inv) => (
//                 <div
//                   key={inv.id}
//                   className={clsx(
//                     "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-red-50",
//                     selectedInv?.id === inv.id ? "bg-red-50 text-[#E30613]" : "text-gray-900"
//                   )}
//                   onClick={() => handleSelect(inv)}
//                 >
//                   <div className="flex justify-between">
//                     <span className="font-medium">{inv.invoiceNumber}</span>
//                     <span className="text-gray-500 ml-2 truncate">{inv.customer.name}</span>
//                   </div>
//                   <div className="text-xs text-gray-500">
//                     Balance Due: <span className="font-bold text-red-600">₦{Number(inv.balanceDue).toLocaleString()}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
//           <div className="relative mt-1">
//              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">₦</span>
//              <input 
//                 name="amount" 
//                 type="number" 
//                 step="0.01" 
//                 key={selectedInv?.id} 
//                 defaultValue={selectedInv?.balanceDue} 
//                 required 
//                 className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500" 
//              />
//           </div>
//           {selectedInv && (
//             <p className="text-xs text-gray-500 mt-1">
//               Due: ₦{Number(selectedInv.balanceDue).toLocaleString()}
//             </p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Method</label>
//           <select name="method" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//             <option value="BANK_TRANSFER">Bank Transfer</option>
//             <option value="CASH">Cash</option>
//             <option value="CHECK">Check</option>
//             <option value="POS">POS</option>
//           </select>
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Reference / Note</label>
//         <input name="reference" placeholder="Check No. or Transaction ID" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//       </div>

//       <div className="flex justify-end gap-2 pt-4 mt-auto">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
//         <button disabled={isPending || !selectedInv} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
//           {isPending ? 'Processing...' : 'Record Payment'}
//         </button>
//       </div>
//     </form>
//   );
// }

'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { createCustomer, recordPayment } from '@/app/lib/sales-actions';
// [UPDATED] Import the Draft Action
import { saveDraftInvoice } from '@/app/lib/invoice-lifecycle';
import { Plus, Trash, Search, X, ChevronDown, Wallet, Save } from 'lucide-react'; 
import clsx from 'clsx';

// 1. CUSTOMER FORM (Unchanged)
export function CustomerForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createCustomer, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Company / Customer Name</label>
        <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Email</label>
           <input name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Phone</label>
           <input name="phone" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Billing Address</label>
        <textarea name="address" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Saving...' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}

// 2. INVOICE FORM (Updated for Draft Workflow)
export function InvoiceForm({ customers, products, onClose, initialData }: { customers: any[], products: any[], onClose: () => void, initialData?: any }) {
  // [UPDATED] Use saveDraftInvoice instead of createInvoice
  const [state, action, isPending] = useActionState(saveDraftInvoice, undefined);
  
  // Cart State
  const [items, setItems] = useState<{productId: string, quantity: number, unitPrice: number}[]>(
    initialData ? initialData.items.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice)
    })) : []
  );
  
  // Customer Selection State
const [customerSearch, setCustomerSearch] = useState(initialData ? initialData.customer.name : '');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialData ? initialData.customerId : '');
  const [customerBalance, setCustomerBalance] = useState(initialData ? Number(initialData.customer.currentBalance) : 0);
  const [isCustOpen, setIsCustOpen] = useState(false);
  const custWrapperRef = useRef<HTMLDivElement>(null);

  // Product Selection State
  const [productSearch, setProductSearch] = useState('');
  const [currentProduct, setCurrentProduct] = useState('');
  const [isProdOpen, setIsProdOpen] = useState(false);
  const prodWrapperRef = useRef<HTMLDivElement>(null);

  // Item Builder State
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [maxStock, setMaxStock] = useState(0);

  // Financial State
 const [taxRate, setTaxRate] = useState(initialData ? Number(initialData.taxRate) : 7.5);
  const [logisticsFee, setLogisticsFee] = useState(initialData ? Number(initialData.logisticsFee) : 0);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  // Handle Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (custWrapperRef.current && !custWrapperRef.current.contains(event.target as Node)) setIsCustOpen(false);
      if (prodWrapperRef.current && !prodWrapperRef.current.contains(event.target as Node)) setIsProdOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGIC: CUSTOMER ---
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  
  const selectCustomer = (c: any) => {
    setSelectedCustomerId(c.id);
    setCustomerSearch(c.name);
    setCustomerBalance(Number(c.currentBalance)); 
    setIsCustOpen(false);
  };
  const clearCustomer = () => {
    setSelectedCustomerId('');
    setCustomerSearch('');
    setCustomerBalance(0);
    setIsCustOpen(true);
  };

  // --- LOGIC: PRODUCT & DYNAMIC STOCK ---
  const getRemainingStock = (product: any) => {
    const inCartQty = items
      .filter(item => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    return product.stockOnHand - inCartQty;
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const handleProductSelect = (p: any) => {
    const available = getRemainingStock(p);
    setCurrentProduct(p.id);
    setProductSearch(p.name);
    setIsProdOpen(false);
    setPrice(Number(p.sellingPrice));
    setMaxStock(available);
    setQty(1); 
  }

  const clearProduct = () => {
    setCurrentProduct('');
    setProductSearch('');
    setPrice(0);
    setMaxStock(0);
    setQty(0);
    setIsProdOpen(true);
  }

  const addItem = () => {
    if (!currentProduct) return;
    if (qty > maxStock) return;

    setItems([...items, { productId: currentProduct, quantity: qty, unitPrice: price }]);
    clearProduct(); 
    setProductSearch(''); 
    setIsProdOpen(false);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Live Calculations
  const subTotal = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);
  const taxAmount = subTotal * (taxRate / 100);
  const grandTotal = subTotal + taxAmount + logisticsFee;

  return (
    <form action={action} className="flex flex-col h-[80vh]">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="customerId" value={selectedCustomerId} />

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-48">
        
        {/* TOP ROW: Customer & Date */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* CUSTOMER SELECT WITH BALANCE INDICATOR */}
          <div className="relative" ref={custWrapperRef}>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search Customer..."
                className="block w-full rounded-md border border-gray-300 pl-3 pr-8 py-2 text-sm focus:border-blue-600 focus:ring-blue-600"
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setIsCustOpen(true); }}
                onFocus={() => setIsCustOpen(true)}
                required={!selectedCustomerId}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {selectedCustomerId ? (
                  <button type="button" onClick={clearCustomer} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* BALANCE INDICATOR */}
            {selectedCustomerId && (
               <div className="mt-1 flex items-center gap-1.5 text-xs">
                 <Wallet className="w-3 h-3 text-gray-400" />
                 {customerBalance > 0 ? (
                    <span className="text-red-600 font-medium">Owes: ₦{customerBalance.toLocaleString()}</span>
                 ) : customerBalance < 0 ? (
                    <span className="text-green-600 font-bold">Credit Available: ₦{Math.abs(customerBalance).toLocaleString()}</span>
                 ) : (
                    <span className="text-gray-500">Balance: ₦0.00</span>
                 )}
               </div>
            )}

            {isCustOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                {filteredCustomers.length === 0 ? <div className="py-2 px-4 text-gray-500">No customers found.</div> : 
                  filteredCustomers.map(c => {
                    const bal = Number(c.currentBalance);
                    return (
                      <div key={c.id} onClick={() => selectCustomer(c)} className="cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 flex justify-between">
                        <span className="block truncate">{c.name}</span>
                        {bal !== 0 && (
                            <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", bal > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                {bal > 0 ? `Debtor` : `Credit`}
                            </span>
                        )}
                      </div>
                    )
                  })
                }
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>
        
        {/* Due Date & Logistics */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Due Date</label>
           <input name="dueDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Location of Loading</label>
            <input name="loadingLocation" defaultValue="Enugu KVTS Industries" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Destination</label>
            <input name="destination" placeholder="e.g. Kano State" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-600 focus:ring-blue-600" />
          </div>
        </div>

        {/* --- ITEM BUILDER --- */}
        <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative" ref={prodWrapperRef}>
              <label className="text-xs font-medium text-gray-500">Product</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Product..."
                  className="w-full text-sm rounded-md border-gray-300 pl-3 pr-8"
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setIsProdOpen(true); }}
                  onFocus={() => setIsProdOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                   {currentProduct ? (
                     <button type="button" onClick={clearProduct} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                   ) : (
                     <Search className="w-4 h-4 text-gray-400" />
                   )}
                </div>
              </div>
              
              {isProdOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                  {filteredProducts.length === 0 ? <div className="py-2 px-4 text-gray-500">No products found.</div> : 
                    filteredProducts.map(p => {
                      const remaining = getRemainingStock(p);
                      const isOutOfStock = remaining <= 0;
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => !isOutOfStock && handleProductSelect(p)}
                          className={clsx(
                            "cursor-pointer select-none relative py-2 pl-3 pr-9 border-b border-gray-50 last:border-0",
                            isOutOfStock ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-blue-50"
                          )}
                        >
                          <div className="flex justify-between items-center">
                             <span className="font-medium">{p.name}</span>
                             <span className={clsx("text-xs font-bold px-2 py-0.5 rounded", isOutOfStock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                                {remaining} left
                             </span>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )}
            </div>

            <div className="w-20">
              <label className="text-xs font-medium text-gray-500">Qty</label>
              <input 
                type="number" 
                value={qty} 
                min="1" 
                max={maxStock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxStock) setQty(val);
                }} 
                disabled={!currentProduct || maxStock === 0}
                className="w-full text-sm rounded-md border-gray-300" 
              />
            </div>
            <div className="w-24">
              <label className="text-xs font-medium text-gray-500">Price</label>
              <input type="number" value={price} readOnly className="w-full text-sm rounded-md border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" />
            </div>
            <button 
              type="button" 
              onClick={addItem} 
              disabled={!currentProduct || qty > maxStock || qty <= 0}
              className="bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4"/>
            </button>
          </div>

          <div className="mt-3 space-y-1">
            {items.map((item, idx) => {
              const pName = products.find(p => p.id === item.productId)?.name;
              return (
                <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 border rounded">
                  <span>{item.quantity} x {pName}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    <button type="button" onClick={() => removeItem(idx)}><Trash className="w-3 h-3 text-red-500"/></button>
                  </div>
                </div>
              )
            })}
            {items.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No items added yet.</p>}
          </div>
        </div>
      </div>

      {/* --- FIXED FOOTER (TOTALS & ACTIONS) --- */}
      <div className="border-t border-gray-200 pt-4 mt-auto bg-white z-20 relative">
        <div className="space-y-2 mb-4 px-1">
           <div className="flex justify-between items-center text-sm">
                <span>Subtotal:</span>
                <span className="font-mono">₦{subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                 <span>VAT / Tax (%):</span>
                 <input name="taxRate" type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-16 h-7 text-right text-xs border border-gray-300 rounded"/>
               </div>
               <span className="font-mono text-gray-600">+ ₦{taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                 <span>Logistics Fee:</span>
                 <input name="logisticsFee" type="number" value={logisticsFee} onChange={(e) => setLogisticsFee(Number(e.target.value))} className="w-24 h-7 text-right text-xs border border-gray-300 rounded"/>
               </div>
               <span className="font-mono text-gray-600">+ ₦{logisticsFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-bold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-700">₦{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        {state?.message && !state.success && (
           <p className="text-sm text-red-600 text-right bg-red-50 p-2 rounded mb-2">{state.message}</p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          {/* [UPDATED] Button Style & Text for Draft */}
          <button 
            disabled={isPending || items.length === 0 || !selectedCustomerId} 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" /> Save as Draft
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

// 3. PAYMENT FORM (Searchable - Kept as is)
export function PaymentForm({ invoices, onClose }: { invoices: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(recordPayment, undefined);
  
  const [selectedInv, setSelectedInv] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (inv: any) => {
    setSelectedInv(inv);
    setSearchTerm(`${inv.invoiceNumber} - ${inv.customer.name}`);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelectedInv(null);
    setSearchTerm('');
    setIsOpen(true);
  };

  return (
    <form action={action} className="space-y-4 h-[400px] flex flex-col">
      <input type="hidden" name="invoiceId" value={selectedInv?.id || ''} />

      <div className="relative" ref={wrapperRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search Outstanding Invoice</label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-[#E30613] focus:border-[#E30613]"
            placeholder="Type Invoice # or Customer Name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            autoComplete="off"
          />
          {searchTerm && (
            <button type="button" onClick={clearSelection} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
            {filteredInvoices.length === 0 ? (
              <div className="cursor-default select-none relative py-2 px-4 text-gray-500">
                No outstanding invoices found.
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className={clsx(
                    "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-red-50",
                    selectedInv?.id === inv.id ? "bg-red-50 text-[#E30613]" : "text-gray-900"
                  )}
                  onClick={() => handleSelect(inv)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{inv.invoiceNumber}</span>
                    <span className="text-gray-500 ml-2 truncate">{inv.customer.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Balance Due: <span className="font-bold text-red-600">₦{Number(inv.balanceDue).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
          <div className="relative mt-1">
             <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">₦</span>
             <input 
                name="amount" 
                type="number" 
                step="0.01" 
                key={selectedInv?.id} 
                defaultValue={selectedInv?.balanceDue} 
                required 
                className="block w-full pl-7 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500" 
             />
          </div>
          {selectedInv && (
            <p className="text-xs text-gray-500 mt-1">
              Due: ₦{Number(selectedInv.balanceDue).toLocaleString()}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Method</label>
          <select name="method" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="POS">POS</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reference / Note</label>
        <input name="reference" placeholder="Check No. or Transaction ID" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-auto">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending || !selectedInv} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? 'Processing...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}