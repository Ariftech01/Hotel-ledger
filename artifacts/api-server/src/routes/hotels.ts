import { Router } from "express";
import { db } from "@workspace/db";
import { hotelsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get("/hotels", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (user.role === "owner") {
      // Owners can see and switch between all properties
      const list = await db.select().from(hotelsTable);
      res.json(list);
    } else {
      // Managers and Staff only see their assigned hotel property
      const list = await db.select().from(hotelsTable).where(eq(hotelsTable.id, user.hotelId));
      res.json(list);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
