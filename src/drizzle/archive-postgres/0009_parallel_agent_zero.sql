CREATE TABLE "token_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"operation" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"input_cost" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"output_cost" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"total_cost" numeric(10, 6) DEFAULT '0.000000' NOT NULL,
	"video_id" text,
	"user_video_id" integer,
	"request_duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "token_usage_user_id_idx" ON "token_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "token_usage_created_at_idx" ON "token_usage" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "token_usage_model_idx" ON "token_usage" USING btree ("model");--> statement-breakpoint
CREATE INDEX "token_usage_operation_idx" ON "token_usage" USING btree ("operation");