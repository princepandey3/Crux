import { useState, useCallback, useRef } from 'react'

/**
 * useIntakeForm
 * Centralises all state and handlers for the Candidate Intake Flow.
 *
 * Returns:
 *  resumeFile      – File | null
 *  jdText          – string
 *  jdFile          – File | null
 *  jdMode          – 'text' | 'file'
 *  dragState       – 'idle' | 'over' | 'reject'
 *  errors          – { resume?: string, jd?: string }
 *  isReady         – boolean (form is submittable)
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

  const onDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

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

  const removeResume = useCallback(() => {
    setResumeFile(null)
  }, [])

  /* ── JD handlers ─────────────────────────────────── */
  const onJdTextChange = useCallback((e) => {
    setJdText(e.target.value)
    if (e.target.value.trim()) clearError('jd')
  }, [])

  const onJdFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      setJdFile(file)
      clearError('jd')
    }
  }, [])

  const removeJdFile = useCallback(() => setJdFile(null), [])

  const switchJdMode = useCallback((mode) => {
    setJdMode(mode)
    setJdText('')
    setJdFile(null)
    clearError('jd')
  }, [])

  /* ── Validation & submit ─────────────────────────── */
  const validate = () => {
    const next = {}
    if (!resumeFile)                              next.resume = 'Please upload your résumé PDF.'
    if (jdMode === 'text' && !jdText.trim())      next.jd     = 'Please enter a job description.'
    if (jdMode === 'file' && !jdFile)             next.jd     = 'Please upload a job description file.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = useCallback((e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      resume: {
        name:     resumeFile.name,
        size:     resumeFile.size,
        type:     resumeFile.type,
        lastModified: resumeFile.lastModified,
      },
      jobDescription: jdMode === 'text'
        ? { mode: 'text',  content: jdText.trim() }
        : { mode: 'file',  name: jdFile.name, size: jdFile.size },
      timestamp: new Date().toISOString(),
    }

    console.group('%c[Deep-Dive] Intake Form Submitted', 'color:#4F6EF7;font-weight:bold')
    console.log('Payload:', payload)
    console.groupEnd()

    setSubmitted(true)
  }, [resumeFile, jdText, jdFile, jdMode])

  const resetForm = useCallback(() => {
    setResumeFile(null)
    setJdText('')
    setJdFile(null)
    setJdMode('text')
    setErrors({})
    setSubmitted(false)
  }, [])

  /* ── Derived ─────────────────────────────────────── */
  const isReady =
    !!resumeFile &&
    (jdMode === 'text' ? jdText.trim().length > 0 : !!jdFile)

  return {
    resumeFile, jdText, jdFile, jdMode,
    dragState, errors, isReady, submitted,
    handlers: {
      onDragEnter, onDragLeave, onDragOver, onDrop,
      onResumeInputChange, removeResume,
      onJdTextChange, onJdFileChange, removeJdFile,
      switchJdMode, onSubmit, resetForm,
    },
  }
}
