CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"document_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"current_stage" text DEFAULT 'uploaded' NOT NULL,
	"raw_text" text,
	"overall_summary" text,
	"clauses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"high_risk_count" integer DEFAULT 0 NOT NULL,
	"medium_risk_count" integer DEFAULT 0 NOT NULL,
	"low_risk_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bucket_name" text NOT NULL,
	"storage_path" text NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contracts_user_id_created_at_idx" ON "contracts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "contracts_document_id_idx" ON "contracts" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_user_id_created_at_idx" ON "documents" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "documents_storage_path_idx" ON "documents" USING btree ("storage_path");