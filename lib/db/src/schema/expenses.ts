import { pgTable, text, uuid, timestamp, numeric, boolean, date, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";
import { paymentMethodEnum } from "./transactions";

export const expenseCategoriesTable = pgTable(
  "expense_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
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
    hotelIdIdx: index("expense_categories_hotel_id_idx").on(table.hotelId),
    nameIdx: index("expense_categories_name_idx").on(table.name),
  })
);

export const expenseCategoriesRelations = relations(expenseCategoriesTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [expenseCategoriesTable.hotelId],
    references: [hotelsTable.id],
  }),
  expenses: many(expensesTable),
}));

export const insertExpenseCategorySchema = createInsertSchema(expenseCategoriesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectExpenseCategorySchema = createSelectSchema(expenseCategoriesTable);
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategoriesTable.$inferSelect;

export const expensesTable = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    expenseCategoryId: uuid("expense_category_id")
      .notNull()
      .references(() => expenseCategoriesTable.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    description: text("description"),
    paidTo: text("paid_to"),
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
    hotelIdIdx: index("expenses_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("expenses_branch_id_idx").on(table.branchId),
    expenseCategoryIdIdx: index("expenses_category_id_idx").on(table.expenseCategoryId),
    dateIdx: index("expenses_date_idx").on(table.date),
    createdAtIdx: index("expenses_created_at_idx").on(table.createdAt),
  })
);

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [expensesTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [expensesTable.branchId],
    references: [branchesTable.id],
  }),
  expenseCategory: one(expenseCategoriesTable, {
    fields: [expensesTable.expenseCategoryId],
    references: [expenseCategoriesTable.id],
  }),
  creator: one(usersTable, {
    fields: [expensesTable.createdBy],
    references: [usersTable.id],
    relationName: "expenseCreator",
  }),
  updater: one(usersTable, {
    fields: [expensesTable.updatedBy],
    references: [usersTable.id],
    relationName: "expenseUpdater",
  }),
}));

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectExpenseSchema = createSelectSchema(expensesTable);
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
