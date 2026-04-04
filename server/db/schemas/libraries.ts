import { boolean, serial, pgEnum, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const libraries = pgTable("libraries", {

    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    location: varchar("location", { length: 255 }),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});