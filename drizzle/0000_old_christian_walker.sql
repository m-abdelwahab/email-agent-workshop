CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"subject" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"date" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"summary" text NOT NULL,
	"labels" text[] DEFAULT '{}'::text[]
);
