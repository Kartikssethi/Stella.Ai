-- Create tables for Creative AI Writing Assistant
-- Based on the exact schema from the provided image

-- User table to store user information
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Document table matching the exact schema from the image
CREATE TABLE IF NOT EXISTS "document" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" VARCHAR NOT NULL, -- plot, character, book_idea, story
    "description" TEXT NOT NULL,
    "created_by" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Note: embedding table already exists in Supabase

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "document_created_by_idx" ON "document" ("created_by");
CREATE INDEX IF NOT EXISTS "document_type_idx" ON "document" ("type");
CREATE INDEX IF NOT EXISTS "user_email_idx" ON "user" ("email");
CREATE INDEX IF NOT EXISTS "embedding_document_id_idx" ON "embedding" ("document_id");
CREATE INDEX IF NOT EXISTS "embedding_section_id_idx" ON "embedding" ("section_id");

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- RLS (Row Level Security) policies
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "document" ENABLE ROW LEVEL SECURITY;

-- Allow users to read all users (for now - can be restricted later)
CREATE POLICY "Allow read access to users" ON "user"
    FOR SELECT USING (true);

-- Allow users to insert their own records
CREATE POLICY "Allow users to insert" ON "user"
    FOR INSERT WITH CHECK (true);

-- Allow users to read all documents (for now - can be restricted later)
CREATE POLICY "Allow read access to documents" ON "document"
    FOR SELECT USING (true);

-- Allow users to insert documents
CREATE POLICY "Allow document insertion" ON "document"
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own documents
CREATE POLICY "Allow users to update their own documents" ON "document"
    FOR UPDATE USING (created_by = auth.uid()::text);

-- Allow users to delete their own documents
CREATE POLICY "Allow users to delete their own documents" ON "document"
    FOR DELETE USING (created_by = auth.uid()::text);

-- Embedding table policies
ALTER TABLE "embedding" ENABLE ROW LEVEL SECURITY;

-- Allow read access to embeddings
CREATE POLICY "Allow read access to embeddings" ON "embedding"
    FOR SELECT USING (true);

-- Allow insertion of embeddings
CREATE POLICY "Allow embedding insertion" ON "embedding"
    FOR INSERT WITH CHECK (true);

-- Allow users to update embeddings for their documents
CREATE POLICY "Allow users to update embeddings for their documents" ON "embedding"
    FOR UPDATE USING (
        document_id IN (
            SELECT id FROM "document" WHERE created_by = auth.uid()::text
        )
    );

-- Allow users to delete embeddings for their documents
CREATE POLICY "Allow users to delete embeddings for their documents" ON "embedding"
    FOR DELETE USING (
        document_id IN (
            SELECT id FROM "document" WHERE created_by = auth.uid()::text
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON "document"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Trigger for embedding table would be added here if the table was created by this script

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_embeddings(
    query_embedding vector,
    user_id text,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id text,
    document_id text,
    section_id text,
    metadata json,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.document_id,
        e.section_id,
        e.metadata,
        1 - (e.vector <=> query_embedding) as similarity
    FROM embedding e
    INNER JOIN document d ON e.document_id = d.id
    WHERE d.created_by = user_id
    AND 1 - (e.vector <=> query_embedding) > match_threshold
    ORDER BY e.vector <=> query_embedding
    LIMIT match_count;
END;
$$;