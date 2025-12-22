'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function DocumentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchTerm(search)
    }
  }, [searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    const params = new URLSearchParams(searchParams.toString())
    if (newSearchTerm === '') {
      params.delete('search')
    } else {
      params.set('search', newSearchTerm)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="mb-4">
      <label htmlFor="document-search" className="block text-sm font-medium text-gray-700">Search Documents</label>
      <input
        type="text"
        id="document-search"
        name="document-search"
        placeholder="Search by filename or summary..."
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  )
}
