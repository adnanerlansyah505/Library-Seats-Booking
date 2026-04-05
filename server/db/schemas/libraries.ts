import { boolean, serial, pgEnum, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";

export const libraries = pgTable("libraries", {

    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 255 }).unique(),
    image: varchar("image", { length: 255 }),
    name: varchar("name").notNull(),
    description: text("description"),
    location: varchar("location", { length: 255 }),
    ownerName: varchar("owner_name"),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});