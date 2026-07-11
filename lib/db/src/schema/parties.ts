import { pgTable, text, uuid, timestamp, numeric, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";
import { invoicesTable } from "./invoices";

export const customersTable = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    outstanding: numeric("outstanding", { precision: 18, scale: 2 }).notNull().default("0"),
    totalPaid: numeric("total_paid", { precision: 18, scale: 2 }).notNull().default("0"),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("customers_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("customers_branch_id_idx").on(table.branchId),
    phoneIdx: index("customers_phone_idx").on(table.phone),
    emailIdx: index("customers_email_idx").on(table.email),
    createdAtIdx: index("customers_created_at_idx").on(table.createdAt),
  })
);

export const customersRelations = relations(customersTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [customersTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [customersTable.branchId],
    references: [branchesTable.id],
  }),
  invoices: many(invoicesTable),
  creator: one(usersTable, {
    fields: [customersTable.createdBy],
    references: [usersTable.id],
  }),
  updater: one(usersTable, {
    fields: [customersTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export const insertCustomerSchema = createInsertSchema(customersTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCustomerSchema = createSelectSchema(customersTable);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;

export const vendorsTable = pgTable(
  "vendors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    address: text("address"),
    outstanding: numeric("outstanding", { precision: 18, scale: 2 }).notNull().default("0"),
    totalPurchased: numeric("total_purchased", { precision: 18, scale: 2 }).notNull().default("0"),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("vendors_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("vendors_branch_id_idx").on(table.branchId),
    phoneIdx: index("vendors_phone_idx").on(table.phone),
    emailIdx: index("vendors_email_idx").on(table.email),
    createdAtIdx: index("vendors_created_at_idx").on(table.createdAt),
  })
);

export const vendorsRelations = relations(vendorsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [vendorsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [vendorsTable.branchId],
    references: [branchesTable.id],
  }),
  creator: one(usersTable, {
    fields: [vendorsTable.createdBy],
    references: [usersTable.id],
  }),
  updater: one(usersTable, {
    fields: [vendorsTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectVendorSchema = createSelectSchema(vendorsTable);
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendorsTable.$inferSelect;
