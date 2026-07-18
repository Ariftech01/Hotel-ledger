import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthenticatedRequest } from "../middlewares/auth";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

// GET /settings
router.get("/settings", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
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
      .from(settingsTable)
      .where(eq(settingsTable.hotelId, targetHotelId));

    // Convert list of key-value rows to a single object dictionary
    const dictionary: Record<string, string> = {};
    for (const row of list) {
      dictionary[row.key] = row.value;
    }

    // Default configuration values
    const defaults = {
      taxRate: "18",
      currency: "INR",
      companyName: "Hotel Ledger Pro Co.",
      backupEnabled: "true",
      darkMode: "false",
    };

    res.json({
      ...defaults,
      ...dictionary,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /settings
router.put("/settings", authMiddleware, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let targetHotelId = user.hotelId;
    if (user.role === "owner" && req.body.hotelId) {
      targetHotelId = req.body.hotelId;
    }

    const { key, value, description } = req.body;
    if (!key || value === undefined) {
      res.status(400).json({ error: "Key and value are required" });
      return;
    }

    // Check if key already exists for this hotel
    const existing = await db
      .select()
      .from(settingsTable)
      .where(
        and(
          eq(settingsTable.hotelId, targetHotelId),
          eq(settingsTable.key, key)
        )
      );

    if (existing.length > 0) {
      // Update
      await db
        .update(settingsTable)
        .set({
          value: String(value),
          description: description || existing[0].description,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(settingsTable.hotelId, targetHotelId),
            eq(settingsTable.key, key)
          )
        );
    } else {
      // Insert
      await db.insert(settingsTable).values({
        hotelId: targetHotelId,
        key,
        value: String(value),
        description: description || null,
      });
    }

    res.json({ success: true, key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
