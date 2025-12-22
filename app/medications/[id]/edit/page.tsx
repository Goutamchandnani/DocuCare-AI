import { createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Medication } from '@/types'
import { EditMedicationForm } from '@/components/EditMedicationForm'

export default async function EditMedicationPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient(cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: medication, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !medication) {
    console.error('Error fetching medication:', error)
    redirect('/medications')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Edit Medication</h1>
      <p className="text-lg mt-4">Editing medication: {medication.name}</p>
      <div className="mt-8 w-full max-w-md">
        <EditMedicationForm medication={medication} />
      </div>
    </div>
  )
}