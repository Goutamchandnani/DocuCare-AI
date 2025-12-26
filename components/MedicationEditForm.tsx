"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Medication {
  id: string;
  user_id: string;
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
  reminders?: { time: string; dose: string }[];
  reminder_days?: string[];
}

interface MedicationEditFormProps {
  medicationId: string;
}

const MedicationEditForm: React.FC<MedicationEditFormProps> = ({ medicationId }) => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(['']);
  const [reminderFrequency, setReminderFrequency] = useState<Medication['reminder_frequency']>('daily');
  const [reminderDays, setReminderDays] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMedication() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching medication:', error);
        setError('Failed to load medication.');
      } else if (data) {
        setMedication(data);
        setName(data.name);
        setDosage(data.dosage);
        setFrequency(data.frequency);
        setInstructions(data.instructions);
        setStartDate(data.start_date);
        setEndDate(data.end_date || '');
        setIsActive(data.is_active);
        setReminderTimes(data.reminders?.map((r: { time: string; dose: string }) => r.time) || (data.reminder_time ? data.reminder_time.split(',') : ['']));
        setReminderFrequency(data.reminder_frequency || 'daily');
        setReminderDays(data.reminder_days ? data.reminder_days.split(',') : []);
      }
      setLoading(false);
    }

    fetchMedication();
  }, [medicationId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!medication) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      return;
    }

    const updatedMedication = {
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
    };

    const { error } = await supabase
      .from('medications')
      .update(updatedMedication)
      .eq('id', medicationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating medication:', error);
      setError('Failed to update medication.');
    } else {
      router.push('/medications');
    }
    setLoading(false);
  };

  if (loading) return <div className="p-4 text-center">Loading medication details...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!medication) return <div className="p-4 text-center">Medication not found.</div>;

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
      {reminderFrequency === 'weekly' && (
        <div>
          <Label>Reminder Days</Label>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={day}
                  value={day}
                  checked={reminderDays.includes(day)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setReminderDays([...reminderDays, day]);
                    } else {
                      setReminderDays(reminderDays.filter(d => d !== day));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor={day} className="ml-2">{day}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label>Reminder Times</Label>
        {reminderTimes.map((time, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => {
                const newReminderTimes = [...reminderTimes];
                newReminderTimes[index] = e.target.value;
                setReminderTimes(newReminderTimes);
              }}
            />
            {reminderTimes.length > 1 && (
              <Button type="button" variant="outline" onClick={() => {
                const newReminderTimes = reminderTimes.filter((_, i) => i !== index);
                setReminderTimes(newReminderTimes);
              }}>Remove</Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setReminderTimes([...reminderTimes, ''])}>Add Reminder Time</Button>
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
        <Button type="button" variant="outline" onClick={() => router.push('/medications')}>Cancel</Button>
        <Button type="submit">Update Medication</Button>
      </div>
    </form>
  );
};

export default MedicationEditForm;
