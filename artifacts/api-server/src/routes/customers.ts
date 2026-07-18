import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /customers
router.get("/customers", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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
      .from(customersTable)
      .where(
        and(
          eq(customersTable.hotelId, targetHotelId),
          eq(customersTable.isDeleted, false)
        )
      )
      .orderBy(desc(customersTable.createdAt));

    // Convert decimal strings to numbers for client safety
    const formatted = list.map((c) => ({
      ...c,
      outstanding: Number(c.outstanding),
      totalPaid: Number(c.totalPaid),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /customers
router.post("/customers", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, phone, email, address, outstanding, totalPaid, hotelId, branchId } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "Name and phone number are required" });
      return;
    }

    const targetHotelId = user.role === "owner" ? (hotelId || user.hotelId) : user.hotelId;
    const targetBranchId = user.role === "owner" ? (branchId || user.branchId) : user.branchId;

    const [customer] = await db
      .insert(customersTable)
      .values({
        name,
        phone,
        email: email || null,
        address: address || null,
        outstanding: String(outstanding || 0),
        totalPaid: String(totalPaid || 0),
        hotelId: targetHotelId,
        branchId: targetBranchId,
        createdBy: user.id,
      })
      .returning();

    res.status(201).json({
      ...customer,
      outstanding: Number(customer.outstanding),
      totalPaid: Number(customer.totalPaid),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /customers/:id
router.put("/customers/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { name, phone, email, address, outstanding, totalPaid } = req.body;

    const existing = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const cust = existing[0];
    if (user.role !== "owner" && cust.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    const updates: any = {
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (outstanding !== undefined) updates.outstanding = String(outstanding);
    if (totalPaid !== undefined) updates.totalPaid = String(totalPaid);

    const [updated] = await db
      .update(customersTable)
      .set(updates)
      .where(eq(customersTable.id, id))
      .returning();

    res.json({
      ...updated,
      outstanding: Number(updated.outstanding),
      totalPaid: Number(updated.totalPaid),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /customers/:id
router.delete("/customers/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const cust = existing[0];
    if (user.role !== "owner" && cust.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    await db
      .update(customersTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(customersTable.id, id));

    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
