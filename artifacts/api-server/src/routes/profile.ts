import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /profile
router.get("/profile", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      hotelId: user.hotelId,
      branchId: user.branchId,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile
router.put("/profile", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { name, avatar } = req.body;

    const updates: any = {
      updatedAt: new Date(),
    };

    if (name) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const [updatedUser] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      hotelId: updatedUser.hotelId,
      branchId: updatedUser.branchId,
      createdAt: updatedUser.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
