import { pgTable, text, uuid, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";

export const attachmentsTable = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    url: text("url").notNull(),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    entityType: text("entity_type").notNull(), // e.g. 'invoice', 'expense', 'transaction'
    entityId: uuid("entity_id").notNull(),
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    createdBy: uuid("created_by").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("attachments_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("attachments_branch_id_idx").on(table.branchId),
    entityTypeIdx: index("attachments_entity_type_idx").on(table.entityType),
    entityIdIdx: index("attachments_entity_id_idx").on(table.entityId),
    createdAtIdx: index("attachments_created_at_idx").on(table.createdAt),
  })
);

export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [attachmentsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [attachmentsTable.branchId],
    references: [branchesTable.id],
  }),
  creator: one(usersTable, {
    fields: [attachmentsTable.createdBy],
    references: [usersTable.id],
  }),
}));

export const insertAttachmentSchema = createInsertSchema(attachmentsTable).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
});
export const selectAttachmentSchema = createSelectSchema(attachmentsTable);
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachmentsTable.$inferSelect;
