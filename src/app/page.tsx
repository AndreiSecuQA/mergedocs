'use client'

import { useRouter } from 'next/navigation'
import { UploadCloud, Table } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()

  return (
    <WizardLayout currentStep={1}>
      <div className="flex flex-col items-center text-center mb-12 mt-4">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          Generate hundreds of personalized<br className="hidden sm:block" /> documents in minutes
        </h1>
        <p className="mt-4 text-lg text-zinc-500 max-w-xl">
          No Word. No complexity. Just your data and your template.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Upload File */}
        <Card className="hover:border-blue-300 hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Upload CSV or Excel</CardTitle>
            <CardDescription>Import your data from a spreadsheet</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/data/upload')}>
              Upload File
            </Button>
          </CardContent>
        </Card>

        {/* Manual Entry */}
        <Card className="hover:border-blue-300 hover:shadow-md transition-all group">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-3 group-hover:bg-violet-100 transition-colors">
              <Table className="w-6 h-6 text-violet-600" />
            </div>
            <CardTitle className="text-lg">Enter Data Manually</CardTitle>
            <CardDescription>Type your data directly into a table editor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => router.push('/data/manual')}>
              Create Table
            </Button>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  )
}
