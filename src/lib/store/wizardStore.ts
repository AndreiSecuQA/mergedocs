import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { ParsedDataTable } from '@/types'

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5
  dataTable: ParsedDataTable | null
  dataSource: 'upload' | 'manual' | null
  templateSource: 'import' | 'new' | null
  templateHtml: string
  templateName: string
  previewHtml: string
  previewDocxBase64: string
  paymentStatus: 'unpaid' | 'pending' | 'paid'
  sessionToken: string | null
  downloadUrl: string | null

  setCurrentStep: (step: WizardState['currentStep']) => void
  setDataTable: (table: ParsedDataTable) => void
  setDataSource: (source: WizardState['dataSource']) => void
  setTemplateSource: (source: WizardState['templateSource']) => void
  setTemplateHtml: (html: string) => void
  setTemplateName: (name: string) => void
  setPreviewHtml: (html: string) => void
  setPreviewDocxBase64: (b64: string) => void
  setPaymentStatus: (status: WizardState['paymentStatus']) => void
  setSessionToken: (token: string) => void
  setDownloadUrl: (url: string) => void
  reset: () => void
}

const initialState = {
  currentStep: 1 as const,
  dataTable: null,
  dataSource: null,
  templateSource: null,
  templateHtml: '',
  templateName: 'Untitled Template',
  previewHtml: '',
  previewDocxBase64: '',
  paymentStatus: 'unpaid' as const,
  sessionToken: null,
  downloadUrl: null,
}

export const useWizardStore = create<WizardState>()(
  devtools(
    persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setDataTable: (table) => set({ dataTable: table }),
      setDataSource: (source) => set({ dataSource: source }),
      setTemplateSource: (source) => set({ templateSource: source }),
      setTemplateHtml: (html) => set({ templateHtml: html }),
      setTemplateName: (name) => set({ templateName: name }),
      setPreviewHtml: (html) => set({ previewHtml: html }),
      setPreviewDocxBase64: (b64) => set({ previewDocxBase64: b64 }),
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      setSessionToken: (token) => set({ sessionToken: token }),
      setDownloadUrl: (url) => set({ downloadUrl: url }),
      reset: () => set(initialState),
    }),
    {
      name: 'mergedocs-wizard',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
    }
  ),
    { name: 'WizardStore' }
  )
)
