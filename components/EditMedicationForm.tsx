'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Medication } from '@/types'

export function EditMedicationForm({ medication }: { medication: Medication }) {
  const [name, setName] = useState(medication.name)
  const [dosage, setDosage] = useState(medication.dosage)
  const [frequency, setFrequency] = useState(medication.frequency)
  const [instructions, setInstructions] = useState(medication.instructions)
  const [startDate, setStartDate] = useState(medication.start_date)
  const [endDate, setEndDate] = useState(medication.end_date || '')
  const [isActive, setIsActive] = useState(medication.is_active)
  const [reminderTime, setReminderTime] = useState(medication.reminder_time || '')
  const [reminderFrequency, setReminderFrequency] = useState<Medication['reminder_frequency']>(medication.reminder_frequency || 'daily')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage('User not logged in.')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('medications')
      .update({
        name,
        dosage,
        frequency,
        instructions,
        start_date: startDate,
        end_date: endDate || null,
        is_active: isActive,
        reminder_time: reminderTime || null,
        reminder_frequency: reminderFrequency || null,
      })
      .eq('id', medication.id)
      .eq('user_id', user.id)

    if (error) {
      setMessage(`Error updating medication: ${error.message}`)
    } else {
      setMessage('Medication updated successfully!')
      router.refresh()
      router.push('/medications')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-md">
      {message && <p className="mb-4 text-center text-sm text-green-500">{message}</p>}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="dosage" className="block text-gray-700 text-sm font-bold mb-2">Dosage:</label>
        <input
          type="text"
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="frequency" className="block text-gray-700 text-sm font-bold mb-2">Frequency:</label>
        <input
          type="text"
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="instructions" className="block text-gray-700 text-sm font-bold mb-2">Instructions:</label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={3}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">End Date (optional):</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="mr-2 leading-tight"
        />
        <label htmlFor="isActive" className="text-gray-700 text-sm font-bold">Currently Active</label>
      </div>
      <div className="mb-4">
        <label htmlFor="reminderTime" className="block text-gray-700 text-sm font-bold mb-2">Reminder Time:</label>
        <input
          type="time"
          id="reminderTime"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="reminderFrequency" className="block text-gray-700 text-sm font-bold mb-2">Reminder Frequency:</label>
        <select
          id="reminderFrequency"
          value={reminderFrequency || 'daily'}
          onChange={(e) => setReminderFrequency(e.target.value as Medication['reminder_frequency'])}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Medication'}
      </button>
    </form>
  )
}