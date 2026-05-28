import pdfParse from 'pdf-parse/lib/pdf-parse.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise whitespace that survives PDF extraction:
 *  • Collapse runs of spaces/tabs inside lines
 *  • Collapse 3+ consecutive blank lines down to 2 (keeps section spacing)
 */
function cleanPdfText(raw) {
  return raw
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Controller ──────────────────────────────────────────────────────────────

/**
 * POST /api/upload
 *
 * Accepts:
 *   resume         – PDF file (multipart/form-data, field name: "resume")
 *   jobDescription – plain-text string  (multipart/form-data, field name: "jobDescription")
 *
 * Returns (Phase 3 — parsing only, no DB write yet):
 *   {
 *     success: true,
 *     data: {
 *       resumeText:     string,   // raw text extracted from PDF
 *       jobDescription: string,   // JD as received from the client
 *       meta: {
 *         fileName:    string,
 *         fileSizeKb:  number,
 *         pageCount:   number,
 *         parsedAt:    ISO-8601 string,
 *       }
 *     }
 *   }
 */
export async function handleUpload(req, res, next) {
  try {
    // ── 1. Validate multipart fields ────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No résumé PDF was attached. Expected field name: "resume".',
      })
    }

    const jobDescription = (req.body.jobDescription || '').trim()
    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'jobDescription field is required and must not be empty.',
      })
    }

    // ── 2. Parse PDF buffer ──────────────────────────────────────────────────
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

    // ── 3. Return parsed data (Phase 4 will persist to Supabase) ────────────
    return res.status(200).json({
      success: true,
      data: {
        resumeText,
        jobDescription,
        meta: {
          fileName:   req.file.originalname,
          fileSizeKb: Math.round(req.file.size / 1024),
          pageCount:  parsed.numpages,
          parsedAt:   new Date().toISOString(),
        },
      },
    })
  } catch (err) {
    next(err)
  }
}
