-- Documents: Add rejection_comments column to filled_documents
-- Allows CEO to store rejection reason, and submitter to see it

ALTER TABLE public.filled_documents
ADD COLUMN IF NOT EXISTS rejection_comments TEXT;
