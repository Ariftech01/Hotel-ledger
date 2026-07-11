import { pgTable, text, uuid, timestamp, numeric, boolean, date, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";
import { invoicesTable } from "./invoices";
import { transactionsTable, paymentMethodEnum } from "./transactions";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoicesTable.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    paymentDate: date("payment_date").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    status: paymentStatusEnum("status").notNull().default("completed"),
    transactionId: uuid("transaction_id").references(() => transactionsTable.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
    referenceNumber: text("reference_number"),
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
    hotelIdIdx: index("payments_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("payments_branch_id_idx").on(table.branchId),
    invoiceIdIdx: index("payments_invoice_id_idx").on(table.invoiceId),
    statusIdx: index("payments_status_idx").on(table.status),
    paymentDateIdx: index("payments_payment_date_idx").on(table.paymentDate),
    createdAtIdx: index("payments_created_at_idx").on(table.createdAt),
  })
);

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [paymentsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [paymentsTable.branchId],
    references: [branchesTable.id],
  }),
  invoice: one(invoicesTable, {
    fields: [paymentsTable.invoiceId],
    references: [invoicesTable.id],
  }),
  transaction: one(transactionsTable, {
    fields: [paymentsTable.transactionId],
    references: [transactionsTable.id],
  }),
  creator: one(usersTable, {
    fields: [paymentsTable.createdBy],
    references: [usersTable.id],
    relationName: "paymentCreator",
  }),
  updater: one(usersTable, {
    fields: [paymentsTable.updatedBy],
    references: [usersTable.id],
    relationName: "paymentUpdater",
  }),
}));

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectPaymentSchema = createSelectSchema(paymentsTable);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
