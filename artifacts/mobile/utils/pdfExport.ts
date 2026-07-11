import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import type { Hotel, Transaction } from "@/types";
import { formatDate, formatIndianCurrency, PAYMENT_METHOD_LABELS } from "./format";

export interface PDFReportOptions {
  hotel: Hotel;
  transactions: Transaction[];
  dateFrom: string;
  dateTo: string;
  preparedBy: string;
  filterLabel: string;
}

function formatDateDisplay(d: string) {
  return formatDate(d);
}

function buildCategoryTotals(transactions: Transaction[]) {
  const map: Record<string, { name: string; color: string; income: number; expense: number; count: number }> = {};
  for (const t of transactions) {
    const catName = t.category?.name ?? "Uncategorized";
    const catColor = t.category?.color ?? "#6B7280";
    if (!map[catName]) map[catName] = { name: catName, color: catColor, income: 0, expense: 0, count: 0 };
    if (t.type === "credit") map[catName].income += t.amount;
    else map[catName].expense += t.amount;
    map[catName].count++;
  }
  return Object.values(map).sort((a, b) => (b.income + b.expense) - (a.income + a.expense));
}

function buildPaymentTotals(transactions: Transaction[]) {
  const map: Record<string, number> = {};
  for (const t of transactions) {
    const pm = PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod;
    map[pm] = (map[pm] ?? 0) + t.amount;
  }
  return map;
}

export async function generateAndSharePDF(opts: PDFReportOptions): Promise<void> {
  const { hotel, transactions, dateFrom, dateTo, preparedBy, filterLabel } = opts;

  const totalIncome = transactions.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const cashTx = transactions.filter((t) => t.paymentMethod === "cash").reduce((s, t) => s + t.amount, 0);
  const bankTx = transactions.filter((t) => t.paymentMethod === "bank_transfer").reduce((s, t) => s + t.amount, 0);
  const upiTx = transactions.filter((t) => ["upi", "gpay", "phonepe", "paytm", "bhim"].includes(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);

  const catTotals = buildCategoryTotals(transactions);
  const pmTotals = buildPaymentTotals(transactions);

  const generatedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });

  const rows = transactions.map((t, i) => `
    <tr style="background:${i % 2 === 0 ? "#FAFAFA" : "#FFFFFF"};">
      <td style="padding:8px 10px;font-size:11px;color:#374151;border-bottom:1px solid #F3F4F6;">${formatDateDisplay(t.date)}</td>
      <td style="padding:8px 10px;font-size:11px;color:#374151;border-bottom:1px solid #F3F4F6;">${t.time}</td>
      <td style="padding:8px 10px;font-size:11px;color:#374151;border-bottom:1px solid #F3F4F6;">${t.category?.name ?? "—"}</td>
      <td style="padding:8px 10px;font-size:11px;color:#374151;border-bottom:1px solid #F3F4F6;">${t.remarks}</td>
      <td style="padding:8px 10px;font-size:11px;color:#374151;border-bottom:1px solid #F3F4F6;">${PAYMENT_METHOD_LABELS[t.paymentMethod] ?? t.paymentMethod}</td>
      <td style="padding:8px 10px;font-size:12px;font-weight:600;color:#059669;border-bottom:1px solid #F3F4F6;text-align:right;">${t.type === "credit" ? formatIndianCurrency(t.amount) : ""}</td>
      <td style="padding:8px 10px;font-size:12px;font-weight:600;color:#EF4444;border-bottom:1px solid #F3F4F6;text-align:right;">${t.type === "debit" ? formatIndianCurrency(t.amount) : ""}</td>
      <td style="padding:8px 10px;font-size:11px;color:#6B7280;border-bottom:1px solid #F3F4F6;text-align:right;">${t.runningBalance !== undefined ? formatIndianCurrency(t.runningBalance) : "—"}</td>
    </tr>`).join("");

  const catRows = catTotals.map((c) => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;color:#374151;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.color};margin-right:8px;"></span>${c.name}
      </td>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#059669;text-align:right;">${c.income > 0 ? formatIndianCurrency(c.income) : "—"}</td>
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#EF4444;text-align:right;">${c.expense > 0 ? formatIndianCurrency(c.expense) : "—"}</td>
      <td style="padding:8px 12px;font-size:12px;color:#6B7280;text-align:right;">${c.count}</td>
    </tr>`).join("");

  const pmRows = Object.entries(pmTotals).map(([pm, amt]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #F3F4F6;">
      <span style="font-size:12px;color:#374151;">${pm}</span>
      <span style="font-size:13px;font-weight:600;color:#1E40AF;">${formatIndianCurrency(amt)}</span>
    </div>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Hotel Ledger Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; background: #fff; color: #111; }
    .page { max-width: 800px; margin: 0 auto; padding: 32px 40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:24px; border-bottom:3px solid #1E40AF; margin-bottom:32px; }
    .logo-area h1 { font-size:24px; font-weight:800; color:#1E40AF; margin-bottom:4px; }
    .logo-area p { font-size:12px; color:#6B7280; line-height:1.6; }
    .report-meta { text-align:right; }
    .report-meta h2 { font-size:18px; font-weight:700; color:#111; margin-bottom:6px; }
    .report-meta p { font-size:11px; color:#6B7280; line-height:1.8; }
    .period-badge { display:inline-block; background:#EFF6FF; color:#1E40AF; font-size:12px; font-weight:600; padding:4px 12px; border-radius:100px; border:1px solid #BFDBFE; margin-bottom:8px; }
    .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px; }
    .kpi-card { border-radius:12px; padding:16px 20px; }
    .kpi-card.income { background:#D1FAE5; border:1px solid #6EE7B7; }
    .kpi-card.expense { background:#FEE2E2; border:1px solid #FCA5A5; }
    .kpi-card.profit { background:#EFF6FF; border:1px solid #BFDBFE; }
    .kpi-label { font-size:11px; font-weight:500; margin-bottom:6px; }
    .kpi-card.income .kpi-label { color:#065F46; }
    .kpi-card.expense .kpi-label { color:#991B1B; }
    .kpi-card.profit .kpi-label { color:#1E3A8A; }
    .kpi-amount { font-size:22px; font-weight:800; }
    .kpi-card.income .kpi-amount { color:#059669; }
    .kpi-card.expense .kpi-amount { color:#EF4444; }
    .kpi-card.profit .kpi-amount { color:#1E40AF; }
    .kpi-sub { font-size:11px; margin-top:4px; }
    .kpi-card.income .kpi-sub { color:#065F46; }
    .kpi-card.expense .kpi-sub { color:#991B1B; }
    .kpi-card.profit .kpi-sub { color:#1E3A8A; }
    .secondary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:32px; }
    .secondary-card { background:#F9FAFB; border:1px solid #E5E7EB; border-radius:10px; padding:12px 16px; }
    .secondary-label { font-size:10px; color:#6B7280; margin-bottom:4px; }
    .secondary-value { font-size:15px; font-weight:700; color:#111; }
    section { margin-bottom:32px; }
    section h3 { font-size:15px; font-weight:700; color:#111; padding-bottom:10px; border-bottom:2px solid #F3F4F6; margin-bottom:16px; letter-spacing:-0.2px; }
    .cat-table, .tx-table { width:100%; border-collapse:collapse; }
    .cat-table th, .tx-table th { background:#1E40AF; color:#fff; font-size:11px; font-weight:600; padding:10px 12px; text-align:left; }
    .cat-table th:last-child { text-align:right; }
    .cat-table td:not(:first-child) { text-align:right; }
    .tx-table th:nth-child(6), .tx-table th:nth-child(7), .tx-table th:nth-child(8) { text-align:right; }
    .pm-section { background:#F9FAFB; border-radius:12px; border:1px solid #E5E7EB; padding:16px 20px; }
    .footer { margin-top:40px; padding-top:20px; border-top:2px solid #F3F4F6; display:flex; justify-content:space-between; align-items:center; }
    .footer p { font-size:10px; color:#9CA3AF; }
    @media print { body { -webkit-print-color-adjust:exact; } }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-area">
      <h1>🏨 ${hotel.name}</h1>
      <p>${hotel.address}<br/>${hotel.phone}${hotel.email ? " · " + hotel.email : ""}${hotel.gstin ? "<br/>GSTIN: " + hotel.gstin : ""}</p>
    </div>
    <div class="report-meta">
      <div class="period-badge">${filterLabel}</div>
      <h2>Ledger Report</h2>
      <p>Generated: ${generatedAt}<br/>Period: ${formatDateDisplay(dateFrom)} – ${formatDateDisplay(dateTo)}<br/>Prepared by: ${preparedBy}<br/>Total entries: ${transactions.length}</p>
    </div>
  </div>

  <!-- KPI CARDS -->
  <div class="kpi-grid">
    <div class="kpi-card income">
      <div class="kpi-label">▲ Total Income</div>
      <div class="kpi-amount">${formatIndianCurrency(totalIncome)}</div>
      <div class="kpi-sub">${transactions.filter((t) => t.type === "credit").length} transactions</div>
    </div>
    <div class="kpi-card expense">
      <div class="kpi-label">▼ Total Expense</div>
      <div class="kpi-amount">${formatIndianCurrency(totalExpense)}</div>
      <div class="kpi-sub">${transactions.filter((t) => t.type === "debit").length} transactions</div>
    </div>
    <div class="kpi-card profit">
      <div class="kpi-label">${netProfit >= 0 ? "◆" : "▼"} Net ${netProfit >= 0 ? "Profit" : "Loss"}</div>
      <div class="kpi-amount" style="color:${netProfit >= 0 ? "#1E40AF" : "#EF4444"};">${formatIndianCurrency(netProfit)}</div>
      <div class="kpi-sub">Margin: ${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0"}%</div>
    </div>
  </div>

  <!-- PAYMENT BREAKDOWN -->
  <div class="secondary-grid">
    <div class="secondary-card"><div class="secondary-label">Cash Transactions</div><div class="secondary-value">${formatIndianCurrency(cashTx)}</div></div>
    <div class="secondary-card"><div class="secondary-label">Bank Transfers</div><div class="secondary-value">${formatIndianCurrency(bankTx)}</div></div>
    <div class="secondary-card"><div class="secondary-label">UPI Payments</div><div class="secondary-value">${formatIndianCurrency(upiTx)}</div></div>
  </div>

  <!-- CATEGORY SUMMARY -->
  <section>
    <h3>Category Summary</h3>
    <table class="cat-table">
      <thead>
        <tr>
          <th style="width:40%;">Category</th>
          <th>Income</th>
          <th>Expense</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>${catRows}</tbody>
    </table>
  </section>

  <!-- PAYMENT METHOD BREAKDOWN -->
  <section>
    <h3>Payment Method Breakdown</h3>
    <div class="pm-section">${pmRows}</div>
  </section>

  <!-- TRANSACTION TABLE -->
  <section>
    <h3>Transaction Details</h3>
    <table class="tx-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Category</th>
          <th>Remarks</th>
          <th>Method</th>
          <th>Income</th>
          <th>Expense</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:#EFF6FF;">
          <td colspan="5" style="padding:10px 12px;font-weight:700;font-size:13px;color:#1E40AF;">TOTAL</td>
          <td style="padding:10px 12px;font-weight:800;font-size:13px;color:#059669;text-align:right;">${formatIndianCurrency(totalIncome)}</td>
          <td style="padding:10px 12px;font-weight:800;font-size:13px;color:#EF4444;text-align:right;">${formatIndianCurrency(totalExpense)}</td>
          <td style="padding:10px 12px;font-weight:800;font-size:13px;color:#1E40AF;text-align:right;">${formatIndianCurrency(netProfit)}</td>
        </tr>
      </tfoot>
    </table>
  </section>

  <!-- FOOTER -->
  <div class="footer">
    <p>Hotel Ledger Pro · Generated on ${generatedAt}</p>
    <p>This is a computer-generated report. No signature required.</p>
  </div>

</div>
</body>
</html>`;

  if (Platform.OS === "web") {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Report" });
  }
}
