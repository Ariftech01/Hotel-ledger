import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, categoriesTable } from "@workspace/db/schema";
import { eq, and, desc, or, like, sql } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /transactions
router.get("/transactions", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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

    const { type, search, categoryId } = req.query;

    const conditions = [
      eq(transactionsTable.hotelId, targetHotelId),
      eq(transactionsTable.isDeleted, false),
    ];

    if (type === "credit" || type === "debit") {
      conditions.push(eq(transactionsTable.type, type));
    }

    if (categoryId) {
      conditions.push(eq(transactionsTable.categoryId, categoryId as string));
    }

    // Load transactions with category relation
    const list = await db.query.transactionsTable.findMany({
      where: (t, { and: andFn }) => andFn(...conditions),
      with: {
        category: true,
      },
      orderBy: [desc(transactionsTable.date), desc(transactionsTable.time)],
    });

    // Map decimal amounts from strings to numbers for React Native compatibility
    const formatted = list.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }));

    // If search term is provided, filter in-memory to match category name or remarks or amount
    let filtered = formatted;
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase();
      filtered = formatted.filter((t) =>
        t.remarks.toLowerCase().includes(q) ||
        (t.category?.name?.toLowerCase().includes(q) ?? false) ||
        String(t.amount).includes(q)
      );
    }

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /transactions
router.post("/transactions", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { type, amount, categoryId, paymentMethod, remarks, description, date, time, hotelId, branchId } = req.body;

    if (!type || !amount || !categoryId || !paymentMethod || !date || !time) {
      res.status(400).json({ error: "Missing required transaction fields" });
      return;
    }

    // Scoping check: non-owners cannot insert transactions for other properties
    const targetHotelId = user.role === "owner" ? (hotelId || user.hotelId) : user.hotelId;
    const targetBranchId = user.role === "owner" ? (branchId || user.branchId) : user.branchId;

    const [tx] = await db
      .insert(transactionsTable)
      .values({
        type: type as "credit" | "debit",
        amount: String(amount),
        categoryId,
        paymentMethod: paymentMethod as any,
        remarks: remarks || "",
        description: description || null,
        date,
        time,
        hotelId: targetHotelId,
        branchId: targetBranchId,
        createdBy: user.id,
      })
      .returning();

    // Fetch the inserted transaction with category loaded
    const fullTx = await db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, tx.id),
      with: {
        category: true,
      },
    });

    if (!fullTx) {
      res.status(500).json({ error: "Failed to retrieve created transaction" });
      return;
    }

    res.status(201).json({
      ...fullTx,
      amount: Number(fullTx.amount),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /transactions/:id
router.put("/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { type, amount, categoryId, paymentMethod, remarks, description, date, time } = req.body;

    // Check if transaction exists and belongs to the user's scoped property
    const existing = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const tx = existing[0];
    if (user.role !== "owner" && tx.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied to this branch data" });
      return;
    }

    const updates: any = {
      isEdited: true,
      editedAt: new Date(),
      editedBy: user.id,
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    if (type) updates.type = type;
    if (amount) updates.amount = String(amount);
    if (categoryId) updates.categoryId = categoryId;
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (remarks !== undefined) updates.remarks = remarks;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = date;
    if (time) updates.time = time;

    await db.update(transactionsTable).set(updates).where(eq(transactionsTable.id, id));

    const updatedTx = await db.query.transactionsTable.findFirst({
      where: eq(transactionsTable.id, id),
      with: {
        category: true,
      },
    });

    res.json({
      ...updatedTx,
      amount: Number(updatedTx?.amount),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /transactions/:id
router.delete("/transactions/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    const tx = existing[0];
    if (user.role !== "owner" && tx.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied to this branch data" });
      return;
    }

    // Soft delete transaction
    await db
      .update(transactionsTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(transactionsTable.id, id));

    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
