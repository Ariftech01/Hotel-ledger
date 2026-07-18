import { Router } from "express";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const demoEmails = ["owner@grandpalace.in", "manager@grandpalace.in", "staff@grandpalace.in"];
    const isDemo = demoEmails.includes(emailLower) && password === "password123";

    let token = "";
    let refreshToken = "";
    let user: any;

    if (isDemo) {
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, emailLower));

      if (users.length === 0) {
        res.status(401).json({ error: "Demo user profile not found in local database" });
        return;
      }

      user = users[0];
      const role = emailLower.includes("owner") ? "owner" : emailLower.includes("manager") ? "manager" : "staff";
      token = `demo-token-${role}`;
      refreshToken = `demo-refreshtoken-${role}`;
    } else {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        res.status(401).json({ error: error?.message || "Invalid credentials" });
        return;
      }

      // Query matching user profile from Drizzle PostgreSQL
      const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, emailLower));

      if (users.length === 0) {
        res.status(401).json({ error: "User profile not found in local database" });
        return;
      }

      user = users[0];
      token = data.session.access_token;
      refreshToken = data.session.refresh_token;
    }

    if (user.isDeleted) {
      res.status(401).json({ error: "This account has been deactivated" });
      return;
    }

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hotelId: user.hotelId,
        branchId: user.branchId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { name, email, password, role, hotelId, branchId } = req.body;
    if (!name || !email || !password || !role || !hotelId) {
      res.status(400).json({ error: "Missing required fields (name, email, password, role, hotelId)" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists locally
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail));
    if (existing.length > 0) {
      res.status(400).json({ error: "User already exists with this email" });
      return;
    }

    // Register user in Supabase Auth
    let supabaseUserId: string | undefined;

    if (supabaseAdmin) {
      // Create user programmatically (auto-confirmed)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });

      if (error) {
        res.status(400).json({ error: `Supabase registration error: ${error.message}` });
        return;
      }
      supabaseUserId = data.user.id;
    } else {
      // Fallback: standard sign up
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name, role },
        },
      });

      if (error) {
        res.status(400).json({ error: `Supabase registration error: ${error.message}` });
        return;
      }
      supabaseUserId = data.user?.id;
    }

    // Insert user record in local PostgreSQL
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        email: normalizedEmail,
        role: role as "owner" | "manager" | "staff",
        hotelId,
        branchId: branchId || null,
        passwordHash: "supabase-managed",
      })
      .returning();

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      hotelId: newUser.hotelId,
      branchId: newUser.branchId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/forgot-password
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "https://hotelledgerpro.example.com/reset-password",
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: "Password reset instructions sent to your email" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/logout
router.post("/auth/logout", async (req, res): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ message: "Signed out successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
