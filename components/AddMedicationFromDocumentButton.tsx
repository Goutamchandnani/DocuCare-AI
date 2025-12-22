'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Document } from '@/types'

export function AddMedicationFromDocumentButton({ document }: { document: Document }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAddMedication = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Placeholder for medication extraction logic
      // In a real scenario, you would parse document.extracted_text or document.ai_summary
      // to get medication name, dosage, frequency, etc.
      const medicationName = document.filename.replace(/\.(pdf|png|jpg|jpeg)$/i, '') || 'Unknown Medication'

      const { error } = await supabase.from('medications').insert({
        user_id: user.id,
        document_id: document.id,
        name: medicationName,
        dosage: 'N/A', // Placeholder
        frequency: 'N/A', // Placeholder
        instructions: 'Refer to document', // Placeholder
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
      })

      if (error) {
        console.error('Error adding medication:', error)
        alert('Failed to add medication.')
      } else {
        alert('Medication added successfully!')
        router.push('/medications')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddMedication}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
    >
      {isLoading ? 'Adding...' : 'Add to Medications'}
    </button>
  )
}
