/**
 * src/services/chatHistory.js
 */

import supabase from "../config/supabase.js";

// ── helper: turn a raw Supabase error into a detailed message ─────────────────
function sbErr(label, error) {
  const detail = [
    error.message,
    error.details && `details: ${error.details}`,
    error.hint && `hint: ${error.hint}`,
    error.code && `code: ${error.code}`,
  ]
    .filter(Boolean)
    .join(" | ");
  console.error(`[chatHistory] ${label}:`, detail);
  return Object.assign(new Error(`${label}: ${detail}`), { status: 500 });
}

// ── Create a new chat session ─────────────────────────────────────────────────
export async function createChatSession(interviewSessionId, openingQuestion) {
  // First verify the supabase client can read — diagnose key/connection issues
  const { error: pingError } = await supabase
    .from("chat_sessions")
    .select("id")
    .limit(1);

  if (pingError) {
    console.error(
      "[chatHistory] ping failed — check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
    throw sbErr("Ping failed before insert", pingError);
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      interview_session_id: interviewSessionId,
      opening_question: openingQuestion,
    })
    .select("id")
    .single();

  if (error) throw sbErr("Failed to create chat session", error);

  return { chatSessionId: data.id };
}

// ── Fetch the next turn index ─────────────────────────────────────────────────
export async function getNextTurnIndex(chatSessionId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("turn_index")
    .eq("chat_session_id", chatSessionId)
    .order("turn_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw sbErr("Failed to fetch turn index", error);

  return data ? data.turn_index + 1 : 1;
}

// ── Append messages ───────────────────────────────────────────────────────────
export async function appendMessages(chatSessionId, messages) {
  if (!messages.length) return;

  const startIndex = await getNextTurnIndex(chatSessionId);

  const rows = messages.map((msg, i) => ({
    chat_session_id: chatSessionId,
    role: msg.role,
    content: msg.content,
    turn_index: startIndex + i,
    rag_sources: msg.ragSources ?? null,
  }));

  const { error } = await supabase.from("chat_messages").insert(rows);

  if (error) throw sbErr("Failed to insert chat messages", error);
}

// ── Fetch message history ─────────────────────────────────────────────────────
export async function getMessages(chatSessionId) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, content, turn_index, rag_sources, created_at")
    .eq("chat_session_id", chatSessionId)
    .order("turn_index", { ascending: true });

  if (error) throw sbErr("Failed to fetch messages", error);

  return data ?? [];
}

// ── Look up a chat session by interview_session_id ────────────────────────────
export async function getChatSessionByInterviewId(interviewSessionId) {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, opening_question")
    .eq("interview_session_id", interviewSessionId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw sbErr("Failed to fetch chat session", error);

  return data ?? null;
}
