-- ════════════════════════════════════════════════════════════════════════════
--  DeepDive Interviewer — Supabase Vector Store Setup
--
--  ⚠️  CHOOSE THE RIGHT DIMENSION BEFORE RUNNING:
--
--     OpenAI  (EMBEDDING_PROVIDER=openai)  → keep   vector(1536)
--     Gemini  (EMBEDDING_PROVIDER=gemini)  → change vector(1536) → vector(768)
--
--  This file is pre-configured for Gemini (768 dims) to match .env.example.
--  Change every occurrence of vector(768) back to vector(1536) if you use OpenAI.
--
--  Paste into: Supabase Dashboard → SQL Editor → New query → Run (F5)
--  Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Enable pgvector ───────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector
  WITH SCHEMA extensions;


-- ── 2. Interview sessions table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name  text,
  file_name       text NOT NULL,
  file_size_kb    integer,
  page_count      integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;


-- ── 3. Documents table ────────────────────────────────────────────────────────
-- FIX: dimension changed from 1536 → 768 to match Gemini text-embedding-004.
-- If you use OpenAI, change vector(768) back to vector(1536) everywhere below.
CREATE TABLE IF NOT EXISTS public.documents (
  id           bigserial PRIMARY KEY,
  session_id   uuid NOT NULL REFERENCES public.interview_sessions (id) ON DELETE CASCADE,
  content      text NOT NULL,
  source       text NOT NULL
               CHECK (source IN ('resume', 'job_description')),
  chunk_index  integer NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}',
  embedding    vector(768),     -- FIX: was vector(1536) — must match your embedding model
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON public.documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS documents_session_id_idx
  ON public.documents (session_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;


-- ── 4. match_documents function ──────────────────────────────────────────────
-- FIX: dimension changed from vector(1536) → vector(768) to match Gemini.
CREATE OR REPLACE FUNCTION public.match_documents (
  query_embedding  vector(768),   -- FIX: was vector(1536)
  match_count      int     DEFAULT 5,
  filter           jsonb   DEFAULT '{}'
)
RETURNS TABLE (
  id         bigint,
  content    text,
  metadata   jsonb,
  source     text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.metadata,
    d.source,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM public.documents d
  WHERE
    (filter = '{}' OR d.metadata @> filter)
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- ── 5. Verify ────────────────────────────────────────────────────────────────
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name IN ('interview_sessions', 'documents');
SELECT routine_name FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_name = 'match_documents';
