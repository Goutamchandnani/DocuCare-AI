'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Document as DocumentType } from '@/types'

interface Document extends DocumentType {
  structured_data?: any; // Allow for structured data
}

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

      let medicationName = 'Unknown Medication'
      let dosage = 'N/A'
      let frequency = 'N/A'
      let instructions = 'Refer to document'

      if (document.structured_data && document.structured_data.Medications && document.structured_data.Medications.length > 0) {
        const firstMedication = document.structured_data.Medications[0]
        medicationName = firstMedication.name || medicationName
        dosage = firstMedication.dosage || dosage
        frequency = firstMedication.frequency || frequency
        instructions = firstMedication.instructions || instructions
      } else {
        // Fallback to filename if no structured medication data
        medicationName = document.filename.replace(/\.(pdf|png|jpg|jpeg)$/i, '') || 'Unknown Medication'
      }

      const { error } = await supabase.from('medications').insert({
        user_id: user.id,
        document_id: document.id,
        name: medicationName,
        dosage: dosage,
        frequency: frequency,
        instructions: instructions,
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
