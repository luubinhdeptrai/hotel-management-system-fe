import { Folio, FolioTransaction } from "@/lib/types/folio";

// Mock folio transactions
const mockFolioTransactions: FolioTransaction[] = [
  // Folio F001 - Active guest
  {
    transactionID: "TXN001",
    folioID: "F001",
    date: "2025-12-08",
    time: "14:30:00",
    type: "DEPOSIT",
    description: "Đặt cọc khi đặt phòng",
    debit: 0,
    credit: 500000,
    createdBy: "Nguyễn Thị Lan",
    createdAt: "2025-12-08T14:30:00",
  },
  {
    transactionID: "TXN002",
    folioID: "F001",
    date: "2025-12-10",
    time: "15:00:00",
    type: "ROOM_CHARGE",
    description: "Tiền phòng ngày 10/12 - Standard",
    debit: 500000,
    credit: 0,
    createdBy: "System",
    createdAt: "2025-12-10T15:00:00",
  },
  {
    transactionID: "TXN003",
    folioID: "F001",
    date: "2025-12-10",
    time: "18:30:00",
    type: "SERVICE",
    description: "Minibar - 2x Coca Cola, 1x Snickers",
    debit: 85000,
    credit: 0,
    createdBy: "Trần Văn Nam",
    createdAt: "2025-12-10T18:30:00",
  },
  {
    transactionID: "TXN004",
    folioID: "F001",
    date: "2025-12-11",
    time: "09:00:00",
    type: "ROOM_CHARGE",
    description: "Tiền phòng ngày 11/12 - Standard",
    debit: 500000,
    credit: 0,
    createdBy: "System",
    createdAt: "2025-12-11T09:00:00",
  },

  // Folio F002 - Checking out today
  {
    transactionID: "TXN005",
    folioID: "F002",
    date: "2025-12-07",
    time: "10:00:00",
    type: "DEPOSIT",
    description: "Đặt cọc booking",
    debit: 0,
    credit: 800000,
    createdBy: "Lê Thị Hoa",
    createdAt: "2025-12-07T10:00:00",
  },
  {
    transactionID: "TXN006",
    folioID: "F002",
    date: "2025-12-09",
    time: "15:00:00",
    type: "ROOM_CHARGE",
    description: "Tiền phòng ngày 09/12 - Deluxe",
    debit: 800000,
    credit: 0,
    createdBy: "System",
    createdAt: "2025-12-09T15:00:00",
  },
  {
    transactionID: "TXN007",
    folioID: "F002",
    date: "2025-12-09",
    time: "20:00:00",
    type: "SERVICE",
    description: "Room Service - Dinner for 2",
    debit: 350000,
    credit: 0,
    createdBy: "Kitchen Staff",
    createdAt: "2025-12-09T20:00:00",
  },
  {
    transactionID: "TXN008",
    folioID: "F002",
    date: "2025-12-10",
    time: "09:00:00",
    type: "ROOM_CHARGE",
    description: "Tiền phòng ngày 10/12 - Deluxe",
    debit: 800000,
    credit: 0,
    createdBy: "System",
    createdAt: "2025-12-10T09:00:00",
  },
  {
    transactionID: "TXN009",
    folioID: "F002",
    date: "2025-12-10",
    time: "11:30:00",
    type: "SERVICE",
    description: "Laundry Service - 5 items",
    debit: 150000,
    credit: 0,
    createdBy: "Housekeeping",
    createdAt: "2025-12-10T11:30:00",
  },
  {
    transactionID: "TXN010",
    folioID: "F002",
    date: "2025-12-10",
    time: "14:00:00",
    type: "PENALTY",
    description: "Hư hỏng tay cầm cửa phòng tắm",
    debit: 200000,
    credit: 0,
    createdBy: "Trần Văn Nam",
    createdAt: "2025-12-10T14:00:00",
  },
];

// Mock folios
export const mockFolios: Folio[] = [
  {
    folioID: "F001",
    reservationID: "DP004",
    customerID: "KH004",
    customerName: "Nguyễn Văn An",
    roomID: "P102",
    roomName: "Phòng 102",
    roomTypeName: "Standard",
    checkInDate: "2025-12-08",
    checkOutDate: "2025-12-12",
    status: "OPEN",
    transactions: mockFolioTransactions.filter((t) => t.folioID === "F001"),
    totalDebit: 1085000, // Room charges + minibar
    totalCredit: 500000, // Deposit
    balance: 585000, // Still owes
    createdAt: "2025-12-08T14:30:00",
  },
  {
    folioID: "F002",
    reservationID: "DP002",
    customerID: "KH002",
    customerName: "Trần Thị Bình",
    roomID: "P201",
    roomName: "Phòng 201",
    roomTypeName: "Deluxe",
    checkInDate: "2025-12-09",
    checkOutDate: "2025-12-11",
    status: "OPEN",
    transactions: mockFolioTransactions.filter((t) => t.folioID === "F002"),
    totalDebit: 2300000, // 2 nights + services + penalty
    totalCredit: 800000, // Deposit
    balance: 1500000,
    createdAt: "2025-12-07T10:00:00",
  },
];

// Helper: Get folio by ID
export const getFolioById = (folioID: string): Folio | undefined => {
  return mockFolios.find((f) => f.folioID === folioID);
};

// Helper: Get folio by room ID
export const getFolioByRoomId = (roomID: string): Folio | undefined => {
  return mockFolios.find((f) => f.roomID === roomID && f.status === "OPEN");
};

// Helper: Calculate folio totals
export const calculateFolioTotals = (transactions: FolioTransaction[]) => {
  const activeTransactions = transactions.filter((t) => !t.isVoided);

  const totalDebit = activeTransactions.reduce((sum, t) => sum + t.debit, 0);
  const totalCredit = activeTransactions.reduce((sum, t) => sum + t.credit, 0);
  const balance = totalDebit - totalCredit;

  return { totalDebit, totalCredit, balance };
};
