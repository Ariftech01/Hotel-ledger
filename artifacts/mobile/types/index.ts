export type UserRole = "owner" | "manager" | "staff";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "gpay"
  | "phonepe"
  | "paytm"
  | "bhim"
  | "cheque"
  | "credit_card"
  | "debit_card"
  | "bank_transfer";

export type TransactionType = "credit" | "debit";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  hotelId: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  gstin?: string;
  logo?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  category?: Category;
  paymentMethod: PaymentMethod;
  hotelId: string;
  hotel?: Hotel;
  remarks: string;
  description?: string;
  date: string;
  time: string;
  isEdited: boolean;
  editedAt?: string;
  editedBy?: string;
  attachmentUrl?: string;
  runningBalance?: number;
}

export interface DashboardSummary {
  todayIncome: number;
  todayExpense: number;
  cashBalance: number;
  bankBalance: number;
  netProfit: number;
  pendingPayments: number;
  pendingCollections: number;
  monthIncome: number;
  monthExpense: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  outstanding: number;
  totalPaid: number;
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  outstanding: number;
  totalPurchased: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  hotelId: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "invoice_sent" | "payment_received" | "reminder" | "pending_bill" | "system";
  isRead: boolean;
  createdAt: string;
}

export type DateFilter = "today" | "yesterday" | "week" | "month" | "year" | "custom";
export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}
