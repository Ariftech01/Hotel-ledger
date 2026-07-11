import type { Category, Customer, Hotel, Invoice, Notification, Transaction, Vendor } from "@/types";

export const MOCK_HOTELS: Hotel[] = [
  { id: "h1", name: "Grand Palace Hotel", address: "MG Road, Bengaluru, Karnataka", phone: "+91-80-4567-8901", gstin: "29AABCU9603R1ZM", email: "accounts@grandpalace.in" },
  { id: "h2", name: "Royal Inn Mysore", address: "Sayyaji Rao Road, Mysuru, Karnataka", phone: "+91-82-1234-5678", gstin: "29AABCU9603R1ZN", email: "info@royalinnmysore.in" },
  { id: "h3", name: "Heritage Palace Coorg", address: "Madikeri Main Road, Coorg, Karnataka", phone: "+91-82-7654-3210", gstin: "29AABCU9603R1ZP", email: "bookings@heritagecoorg.in" },
];

export const ALL_CATEGORIES: Category[] = [
  // ─── Income ───────────────────────────────────────────────
  { id: "c_in1",  name: "Room Rent",        icon: "home",          color: "#059669", type: "income" },
  { id: "c_in2",  name: "Room Booking",     icon: "key",           color: "#10B981", type: "income" },
  { id: "c_in3",  name: "Deluxe Room",      icon: "star",          color: "#34D399", type: "income" },
  { id: "c_in4",  name: "Suite Room",       icon: "award",         color: "#0D9488", type: "income" },
  { id: "c_in5",  name: "Restaurant Sales", icon: "coffee",        color: "#F59E0B", type: "income" },
  { id: "c_in6",  name: "Food & Beverage",  icon: "shopping-bag",  color: "#D97706", type: "income" },
  { id: "c_in7",  name: "Bar Sales",        icon: "package",       color: "#B45309", type: "income" },
  { id: "c_in8",  name: "Laundry Service",  icon: "wind",          color: "#6366F1", type: "income" },
  { id: "c_in9",  name: "Spa Service",      icon: "heart",         color: "#EC4899", type: "income" },
  { id: "c_in10", name: "Conference Hall",  icon: "users",         color: "#0EA5E9", type: "income" },
  { id: "c_in11", name: "Banquet Booking",  icon: "calendar",      color: "#7C3AED", type: "income" },
  { id: "c_in12", name: "Parking",          icon: "map-pin",       color: "#64748B", type: "income" },
  { id: "c_in13", name: "Extra Bed",        icon: "plus-square",   color: "#059669", type: "income" },
  { id: "c_in14", name: "Travel Desk",      icon: "map",           color: "#0891B2", type: "income" },
  { id: "c_in15", name: "Swimming Pool",    icon: "droplet",       color: "#06B6D4", type: "income" },
  { id: "c_in16", name: "Event Booking",    icon: "flag",          color: "#8B5CF6", type: "income" },
  { id: "c_in17", name: "Advance Booking",  icon: "clock",         color: "#F97316", type: "income" },
  { id: "c_in18", name: "Online Booking",   icon: "globe",         color: "#0EA5E9", type: "income" },
  { id: "c_in19", name: "Walk-in Guest",    icon: "user-plus",     color: "#10B981", type: "income" },
  { id: "c_in20", name: "Other Income",     icon: "plus-circle",   color: "#6B7280", type: "income" },

  // ─── Expense ──────────────────────────────────────────────
  { id: "c_ex1",  name: "Electricity Bill",     icon: "zap",          color: "#F59E0B", type: "expense" },
  { id: "c_ex2",  name: "Water Bill",           icon: "droplet",      color: "#3B82F6", type: "expense" },
  { id: "c_ex3",  name: "Internet Bill",        icon: "wifi",         color: "#8B5CF6", type: "expense" },
  { id: "c_ex4",  name: "Gas",                  icon: "thermometer",  color: "#EF4444", type: "expense" },
  { id: "c_ex5",  name: "Housekeeping",         icon: "star",         color: "#84CC16", type: "expense" },
  { id: "c_ex6",  name: "Cleaning Supplies",    icon: "trash-2",      color: "#22D3EE", type: "expense" },
  { id: "c_ex7",  name: "Laundry Expense",      icon: "wind",         color: "#6366F1", type: "expense" },
  { id: "c_ex8",  name: "Staff Salary",         icon: "users",        color: "#EF4444", type: "expense" },
  { id: "c_ex9",  name: "Kitchen Expense",      icon: "feather",      color: "#F97316", type: "expense" },
  { id: "c_ex10", name: "Grocery",              icon: "shopping-cart", color: "#8B5CF6", type: "expense" },
  { id: "c_ex11", name: "Vegetables",           icon: "leaf",         color: "#22C55E", type: "expense" },
  { id: "c_ex12", name: "Fruits",               icon: "circle",       color: "#F59E0B", type: "expense" },
  { id: "c_ex13", name: "Dairy Products",       icon: "package",      color: "#A78BFA", type: "expense" },
  { id: "c_ex14", name: "Meat & Seafood",       icon: "anchor",       color: "#EF4444", type: "expense" },
  { id: "c_ex15", name: "Restaurant Purchase",  icon: "coffee",       color: "#D97706", type: "expense" },
  { id: "c_ex16", name: "Maintenance",          icon: "tool",         color: "#F97316", type: "expense" },
  { id: "c_ex17", name: "Plumbing",             icon: "git-merge",    color: "#3B82F6", type: "expense" },
  { id: "c_ex18", name: "Electrical Repair",    icon: "zap",          color: "#FBBF24", type: "expense" },
  { id: "c_ex19", name: "Furniture",            icon: "layout",       color: "#92400E", type: "expense" },
  { id: "c_ex20", name: "Interior",             icon: "layers",       color: "#7C3AED", type: "expense" },
  { id: "c_ex21", name: "Marketing",            icon: "trending-up",  color: "#06B6D4", type: "expense" },
  { id: "c_ex22", name: "Advertisement",        icon: "radio",        color: "#0EA5E9", type: "expense" },
  { id: "c_ex23", name: "Printing",             icon: "printer",      color: "#64748B", type: "expense" },
  { id: "c_ex24", name: "Stationery",           icon: "edit",         color: "#6B7280", type: "expense" },
  { id: "c_ex25", name: "Fuel",                 icon: "truck",        color: "#92400E", type: "expense" },
  { id: "c_ex26", name: "Vehicle Expense",      icon: "navigation",   color: "#78716C", type: "expense" },
  { id: "c_ex27", name: "Software",             icon: "monitor",      color: "#6366F1", type: "expense" },
  { id: "c_ex28", name: "GST Payment",          icon: "percent",      color: "#EF4444", type: "expense" },
  { id: "c_ex29", name: "Tax",                  icon: "file-text",    color: "#B91C1C", type: "expense" },
  { id: "c_ex30", name: "Bank Charges",         icon: "briefcase",    color: "#374151", type: "expense" },
  { id: "c_ex31", name: "Commission",           icon: "share-2",      color: "#7C3AED", type: "expense" },
  { id: "c_ex32", name: "Rent",                 icon: "home",         color: "#B91C1C", type: "expense" },
  { id: "c_ex33", name: "Security",             icon: "shield",       color: "#374151", type: "expense" },
  { id: "c_ex34", name: "Misc. Expense",        icon: "more-horizontal", color: "#6B7280", type: "expense" },
];

export const MOCK_CATEGORIES = ALL_CATEGORIES;

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1",  type: "credit", amount: 45000,  categoryId: "c_in1",  category: ALL_CATEGORIES[0],  paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Room booking - Suite 201",        date: "2026-06-30", time: "09:15", isEdited: false, runningBalance: 245000 },
  { id: "t2",  type: "credit", amount: 12500,  categoryId: "c_in5",  category: ALL_CATEGORIES[4],  paymentMethod: "upi",           hotelId: "h1", remarks: "Restaurant revenue",              date: "2026-06-30", time: "11:30", isEdited: false, runningBalance: 257500 },
  { id: "t3",  type: "debit",  amount: 8500,   categoryId: "c_ex10", category: ALL_CATEGORIES[29], paymentMethod: "cheque",        hotelId: "h1", remarks: "Grocery purchase - Namdhari",    date: "2026-06-30", time: "13:45", isEdited: true,  editedAt: "2026-06-30", editedBy: "Manager", runningBalance: 249000 },
  { id: "t4",  type: "credit", amount: 25000,  categoryId: "c_in10", category: ALL_CATEGORIES[9],  paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Conference hall - Tech Corp",    date: "2026-06-30", time: "14:00", isEdited: false, runningBalance: 274000 },
  { id: "t5",  type: "debit",  amount: 3200,   categoryId: "c_ex1",  category: ALL_CATEGORIES[20], paymentMethod: "cash",          hotelId: "h1", remarks: "Electricity bill payment",       date: "2026-06-30", time: "16:20", isEdited: false, runningBalance: 270800 },
  { id: "t6",  type: "credit", amount: 8900,   categoryId: "c_in9",  category: ALL_CATEGORIES[8],  paymentMethod: "credit_card",   hotelId: "h2", remarks: "Spa booking - 3 guests",        date: "2026-06-30", time: "17:00", isEdited: false, runningBalance: 279700 },
  { id: "t7",  type: "debit",  amount: 125000, categoryId: "c_ex8",  category: ALL_CATEGORIES[27], paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Staff salary - June 2026",      date: "2026-06-29", time: "10:00", isEdited: false, runningBalance: 154700 },
  { id: "t8",  type: "credit", amount: 38000,  categoryId: "c_in1",  category: ALL_CATEGORIES[0],  paymentMethod: "gpay",          hotelId: "h2", remarks: "Weekend package booking",       date: "2026-06-29", time: "11:15", isEdited: false, runningBalance: 192700 },
  { id: "t9",  type: "debit",  amount: 4500,   categoryId: "c_ex16", category: ALL_CATEGORIES[35], paymentMethod: "cash",          hotelId: "h1", remarks: "AC maintenance",                date: "2026-06-29", time: "14:30", isEdited: false, runningBalance: 188200 },
  { id: "t10", type: "credit", amount: 18500,  categoryId: "c_in6",  category: ALL_CATEGORIES[5],  paymentMethod: "cash",          hotelId: "h1", remarks: "Banquet dinner service",        date: "2026-06-28", time: "20:00", isEdited: false, runningBalance: 206700 },
  { id: "t11", type: "debit",  amount: 6700,   categoryId: "c_ex5",  category: ALL_CATEGORIES[24], paymentMethod: "cash",          hotelId: "h1", remarks: "Housekeeping supplies",         date: "2026-06-28", time: "09:00", isEdited: false, runningBalance: 200000 },
  { id: "t12", type: "credit", amount: 56000,  categoryId: "c_in4",  category: ALL_CATEGORIES[3],  paymentMethod: "debit_card",    hotelId: "h3", remarks: "Heritage suite - 4 nights",    date: "2026-06-27", time: "12:00", isEdited: false, runningBalance: 256000 },
  { id: "t13", type: "debit",  amount: 15000,  categoryId: "c_ex21", category: ALL_CATEGORIES[40], paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Digital marketing - June",     date: "2026-06-26", time: "10:30", isEdited: false, runningBalance: 241000 },
  { id: "t14", type: "credit", amount: 9500,   categoryId: "c_in8",  category: ALL_CATEGORIES[7],  paymentMethod: "cash",          hotelId: "h1", remarks: "Laundry service revenue",      date: "2026-06-25", time: "15:00", isEdited: true,  editedAt: "2026-06-25", editedBy: "Owner", runningBalance: 250500 },
  { id: "t15", type: "debit",  amount: 22000,  categoryId: "c_ex2",  category: ALL_CATEGORIES[21], paymentMethod: "cheque",        hotelId: "h1", remarks: "Water bill - Q2 2026",         date: "2026-06-24", time: "11:00", isEdited: false, runningBalance: 228500 },
  { id: "t16", type: "credit", amount: 72000,  categoryId: "c_in1",  category: ALL_CATEGORIES[0],  paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Deluxe rooms - 4 bookings",    date: "2026-06-23", time: "09:00", isEdited: false, runningBalance: 300500 },
  { id: "t17", type: "debit",  amount: 9800,   categoryId: "c_ex10", category: ALL_CATEGORIES[29], paymentMethod: "cash",          hotelId: "h1", remarks: "Weekly vegetable purchase",    date: "2026-06-22", time: "08:00", isEdited: false, runningBalance: 290700 },
  { id: "t18", type: "credit", amount: 34000,  categoryId: "c_in11", category: ALL_CATEGORIES[10], paymentMethod: "bank_transfer", hotelId: "h2", remarks: "Corporate banquet - 50 pax",   date: "2026-06-21", time: "19:00", isEdited: false, runningBalance: 324700 },
  { id: "t19", type: "debit",  amount: 5500,   categoryId: "c_ex3",  category: ALL_CATEGORIES[22], paymentMethod: "bank_transfer", hotelId: "h1", remarks: "Broadband & CCTV internet",    date: "2026-06-20", time: "10:00", isEdited: false, runningBalance: 319200 },
  { id: "t20", type: "credit", amount: 14500,  categoryId: "c_in9",  category: ALL_CATEGORIES[8],  paymentMethod: "cash",          hotelId: "h1", remarks: "Spa package - bridal group",   date: "2026-06-19", time: "14:00", isEdited: false, runningBalance: 333700 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cu1", name: "Tech Corp India Ltd",     phone: "+91-98765-43210", email: "accounts@techcorp.in",       address: "Whitefield, Bengaluru",    outstanding: 85000,  totalPaid: 250000 },
  { id: "cu2", name: "Sharma Enterprises",      phone: "+91-99876-54321", email: "sharma@enterprise.com",     address: "Jayanagar, Bengaluru",     outstanding: 0,      totalPaid: 125000 },
  { id: "cu3", name: "Meera Kaul",              phone: "+91-97654-32198", email: "meera.kaul@gmail.com",      address: "Indiranagar, Bengaluru",   outstanding: 15000,  totalPaid: 45000 },
  { id: "cu4", name: "Global Travels Pvt Ltd",  phone: "+91-80-2345-6789", email: "bookings@globaltravels.in", address: "Koramangala, Bengaluru",   outstanding: 120000, totalPaid: 850000 },
  { id: "cu5", name: "Ravi Kumar",              phone: "+91-94567-89012", email: "ravi.k@yahoo.com",          address: "Rajajinagar, Bengaluru",   outstanding: 0,      totalPaid: 32000 },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: "v1", name: "Namdhari Fresh Foods",   phone: "+91-80-4567-1234", email: "orders@namdhari.com",         address: "Rajajinagar, Bengaluru",   outstanding: 35000, totalPurchased: 450000 },
  { id: "v2", name: "IFB Laundry Services",   phone: "+91-80-3456-7890", email: "service@ifb.in",              address: "Peenya, Bengaluru",        outstanding: 12500, totalPurchased: 95000 },
  { id: "v3", name: "Wipro Lighting",         phone: "+91-80-2234-5678", email: "accounts@wiprolighting.com",  address: "Electronic City, Bengaluru", outstanding: 0,   totalPurchased: 78000 },
  { id: "v4", name: "Simplex Maintenance",    phone: "+91-98456-12345",  email: "info@simplex.co.in",          address: "Whitefield, Bengaluru",    outstanding: 8000,  totalPurchased: 120000 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Payment Received",     message: "₹85,000 received from Tech Corp India Ltd",     type: "payment_received", isRead: false, createdAt: "2026-06-30T09:15:00" },
  { id: "n2", title: "Invoice Sent",         message: "Invoice #INV-2026-089 sent to Global Travels",  type: "invoice_sent",     isRead: false, createdAt: "2026-06-30T08:30:00" },
  { id: "n3", title: "Pending Bill Reminder", message: "Staff salary for June 2026 is due",            type: "pending_bill",     isRead: true,  createdAt: "2026-06-29T10:00:00" },
  { id: "n4", title: "Payment Due",          message: "Namdhari Fresh Foods - ₹35,000 overdue by 5 days", type: "reminder",    isRead: true,  createdAt: "2026-06-28T09:00:00" },
  { id: "n5", title: "System Update",        message: "Hotel Ledger Pro v2.1.0 is now available",     type: "system",           isRead: true,  createdAt: "2026-06-27T12:00:00" },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv1", invoiceNumber: "INV-2026-089", customerId: "cu4", customer: MOCK_CUSTOMERS[3],
    hotelId: "h1", status: "sent", date: "2026-06-30", dueDate: "2026-07-15",
    items: [{ id: "i1", description: "Deluxe Room - 3 nights", quantity: 3, rate: 8500, gstRate: 12, amount: 25500 }],
    subtotal: 25500, gstAmount: 3060, discount: 0, total: 28560,
  },
  {
    id: "inv2", invoiceNumber: "INV-2026-088", customerId: "cu1", customer: MOCK_CUSTOMERS[0],
    hotelId: "h1", status: "paid", date: "2026-06-25", dueDate: "2026-07-10",
    items: [{ id: "i2", description: "Conference Hall - Full Day", quantity: 1, rate: 25000, gstRate: 18, amount: 25000 }],
    subtotal: 25000, gstAmount: 4500, discount: 2500, total: 27000,
  },
  {
    id: "inv3", invoiceNumber: "INV-2026-087", customerId: "cu3", customer: MOCK_CUSTOMERS[2],
    hotelId: "h2", status: "overdue", date: "2026-06-15", dueDate: "2026-06-29",
    items: [{ id: "i3", description: "Spa Package - Couple", quantity: 1, rate: 15000, gstRate: 18, amount: 15000 }],
    subtotal: 15000, gstAmount: 2700, discount: 700, total: 17000,
  },
];

export const MOCK_DASHBOARD = {
  todayIncome: 91400,
  todayExpense: 11700,
  cashBalance: 185000,
  bankBalance: 1245000,
  netProfit: 79700,
  pendingPayments: 55500,
  pendingCollections: 220000,
  monthIncome: 1850000,
  monthExpense: 420000,
};

export const MOCK_MONTHLY_DATA = [
  { month: "Jan", income: 1200000, expense: 380000, profit: 820000 },
  { month: "Feb", income: 1450000, expense: 410000, profit: 1040000 },
  { month: "Mar", income: 1680000, expense: 390000, profit: 1290000 },
  { month: "Apr", income: 1320000, expense: 445000, profit: 875000 },
  { month: "May", income: 1750000, expense: 398000, profit: 1352000 },
  { month: "Jun", income: 1850000, expense: 420000, profit: 1430000 },
];

export const CATEGORY_ICON_OPTIONS: string[] = [
  "home", "key", "star", "award", "coffee", "shopping-bag", "package", "wind",
  "heart", "users", "calendar", "map-pin", "map", "droplet", "flag", "clock",
  "globe", "user-plus", "plus-circle", "zap", "wifi", "thermometer", "trash-2",
  "leaf", "shopping-cart", "tool", "layers", "trending-up", "radio", "printer",
  "edit", "truck", "navigation", "monitor", "percent", "file-text", "briefcase",
  "share-2", "shield", "more-horizontal", "activity", "layout", "anchor",
  "git-merge", "feather", "credit-card", "dollar-sign", "bar-chart-2", "pie-chart",
];

export const CATEGORY_COLOR_OPTIONS: string[] = [
  "#059669", "#10B981", "#34D399", "#0D9488", "#06B6D4", "#0EA5E9", "#3B82F6",
  "#6366F1", "#8B5CF6", "#7C3AED", "#A855F7", "#EC4899", "#F43F5E", "#EF4444",
  "#F97316", "#F59E0B", "#D97706", "#B45309", "#84CC16", "#22C55E", "#64748B",
  "#6B7280", "#374151",
];
