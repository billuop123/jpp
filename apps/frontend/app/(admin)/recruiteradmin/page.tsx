'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { BACKEND_URL } from '@/scripts/lib/config'
import { useUser } from '@/store/user'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import LoadingStep from '@/components/LoadingStep'

type Recruiter = {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
  company?: {
    name: string
  }[]
  role: {
    code: string
  }
  isPremium: boolean
}

export default function RecruiterAdminPage() {
  const { token } = useUser()
  const [page, setPage] = useState(1)
  const [limit] = useState(2)

  const { data, isLoading, error } = useQuery({
    queryKey: ['recruiters', page, limit],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/admin/recruiters?page=${page}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token!,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch recruiters')
      }

      return (await response.json()) as Recruiter[]
    },
  })

  const recruiters = data ?? []

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recruiters</h1>
        <div className="text-sm text-muted-foreground">
          Page {page}
        </div>
      </div>

      {isLoading && <LoadingStep message="Loading recruiters..." />}

      {error && (
        <p className="text-sm text-red-500">
          {(error as Error).message ?? 'Something went wrong while fetching recruiters.'}
        </p>
      )}

      {!isLoading && !error && recruiters.length === 0 && (
        <p className="text-sm text-muted-foreground">No recruiters found.</p>
      )}

      {recruiters.length > 0 && (
        <Table>
          <TableCaption>List of all recruiter users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruiters.map((recruiter) => (
              <TableRow key={recruiter.id}>
                <TableCell>{recruiter.name ?? '-'}</TableCell>
                <TableCell>{recruiter.email}</TableCell>
                <TableCell>
                  {recruiter.company && recruiter.company.length > 0
                    ? recruiter.company[0]?.name
                    : '-'}
                </TableCell>
                <TableCell>{recruiter.role?.code ?? '-'}</TableCell>
                <TableCell>
                  {recruiter.isPremium ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  {new Date(recruiter.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <button
          type="button"
          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={isLoading || recruiters.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  )
}