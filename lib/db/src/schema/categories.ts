import { pgTable, serial, text, boolean, timestamp, integer, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const categoriesTable = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    parentId: integer("parent_id"),
    sizes: text("sizes").array().notNull().default([]), // Dynamic sizes array for clothing/thrifting categories
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "categories_parent_id_fk",
    }).onDelete("cascade"),
  ]
);

// Zod schemas with TypeScript safety bypasses for monorepo type checking
export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true }) as any;
export const selectCategorySchema = createSelectSchema(categoriesTable) as any;

// Type exports expected by @workspace/api-server and frontend (@workspace/geekthrifts)
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect & {
  parentId?: number | null;
  sizes?: string[];
};