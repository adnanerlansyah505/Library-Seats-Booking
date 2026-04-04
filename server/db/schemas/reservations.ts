import { date, integer, pgEnum, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { libraries } from "./libraries";
import { librarySeats } from "./seats";
import { relations } from "drizzle-orm";

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "expired",
]);

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  libraryId: integer("library_id")
    .notNull()
    .references(() => libraries.id),

  // Optional reference to a concrete seat record
  seatId: integer("seat_id").references(() => librarySeats.id),

  // Legacy / simple mode: just store the seat number directly
  seatNumber: integer("seat_number"),

  // When the reservation was created by the user
  reservedAt: timestamp("reserved_at").defaultNow(),

  // When the seat is actually booked for
  reservedDate: date("reserved_date"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),

  status: reservationStatusEnum("status").default("pending"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userRelations = relations(users, ({ many }) => ({
  reservations: many(reservations)
}))

export const libraryRelations = relations(libraries, ({ many }) => ({
  reservations: many(reservations)
}))

export const reservationRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),

  library: one(libraries, {
    fields: [reservations.libraryId],
    references: [libraries.id],
  }),

  seat: one(librarySeats, {
    fields: [reservations.seatId],
    references: [librarySeats.id],
  }),
}))