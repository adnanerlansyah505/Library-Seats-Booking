CREATE TYPE "public"."user_role" AS ENUM('admin', 'student');--> statement-breakpoint
CREATE TYPE "public"."seat_type" AS ENUM('individual', 'group', 'computer', 'silent');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('email', 'push');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('scheduled', 'sent', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'student',
	"status" boolean DEFAULT true,
	"is_email_verified" boolean DEFAULT false,
	"email_verification_token" varchar(255),
	"email_verification_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "libraries" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255),
	"name" varchar NOT NULL,
	"description" text,
	"location" varchar(255),
	"owner_name" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "libraries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "library_seats" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255),
	"library_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(255),
	"type" "seat_type" DEFAULT 'individual',
	"floor" integer,
	"area" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "library_seats_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"library_id" integer NOT NULL,
	"seat_id" integer,
	"seat_number" integer,
	"reserved_at" timestamp DEFAULT now(),
	"reserved_date" date,
	"start_time" timestamp,
	"end_time" timestamp,
	"status" "reservation_status" DEFAULT 'pending',
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
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "library_seats" ADD CONSTRAINT "library_seats_library_id_libraries_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."libraries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_library_id_libraries_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."libraries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_seat_id_library_seats_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."library_seats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_reminders" ADD CONSTRAINT "reservation_reminders_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;