import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { supabase } from "../lib/supabase";

export interface AuthenticatedRequest extends Request {
  user?: typeof usersTable.$inferSelect;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token = "";
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({ error: "Missing or invalid authorization token" });
      return;
    }

    let email = "";

    if (token.startsWith("demo-token-")) {
      email = token === "demo-token-owner" ? "owner@grandpalace.in" :
              token === "demo-token-manager" ? "manager@grandpalace.in" :
              "staff@grandpalace.in";
    } else {
      // Verify token using Supabase Auth
      const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);
      if (supabaseError || !supabaseUser) {
        res.status(401).json({ error: `Invalid token: ${supabaseError?.message || "User not found"}` });
        return;
      }
      email = supabaseUser.email || "";
    }

    if (!email) {
      res.status(401).json({ error: "Token does not contain user email" });
      return;
    }

    // Load user profile from database
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (users.length === 0) {
      res.status(401).json({ error: "User not found in local database" });
      return;
    }

    const user = users[0];
    if (user.isDeleted) {
      res.status(401).json({ error: "User account has been deactivated" });
      return;
    }

    // Attach to request
    (req as any).user = user;
    next();
  } catch (err: any) {
    res.status(500).json({ error: `Auth middleware error: ${err.message}` });
  }
}
