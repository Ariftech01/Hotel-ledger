import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the workspace root .env
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

import { createClient } from "@supabase/supabase-js";
import { eq, and } from "drizzle-orm";

const HOTEL_1_ID = "11111111-1111-1111-1111-111111111111";
const HOTEL_2_ID = "22222222-2222-2222-2222-222222222222";
const HOTEL_3_ID = "33333333-3333-3333-3333-333333333333";

const BRANCH_1_ID = "11111111-1111-1111-1111-111111111111";
const BRANCH_2_ID = "22222222-2222-2222-2222-222222222222";
const BRANCH_3_ID = "33333333-3333-3333-3333-333333333333";

const ALL_CATEGORIES = [
  // Income
  { name: "Room Rent", icon: "home", color: "#059669", type: "income" },
  { name: "Room Booking", icon: "key", color: "#10B981", type: "income" },
  { name: "Deluxe Room", icon: "star", color: "#34D399", type: "income" },
  { name: "Suite Room", icon: "award", color: "#0D9488", type: "income" },
  { name: "Restaurant Sales", icon: "coffee", color: "#F59E0B", type: "income" },
  { name: "Food & Beverage", icon: "shopping-bag", color: "#D97706", type: "income" },
  { name: "Bar Sales", icon: "package", color: "#B45309", type: "income" },
  { name: "Laundry Service", icon: "wind", color: "#6366F1", type: "income" },
  { name: "Spa Service", icon: "heart", color: "#EC4899", type: "income" },
  { name: "Conference Hall", icon: "users", color: "#0EA5E9", type: "income" },
  { name: "Banquet Booking", icon: "calendar", color: "#7C3AED", type: "income" },
  { name: "Parking", icon: "map-pin", color: "#64748B", type: "income" },
  { name: "Extra Bed", icon: "plus-square", color: "#059669", type: "income" },
  { name: "Travel Desk", icon: "map", color: "#0891B2", type: "income" },
  { name: "Swimming Pool", icon: "droplet", color: "#06B6D4", type: "income" },
  { name: "Event Booking", icon: "flag", color: "#8B5CF6", type: "income" },
  { name: "Advance Booking", icon: "clock", color: "#F97316", type: "income" },
  { name: "Online Booking", icon: "globe", color: "#0EA5E9", type: "income" },
  { name: "Walk-in Guest", icon: "user-plus", color: "#10B981", type: "income" },
  { name: "Other Income", icon: "plus-circle", color: "#6B7280", type: "income" },

  // Expense
  { name: "Electricity Bill", icon: "zap", color: "#F59E0B", type: "expense" },
  { name: "Water Bill", icon: "droplet", color: "#3B82F6", type: "expense" },
  { name: "Internet Bill", icon: "wifi", color: "#8B5CF6", type: "expense" },
  { name: "Gas", icon: "thermometer", color: "#EF4444", type: "expense" },
  { name: "Housekeeping", icon: "star", color: "#84CC16", type: "expense" },
  { name: "Cleaning Supplies", icon: "trash-2", color: "#22D3EE", type: "expense" },
  { name: "Laundry Expense", icon: "wind", color: "#6366F1", type: "expense" },
  { name: "Staff Salary", icon: "users", color: "#EF4444", type: "expense" },
  { name: "Kitchen Expense", icon: "feather", color: "#F97316", type: "expense" },
  { name: "Grocery", icon: "shopping-cart", color: "#8B5CF6", type: "expense" },
  { name: "Vegetables", icon: "leaf", color: "#22C55E", type: "expense" },
  { name: "Fruits", icon: "circle", color: "#F59E0B", type: "expense" },
  { name: "Dairy Products", icon: "package", color: "#A78BFA", type: "expense" },
  { name: "Meat & Seafood", icon: "anchor", color: "#EF4444", type: "expense" },
  { name: "Restaurant Purchase", icon: "coffee", color: "#D97706", type: "expense" },
  { name: "Maintenance", icon: "tool", color: "#F97316", type: "expense" },
  { name: "Plumbing", icon: "git-merge", color: "#3B82F6", type: "expense" },
  { name: "Electrical Repair", icon: "zap", color: "#FBBF24", type: "expense" },
  { name: "Furniture", icon: "layout", color: "#92400E", type: "expense" },
  { name: "Interior", icon: "layers", color: "#7C3AED", type: "expense" },
  { name: "Marketing", icon: "trending-up", color: "#06B6D4", type: "expense" },
  { name: "Advertisement", icon: "radio", color: "#0EA5E9", type: "expense" },
  { name: "Printing", icon: "printer", color: "#64748B", type: "expense" },
  { name: "Stationery", icon: "edit", color: "#6B7280", type: "expense" },
  { name: "Fuel", icon: "truck", color: "#92400E", type: "expense" },
  { name: "Vehicle Expense", icon: "navigation", color: "#78716C", type: "expense" },
  { name: "Software", icon: "monitor", color: "#6366F1", type: "expense" },
  { name: "GST Payment", icon: "percent", color: "#EF4444", type: "expense" },
  { name: "Tax", icon: "file-text", color: "#B91C1C", type: "expense" },
  { name: "Bank Charges", icon: "briefcase", color: "#374151", type: "expense" },
  { name: "Commission", icon: "share-2", color: "#7C3AED", type: "expense" },
  { name: "Rent", icon: "home", color: "#B91C1C", type: "expense" },
  { name: "Security", icon: "shield", color: "#374151", type: "expense" },
  { name: "Misc. Expense", icon: "more-horizontal", color: "#6B7280", type: "expense" },
];

async function seed() {
  console.log("Starting database seed script...");

  // Load database connection dynamically after environment is setup
  const { db } = await import("./index");
  const { hotelsTable, branchesTable, categoriesTable, usersTable } = await import("./schema");

  // 1. Seed Hotels
  console.log("Seeding Hotels...");
  const hotels = [
    {
      id: HOTEL_1_ID,
      name: "Grand Palace Hotel",
      address: "MG Road, Bengaluru, Karnataka",
      phone: "+91-80-4567-8901",
      email: "accounts@grandpalace.in",
      gstin: "29AABCU9603R1ZM",
    },
    {
      id: HOTEL_2_ID,
      name: "Royal Inn Mysore",
      address: "Sayyaji Rao Road, Mysuru, Karnataka",
      phone: "+91-82-1234-5678",
      email: "info@royalinnmysore.in",
      gstin: "29AABCU9603R1ZN",
    },
    {
      id: HOTEL_3_ID,
      name: "Heritage Palace Coorg",
      address: "Madikeri Main Road, Coorg, Karnataka",
      phone: "+91-82-7654-3210",
      email: "bookings@heritagecoorg.in",
      gstin: "29AABCU9603R1ZP",
    },
  ];

  for (const h of hotels) {
    const existing = await db.select().from(hotelsTable).where(eq(hotelsTable.id, h.id));
    if (existing.length === 0) {
      await db.insert(hotelsTable).values(h);
      console.log(`Created hotel: ${h.name}`);
    }
  }

  // 2. Seed Branches
  console.log("Seeding Branches...");
  const branches = [
    {
      id: BRANCH_1_ID,
      name: "Grand Palace Hotel (Main)",
      address: "MG Road, Bengaluru, Karnataka",
      phone: "+91-80-4567-8901",
      email: "accounts@grandpalace.in",
      hotelId: HOTEL_1_ID,
    },
    {
      id: BRANCH_2_ID,
      name: "Royal Inn Mysore (Main)",
      address: "Sayyaji Rao Road, Mysuru, Karnataka",
      phone: "+91-82-1234-5678",
      email: "info@royalinnmysore.in",
      hotelId: HOTEL_2_ID,
    },
    {
      id: BRANCH_3_ID,
      name: "Heritage Palace Coorg (Main)",
      address: "Madikeri Main Road, Coorg, Karnataka",
      phone: "+91-82-7654-3210",
      email: "bookings@heritagecoorg.in",
      hotelId: HOTEL_3_ID,
    },
  ];

  for (const b of branches) {
    const existing = await db.select().from(branchesTable).where(eq(branchesTable.id, b.id));
    if (existing.length === 0) {
      await db.insert(branchesTable).values(b);
      console.log(`Created branch: ${b.name}`);
    }
  }

  // 3. Seed Categories
  console.log("Seeding Categories...");
  for (const hotelId of [HOTEL_1_ID, HOTEL_2_ID, HOTEL_3_ID]) {
    for (const cat of ALL_CATEGORIES) {
      const existing = await db
        .select()
        .from(categoriesTable)
        .where(
          and(
            eq(categoriesTable.hotelId, hotelId),
            eq(categoriesTable.name, cat.name)
          )
        );
      if (existing.length === 0) {
        await db.insert(categoriesTable).values({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type as "income" | "expense" | "both",
          hotelId: hotelId,
        });
      }
    }
  }
  console.log("Categories seeded successfully.");

  // 4. Seed Demo Users in Supabase Auth (if credentials exist)
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceKey) {
    console.log("Connecting to Supabase Auth to seed demo users...");
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const demoUsers = [
      { email: "owner@grandpalace.in", password: "password123", name: "Rajesh Kumar (Owner)", role: "owner" },
      { email: "manager@grandpalace.in", password: "password123", name: "Priya Sharma (Manager)", role: "manager" },
      { email: "staff@grandpalace.in", password: "password123", name: "Amit Singh (Staff)", role: "staff" },
    ];

    for (const u of demoUsers) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name, role: u.role },
      });

      if (error) {
        if (error.message.includes("already exists") || error.message.includes("Conflict")) {
          console.log(`Supabase user already exists: ${u.email}`);
        } else {
          console.warn(`Error creating Supabase user ${u.email}:`, error.message);
        }
      } else {
        console.log(`Supabase user registered: ${u.email}`);
      }
    }
  } else {
    console.log("Skipping Supabase user seeding: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in env.");
  }

  // 5. Seed Demo Users in Drizzle PostgreSQL
  console.log("Seeding Demo Users in local PostgreSQL...");
  const demoUsersDb = [
    {
      email: "owner@grandpalace.in",
      name: "Rajesh Kumar",
      role: "owner" as const,
      hotelId: HOTEL_1_ID,
      branchId: BRANCH_1_ID,
    },
    {
      email: "manager@grandpalace.in",
      name: "Priya Sharma",
      role: "manager" as const,
      hotelId: HOTEL_1_ID,
      branchId: BRANCH_1_ID,
    },
    {
      email: "staff@grandpalace.in",
      name: "Amit Singh",
      role: "staff" as const,
      hotelId: HOTEL_1_ID,
      branchId: BRANCH_1_ID,
    },
  ];

  for (const u of demoUsersDb) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, u.email));
    if (existing.length === 0) {
      await db.insert(usersTable).values({
        name: u.name,
        email: u.email,
        role: u.role,
        hotelId: u.hotelId,
        branchId: u.branchId,
        passwordHash: "supabase-managed",
      });
      console.log(`Created local PostgreSQL user profile: ${u.email}`);
    }
  }

  console.log("Database seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
