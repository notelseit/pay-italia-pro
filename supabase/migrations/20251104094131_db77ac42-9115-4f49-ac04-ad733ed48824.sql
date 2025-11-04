-- Add file support to hr_news_sources table
ALTER TABLE public.hr_news_sources
ADD COLUMN file_path text,
ADD COLUMN file_name text,
ADD COLUMN file_size integer,
ADD COLUMN mime_type text;

-- Make url nullable since we can have either url or file
ALTER TABLE public.hr_news_sources
ALTER COLUMN url DROP NOT NULL;