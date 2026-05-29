/**
 * src/controllers/upload.controller.js  (Phase 4 — replaces Phase 3 version)
 * ─────────────────────────────────────────────────────────────────────────────
 * POST /api/upload
 *
 * Full pipeline:
 *   1. Validate multipart fields (resume PDF + jobDescription text)
 *   2. Extract raw text from PDF via pdf-parse
 *   3. Ingest: chunk → embed → insert vectors into Supabase  [NEW in Phase 4]
 *   4. Generate: RAG retrieval → LLM → opening interview question  [NEW]
 *   5. Return session ID + question + source excerpts to the client
 */

import pdfParse         from 'pdf-parse/lib/pdf-parse.js'
import { ingestDocuments, generateOpeningQuestion } from '../services/ragPipeline.js'

// ── Text normaliser (carried over from Phase 3) ───────────────────────────────
function cleanPdfText(raw) {
  return raw
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── Controller ────────────────────────────────────────────────────────────────
export async function handleUpload(req, res, next) {
  try {
    // ── 1. Validate ─────────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No résumé PDF attached. Expected field name: "resume".',
      })
    }

    const jobDescription = (req.body.jobDescription || '').trim()
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'jobDescription field is required and must not be empty.',
      })
    }

    // ── 2. Parse PDF ─────────────────────────────────────────────────────────
    let parsed
    try {
      parsed = await pdfParse(req.file.buffer)
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: `Could not parse the PDF: ${parseErr.message}`,
      })
    }

    const resumeText = cleanPdfText(parsed.text)
    if (!resumeText) {
      return res.status(422).json({
        success: false,
        error:
          'The PDF appears to be a scanned image with no extractable text. ' +
          'Please upload a text-based PDF.',
      })
    }

    // ── 3. Ingest (chunk + embed + store) ────────────────────────────────────
    const meta = {
      fileName:   req.file.originalname,
      fileSizeKb: Math.round(req.file.size / 1024),
      pageCount:  parsed.numpages,
    }

    const { sessionId, chunkCount } = await ingestDocuments({
      resumeText,
      jobDescription,
      meta,
    })

    // ── 4. Generate opening question ─────────────────────────────────────────
    const { question, sources } = await generateOpeningQuestion(sessionId)

    // ── 5. Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      data: {
        sessionId,
        question,
        sources,
        meta: {
          ...meta,
          chunkCount,
          parsedAt: new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}
