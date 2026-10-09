import { pgTable, serial, text, numeric, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  customerCity: text("customer_city").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // 🟢 MAKE SURE THIS FIELD IS DEFINED
  isArchived: boolean("is_archived").default(false).notNull(),
});