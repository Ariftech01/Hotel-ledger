import { pgTable, text, uuid, timestamp, pgEnum, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { notificationsTable } from "./notifications";
import { transactionsTable } from "./transactions";
import { ledgerAccountsTable } from "./ledgers";
import { paymentsTable } from "./payments";
import { expensesTable } from "./expenses";
import { attachmentsTable } from "./attachments";
import { auditLogsTable } from "./audit_logs";

export const userRoleEnum = pgEnum("user_role", ["owner", "manager", "staff"]);

export const rolesTable = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(), // 'owner', 'manager', 'staff' or other custom roles
    description: text("description"),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("roles_hotel_id_idx").on(table.hotelId),
    nameIdx: index("roles_name_idx").on(table.name),
  })
);

export const rolesRelations = relations(rolesTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [rolesTable.hotelId],
    references: [hotelsTable.id],
  }),
  users: many(usersTable),
}));

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("staff"),
    roleId: uuid("role_id").references((): any => rolesTable.id, { onDelete: "set null" }),
    avatar: text("avatar"),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references((): any => branchesTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("users_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("users_branch_id_idx").on(table.branchId),
    roleIdIdx: index("users_role_id_idx").on(table.roleId),
    emailIdx: index("users_email_idx").on(table.email),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  })
);

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [usersTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [usersTable.branchId],
    references: [branchesTable.id],
  }),
  roleRef: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
  notifications: many(notificationsTable),
  createdTransactions: many(transactionsTable, { relationName: "transactionCreator" }),
  editedTransactions: many(transactionsTable, { relationName: "transactionEditor" }),
  createdBranches: many(branchesTable, { relationName: "branchCreator" }),
  updatedBranches: many(branchesTable, { relationName: "branchUpdater" }),
  createdLedgers: many(ledgerAccountsTable, { relationName: "ledgerCreator" }),
  updatedLedgers: many(ledgerAccountsTable, { relationName: "ledgerUpdater" }),
  createdPayments: many(paymentsTable, { relationName: "paymentCreator" }),
  updatedPayments: many(paymentsTable, { relationName: "paymentUpdater" }),
  createdExpenses: many(expensesTable, { relationName: "expenseCreator" }),
  updatedExpenses: many(expensesTable, { relationName: "expenseUpdater" }),
  createdAttachments: many(attachmentsTable),
  auditLogs: many(auditLogsTable),
}));

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = createSelectSchema(usersTable).omit({
  passwordHash: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
export type PublicUser = Omit<User, "passwordHash">;

export const insertRoleSchema = createInsertSchema(rolesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectRoleSchema = createSelectSchema(rolesTable);
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof rolesTable.$inferSelect;
