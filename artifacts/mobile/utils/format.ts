export function formatIndianCurrency(amount: number): string {
  if (amount === 0) return "₹0";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const str = abs.toFixed(0);
  const lastThree = str.slice(-3);
  const remaining = str.slice(0, -3);
  let formatted = lastThree;
  if (remaining.length > 0) {
    const parts = [];
    let rem = remaining;
    while (rem.length > 2) {
      parts.unshift(rem.slice(-2));
      rem = rem.slice(0, -2);
    }
    if (rem.length > 0) parts.unshift(rem);
    formatted = parts.join(",") + "," + lastThree;
  }
  return `${sign}₹${formatted}`;
}

export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  } else if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  } else if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  }
  return formatIndianCurrency(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatTime(timeStr: string): string {
  const [hour, minute] = timeStr.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${formatTime(timeStr)}`;
}

export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getMonthName(monthIndex: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[monthIndex] ?? "Jan";
}

export function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) return "Today";
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";
  return formatDate(dateStr);
}

export function parseAmount(text: string): number {
  const cleaned = text.replace(/[₹,\s]/g, "");
  return parseFloat(cleaned) || 0;
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  upi: "UPI",
  gpay: "Google Pay",
  phonepe: "PhonePe",
  paytm: "Paytm",
  bhim: "BHIM",
  cheque: "Cheque",
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  bank_transfer: "Bank Transfer",
};

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: "dollar-sign",
  upi: "smartphone",
  gpay: "smartphone",
  phonepe: "smartphone",
  paytm: "smartphone",
  bhim: "smartphone",
  cheque: "file-text",
  credit_card: "credit-card",
  debit_card: "credit-card",
  bank_transfer: "briefcase",
};
