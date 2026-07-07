-- Drop and recreate the problematic columns
ALTER TABLE "transcript_segments" DROP COLUMN "start";
ALTER TABLE "transcript_segments" DROP COLUMN "end";
ALTER TABLE "transcript_segments" ADD COLUMN "start" time NOT NULL;
ALTER TABLE "transcript_segments" ADD COLUMN "end" time NOT NULL;
