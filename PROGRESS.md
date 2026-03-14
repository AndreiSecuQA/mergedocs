# MergeDocs — Implementation Progress

## Session 1 — Foundation Scaffold ✅

**Date:** 2026-03-14  
**Status:** Complete

### Steps Completed

| Step | Description | Status |
|------|-------------|--------|
| 1 | Next.js 14+ project scaffold (TypeScript, Tailwind, App Router, `@/*` alias) | ✅ |
| 2 | All production dependencies installed (`zustand`, `@tiptap/*`, `@dnd-kit/*`, `papaparse`, `xlsx`, `mammoth`, `jszip`, `@prisma/client`, `prisma`, `stripe`, `@aws-sdk/*`, `lucide-react`, `clsx`, `tailwind-merge`, etc.) | ✅ |
| 3 | shadcn/ui initialized; components added: `button`, `card`, `input`, `label`, `progress`, `badge`, `separator`, `dialog`, `tabs`, `sheet`, `sonner` | ✅ |
| 4 | Full folder structure created with all placeholder pages and API routes | ✅ |
| 5 | `src/types/index.ts` — All shared TypeScript types (`ParsedDataTable`, `MergePreviewRequest`, `MergePreviewResponse`, `CheckoutRequest`, `CheckoutResponse`, `ApiError`, `PricingTier`, `PricingConfig`) | ✅ |
| 6 | `src/lib/store/wizardStore.ts` — Zustand store with devtools, full state shape and all setters | ✅ |
| 7 | `src/lib/merge/variableReplacer.ts` — `replaceVariables()` and `replaceVariablesForPreview()` with `$variableName` regex logic | ✅ |
| 8 | `src/lib/tiptap/VariableNode.ts` — Custom TipTap inline `VariableNode` extension with `insertVariable` command | ✅ |
| 9 | `prisma/schema.prisma` — `User`, `Template`, `MergeSession` models; Prisma client generated | ✅ |
| 10 | `src/lib/storage/r2Client.ts` — `uploadToR2()` and `getPresignedUrl()` using `@aws-sdk/client-s3` with env guard | ✅ |
| 11 | `src/lib/parsers/csvParser.ts` — Client-side CSV parsing via `papaparse` with header sanitization, validation, 500-row/50-col limits | ✅ |
| 12 | `src/lib/parsers/xlsxParser.ts` — Client-side XLSX/XLS parsing via SheetJS with same validation rules | ✅ |
| 13 | `.env.local` — All environment variable placeholders defined | ✅ |
| 14 | `src/app/globals.css` — Custom classes added: `.variable-chip`, `.variable-matched`, `.variable-unmatched`, `.ProseMirror` styles | ✅ |
| 15 | `src/app/layout.tsx` — Updated metadata, Sonner `<Toaster />` wired in root layout | ✅ |

### Folder Structure

```
src/
├── app/
│   ├── page.tsx                          ✅ placeholder
│   ├── layout.tsx                        ✅ root layout with Toaster
│   ├── globals.css                       ✅ + custom MergeDocs styles
│   ├── data/upload/page.tsx              ✅ placeholder
│   ├── data/manual/page.tsx              ✅ placeholder
│   ├── template/page.tsx                 ✅ placeholder
│   ├── editor/page.tsx                   ✅ placeholder
│   ├── preview/page.tsx                  ✅ placeholder
│   ├── download/page.tsx                 ✅ placeholder
│   └── api/
│       ├── parse-docx/route.ts           ✅ placeholder (501)
│       ├── generate/preview/route.ts     ✅ placeholder (501)
│       ├── generate/bulk/route.ts        ✅ placeholder (501)
│       └── payment/
│           ├── checkout/route.ts         ✅ placeholder (501)
│           └── webhook/route.ts          ✅ placeholder (501)
├── components/
│   ├── wizard/                           ✅ empty (Session 2)
│   ├── shared/                           ✅ empty (Session 2)
│   └── ui/                               ✅ shadcn components
├── lib/
│   ├── store/wizardStore.ts              ✅ IMPLEMENTED
│   ├── tiptap/VariableNode.ts            ✅ IMPLEMENTED
│   ├── parsers/csvParser.ts              ✅ IMPLEMENTED
│   ├── parsers/xlsxParser.ts             ✅ IMPLEMENTED
│   ├── generators/docxGenerator.ts       ✅ placeholder (Session 3)
│   ├── generators/pdfGenerator.ts        ✅ placeholder (Session 3)
│   ├── generators/zipBuilder.ts          ✅ placeholder (Session 3)
│   ├── merge/variableReplacer.ts         ✅ IMPLEMENTED
│   ├── storage/r2Client.ts               ✅ IMPLEMENTED
│   ├── stripe/createCheckout.ts          ✅ placeholder (Session 4)
│   └── utils.ts                          ✅ shadcn utility
├── types/index.ts                        ✅ IMPLEMENTED
prisma/schema.prisma                      ✅ IMPLEMENTED + generated
.env.local                                ✅ all placeholders defined
```

---

## Session 2 — Data Source UI ✅

**Status:** Complete — build passed, git committed

### Steps Completed

| Step | Description | Status |
|------|-------------|--------|
| 10 | `src/lib/parsers/csvParser.ts` — Added `sanitizeVariableName()` export; renamed `parseCsv` → `parseCSV` | ✅ |
| 11 | `src/lib/parsers/xlsxParser.ts` — Imports `sanitizeVariableName` from csvParser; renamed `parseXlsx` → `parseXLSX` | ✅ |
| 12 | `src/components/wizard/StepIndicator.tsx` — 5-step horizontal progress bar with completed/current/future states | ✅ |
| 13 | `src/components/shared/WizardLayout.tsx` — Sticky top bar with logo + StepIndicator; `max-w-5xl` content area | ✅ |
| 14 | `src/components/wizard/FileUploader.tsx` — Drag-and-drop CSV/XLSX uploader; dispatches to `parseCSV` or `parseXLSX`; error toasts | ✅ |
| 15 | `src/components/wizard/DataTablePreview.tsx` — Editable table preview; inline header validation; Confirm button | ✅ |
| 16 | `src/components/wizard/ManualTableEditor.tsx` — Manual table entry; add/remove rows & cols; live variable/document count badge | ✅ |
| 17 | `src/app/page.tsx` — Landing page with Upload CSV/Excel and Enter Data Manually cards; wrapped in `WizardLayout currentStep={1}` | ✅ |
| 17b | `src/app/data/upload/page.tsx` — Upload flow: FileUploader → DataTablePreview → store → navigate `/template` | ✅ |
| 17c | `src/app/data/manual/page.tsx` — Manual flow: ManualTableEditor → store → navigate `/template` | ✅ |

---

## Session 3 — Template Editor & Preview ✅

**Status:** Complete — build passed, git committed

### Steps Completed

| Step | Description | Status |
|------|-------------|--------|
| 18 | `src/app/api/parse-docx/route.ts` — Accepts `.docx` via FormData; mammoth.js → HTML; returns `{ html }` | ✅ |
| 19 | `src/app/api/generate/preview/route.ts` — Accepts `{ templateHtml, firstRow }`; `replaceVariablesForPreview` + `replaceVariables`; returns `{ previewHtml, docxBase64 }` | ✅ |
| 20 | `src/components/wizard/DocumentSourceChoice.tsx` — Step 2 choice: import `.docx`/`.txt` or create new; error toast for `.doc`/unsupported | ✅ |
| 21 | `src/components/wizard/EditorToolbar.tsx` — TipTap formatting toolbar: Bold/Italic/Underline, H1/H2, alignment, lists, Undo/Redo | ✅ |
| 22 | `src/components/shared/DraggableVariableChip.tsx` — Draggable chip via `@dnd-kit/core` `useDraggable`; green checkmark overlay when used | ✅ |
| 23 | `src/components/wizard/VariableSidebar.tsx` — Variable list sidebar with draggable chips; `isUsed` detection via `data-variable` in editor HTML | ✅ |
| 24 | `src/components/wizard/TemplateEditor.tsx` — TipTap editor (StarterKit + TextStyle + Underline + TextAlign + Placeholder + VariableNode); `useDroppable` drop target; debounced `onChange` | ✅ |
| 24b | `src/app/template/page.tsx` — Step 2 page: guard redirect if no dataTable; DocumentSourceChoice → navigate to `/editor` | ✅ |
| 24c | `src/app/editor/page.tsx` — Step 3 page: DndContext wrapping VariableSidebar + TemplateEditor; Generate Preview → POST `/api/generate/preview` → navigate `/preview` | ✅ |
| 24d | `src/app/preview/page.tsx` — Step 4 page: renders `previewHtml`; free first-doc download (base64 → blob); navigate to `/download` | ✅ |

---

## Session 4 — Preview, Generation & Payments ✅

**Status:** Complete — build passed (16/16 pages), git committed

### Dependencies Added
- `html-to-docx` — server-side HTML → .docx conversion
- `src/types/html-to-docx.d.ts` — ambient TypeScript declaration
- `src/lib/db/prisma.ts` — Prisma singleton with hot-reload guard

### Steps Completed

| Step | Description | Status |
|------|-------------|--------|
| 25 | `src/lib/generators/docxGenerator.ts` — `generateDocx(html): Promise<Buffer>` and `generateDocxBase64(html): Promise<string>` via `html-to-docx` | ✅ |
| 26 | `src/app/api/generate/preview/route.ts` — Updated to call `generateDocxBase64`; returns real `.docx` base64 (not plain text placeholder) | ✅ |
| 27 | `src/components/wizard/PreviewRenderer.tsx` — A4-like white preview container; counts `variable-unmatched` spans and shows warning banner | ✅ |
| 28 | `src/app/preview/page.tsx` — Two-column layout: variable substitution table (left) + PreviewRenderer (right); free single-doc download; `DownloadGate` with Stripe redirect | ✅ |
| 29 | `src/app/api/payment/checkout/route.ts` — Validates rowCount (≤500); uploads input.json to R2; creates `MergeSession` in DB; creates Stripe Checkout session; returns `{ checkoutUrl }` | ✅ |
| 30 | `src/app/api/payment/webhook/route.ts` — Reads raw body via `request.text()`; verifies Stripe signature; on `checkout.session.completed` updates DB and fire-and-forgets bulk generation | ✅ |
| 31 | `src/lib/generators/zipBuilder.ts` — `buildZip(documents): Promise<Buffer>` using JSZip `nodebuffer` output | ✅ |
| 32a | `src/app/api/generate/bulk/route.ts` — Verifies paid session; downloads input.json from R2; generates per-row `.docx`; builds zip; uploads to R2; stores pre-signed URL; updates DB | ✅ |
| 32b | `src/app/api/session-status/route.ts` — `GET ?token=…` returns `{ status: 'pending' \| 'ready', downloadUrl? }` for download page polling | ✅ |
| 33 | `src/app/download/page.tsx` — Polls `/api/session-status` every 2s (max 5 min); auto-triggers download on ready; handles cancelled/no-token state; timeout state with support contact | ✅ |

### Pricing Logic Implemented
| Row Count | Price | Stripe Price Env |
|-----------|-------|-----------------|
| 1 | Free | — |
| 2–50 | $4.99 | `STRIPE_PRICE_BATCH_50` |
| 51–500 | $9.99 | `STRIPE_PRICE_BATCH_500` |
| > 500 | Rejected | `ROW_LIMIT_EXCEEDED` error |

---

## Session 5 — Polish & Production Readiness ✅

**Status:** Complete — build passed (16/16 pages, exit code 0), git committed

### New Files Created
- `src/lib/rateLimit.ts` — In-memory rate limiter (`checkRateLimit(key, limit, windowMs)`)
- `src/components/shared/ErrorBoundary.tsx` — React class component error boundary with Try Again / Go Home fallback
- `src/app/global-error.tsx` — Next.js App Router global error page (inline styles only, no shadcn deps)

### Steps Completed

| Step | Description | Status |
|------|-------------|--------|
| 34 | Mobile responsiveness: dismissable amber banner + Sheet slide-out sidebar on editor page; `overflow-x-auto` on upload/manual table containers | ✅ |
| 35 | Error boundaries: `ErrorBoundary` class component; `global-error.tsx`; wrapped upload, manual, editor, preview, and download pages | ✅ |
| 36 | Toast audit: success toast after CSV/XLSX parse ("N rows, M variables"); success toast after .txt/.docx import; "Preview ready" success toast; unmatched-variable warning toast in preview | ✅ |
| 37 | Loading states: variable-placed guard before preview generation ("Add at least one variable …"); `try/finally` ensures `isLoading` resets on all paths | ✅ |
| 38 | Security hardening: `src/lib/rateLimit.ts` applied to generate (30 req/min) and payment (10 req/min) routes; Content-Type + 5 MB body-size guards; `sanitizeVariableName` re-applied to all incoming keys in preview and bulk routes; `console.error` logging on all API error paths | ✅ |
| 39 | TypeScript quality: removed invalid `asChild` from `SheetTrigger` (base-ui/react has no asChild); fixed duplicate `body` declaration in checkout route; moved unmatched-variables `useEffect` before conditional return in preview page (hooks rules); explicit `Promise<NextResponse>` / `Promise<void>` return types on all API handlers | ✅ |
| 40 | Final build verification: `npm run build` → 16/16 pages, TypeScript clean, exit code 0 | ✅ |
