'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Medication } from '@/types'

export function EditMedicationForm({ medication }: { medication: Medication }) {
  const [name, setName] = useState(medication.name)
  const [dosage, setDosage] = useState(medication.dosage || '')
  const [frequency, setFrequency] = useState(medication.frequency || '')
  const [instructions, setInstructions] = useState(medication.instructions || '')
  const [startDate, setStartDate] = useState(medication.start_date)
  const [endDate, setEndDate] = useState(medication.end_date || '')
  const [isActive, setIsActive] = useState(medication.is_active)
  const [reminderTimes, setReminderTimes] = useState<string[]>(medication.reminder_time ? medication.reminder_time.split(',') : ['']);
  const [reminderFrequency, setReminderFrequency] = useState<Medication['reminder_frequency']>(medication.reminder_frequency || 'daily');
  const [reminderDays, setReminderDays] = useState<string[]>(medication.reminder_days ? medication.reminder_days.split(',') : []);
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAddReminderTime = () => {
    setReminderTimes([...reminderTimes, '']);
  };

  const handleRemoveReminderTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleReminderTimeChange = (index: number, value: string) => {
    const newReminderTimes = [...reminderTimes];
    newReminderTimes[index] = value;
    setReminderTimes(newReminderTimes);
  };

  const handleReminderDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setReminderDays(prev =>
      checked ? [...prev, value] : prev.filter(day => day !== value)
    );
  };

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
        reminder_time: reminderTimes.filter(time => time !== '').join(',') || null,
        reminder_frequency: reminderFrequency || null,
        reminder_days: reminderFrequency === 'weekly' ? reminderDays.join(',') : null,
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
          value={startDate || ''}
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
          value={endDate || ''}
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
        <label className="block text-gray-700 text-sm font-bold mb-2">Reminder Times:</label>
        {reminderTimes.map((time, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="time"
              value={time}
              onChange={(e) => handleReminderTimeChange(index, e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {reminderTimes.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveReminderTime(index)}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
              >
                -
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddReminderTime}
          className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
        >
          + Add Time
        </button>
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

      {reminderFrequency === 'weekly' && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Days of the Week:</label>
          <div className="flex flex-wrap gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <label key={day} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={day}
                  checked={reminderDays.includes(day)}
                  onChange={handleReminderDayChange}
                  className="form-checkbox"
                />
                <span className="ml-2 text-gray-700">{day}</span>
              </label>
            ))}
          </div>
        </div>
      )}
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