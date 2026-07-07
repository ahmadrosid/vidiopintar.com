CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_type" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"payment_method" text DEFAULT 'bank_transfer' NOT NULL,
	"transaction_reference" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_settings" text,
	"user_agent" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"confirmed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	CONSTRAINT "transactions_transaction_reference_unique" UNIQUE("transaction_reference")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"user_video_id" integer NOT NULL,
	"timestamp" real NOT NULL,
	"text" text NOT NULL,
	"color" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_video_id_user_videos_id_fk" FOREIGN KEY ("user_video_id") REFERENCES "public"."user_videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_videos_user_id_youtube_id_idx" ON "user_videos" USING btree ("user_id","youtube_id");