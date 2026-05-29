import React from 'react'
import { useIntakeForm }          from '@/hooks/useIntakeForm.js'
import ResumeDropZone             from './ResumeDropZone.jsx'
import JobDescriptionSection      from './JobDescriptionSection.jsx'
import IntakeSubmitBar            from './IntakeSubmitBar.jsx'
import IntakeSuccessScreen        from './IntakeSuccessScreen.jsx'

/**
 * DashboardIntakeForm
 * Orchestrator for Candidate Intake Flow.
 * Wires the custom hook to all child components.
 */
export default function DashboardIntakeForm() {
  const {
    resumeFile, jdText, jdFile, jdMode,
    dragState, errors, isReady, submitted,
    isSubmitting, apiResult,              // ← FIX: was missing
    handlers: {
      onDragEnter, onDragLeave, onDragOver, onDrop,
      onResumeInputChange, removeResume,
      onJdTextChange, onJdFileChange, removeJdFile,
      switchJdMode, onSubmit, resetForm,
    },
  } = useIntakeForm()

  if (submitted) {
    return (
      <IntakeSuccessScreen
        resumeFile={resumeFile}
        apiResult={apiResult}             // ← FIX: was missing
        onReset={resetForm}
      />
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label="Candidate intake form"
      className="flex flex-col gap-8"
    >
      {/* Step 1 — Résumé */}
      <ResumeDropZone
        file={resumeFile}
        dragState={dragState}
        error={errors.resume}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onInputChange={onResumeInputChange}
        onRemove={removeResume}
      />

      {/* Divider */}
      <div className="h-px w-full bg-white/[0.06]" role="separator" />

      {/* Step 2 — Job Description */}
      <JobDescriptionSection
        mode={jdMode}
        onModeChange={switchJdMode}
        jdText={jdText}
        onJdTextChange={onJdTextChange}
        jdFile={jdFile}
        onJdFileChange={onJdFileChange}
        onJdFileRemove={removeJdFile}
        error={errors.jd}
      />

      {/* Divider */}
      <div className="h-px w-full bg-white/[0.06]" role="separator" />

      {/* FIX: show API error if the request fails */}
      {errors.api && (
        <p className="text-sm text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          ⚠ {errors.api}
        </p>
      )}

      {/* Submit bar */}
      <IntakeSubmitBar
        isReady={isReady}
        isSubmitting={isSubmitting}       // ← FIX: was missing
        hasResume={!!resumeFile}
        hasJd={jdMode === 'text' ? jdText.trim().length > 0 : !!jdFile}
      />
    </form>
  )
}
