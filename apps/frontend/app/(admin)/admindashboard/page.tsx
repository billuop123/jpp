'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { BACKEND_URL } from '@/scripts/lib/config'
import { useUser } from '@/store/user'
import type { Company } from '@/components/companies/types'
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader'
import { UnverifiedCompaniesSection } from '@/components/admin/UnverifiedCompaniesSection'
import { CompanyVerificationDialog } from '@/components/admin/CompanyVerificationDialog'

export default function AdminDashboard() {
  const { token } = useUser()
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['unverified-companies', page, limit],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/admin/unverified-companies?page=${page}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token!,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch unverified companies')
      }

      return (await response.json()) as Company[]
    },
  })

  const unverifiedCompanies = data ?? []

  const openPdfInBrowser = async (url: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const pdfUrl = URL.createObjectURL(
        new Blob([blob], { type: 'application/pdf' }),
      )
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const verifyCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await fetch(
        `${BACKEND_URL}/admin/verify-company/${companyId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token!,
          },
        },
      )

      const res = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(res.message || 'Failed to verify company')
      }

      return res
    },
    onSuccess: () => {
      toast.success('Company verified successfully')
      setIsDialogOpen(false)
      setSelectedCompany(null)
      queryClient.invalidateQueries({ queryKey: ['unverified-companies'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to verify company')
    },
  })

  const handleOpenCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    if (verifyCompanyMutation.isPending) return
    setIsDialogOpen(false)
    setSelectedCompany(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <AdminDashboardHeader />

        <UnverifiedCompaniesSection
          page={page}
          limit={limit}
          isLoading={isLoading}
          error={error}
          companies={unverifiedCompanies}
          onPageChange={setPage}
          onReviewCompany={handleOpenCompany}
          onOpenDocument={(company) => {
            if (company.incorporationLink) {
              openPdfInBrowser(company.incorporationLink)
            }
          }}
        />
      </div>

      <CompanyVerificationDialog
        isOpen={isDialogOpen}
        company={selectedCompany}
        isVerifying={verifyCompanyMutation.isPending}
        onClose={handleCloseDialog}
        onVerify={() => {
          if (selectedCompany) {
            verifyCompanyMutation.mutate(selectedCompany.id)
          }
        }}
        onOpenPdf={openPdfInBrowser}
      />
    </div>
  )
}