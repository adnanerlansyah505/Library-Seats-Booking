import { boolean, integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { libraries } from "./libraries";

export const seatTypeEnum = pgEnum("seat_type", ["individual", "group", "computer", "silent"]);

export const librarySeats = pgTable("library_seats", {
  id: serial("id").primaryKey(),

  libraryId: integer("library_id")
    .notNull()
    .references(() => libraries.id),

  // Identifier for the seat (e.g. "A-01") that can be used in URLs or UI
  code: varchar("code", { length: 50 }).notNull(),

  // Optional human-friendly label (e.g. "Window Seat A-01")
  label: varchar("label", { length: 255 }),

  type: seatTypeEnum("type").default("individual"),

  // Optional extra context for grouping / display
  floor: integer("floor"),
  area: varchar("area", { length: 100 }),

  // Whether this seat can currently be booked
  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
