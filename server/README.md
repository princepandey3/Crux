# DeepDive Interviewer

An AI-powered interview preparation tool. Upload a résumé PDF and a job description, and the system generates a deeply contextualised opening interview question grounded strictly in the candidate's actual experience versus the role's specific requirements.

Built across four phases: React frontend intake UI → Node/Express backend → PDF parsing + Supabase storage → RAG pipeline with LangChain, pgvector, and an LLM (OpenAI or Google Gemini).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project Structure](#3-project-structure)
4. [Phase 1 & 2 — Frontend Setup](#4-phase-1--2--frontend-setup)
5. [Phase 3 — Backend Server Setup](#5-phase-3--backend-server-setup)
6. [Phase 4 — Supabase Database Setup](#6-phase-4--supabase-database-setup)
7. [Phase 4 — RAG Pipeline Configuration](#7-phase-4--rag-pipeline-configuration)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Running the Full Stack](#9-running-the-full-stack)
10. [API Reference](#10-api-reference)
11. [How the RAG Pipeline Works](#11-how-the-rag-pipeline-works)
12. [Choosing an AI Provider](#12-choosing-an-ai-provider)
13. [Tuning the Pipeline](#13-tuning-the-pipeline)
14. [Troubleshooting](#14-troubleshooting)
15. [Future Phases Roadmap](#15-future-phases-roadmap)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (Vite + React)                   │
│  ResumeDropZone  ──┐                                            │
│  JobDescription  ──┼──► useIntakeForm ──► POST /api/upload      │
│  IntakeSubmitBar ──┘         (FormData: PDF + JD text)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ :5173 → proxy → :3001
┌──────────────────────────────▼──────────────────────────────────┐
│                     NODE / EXPRESS SERVER                        │
│                                                                  │
│  multer (memory)  →  pdf-parse  →  cleanPdfText()               │
│          │                                                       │
│          ▼                                                       │
│  ragPipeline.ingestDocuments()                                   │
│    ├─ createSession()       → Supabase: interview_sessions       │
│    ├─ chunker.chunkAll()    → RecursiveCharacterTextSplitter     │
│    └─ vectorStore.insert()  → Supabase: documents + embeddings   │
│          │                                                       │
│  ragPipeline.generateOpeningQuestion()                           │
│    ├─ similaritySearch()    → match_documents RPC (cosine ANN)   │
│    ├─ formatContext()       → labelled résumé + JD passages      │
│    └─ LLM chain             → grounded interview question        │
│          │                                                       │
│  { sessionId, question, sources, meta }  ──► client             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│               SUPABASE (PostgreSQL + pgvector)                   │
│                                                                  │
│  interview_sessions   id | file_name | created_at | …           │
│  documents            id | session_id | content | embedding      │
│                          | source | chunk_index | metadata       │
│                                                                  │
│  match_documents()    RPC — cosine similarity search             │
│                       filtered by session_id + optional source   │
└─────────────────────────────────────────────────────────────────┘
```

**Key design choices:**

- **No temp files** — multer uses in-memory storage; the PDF buffer goes straight to pdf-parse then gets GC'd.
- **Service Role Key only on the server** — the Supabase client that can bypass Row Level Security never leaves Node.
- **Session-scoped retrieval** — every upload gets its own `interview_sessions` UUID; `match_documents` always filters by `session_id`, so queries from one candidate never bleed into another's results.
- **Provider-agnostic** — a single `EMBEDDING_PROVIDER` / `LLM_PROVIDER` env var switches the AI stack between OpenAI and Google Gemini with no code changes.

---

## 2. Prerequisites

| Tool                                   | Minimum version | Notes                                                |
| -------------------------------------- | --------------- | ---------------------------------------------------- |
| Node.js                                | 18.0.0          | Uses `--watch` flag for dev; ESM (`"type":"module"`) |
| npm                                    | 9+              | Bundled with Node 18                                 |
| Supabase account                       | —               | Free tier works for development                      |
| OpenAI **or** Google AI Studio account | —               | One is required; both is optional                    |

Verify your Node version:

```bash
node --version   # should print v18.x.x or higher
```

---

## 3. Project Structure

After completing all four phases your workspace should look like this:

```
deepdive/
├── deep-dive-interviewer/          ← Phase 1 & 2: React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── intake/             ← DashboardIntakeForm, ResumeDropZone, …
│   │   │   ├── layout/             ← Navbar, Footer, RootLayout
│   │   │   └── ui/                 ← FieldError, FileChip, StatusBadge, …
│   │   ├── hooks/
│   │   │   └── useIntakeForm.js    ← replaced in Phase 3 to call the API
│   │   ├── pages/
│   │   ├── routes/
│   │   └── styles/
│   ├── vite.config.js              ← replaced in Phase 3 to add proxy
│   └── package.json
│
└── deep-dive-server/               ← Phase 3 & 4: Express backend
    ├── supabase/
    │   └── schema.sql              ← run once in Supabase SQL Editor
    ├── src/
    │   ├── config/
    │   │   ├── supabase.js         ← service-role Supabase client
    │   │   └── llm.js              ← Phase 4: embeddings + chat LLM factory
    │   ├── controllers/
    │   │   └── upload.controller.js
    │   ├── middleware/
    │   │   ├── upload.js           ← multer config
    │   │   └── errorHandler.js
    │   ├── routes/
    │   │   └── upload.routes.js
    │   ├── services/               ← Phase 4
    │   │   ├── chunker.js
    │   │   ├── vectorStore.js
    │   │   └── ragPipeline.js
    │   ├── app.js
    │   └── index.js
    ├── .env.example
    ├── .gitignore
    └── package.json
```

---

## 4. Phase 1 & 2 — Frontend Setup

If you are starting fresh, install and run the React frontend:

```bash
cd deep-dive-interviewer
npm install
npm run dev
# Vite starts on http://localhost:5173
```

**Apply the Phase 3 frontend updates** (these files ship in the Phase 3 zip under `frontend-updates/`):

```bash
# From the project root
cp frontend-updates/useIntakeForm.js  deep-dive-interviewer/src/hooks/useIntakeForm.js
cp frontend-updates/vite.config.js    deep-dive-interviewer/vite.config.js
```

The updated `vite.config.js` adds a dev-server proxy:

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:3001', changeOrigin: true }
  }
}
```

This means the browser always calls `localhost:5173/api/upload` and Vite forwards it to Express. No CORS configuration is needed during development.

---

## 5. Phase 3 — Backend Server Setup

### 5a. Install dependencies

```bash
cd deep-dive-server
npm install
```

This installs: `express`, `cors`, `dotenv`, `multer`, `pdf-parse`, `@supabase/supabase-js`, and all LangChain packages.

### 5b. Create your environment file

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
```

See [Section 8](#8-environment-variables-reference) for all variables.

### 5c. Where to find your Supabase credentials

1. Go to [supabase.com](https://supabase.com) → your project
2. Click **Project Settings** (gear icon in the left sidebar)
3. Click **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret (under "Project API keys", click "Reveal") → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key bypasses Row Level Security. Never put it in frontend code or commit it to git.

---

## 6. Phase 4 — Supabase Database Setup

This is a **one-time step** you do in the Supabase dashboard before starting the server.

### 6a. Run the SQL schema

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open `deep-dive-server/supabase/schema.sql` in a text editor, select all, and paste it into the SQL Editor
5. Click **Run** (or press `F5`)

The script creates:

| Object                     | Type           | Purpose                                                         |
| -------------------------- | -------------- | --------------------------------------------------------------- |
| `vector`                   | Extension      | Adds the `vector` data type and ANN index support to PostgreSQL |
| `interview_sessions`       | Table          | One row per candidate upload; parent for all document chunks    |
| `documents`                | Table          | Stores chunked text + 1536-dimensional embedding vector         |
| `documents_embedding_idx`  | IVFFlat index  | Enables fast approximate nearest-neighbour cosine search        |
| `documents_session_id_idx` | B-tree index   | Fast per-session queries and cascaded deletes                   |
| `match_documents`          | Function (RPC) | Called by LangChain to run similarity searches                  |

### 6b. Verify the setup

After running the script, scroll to the bottom of the SQL output. You should see three result sets:

```
extname | extversion
--------+-----------
vector  | 0.x.x          ← pgvector is enabled

table_name
--------------------
interview_sessions  ← both tables exist
documents

routine_name
-----------------
match_documents     ← RPC function exists
```

If any of these are missing, re-run the schema script — all statements use `IF NOT EXISTS` / `OR REPLACE` so it is safe to run multiple times.

### 6c. Important: Gemini embedding dimensions

The `documents.embedding` column is created as `vector(1536)`, which matches OpenAI's `text-embedding-3-small` model. If you choose Google Gemini embeddings (`text-embedding-004` produces 768-dimensional vectors), you **must** edit `schema.sql` before running it:

```sql
-- Change this line in schema.sql:
embedding    vector(1536),
-- To:
embedding    vector(768),
```

You cannot change a column's vector dimension after it has data. If you have already run the schema with 1536 and want to switch to Gemini, you need to drop and recreate the `documents` table.

---

## 7. Phase 4 — RAG Pipeline Configuration

The RAG pipeline is wired together across three service files:

### `src/services/chunker.js`

Splits raw text into overlapping chunks using LangChain's `RecursiveCharacterTextSplitter`. Each chunk becomes a LangChain `Document` object with metadata:

```js
{
  pageContent: "...the chunk text...",
  metadata: {
    source: "resume",          // or "job_description"
    session_id: "<uuid>",      // used to filter search results
    chunk_index: 3,            // position in the original document
  }
}
```

### `src/services/vectorStore.js`

Wraps `SupabaseVectorStore` from `@langchain/community`. It handles:

- **Insertion**: `insertDocuments(docs)` calls `SupabaseVectorStore.fromDocuments()`, which batches the embed API calls and writes rows to the `documents` table automatically.
- **Retrieval**: `getRetriever(sessionId, k)` returns a LangChain retriever that passes `{ session_id }` as a filter to the `match_documents` RPC, scoping results to the current session only.

### `src/services/ragPipeline.js`

The orchestrator. Two exported functions:

**`ingestDocuments({ resumeText, jobDescription, meta })`**

1. Inserts a row into `interview_sessions` to get a UUID
2. Calls `chunkAll()` to split both documents in parallel
3. Calls `insertDocuments()` to embed and store all chunks

**`generateOpeningQuestion(sessionId)`**

1. Runs a broad similarity search using a fixed retrieval query designed to surface experience + requirements chunks
2. Formats retrieved chunks into a labelled context block
3. Runs a `ChatPromptTemplate` chain against the LLM with strict grounding rules
4. Returns `{ question, sources, chunkCount }`

---

## 8. Environment Variables Reference

All variables live in `deep-dive-server/.env`. The `.env.example` file contains every variable with comments.

### Required for all setups

| Variable                    | Description                        | Example                   |
| --------------------------- | ---------------------------------- | ------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL          | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role secret (bypasses RLS) | `eyJhbGci...`             |

### Choose one embedding provider

| Variable             | Value                | Notes                            |
| -------------------- | -------------------- | -------------------------------- |
| `EMBEDDING_PROVIDER` | `openai` or `gemini` | Defaults to `openai`             |
| `OPENAI_API_KEY`     | `sk-...`             | Required if provider is `openai` |
| `GOOGLE_API_KEY`     | `AIza...`            | Required if provider is `gemini` |

### Choose one LLM provider

| Variable       | Value                | Notes                |
| -------------- | -------------------- | -------------------- |
| `LLM_PROVIDER` | `openai` or `gemini` | Defaults to `openai` |

LLM and embedding providers can be mixed (e.g. Gemini embeddings + OpenAI GPT-4o for generation), as long as the vector dimension in the schema matches your embedding choice.

### Optional / tuning

| Variable           | Default                 | Description                                       |
| ------------------ | ----------------------- | ------------------------------------------------- |
| `PORT`             | `3001`                  | Express server port                               |
| `NODE_ENV`         | `development`           | Set to `production` when deploying                |
| `ALLOWED_ORIGINS`  | `http://localhost:5173` | Comma-separated allowed CORS origins              |
| `MAX_FILE_SIZE_MB` | `10`                    | Maximum PDF upload size                           |
| `RAG_MATCH_COUNT`  | `6`                     | Chunks retrieved per similarity search            |
| `CHUNK_SIZE`       | `800`                   | Target characters per chunk                       |
| `CHUNK_OVERLAP`    | `120`                   | Overlapping characters between consecutive chunks |

---

## 9. Running the Full Stack

You need two terminal windows.

**Terminal 1 — Backend**

```bash
cd deep-dive-server
npm run dev
```

Expected output:

```
🚀  DeepDive API server running on http://localhost:3001
   Environment : development
   Supabase URL: ✓ set
```

**Terminal 2 — Frontend**

```bash
cd deep-dive-interviewer
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173` in your browser. You can verify the server is reachable independently:

```bash
curl http://localhost:3001/health
# → {"status":"ok"}
```

---

## 10. API Reference

### `POST /api/upload`

The single endpoint for the full pipeline. Accepts `multipart/form-data`.

**Request fields**

| Field            | Type       | Required | Description                                                                |
| ---------------- | ---------- | -------- | -------------------------------------------------------------------------- |
| `resume`         | File (PDF) | Yes      | The candidate's résumé. Must be `application/pdf`, max `MAX_FILE_SIZE_MB`. |
| `jobDescription` | String     | Yes      | The full job description text.                                             |

**Success response `200`**

```json
{
  "success": true,
  "data": {
    "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "question": "In your role at Acme Corp, you led a migration to Kubernetes. Can you walk me through a situation where that migration hit an unexpected obstacle, what your specific actions were, and what the measurable outcome was — particularly given that this role requires direct experience scaling containerised workloads under SLA constraints?",
    "sources": [
      {
        "source": "resume",
        "excerpt": "Led migration of 12 microservices from ECS to Kubernetes, reducing deployment time by 40%..."
      },
      {
        "source": "job_description",
        "excerpt": "Must have hands-on experience scaling containerised workloads and maintaining 99.9% SLA..."
      }
    ],
    "meta": {
      "fileName": "john-doe-resume.pdf",
      "fileSizeKb": 142,
      "pageCount": 2,
      "chunkCount": 31,
      "parsedAt": "2026-05-29T10:23:45.000Z"
    }
  }
}
```

**Error responses**

| Status | Cause                                                                                |
| ------ | ------------------------------------------------------------------------------------ |
| `400`  | Missing `resume` file or empty `jobDescription`                                      |
| `413`  | PDF exceeds `MAX_FILE_SIZE_MB`                                                       |
| `422`  | PDF is scanned/image-only (no extractable text), or chunking produced zero documents |
| `500`  | Supabase insert failed, embedding API error, or LLM API error                        |

### `GET /health`

Returns `{"status":"ok"}`. Use this to confirm the server is running.

---

## 11. How the RAG Pipeline Works

Understanding this helps you tune it and debug issues.

### Step 1 — PDF text extraction

`pdf-parse` reads the raw PDF buffer from memory and extracts the text layer. A `cleanPdfText()` function then normalises whitespace: collapsing multiple spaces/tabs within lines and reducing 3+ consecutive blank lines to 2. This improves chunking quality by removing PDF rendering artefacts.

### Step 2 — Session creation

A row is inserted into `interview_sessions` immediately, before any chunking or embedding. This gives us a UUID to attach to every document chunk and means we can cascade-delete all chunks for a session with a single delete on the parent row.

### Step 3 — Chunking

`RecursiveCharacterTextSplitter` tries to split on `\n\n` first (paragraph breaks), then `\n`, then `. `, then ` `, then individual characters — falling back down the hierarchy only when the chunk would exceed `CHUNK_SIZE`. The `CHUNK_OVERLAP` setting means consecutive chunks share a tail/head window, so context around a split point is not lost.

Resume and JD are chunked in parallel. Each resulting `Document` carries `{ source, session_id, chunk_index }` in its metadata.

### Step 4 — Embedding and storage

`SupabaseVectorStore.fromDocuments()` sends all chunks to the embedding model in batches of up to 512. The returned vectors (1536 floats for OpenAI, 768 for Gemini) are written to the `documents.embedding` column alongside the chunk text and metadata.

### Step 5 — Similarity retrieval

At query time, the retrieval query string:

```
"candidate professional experience skills responsibilities achievements
 job requirements qualifications responsibilities technologies"
```

is embedded using the same model. The `match_documents` RPC computes cosine distance between this query vector and every `documents.embedding` row for the session, returning the `RAG_MATCH_COUNT` smallest distances (most similar chunks).

### Step 6 — Grounded question generation

The retrieved chunks are formatted into a labelled context block with `📄 RÉSUMÉ` and `📋 JOB DESCRIPTION` prefixes. The system prompt enforces strict grounding rules:

- The question must reference a concrete, verifiable detail from the résumé (project, technology, metric, role)
- It must bridge that detail to a specific requirement from the JD
- It must invite a STAR-format answer
- If context is insufficient, the model must respond with `INSUFFICIENT_CONTEXT` rather than hallucinate

The chain uses `ChatPromptTemplate → LLM → StringOutputParser`. Temperature is set to `0.4` — low enough for focused, fact-grounded output while leaving room for natural phrasing.

---

## 12. Choosing an AI Provider

### OpenAI (default, recommended for first run)

| Model                    | Use                 | Dimensions | Notes                     |
| ------------------------ | ------------------- | ---------- | ------------------------- |
| `text-embedding-3-small` | Embeddings          | 1536       | Fast, cheap, good quality |
| `gpt-4o`                 | Question generation | —          | Best reasoning quality    |

Set in `.env`:

```
EMBEDDING_PROVIDER=openai
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Estimated cost per upload: < $0.01 for embeddings (small résumé + JD), ~$0.01–0.03 for GPT-4o generation.

### Google Gemini

| Model                | Use                 | Dimensions | Notes                                     |
| -------------------- | ------------------- | ---------- | ----------------------------------------- |
| `text-embedding-004` | Embeddings          | 768        | Requires schema change                    |
| `gemini-1.5-pro`     | Question generation | —          | Strong reasoning, generous context window |

Set in `.env`:

```
EMBEDDING_PROVIDER=gemini
LLM_PROVIDER=gemini
GOOGLE_API_KEY=AIza...
```

**Important:** If using Gemini embeddings, change `vector(1536)` to `vector(768)` in `schema.sql` before running it. This cannot be changed once data exists in the table.

### Mixing providers

You can use Gemini embeddings with OpenAI GPT-4o (or vice versa). The two settings are independent. The only constraint is that whichever embedding model you use at ingest time must be the same one used at retrieval time — mixing models between ingest and query will produce garbage similarity scores.

---

## 13. Tuning the Pipeline

### Chunk size and overlap

| Scenario                               | Recommendation                                                  |
| -------------------------------------- | --------------------------------------------------------------- |
| Résumés are very dense / structured    | Reduce `CHUNK_SIZE` to `600`, increase `CHUNK_OVERLAP` to `150` |
| JDs are long and verbose               | Increase `CHUNK_SIZE` to `1000`                                 |
| Getting too many near-duplicate chunks | Reduce `CHUNK_OVERLAP` to `80`                                  |

### Retrieval count

`RAG_MATCH_COUNT` controls how many chunks are sent to the LLM as context. The tradeoffs:

- **Too low (< 4)**: May not surface both résumé and JD content, leading to poorly grounded questions.
- **Too high (> 10)**: Increases LLM input tokens and cost; may dilute signal with low-relevance chunks.
- **Sweet spot**: `6–8` for most résumé + JD combinations.

### IVFFlat index tuning

The `documents_embedding_idx` is created with `lists = 100`. This controls the number of IVFFlat centroids. For small data sets (< 10,000 rows) it has minimal impact. If you scale to many sessions:

```sql
-- Rule of thumb: lists ≈ total rows / 1000
-- After bulk inserts, reindex for best performance:
REINDEX INDEX documents_embedding_idx;
```

---

## 14. Troubleshooting

### Server won't start: "Missing Supabase environment variables"

Your `.env` file is missing or `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are not set. Check:

```bash
cat deep-dive-server/.env
```

Make sure there are no extra spaces around the `=` sign and no quotes around the values.

### "Failed to create session" (500 on upload)

The server cannot write to Supabase. Common causes:

1. `schema.sql` has not been run yet — the `interview_sessions` table does not exist.
2. The `SUPABASE_SERVICE_ROLE_KEY` is the `anon` key instead of the `service_role` key.
3. Network issue — check that `SUPABASE_URL` is correct and reachable.

### "Could not parse the PDF" (422)

The PDF is corrupted, password-protected, or a format that `pdf-parse` cannot read. Test with a different PDF. Most word-processor-exported PDFs work; some design tool exports do not.

### "The PDF appears to be a scanned image" (422)

The PDF has no text layer — it is a raster scan. `pdf-parse` returns an empty string. Ask the candidate to upload a text-based PDF (exported from Word, Google Docs, etc.) rather than a scanned image.

### "No document chunks found for this session" (404 on question generation)

The ingestion step completed but the retrieval found no rows. This usually means:

1. The `match_documents` RPC does not exist — re-run `schema.sql`.
2. The `filter` jsonb column in `documents.metadata` does not contain `session_id`. Check that `chunker.js` is passing `sessionId` into the Document metadata correctly.

### "INSUFFICIENT_CONTEXT" error (422)

The LLM signalled that the retrieved chunks did not contain enough specific detail to generate a grounded question. This happens with very thin résumés (< 200 words) or very generic JDs. Try:

- Increasing `RAG_MATCH_COUNT` to retrieve more context
- Decreasing `CHUNK_SIZE` so individual chunks are more focused
- Verifying the PDF extracted cleanly (check `resumeText` in the server logs)

### Embedding dimension mismatch error from Supabase

You created the table with `vector(1536)` but switched to Gemini embeddings (768 dims), or vice versa. You need to drop and recreate the `documents` table:

```sql
-- WARNING: deletes all existing embeddings
DROP TABLE IF EXISTS public.documents CASCADE;
-- Then re-run schema.sql with the correct vector() dimension
```

### CORS error in browser

The Express server is not running, or it is running on a different port than the Vite proxy target. Check:

1. The server is running on port `3001` (or whatever `PORT` is set to in `.env`)
2. `vite.config.js` proxy target matches: `target: 'http://localhost:3001'`
3. `ALLOWED_ORIGINS` in `.env` includes `http://localhost:5173`

---

## 15. Future Phases Roadmap

The `sessionId` returned from `POST /api/upload` is the key to all subsequent phases:

**Phase 5 — Interactive interview session**
Use the `sessionId` to maintain a multi-turn conversation. Each follow-up question is generated by retrieving chunks relevant to the candidate's previous answer, keeping the interview grounded throughout.

**Phase 6 — Session persistence and history**
Store the generated questions and (optionally) candidate responses in a `session_turns` table linked to `interview_sessions`. Enables review, scoring, and playback.

**Phase 7 — Scoring and feedback**
After the session, run a final RAG pass to evaluate how well the candidate's answers addressed the JD requirements and generate structured feedback.

**Phase 8 — Authentication and multi-user support**
Add Supabase Auth. Update RLS policies on `interview_sessions` and `documents` so each user can only see their own sessions. Swap the Service Role client for a user-scoped client on authenticated routes.
