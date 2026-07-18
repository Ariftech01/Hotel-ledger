import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, categoriesTable } from "@workspace/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/reports", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let targetHotelId = user.hotelId;
    if (user.role === "owner" && req.query.hotelId) {
      targetHotelId = req.query.hotelId as string;
    }

    const { startDate, endDate, format } = req.query;

    const conditions = [
      eq(transactionsTable.hotelId, targetHotelId),
      eq(transactionsTable.isDeleted, false),
    ];

    if (startDate) {
      conditions.push(gte(transactionsTable.date, startDate as string));
    }
    if (endDate) {
      conditions.push(lte(transactionsTable.date, endDate as string));
    }

    const list = await db.query.transactionsTable.findMany({
      where: (t, { and: andFn }) => andFn(...conditions),
      with: {
        category: true,
      },
      orderBy: [desc(transactionsTable.date), desc(transactionsTable.time)],
    });

    const formatted = list.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    // CSV format generation
    if (format === "csv") {
      let csv = "Date,Time,Type,Amount,Category,Remarks,Payment Method\n";
      for (const t of formatted) {
        const catName = t.category?.name || "Uncategorized";
        const remarksEscaped = t.remarks.replace(/"/g, '""');
        csv += `${t.date},${t.time},${t.type},${t.amount},"${catName}","${remarksEscaped}",${t.paymentMethod}\n`;
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=ledger_report_${startDate || "all"}_to_${endDate || "all"}.csv`);
      res.send(csv);
      return;
    }

    // Excel format generation (served as TSV which Excel opens automatically)
    if (format === "xlsx" || format === "excel") {
      let tsv = "Date\tTime\tType\tAmount\tCategory\tRemarks\tPayment Method\n";
      for (const t of formatted) {
        const catName = t.category?.name || "Uncategorized";
        tsv += `${t.date}\t${t.time}\t${t.type}\t${t.amount}\t${catName}\t${t.remarks}\t${t.paymentMethod}\n`;
      }
      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader("Content-Disposition", `attachment; filename=ledger_report_${startDate || "all"}_to_${endDate || "all"}.xls`);
      res.send(tsv);
      return;
    }

    // HTML / PDF print layout format
    if (format === "pdf" || format === "html") {
      let rows = "";
      let totalIncome = 0;
      let totalExpense = 0;

      for (const t of formatted) {
        if (t.type === "credit") totalIncome += t.amount;
        else totalExpense += t.amount;

        rows += `
          <tr>
            <td>${t.date} ${t.time}</td>
            <td style="color:${t.type === "credit" ? "green" : "red"}">${t.type.toUpperCase()}</td>
            <td>₹${t.amount.toFixed(2)}</td>
            <td>${t.category?.name || "Uncategorized"}</td>
            <td>${t.remarks}</td>
            <td>${t.paymentMethod.replace("_", " ")}</td>
          </tr>
        `;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Hotel Ledger Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 8px; }
            .print-btn { background-color: #1e40af; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <h2>Hotel Ledger Report</h2>
          <p>Period: ${startDate || "All"} to ${endDate || "All"}</p>
          <button class="print-btn" onclick="window.print()">Print to PDF</button>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Income (Credit):</strong> ₹${totalIncome.toFixed(2)}</p>
            <p><strong>Total Expense (Debit):</strong> ₹${totalExpense.toFixed(2)}</p>
            <p><strong>Net Balance:</strong> ₹${(totalIncome - totalExpense).toFixed(2)}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Remarks</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
        </html>
      `;

      res.setHeader("Content-Type", "text/html");
      res.send(html);
      return;
    }

    // Default JSON Summary
    const totalIncome = formatted.filter((t) => t.type === "credit").reduce((s, t) => s + t.amount, 0);
    const totalExpense = formatted.filter((t) => t.type === "debit").reduce((s, t) => s + t.amount, 0);

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        transactionCount: formatted.length,
      },
      transactions: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
