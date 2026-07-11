import { pgTable, text, uuid, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { branchesTable } from "./branches";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";
import { customersTable, vendorsTable } from "./parties";
import { transactionsTable } from "./transactions";
import { invoicesTable } from "./invoices";
import { ledgerAccountsTable } from "./ledgers";
import { expenseCategoriesTable, expensesTable } from "./expenses";
import { settingsTable } from "./settings";
import { attachmentsTable } from "./attachments";
import { auditLogsTable } from "./audit_logs";

export const hotelsTable = pgTable(
  "hotels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    gstin: text("gstin"),
    logo: text("logo"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("hotels_email_idx").on(table.email),
    phoneIdx: index("hotels_phone_idx").on(table.phone),
    createdAtIdx: index("hotels_created_at_idx").on(table.createdAt),
  })
);

export const hotelsRelations = relations(hotelsTable, ({ many }) => ({
  branches: many(branchesTable),
  users: many(usersTable),
  categories: many(categoriesTable),
  customers: many(customersTable),
  vendors: many(vendorsTable),
  transactions: many(transactionsTable),
  invoices: many(invoicesTable),
  ledgerAccounts: many(ledgerAccountsTable),
  expenseCategories: many(expenseCategoriesTable),
  expenses: many(expensesTable),
  settings: many(settingsTable),
  attachments: many(attachmentsTable),
  auditLogs: many(auditLogsTable),
}));

export const insertHotelSchema = createInsertSchema(hotelsTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectHotelSchema = createSelectSchema(hotelsTable);
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotelsTable.$inferSelect;
