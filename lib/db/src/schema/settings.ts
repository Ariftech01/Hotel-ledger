import { pgTable, text, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";

export const settingsTable = pgTable(
  "settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("settings_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("settings_branch_id_idx").on(table.branchId),
    keyIdx: index("settings_key_idx").on(table.key),
  })
);

export const settingsRelations = relations(settingsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [settingsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [settingsTable.branchId],
    references: [branchesTable.id],
  }),
}));

export const insertSettingSchema = createInsertSchema(settingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectSettingSchema = createSelectSchema(settingsTable);
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settingsTable.$inferSelect;
