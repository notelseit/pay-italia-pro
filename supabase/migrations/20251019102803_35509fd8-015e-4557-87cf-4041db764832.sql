-- Add document_url column to education_records table
ALTER TABLE education_records 
ADD COLUMN IF NOT EXISTS document_url text;