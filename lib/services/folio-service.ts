/**
 * Folio Service - Business Logic for Folio Management
 * Implements business rules from CHECKLIST Module 11, 17
 */

export type FolioType = "GUEST" | "MASTER" | "NO_RESIDENT";
export type TransactionType = "ROOM_CHARGE" | "SERVICE" | "DEPOSIT" | "PAYMENT" | "SURCHARGE" | "PENALTY" | "TRANSFER_IN" | "TRANSFER_OUT";

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  amount: number; // Positive for charges, negative for payments/deposits
  isVoid?: boolean; // For voided transactions (Module 18)
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  fromFolioID?: string; // For transfers
  toFolioID?: string; // For transfers
}

export interface Folio {
  folioID: string;
  folioType: FolioType;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  balance: number; // Calculated field
  transactions: Transaction[];
  linkedFolios?: string[]; // For Master folio linking to Guest folios
  masterFolioID?: string; // For Guest folio linking to Master
}

export interface TransactionBreakdown {
  roomCharges: number;
  services: number;
  surcharges: number;
  penalties: number;
  deposits: number;
  payments: number;
  totalCharges: number;
  totalPayments: number;
  balance: number;
}

export interface Bill {
  folioID: string;
  guestName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  breakdown: TransactionBreakdown;
  finalBalance: number;
  closedAt: string;
}

/**
 * Calculate folio balance
 * Formula: Balance = Sum(Charges) - Sum(Payments)
 * From Module 11
 */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions
    .filter((t) => !t.isVoid) // Exclude voided transactions
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get transaction breakdown by type
 */
export function getTransactionBreakdown(transactions: Transaction[]) {
  const validTransactions = transactions.filter((t) => !t.isVoid);

  const roomCharges = validTransactions
    .filter((t) => t.type === "ROOM_CHARGE")
    .reduce((sum, t) => sum + t.amount, 0);

  const services = validTransactions
    .filter((t) => t.type === "SERVICE")
    .reduce((sum, t) => sum + t.amount, 0);

  const surcharges = validTransactions
    .filter((t) => t.type === "SURCHARGE")
    .reduce((sum, t) => sum + t.amount, 0);

  const penalties = validTransactions
    .filter((t) => t.type === "PENALTY")
    .reduce((sum, t) => sum + t.amount, 0);

  const deposits = validTransactions
    .filter((t) => t.type === "DEPOSIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const payments = validTransactions
    .filter((t) => t.type === "PAYMENT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCharges = roomCharges + services + surcharges + penalties;
  const totalPayments = Math.abs(deposits) + Math.abs(payments);

  return {
    roomCharges,
    services,
    surcharges,
    penalties,
    deposits: Math.abs(deposits),
    payments: Math.abs(payments),
    totalCharges,
    totalPayments,
    balance: totalCharges - totalPayments,
  };
}

/**
 * Transfer charge from one folio to another
 * Used for Master/Guest folio split billing
 * From Module 17
 */
export function transferCharge(
  fromFolio: Folio,
  toFolio: Folio,
  transactionID: string
): { fromFolio: Folio; toFolio: Folio; success: boolean; error?: string } {
  const transaction = fromFolio.transactions.find((t) => t.id === transactionID);

  if (!transaction) {
    return {
      fromFolio,
      toFolio,
      success: false,
      error: "Transaction not found",
    };
  }

  if (transaction.isVoid) {
    return {
      fromFolio,
      toFolio,
      success: false,
      error: "Cannot transfer voided transaction",
    };
  }

  // Create transfer-out transaction in source folio
  const transferOutTransaction: Transaction = {
    id: `TO-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type: "TRANSFER_OUT",
    description: `Chuyển sang ${toFolio.folioID}: ${transaction.description}`,
    amount: -transaction.amount, // Negative to reduce balance
    fromFolioID: fromFolio.folioID,
    toFolioID: toFolio.folioID,
  };

  // Create transfer-in transaction in destination folio
  const transferInTransaction: Transaction = {
    id: `TI-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type: "TRANSFER_IN",
    description: `Nhận từ ${fromFolio.folioID}: ${transaction.description}`,
    amount: transaction.amount, // Positive to increase balance
    fromFolioID: fromFolio.folioID,
    toFolioID: toFolio.folioID,
  };

  const updatedFromFolio = {
    ...fromFolio,
    transactions: [...fromFolio.transactions, transferOutTransaction],
  };

  const updatedToFolio = {
    ...toFolio,
    transactions: [...toFolio.transactions, transferInTransaction],
  };

  // Recalculate balances
  updatedFromFolio.balance = calculateBalance(updatedFromFolio.transactions);
  updatedToFolio.balance = calculateBalance(updatedToFolio.transactions);

  return {
    fromFolio: updatedFromFolio,
    toFolio: updatedToFolio,
    success: true,
  };
}

/**
 * Split bill - Create new folio with portion of charges
 * Used when company pays room charges, guest pays personal services
 * From Module 17
 */
export function splitBill(
  originalFolio: Folio,
  splitAmount: number,
  splitDescription: string,
  newFolioType: FolioType
): { originalFolio: Folio; newFolio: Folio } {
  // Create split transaction in original folio
  const splitOutTransaction: Transaction = {
    id: `SP-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type: "TRANSFER_OUT",
    description: splitDescription,
    amount: -splitAmount,
  };

  const newFolio: Folio = {
    folioID: `F${Date.now()}`,
    folioType: newFolioType,
    guestName: originalFolio.guestName,
    roomNumber: originalFolio.roomNumber,
    checkInDate: originalFolio.checkInDate,
    checkOutDate: originalFolio.checkOutDate,
    balance: splitAmount,
    transactions: [
      {
        id: `SI-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: "TRANSFER_IN",
        description: `Chia bill từ ${originalFolio.folioID}`,
        amount: splitAmount,
      },
    ],
  };

  const updatedOriginalFolio = {
    ...originalFolio,
    transactions: [...originalFolio.transactions, splitOutTransaction],
  };

  updatedOriginalFolio.balance = calculateBalance(updatedOriginalFolio.transactions);

  return {
    originalFolio: updatedOriginalFolio,
    newFolio,
  };
}

/**
 * Void transaction - Mark as void and create reverse entry
 * From Module 18
 * Never delete - just mark IsVoid = 1 and create offsetting transaction
 */
export function voidTransaction(
  folio: Folio,
  transactionID: string,
  voidReason: string,
  voidedBy: string
): Folio {
  const transactionIndex = folio.transactions.findIndex((t) => t.id === transactionID);

  if (transactionIndex === -1) {
    throw new Error("Transaction not found");
  }

  const transaction = folio.transactions[transactionIndex];

  if (transaction.isVoid) {
    throw new Error("Transaction already voided");
  }

  // Mark original transaction as void
  const updatedTransactions = [...folio.transactions];
  updatedTransactions[transactionIndex] = {
    ...transaction,
    isVoid: true,
    voidReason,
    voidedBy,
    voidedAt: new Date().toISOString(),
  };

  // Create reverse transaction
  const reverseTransaction: Transaction = {
    id: `V-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type: transaction.type,
    description: `VOID: ${transaction.description} - ${voidReason}`,
    amount: -transaction.amount, // Opposite sign
  };

  updatedTransactions.push(reverseTransaction);

  const updatedFolio = {
    ...folio,
    transactions: updatedTransactions,
  };

  updatedFolio.balance = calculateBalance(updatedFolio.transactions);

  return updatedFolio;
}

/**
 * Post charge to folio
 * Add a new transaction
 */
export function postCharge(
  folio: Folio,
  type: TransactionType,
  description: string,
  amount: number
): Folio {
  const newTransaction: Transaction = {
    id: `T-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    type,
    description,
    amount,
  };

  const updatedFolio = {
    ...folio,
    transactions: [...folio.transactions, newTransaction],
  };

  updatedFolio.balance = calculateBalance(updatedFolio.transactions);

  return updatedFolio;
}

/**
 * Create Master Folio for group booking
 * From Module 17
 */
export function createMasterFolio(
  guestFolios: Folio[],
  companyName: string
): Folio {
  const masterFolio: Folio = {
    folioID: `M-${Date.now()}`,
    folioType: "MASTER",
    guestName: companyName,
    roomNumber: guestFolios.map((f) => f.roomNumber).join(", "),
    checkInDate: guestFolios[0].checkInDate,
    checkOutDate: guestFolios[0].checkOutDate,
    balance: 0,
    transactions: [],
    linkedFolios: guestFolios.map((f) => f.folioID),
  };

  return masterFolio;
}

/**
 * Auto-transfer room charges from Guest folios to Master folio
 * From Module 17 - Company pays room charges
 */
export function transferRoomChargesToMaster(
  guestFolios: Folio[],
  masterFolio: Folio
): { guestFolios: Folio[]; masterFolio: Folio } {
  let updatedMasterFolio = { ...masterFolio };
  const updatedGuestFolios = guestFolios.map((guestFolio) => {
    let updatedGuestFolio = { ...guestFolio };

    // Find all room charges in guest folio
    const roomCharges = guestFolio.transactions.filter(
      (t) => t.type === "ROOM_CHARGE" && !t.isVoid
    );

    // Transfer each room charge to master
    roomCharges.forEach((charge) => {
      const result = transferCharge(
        updatedGuestFolio,
        updatedMasterFolio,
        charge.id
      );
      if (result.success) {
        updatedGuestFolio = result.fromFolio;
        updatedMasterFolio = result.toFolio;
      }
    });

    return updatedGuestFolio;
  });

  return {
    guestFolios: updatedGuestFolios,
    masterFolio: updatedMasterFolio,
  };
}

/**
 * Close folio - Mark as settled and generate final bill
 */
export function closeFolio(folio: Folio): { folio: Folio; bill: Bill } {
  const breakdown = getTransactionBreakdown(folio.transactions);

  const bill: Bill = {
    folioID: folio.folioID,
    guestName: folio.guestName,
    roomNumber: folio.roomNumber,
    checkInDate: folio.checkInDate,
    checkOutDate: folio.checkOutDate,
    breakdown,
    finalBalance: breakdown.balance,
    closedAt: new Date().toISOString(),
  };

  return {
    folio: {
      ...folio,
      balance: breakdown.balance,
    },
    bill,
  };
}
