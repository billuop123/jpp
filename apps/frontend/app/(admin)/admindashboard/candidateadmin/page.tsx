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

type Candidate = {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
  role: {
    code: string
  }
  isPremium: boolean
}

export default function CandidatePage() {
  const { token } = useUser()
  const [page, setPage] = useState(1)
  const [limit] = useState(5)

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', page, limit],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch(
        `${BACKEND_URL}/admin/candidates?page=${page}&limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token!,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }

      return (await response.json()) as Candidate[]
    },
  })

  const candidates = data ?? []

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <div className="text-sm text-muted-foreground">
          Page {page}
        </div>
      </div>

      {isLoading && <LoadingStep message="Loading candidates..." />}

      {error && (
        <p className="text-sm text-red-500">
          {(error as Error).message ?? 'Something went wrong while fetching candidates.'}
        </p>
      )}

      {!isLoading && !error && candidates.length === 0 && (
        <p className="text-sm text-muted-foreground">No candidates found.</p>
      )}

      {candidates.length > 0 && (
        <Table>
          <TableCaption>List of all candidate users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name ?? '-'}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.role?.code ?? '-'}</TableCell>
                <TableCell>
                  {candidate.isPremium ? 'Yes' : 'No'}
                </TableCell>
                <TableCell>
                  {new Date(candidate.createdAt).toLocaleDateString(undefined, {
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
          disabled={isLoading || candidates.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  )
}