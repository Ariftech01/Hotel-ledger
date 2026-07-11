import { pgTable, text, uuid, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { hotelsTable } from "./hotels";
import { branchesTable } from "./branches";
import { usersTable } from "./users";

export const auditLogsTable = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    hotelId: uuid("hotel_id")
      .notNull()
      .references(() => hotelsTable.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branchesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    action: text("action").notNull(), // e.g. 'create', 'update', 'delete', 'login'
    entityType: text("entity_type").notNull(), // e.g. 'invoice', 'payment', 'transaction'
    entityId: uuid("entity_id"),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    hotelIdIdx: index("audit_logs_hotel_id_idx").on(table.hotelId),
    branchIdIdx: index("audit_logs_branch_id_idx").on(table.branchId),
    userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
    entityTypeIdx: index("audit_logs_entity_type_idx").on(table.entityType),
    entityIdIdx: index("audit_logs_entity_id_idx").on(table.entityId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

export const auditLogsRelations = relations(auditLogsTable, ({ one }) => ({
  hotel: one(hotelsTable, {
    fields: [auditLogsTable.hotelId],
    references: [hotelsTable.id],
  }),
  branch: one(branchesTable, {
    fields: [auditLogsTable.branchId],
    references: [branchesTable.id],
  }),
  user: one(usersTable, {
    fields: [auditLogsTable.userId],
    references: [usersTable.id],
  }),
}));

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({
  id: true,
  createdAt: true,
});
export const selectAuditLogSchema = createSelectSchema(auditLogsTable);
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
