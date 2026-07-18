import { Router } from "express";
import { db } from "@workspace/db";
import { vendorsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /vendors
router.get("/vendors", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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
      .from(vendorsTable)
      .where(
        and(
          eq(vendorsTable.hotelId, targetHotelId),
          eq(vendorsTable.isDeleted, false)
        )
      )
      .orderBy(desc(vendorsTable.createdAt));

    // Convert decimal strings to numbers for client safety
    const formatted = list.map((v) => ({
      ...v,
      outstanding: Number(v.outstanding),
      totalPurchased: Number(v.totalPurchased),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /vendors
router.post("/vendors", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, phone, email, address, outstanding, totalPurchased, hotelId, branchId } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "Name and phone number are required" });
      return;
    }

    const targetHotelId = user.role === "owner" ? (hotelId || user.hotelId) : user.hotelId;
    const targetBranchId = user.role === "owner" ? (branchId || user.branchId) : user.branchId;

    const [vendor] = await db
      .insert(vendorsTable)
      .values({
        name,
        phone,
        email: email || null,
        address: address || null,
        outstanding: String(outstanding || 0),
        totalPurchased: String(totalPurchased || 0),
        hotelId: targetHotelId,
        branchId: targetBranchId,
        createdBy: user.id,
      })
      .returning();

    res.status(201).json({
      ...vendor,
      outstanding: Number(vendor.outstanding),
      totalPurchased: Number(vendor.totalPurchased),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /vendors/:id
router.put("/vendors/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { name, phone, email, address, outstanding, totalPurchased } = req.body;

    const existing = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Vendor not found" });
      return;
    }

    const vend = existing[0];
    if (user.role !== "owner" && vend.hotelId !== user.hotelId) {
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
    if (totalPurchased !== undefined) updates.totalPurchased = String(totalPurchased);

    const [updated] = await db
      .update(vendorsTable)
      .set(updates)
      .where(eq(vendorsTable.id, id))
      .returning();

    res.json({
      ...updated,
      outstanding: Number(updated.outstanding),
      totalPurchased: Number(updated.totalPurchased),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /vendors/:id
router.delete("/vendors/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db.select().from(vendorsTable).where(eq(vendorsTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Vendor not found" });
      return;
    }

    const vend = existing[0];
    if (user.role !== "owner" && vend.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    await db
      .update(vendorsTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(vendorsTable.id, id));

    res.json({ success: true, message: "Vendor deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
