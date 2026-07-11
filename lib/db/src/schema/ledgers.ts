import { pgTable, text, uuid, timestamp, numeric, boolean, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";
import { transactionsTable } from "./transactions";

export const ledgerTypeEnum = pgEnum("ledger_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const ledgerAccountsTable = pgTable(
  "ledger_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    code: text("code"),
    type: ledgerTypeEnum("type").notNull(),
    description: text("description"),
    balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
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
    hotelIdIdx: index("ledger_accounts_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("ledger_accounts_branch_id_idx").on(table.branchId),
    typeIdx: index("ledger_accounts_type_idx").on(table.type),
    createdAtIdx: index("ledger_accounts_created_at_idx").on(table.createdAt),
  })
);

export const ledgerAccountsRelations = relations(ledgerAccountsTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [ledgerAccountsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [ledgerAccountsTable.branchId],
    references: [branchesTable.id],
  }),
  transactions: many(transactionsTable),
  creator: one(usersTable, {
    fields: [ledgerAccountsTable.createdBy],
    references: [usersTable.id],
    relationName: "ledgerCreator",
  }),
  updater: one(usersTable, {
    fields: [ledgerAccountsTable.updatedBy],
    references: [usersTable.id],
    relationName: "ledgerUpdater",
  }),
}));

export const insertLedgerAccountSchema = createInsertSchema(ledgerAccountsTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectLedgerAccountSchema = createSelectSchema(ledgerAccountsTable);
export type InsertLedgerAccount = z.infer<typeof insertLedgerAccountSchema>;
export type LedgerAccount = typeof ledgerAccountsTable.$inferSelect;
