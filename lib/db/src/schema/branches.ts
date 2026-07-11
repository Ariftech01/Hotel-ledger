import { pgTable, text, uuid, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { usersTable } from "./users";
import { customersTable, vendorsTable } from "./parties";
import { transactionsTable } from "./transactions";
import { invoicesTable } from "./invoices";
import { paymentsTable } from "./payments";
import { expensesTable } from "./expenses";
import { ledgerAccountsTable } from "./ledgers";
import { settingsTable } from "./settings";
import { attachmentsTable } from "./attachments";
import { auditLogsTable } from "./audit_logs";

export const branchesTable = pgTable(
  "branches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references((): any => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references((): any => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("branches_hotel_id_idx").on(table.hotelId),
    phoneIdx: index("branches_phone_idx").on(table.phone),
    emailIdx: index("branches_email_idx").on(table.email),
    createdAtIdx: index("branches_created_at_idx").on(table.createdAt),
  })
);

export const branchesRelations = relations(branchesTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [branchesTable.hotelId],
    references: [hotelsTable.id],
  }),
  users: many(usersTable),
  customers: many(customersTable),
  vendors: many(vendorsTable),
  transactions: many(transactionsTable),
  invoices: many(invoicesTable),
  payments: many(paymentsTable),
  expenses: many(expensesTable),
  ledgerAccounts: many(ledgerAccountsTable),
  settings: many(settingsTable),
  attachments: many(attachmentsTable),
  auditLogs: many(auditLogsTable),
  creator: one(usersTable, {
    fields: [branchesTable.createdBy],
    references: [usersTable.id],
    relationName: "branchCreator",
  }),
  updater: one(usersTable, {
    fields: [branchesTable.updatedBy],
    references: [usersTable.id],
    relationName: "branchUpdater",
  }),
}));

export const insertBranchSchema = createInsertSchema(branchesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectBranchSchema = createSelectSchema(branchesTable);
export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branchesTable.$inferSelect;
