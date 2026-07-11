import { pgTable, text, uuid, timestamp, pgEnum, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { usersTable } from "./users";
import { transactionsTable } from "./transactions";

export const categoryTypeEnum = pgEnum("category_type", ["income", "expense", "both"]);

export const categoriesTable = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    type: categoryTypeEnum("type").notNull(),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    updatedBy: uuid("updated_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("categories_hotel_id_idx").on(table.hotelId),
    typeIdx: index("categories_type_idx").on(table.type),
    createdAtIdx: index("categories_created_at_idx").on(table.createdAt),
  })
);

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  hotel: one(hotelsTable, {
    fields: [categoriesTable.hotelId],
    references: [hotelsTable.id],
  }),
  transactions: many(transactionsTable),
  creator: one(usersTable, {
    fields: [categoriesTable.createdBy],
    references: [usersTable.id],
  }),
  updater: one(usersTable, {
    fields: [categoriesTable.updatedBy],
    references: [usersTable.id],
  }),
}));

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});
export const selectCategorySchema = createSelectSchema(categoriesTable);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;
