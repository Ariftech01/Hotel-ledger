import { pgTable, text, uuid, timestamp, numeric, date, integer, pgEnum, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { customersTable } from "./parties";
import { usersTable } from "./users";
import { paymentsTable } from "./payments";

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
]);

export const invoicesTable = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceNumber: text("invoice_number").notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customersTable.id, { onDelete: "restrict" }),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    subtotal: numeric("subtotal", { precision: 18, scale: 2 }).notNull(),
    gstAmount: numeric("gst_amount", { precision: 18, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 18, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 18, scale: 2 }).notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    date: date("date").notNull(),
    dueDate: date("due_date").notNull(),
    notes: text("notes"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("invoices_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("invoices_branch_id_idx").on(table.branchId),
    customerIdIdx: index("invoices_customer_id_idx").on(table.customerId),
    invoiceNumberIdx: index("invoices_invoice_number_idx").on(table.invoiceNumber),
    statusIdx: index("invoices_status_idx").on(table.status),
    dateIdx: index("invoices_date_idx").on(table.date),
    createdAtIdx: index("invoices_created_at_idx").on(table.createdAt),
  })
);

export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [invoicesTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [invoicesTable.branchId],
    references: [branchesTable.id],
  }),
  customer: one(customersTable, {
    fields: [invoicesTable.customerId],
    references: [customersTable.id],
  }),
  invoiceItems: many(invoiceItemsTable),
  payments: many(paymentsTable),
  creator: one(usersTable, {
    fields: [invoicesTable.createdBy],
    references: [usersTable.id],
  }),
  updater: one(usersTable, {
    fields: [invoicesTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectInvoiceSchema = createSelectSchema(invoicesTable);
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;

export const invoiceItemsTable = pgTable(
  "invoice_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoicesTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    rate: numeric("rate", { precision: 18, scale: 2 }).notNull(),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  },
  (table) => ({
    invoiceIdIdx: index("invoice_items_invoice_id_idx").on(table.invoiceId),
  })
);

export const invoiceItemsRelations = relations(invoiceItemsTable, ({ one }) => ({
  invoice: one(invoicesTable, {
    fields: [invoiceItemsTable.invoiceId],
    references: [invoicesTable.id],
  }),
}));

export const insertInvoiceItemSchema = createInsertSchema(invoiceItemsTable).omit({
  id: true,
});
export const selectInvoiceItemSchema = createSelectSchema(invoiceItemsTable);
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItemsTable.$inferSelect;
