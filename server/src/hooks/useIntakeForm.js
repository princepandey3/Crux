import { useState, useCallback, useRef } from 'react'

/**
 * useIntakeForm  (Phase 3 update)
 * ─────────────────────────────────────────────────────────────────────────────
 * Added: real API submission to POST /api/upload via FormData.
 * The hook now tracks `isSubmitting` and `apiResult` alongside the existing
 * form state so the success screen can display parsed data.
 *
 * Returns:
 *  resumeFile      – File | null
 *  jdText          – string
 *  jdFile          – File | null
 *  jdMode          – 'text' | 'file'
 *  dragState       – 'idle' | 'over' | 'reject'
 *  errors          – { resume?: string, jd?: string, api?: string }
 *  isReady         – boolean (form is submittable)
 *  isSubmitting    – boolean (network request in flight)
 *  submitted       – boolean (request succeeded)
 *  apiResult       – { resumeText, jobDescription, meta } | null
 *  handlers        – all event handlers
 */
export function useIntakeForm() {
  const [resumeFile, setResumeFile]   = useState(null)
  const [jdText, setJdText]           = useState('')
  const [jdFile, setJdFile]           = useState(null)
  const [jdMode, setJdMode]           = useState('text')   // 'text' | 'file'
  const [dragState, setDragState]     = useState('idle')   // 'idle' | 'over' | 'reject'
  const [errors, setErrors]           = useState({})
  const [submitted, setSubmitted]     = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResult, setApiResult]     = useState(null)
  const dragCounter                   = useRef(0)

  /* ── Helpers ─────────────────────────────────────── */
  const isPDF = (file) => file?.type === 'application/pdf'

  const clearError = (key) =>
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })

  /* ── Resume handlers ─────────────────────────────── */
  const acceptResumeFile = useCallback((file) => {
    if (!isPDF(file)) {
      setDragState('reject')
      setErrors((e) => ({ ...e, resume: 'Only PDF files are accepted.' }))
      setTimeout(() => setDragState('idle'), 1200)
      return
    }
    setResumeFile(file)
    setDragState('idle')
    clearError('resume')
  }, [])

  const onDragEnter = useCallback((e) => {
    e.preventDefault()
    dragCounter.current += 1
    if (dragCounter.current === 1) setDragState('over')
  }, [])

  const onDragLeave = useCallback((e) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) setDragState('idle')
  }, [])

  const onDragOver = useCallback((e) => { e.preventDefault() }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    dragCounter.current = 0
    const file = e.dataTransfer.files?.[0]
    if (file) acceptResumeFile(file)
  }, [acceptResumeFile])

  const onResumeInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) acceptResumeFile(file)
  }, [acceptResumeFile])

  const removeResume = useCallback(() => setResumeFile(null), [])

  /* ── JD handlers ─────────────────────────────────── */
  const onJdTextChange = useCallback((e) => {
    setJdText(e.target.value)
    if (e.target.value.trim()) clearError('jd')
  }, [])

  const onJdFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) { setJdFile(file); clearError('jd') }
  }, [])

  const removeJdFile = useCallback(() => setJdFile(null), [])

  const switchJdMode = useCallback((mode) => {
    setJdMode(mode)
    setJdText('')
    setJdFile(null)
    clearError('jd')
  }, [])

  /* ── Validation ──────────────────────────────────── */
  const validate = () => {
    const next = {}
    if (!resumeFile)                              next.resume = 'Please upload your résumé PDF.'
    if (jdMode === 'text' && !jdText.trim())      next.jd     = 'Please enter a job description.'
    if (jdMode === 'file' && !jdFile)             next.jd     = 'Please upload a job description file.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  /* ── Submit → POST /api/upload ───────────────────── */
  const onSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return

    // Build multipart payload
    const formData = new FormData()
    formData.append('resume', resumeFile)

    // JD: if file mode, read it as text first; otherwise send the textarea value
    let jdContent = jdText.trim()
    if (jdMode === 'file' && jdFile) {
      jdContent = await jdFile.text()
    }
    formData.append('jobDescription', jdContent)

    setIsSubmitting(true)
    clearError('api')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Note: do NOT set Content-Type manually — the browser sets it with
        // the correct boundary when you pass a FormData body.
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Server error ${res.status}`)
      }

      setApiResult(json.data)
      setSubmitted(true)
    } catch (err) {
      setErrors((prev) => ({ ...prev, api: err.message }))
    } finally {
      setIsSubmitting(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeFile, jdText, jdFile, jdMode])

  const resetForm = useCallback(() => {
    setResumeFile(null)
    setJdText('')
    setJdFile(null)
    setJdMode('text')
    setErrors({})
    setSubmitted(false)
    setIsSubmitting(false)
    setApiResult(null)
  }, [])

  /* ── Derived ─────────────────────────────────────── */
  const isReady =
    !!resumeFile &&
    (jdMode === 'text' ? jdText.trim().length > 0 : !!jdFile)

  return {
    resumeFile, jdText, jdFile, jdMode,
    dragState, errors, isReady, submitted,
    isSubmitting, apiResult,
    handlers: {
      onDragEnter, onDragLeave, onDragOver, onDrop,
      onResumeInputChange, removeResume,
      onJdTextChange, onJdFileChange, removeJdFile,
      switchJdMode, onSubmit, resetForm,
    },
  }
}
