"use client"

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface MedicationFormProps {
  onSave: (medication: Omit<Medication, 'id' | 'user_id'>) => void;
  onCancel: () => void;
  initialData?: Medication | null;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  document_id: string | null;
  reminder_time?: string | null;
  reminder_frequency?: 'daily' | 'twice_daily' | 'weekly' | null;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '')
  const [dosage, setDosage] = useState(initialData?.dosage || '')
  const [frequency, setFrequency] = useState(initialData?.frequency || '')
  const [instructions, setInstructions] = useState(initialData?.instructions || '')
  const [startDate, setStartDate] = useState(initialData?.start_date || '')
  const [endDate, setEndDate] = useState(initialData?.end_date || '')
  const [isActive, setIsActive] = useState(initialData?.is_active || false)
  const [reminderTime, setReminderTime] = useState(initialData?.reminder_time || '')
  const [reminderFrequency, setReminderFrequency] = useState<Medication['reminder_frequency']>(initialData?.reminder_frequency || 'daily')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      dosage,
      frequency,
      instructions,
      start_date: startDate,
      end_date: endDate || null,
      is_active: isActive,
      document_id: initialData?.document_id || null, // Preserve document_id if editing
      reminder_time: reminderTime || null,
      reminder_frequency: reminderFrequency || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <div>
        <Label htmlFor="name">Medication Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="dosage">Dosage</Label>
        <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <Input id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Input id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" type="date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="reminderTime">Reminder Time</Label>
        <Input id="reminderTime" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
        <select
          id="reminderFrequency"
          value={reminderFrequency || ''}
          onChange={(e) => setReminderFrequency(e.target.value as Medication['reminder_frequency'])}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="isActive">Is Active</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Medication</Button>
      </div>
    </form>
  )
}

export default MedicationForm
