"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { UploadForm } from "@/components/upload-form"

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Content</h1>
          <p className="text-muted-foreground mt-2">
            Upload photos, testimonials, or project notes to generate SEO-optimized blog posts
          </p>
        </div>

        <UploadForm />
      </div>
    </DashboardLayout>
  )
}
