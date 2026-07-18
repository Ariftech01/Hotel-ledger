import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /categories
router.get("/categories", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.hotelId, targetHotelId),
          eq(categoriesTable.isDeleted, false)
        )
      )
      .orderBy(desc(categoriesTable.createdAt));

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /categories/:id
router.get("/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db
      .select()
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, id),
          eq(categoriesTable.isDeleted, false)
        )
      );

    if (existing.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const cat = existing[0];
    if (user.role !== "owner" && cat.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    res.json(cat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /categories
router.post("/categories", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, icon, color, type, hotelId } = req.body;
    if (!name || !icon || !color || !type) {
      res.status(400).json({ error: "Missing required category fields (name, icon, color, type)" });
      return;
    }

    const targetHotelId = user.role === "owner" ? (hotelId || user.hotelId) : user.hotelId;

    const [category] = await db
      .insert(categoriesTable)
      .values({
        name,
        icon,
        color,
        type: type as "income" | "expense" | "both",
        hotelId: targetHotelId,
        createdBy: user.id,
      })
      .returning();

    res.status(201).json(category);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /categories/:id
router.put("/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;
    const { name, icon, color, type } = req.body;

    const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const cat = existing[0];
    if (user.role !== "owner" && cat.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    const updates: any = {
      updatedAt: new Date(),
      updatedBy: user.id,
    };

    if (name) updates.name = name;
    if (icon) updates.icon = icon;
    if (color) updates.color = color;
    if (type) updates.type = type;

    const [updated] = await db
      .update(categoriesTable)
      .set(updates)
      .where(eq(categoriesTable.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /categories/:id
router.delete("/categories/:id", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params.id as string;

    const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const cat = existing[0];
    if (user.role !== "owner" && cat.hotelId !== user.hotelId) {
      res.status(403).json({ error: "Forbidden: Access denied" });
      return;
    }

    await db
      .update(categoriesTable)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(eq(categoriesTable.id, id));

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
