import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, customersTable, vendorsTable } from "@workspace/db/schema";
import { eq, and, gte, lte, sum, sql } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/dashboard", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Scoping check: Owner can select branch/hotel, manager/staff are locked to their own hotelId
    let targetHotelId = user.hotelId;
    if (user.role === "owner" && req.query.hotelId) {
      targetHotelId = req.query.hotelId as string;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

    // 1. Today's income (credits)
    const todayIncomeRes = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "credit"),
          eq(transactionsTable.date, todayStr),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const todayIncome = Number(todayIncomeRes[0]?.val || 0);

    // 2. Today's expense (debits)
    const todayExpenseRes = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "debit"),
          eq(transactionsTable.date, todayStr),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const todayExpense = Number(todayExpenseRes[0]?.val || 0);

    // 3. Cash balance (credits minus debits with paymentMethod = 'cash')
    const cashCredit = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.paymentMethod, "cash"),
          eq(transactionsTable.type, "credit"),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const cashDebit = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.paymentMethod, "cash"),
          eq(transactionsTable.type, "debit"),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const cashBalance = Number(cashCredit[0]?.val || 0) - Number(cashDebit[0]?.val || 0);

    // 4. Bank balance (digital payments: bank_transfer, upi, credit_card, etc.)
    const bankCredit = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "credit"),
          eq(transactionsTable.isDeleted, false),
          sql`${transactionsTable.paymentMethod} != 'cash'`
        )
      );
    const bankDebit = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "debit"),
          eq(transactionsTable.isDeleted, false),
          sql`${transactionsTable.paymentMethod} != 'cash'`
        )
      );
    const bankBalance = Number(bankCredit[0]?.val || 0) - Number(bankDebit[0]?.val || 0);

    // 5. Pending collections (Outstanding from customers)
    const collectionsRes = await db
      .select({ val: sum(customersTable.outstanding) })
      .from(customersTable)
      .where(
        and(
          eq(customersTable.hotelId, targetHotelId),
          eq(customersTable.isDeleted, false)
        )
      );
    const pendingCollections = Number(collectionsRes[0]?.val || 0);

    // 6. Pending payments (Outstanding to vendors)
    const paymentsRes = await db
      .select({ val: sum(vendorsTable.outstanding) })
      .from(vendorsTable)
      .where(
        and(
          eq(vendorsTable.hotelId, targetHotelId),
          eq(vendorsTable.isDeleted, false)
        )
      );
    const pendingPayments = Number(paymentsRes[0]?.val || 0);

    // 7. Month income
    const monthIncomeRes = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "credit"),
          gte(transactionsTable.date, startOfMonth),
          lte(transactionsTable.date, endOfMonth),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const monthIncome = Number(monthIncomeRes[0]?.val || 0);

    // 8. Month expense
    const monthExpenseRes = await db
      .select({ val: sum(transactionsTable.amount) })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.hotelId, targetHotelId),
          eq(transactionsTable.type, "debit"),
          gte(transactionsTable.date, startOfMonth),
          lte(transactionsTable.date, endOfMonth),
          eq(transactionsTable.isDeleted, false)
        )
      );
    const monthExpense = Number(monthExpenseRes[0]?.val || 0);

    // 9. Generate Monthly data (6 months back trend)
    const monthlyTrend: any[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];

      const mIncRes = await db
        .select({ val: sum(transactionsTable.amount) })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.hotelId, targetHotelId),
            eq(transactionsTable.type, "credit"),
            gte(transactionsTable.date, mStart),
            lte(transactionsTable.date, mEnd),
            eq(transactionsTable.isDeleted, false)
          )
        );
      const mExpRes = await db
        .select({ val: sum(transactionsTable.amount) })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.hotelId, targetHotelId),
            eq(transactionsTable.type, "debit"),
            gte(transactionsTable.date, mStart),
            lte(transactionsTable.date, mEnd),
            eq(transactionsTable.isDeleted, false)
          )
        );

      const inc = Number(mIncRes[0]?.val || 0);
      const exp = Number(mExpRes[0]?.val || 0);

      monthlyTrend.push({
        month: months[d.getMonth()],
        income: inc,
        expense: exp,
        profit: inc - exp,
      });
    }

    res.json({
      summary: {
        todayIncome,
        todayExpense,
        cashBalance: Math.max(cashBalance, 0), // Fallback negative balances to 0 or preserve
        bankBalance: Math.max(bankBalance, 0),
        netProfit: todayIncome - todayExpense,
        pendingPayments,
        pendingCollections,
        monthIncome,
        monthExpense,
      },
      monthlyData: monthlyTrend,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
