'use client'

interface PreviewRendererProps {
  previewHtml: string
}

export default function PreviewRenderer({ previewHtml }: PreviewRendererProps) {
  // Count unmatched variables by looking for the class injected by replaceVariablesForPreview
  const unmatchedCount = (previewHtml.match(/class="variable-unmatched"/g) ?? []).length

  return (
    <div className="flex flex-col gap-3">
      {unmatchedCount > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          ⚠ {unmatchedCount} variable{unmatchedCount !== 1 ? 's' : ''} not found in your data
          — shown in red below
        </div>
      )}
      {/* A4-like white page container */}
      <div
        className="bg-white shadow-md rounded-sm mx-auto w-full overflow-hidden"
        style={{ maxWidth: '794px' /* ~210mm at 96 dpi */ }}
      >
        <div
          className="prose prose-sm max-w-none p-10 min-h-[500px]"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  )
}
