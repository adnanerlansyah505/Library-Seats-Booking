CREATE TYPE "public"."seat_type" AS ENUM('individual', 'group', 'computer', 'silent');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('email', 'push');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('scheduled', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "library_seats" (
	"id" serial PRIMARY KEY NOT NULL,
	"library_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(255),
	"type" "seat_type" DEFAULT 'individual',
	"floor" integer,
	"area" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"reservation_id" integer NOT NULL,
	"channel" "reminder_channel" DEFAULT 'email' NOT NULL,
	"status" "reminder_status" DEFAULT 'scheduled' NOT NULL,
	"send_at" timestamp NOT NULL,
	"sent_at" timestamp,
	"error_message" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "seat_id" integer;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "reserved_date" date;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "status" "reservation_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "library_seats" ADD CONSTRAINT "library_seats_library_id_libraries_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."libraries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_reminders" ADD CONSTRAINT "reservation_reminders_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_seat_id_library_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."library_seats"("id") ON DELETE no action ON UPDATE no action;