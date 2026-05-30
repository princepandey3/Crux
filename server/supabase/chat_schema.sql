-- ════════════════════════════════════════════════════════════════════════════
--  DeepDive Interviewer — Phase 5: Chat History Schema
--
--  New tables:
--    chat_sessions  — one row per interview (links to interview_sessions)
--    chat_messages  — every message turn, ordered by turn_index
--
--  Paste into: Supabase Dashboard → SQL Editor → New query → Run (F5)
--  Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.
-- ════════════════════════════════════════════════════════════════════════════


-- ── 1. chat_sessions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_session_id uuid        NOT NULL
                       REFERENCES public.interview_sessions (id) ON DELETE CASCADE,
  candidate_name       text,
  opening_question     text,                    -- ← cached opening question
  started_at           timestamptz NOT NULL DEFAULT now(),
  last_active_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_sessions_interview_session_id_idx
  ON public.chat_sessions (interview_session_id);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow the service role (used by the backend) full access
DROP POLICY IF EXISTS "service role full access" ON public.chat_sessions;
CREATE POLICY "service role full access" ON public.chat_sessions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.chat_sessions IS
  'One chat session per uploaded resume/JD pair. Links to interview_sessions.';


-- ── 2. chat_messages ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              bigserial    PRIMARY KEY,
  chat_session_id uuid         NOT NULL
                  REFERENCES public.chat_sessions (id) ON DELETE CASCADE,
  role            text         NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text         NOT NULL,
  turn_index      integer      NOT NULL,
  rag_sources     jsonb        DEFAULT NULL,
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_turn_idx
  ON public.chat_messages (chat_session_id, turn_index ASC);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
  ON public.chat_messages (created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow the service role full access
DROP POLICY IF EXISTS "service role full access" ON public.chat_messages;
CREATE POLICY "service role full access" ON public.chat_messages
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.chat_messages IS
  'Every turn in a chat session. role is ''user'' or ''assistant''.';


-- ── 3. Auto-update last_active_at on new messages ────────────────────────────
CREATE OR REPLACE FUNCTION public.update_chat_session_last_active()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.chat_sessions
     SET last_active_at = now()
   WHERE id = NEW.chat_session_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chat_messages_update_session ON public.chat_messages;
CREATE TRIGGER trg_chat_messages_update_session
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_session_last_active();


-- ── 4. Helper view ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.v_chat_threads AS
SELECT
  cm.id              AS message_id,
  cm.chat_session_id,
  cs.interview_session_id,
  cs.candidate_name,
  cm.role,
  cm.turn_index,
  cm.content,
  cm.rag_sources,
  cm.created_at
FROM public.chat_messages   cm
JOIN public.chat_sessions   cs ON cs.id = cm.chat_session_id
ORDER BY cm.chat_session_id, cm.turn_index;


-- ── 5. Verify ─────────────────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('chat_sessions', 'chat_messages');
