'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function DocumentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    const type = searchParams.get('type')
    if (type) {
      setSelectedType(type)
    }
  }, [searchParams])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value
    setSelectedType(newType)
    const params = new URLSearchParams(searchParams.toString())
    if (newType === 'all') {
      params.delete('type')
    } else {
      params.set('type', newType)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="mb-4">
      <label htmlFor="document-type-filter" className="block text-sm font-medium text-gray-700">Filter by Type</label>
      <select
        id="document-type-filter"
        name="document-type-filter"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        value={selectedType}
        onChange={handleFilterChange}
      >
        <option value="all">All</option>
        <option value="prescription">Prescription</option>
        <option value="lab_report">Lab Report</option>
        <option value="other">Other</option>
      </select>
    </div>
  )
}
