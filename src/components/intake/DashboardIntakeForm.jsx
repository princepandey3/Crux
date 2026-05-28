import React from 'react'
import { useIntakeForm }          from '@/hooks/useIntakeForm.js'
import ResumeDropZone             from './ResumeDropZone.jsx'
import JobDescriptionSection      from './JobDescriptionSection.jsx'
import IntakeSubmitBar            from './IntakeSubmitBar.jsx'
import IntakeSuccessScreen        from './IntakeSuccessScreen.jsx'

/**
 * DashboardIntakeForm
 * Orchestrator for Phase 2 — Candidate Intake Flow.
 * Wires the custom hook to all child components.
 * No backend calls yet; submission logs to console.
 */
export default function DashboardIntakeForm() {
  const {
    resumeFile, jdText, jdFile, jdMode,
    dragState, errors, isReady, submitted,
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

      {/* Submit bar */}
      <IntakeSubmitBar
        isReady={isReady}
        hasResume={!!resumeFile}
        hasJd={jdMode === 'text' ? jdText.trim().length > 0 : !!jdFile}
      />
    </form>
  )
}
