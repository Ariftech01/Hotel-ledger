import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, categoriesTable } from "@workspace/db/schema";
import { eq, and, sum, sql } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/analytics", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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

    const { startDate, endDate } = req.query;

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

    // Fetch transactions with categories
    const list = await db.query.transactionsTable.findMany({
      where: (t, { and: andFn }) => andFn(...conditions),
      with: {
        category: true,
      },
    });

    const totalIncome = list.filter((t) => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = list.filter((t) => t.type === "debit").reduce((s, t) => s + Number(t.amount), 0);

    // Group income by category
    const incomeMap: Record<string, { category: any; total: number; count: number }> = {};
    const expenseMap: Record<string, { category: any; total: number; count: number }> = {};

    for (const t of list) {
      const cat = t.category || { id: "other", name: "Other", icon: "plus-circle", color: "#6B7280" };
      const amt = Number(t.amount);

      if (t.type === "credit") {
        if (!incomeMap[cat.id]) {
          incomeMap[cat.id] = { category: cat, total: 0, count: 0 };
        }
        incomeMap[cat.id].total += amt;
        incomeMap[cat.id].count += 1;
      } else {
        if (!expenseMap[cat.id]) {
          expenseMap[cat.id] = { category: cat, total: 0, count: 0 };
        }
        expenseMap[cat.id].total += amt;
        expenseMap[cat.id].count += 1;
      }
    }

    const incomeByCategory = Object.values(incomeMap).map((item) => ({
      category: item.category,
      total: item.total,
      count: item.count,
      percentage: totalIncome > 0 ? Math.round((item.total / totalIncome) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    const expenseByCategory = Object.values(expenseMap).map((item) => ({
      category: item.category,
      total: item.total,
      count: item.count,
      percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    res.json({
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for typescript validation
function gte(col: any, val: string) {
  return sql`${col} >= ${val}`;
}
function lte(col: any, val: string) {
  return sql`${col} <= ${val}`;
}

export default router;
