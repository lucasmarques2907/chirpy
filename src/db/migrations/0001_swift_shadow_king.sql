ALTER TABLE "chirps" ALTER COLUMN "body" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "chirps" ALTER COLUMN "user_id" SET NOT NULL;