import { Router } from "express";
import { db } from "@workspace/db";
import { ledgerAccountsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /ledger
router.get("/ledger", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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

    const list = await db
      .select()
      .from(ledgerAccountsTable)
      .where(
        and(
          eq(ledgerAccountsTable.hotelId, targetHotelId),
          eq(ledgerAccountsTable.isDeleted, false)
        )
      )
      .orderBy(desc(ledgerAccountsTable.createdAt));

    // Convert balance from decimal string to number
    const formatted = list.map((l) => ({
      ...l,
      balance: Number(l.balance),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ledger
router.post("/ledger", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, code, type, description, balance, hotelId, branchId } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: "Name and type are required" });
      return;
    }

    const targetHotelId = user.role === "owner" ? (hotelId || user.hotelId) : user.hotelId;
    const targetBranchId = user.role === "owner" ? (branchId || user.branchId) : user.branchId;

    const [account] = await db
      .insert(ledgerAccountsTable)
      .values({
        name,
        code: code || null,
        type: type as "asset" | "liability" | "equity" | "revenue" | "expense",
        description: description || null,
        balance: String(balance || 0),
        hotelId: targetHotelId,
        branchId: targetBranchId,
        createdBy: user.id,
      })
      .returning();

    res.status(201).json({
      ...account,
      balance: Number(account.balance),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /ledger/:id
router.put("/ledger/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { name, code, type, description, balance } = req.body;

    const existing = await db.select().from(ledgerAccountsTable).where(eq(ledgerAccountsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Ledger account not found" });
      return;
    }

    const acc = existing[0];
    if (user.role !== "owner" && acc.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    const updates: any = {
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    if (name) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (type) updates.type = type;
    if (description !== undefined) updates.description = description;
    if (balance !== undefined) updates.balance = String(balance);

    const [updated] = await db
      .update(ledgerAccountsTable)
      .set(updates)
      .where(eq(ledgerAccountsTable.id, id))
      .returning();

    res.json({
      ...updated,
      balance: Number(updated.balance),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /ledger/:id
router.delete("/ledger/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db.select().from(ledgerAccountsTable).where(eq(ledgerAccountsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Ledger account not found" });
      return;
    }

    const acc = existing[0];
    if (user.role !== "owner" && acc.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    await db
      .update(ledgerAccountsTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(ledgerAccountsTable.id, id));

    res.json({ success: true, message: "Ledger account deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
