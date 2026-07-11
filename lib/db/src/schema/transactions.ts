import { pgTable, text, uuid, timestamp, numeric, boolean, date, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { categoriesTable } from "./categories";
import { usersTable } from "./users";
import { ledgerAccountsTable } from "./ledgers";

export const transactionTypeEnum = pgEnum("transaction_type", ["credit", "debit"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "upi",
  "gpay",
  "phonepe",
  "paytm",
  "bhim",
  "cheque",
  "credit_card",
  "debit_card",
  "bank_transfer",
]);

export const transactionsTable = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: transactionTypeEnum("type").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "restrict" }),
    ledgerAccountId: uuid("ledger_account_id").references(() => ledgerAccountsTable.id, {
      onDelete: "restrict",
    }),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    remarks: text("remarks").notNull().default(""),
    description: text("description"),
    date: date("date").notNull(),
    time: text("time").notNull(),
    isEdited: boolean("is_edited").notNull().default(false),
    editedAt: timestamp("edited_at"),
    editedBy: uuid("edited_by").references(() => usersTable.id, { onDelete: "set null" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
  },
  (table) => ({
    hotelIdIdx: index("transactions_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("transactions_branch_id_idx").on(table.branchId),
    categoryIdIdx: index("transactions_category_id_idx").on(table.categoryId),
    ledgerAccountIdIdx: index("transactions_ledger_account_id_idx").on(table.ledgerAccountId),
    dateIdx: index("transactions_date_idx").on(table.date),
    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  })
);

export const transactionsRelations = relations(transactionsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [transactionsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [transactionsTable.branchId],
    references: [branchesTable.id],
  }),
  category: one(categoriesTable, {
    fields: [transactionsTable.categoryId],
    references: [categoriesTable.id],
  }),
  ledgerAccount: one(ledgerAccountsTable, {
    fields: [transactionsTable.ledgerAccountId],
    references: [ledgerAccountsTable.id],
  }),
  creator: one(usersTable, {
    fields: [transactionsTable.createdBy],
    references: [usersTable.id],
    relationName: "transactionCreator",
  }),
  editor: one(usersTable, {
    fields: [transactionsTable.editedBy],
    references: [usersTable.id],
    relationName: "transactionEditor",
  }),
  updater: one(usersTable, {
    fields: [transactionsTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({
  id: true,
  isEdited: true,
  editedAt: true,
  editedBy: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});
export const selectTransactionSchema = createSelectSchema(transactionsTable);
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
