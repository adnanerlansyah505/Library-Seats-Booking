import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { libraries } from "./libraries";
import { relations } from "drizzle-orm";

export const reservations = pgTable("reservations", {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
        .notNull()
        .references(() => users.id),

    libraryId: integer("library_id")
        .notNull()
        .references(() => libraries.id),

    seatNumber: integer("seat_number"),
    reservedAt: timestamp("reserved_at").defaultNow(),
    
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userRelations = relations(users, ({ many }) => ({
  reservations: many(reservations)
}))

export const libraryRelations = relations(libraries, ({ many }) => ({
  reservations: many(reservations)
}))

export const reservationRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id]
  }),

  library: one(libraries, {
    fields: [reservations.libraryId],
    references: [libraries.id]
  })
}))