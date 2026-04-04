import { integer, pgEnum, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { reservations } from "./reservations";
import { relations } from "drizzle-orm";

export const reminderChannelEnum = pgEnum("reminder_channel", ["email", "push"]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "scheduled",
  "sent",
  "failed",
  "cancelled",
]);

export const reservationReminders = pgTable("reservation_reminders", {
  id: serial("id").primaryKey(),

  reservationId: integer("reservation_id")
    .notNull()
    .references(() => reservations.id),

  channel: reminderChannelEnum("channel").notNull().default("email"),
  status: reminderStatusEnum("status").notNull().default("scheduled"),

  // When the reminder should be sent
  sendAt: timestamp("send_at").notNull(),

  // When it was actually sent (if applicable)
  sentAt: timestamp("sent_at"),

  // Optional short error message for failed sends
  errorMessage: varchar("error_message", { length: 500 }),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reservationReminderRelations = relations(
  reservationReminders,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationReminders.reservationId],
      references: [reservations.id],
    }),
  }),
);
