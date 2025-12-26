"use client";

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  reminders: any[]; // Assuming reminders can be an array of objects
  created_at: string;
  reminder_time?: string | null;
  reminder_frequency?: 'daily' | 'twice_daily' | 'weekly' | null;
}

interface MedicationListProps {
  refreshTrigger?: number;
}

export default function MedicationList({ refreshTrigger }: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // You can adjust this value
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleDelete = async (medicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this medication?')) {
      return;
    }
    try {
      const response = await fetch(`/api/medications/${medicationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete medication');
      }

      setMedications(medications.filter(med => med.id !== medicationId));
    } catch (err: any) {
      console.error('Error deleting medication:', err.message);
      alert(`Failed to delete medication: ${err.message}`);
    }
  };

  useEffect(() => {
    async function fetchMedications() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const from = page * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching medications:', error);
        setError('Failed to load medications.');
        setMedications([]);
      } else if (data) {
        setMedications(prevMedications => [...prevMedications, ...data as Medication[]]);
        setHasMore(data.length === itemsPerPage);
      } else {
        setMedications([]);
        setHasMore(false);
      }
      setLoading(false);
    }

    fetchMedications();
  }, [supabase, refreshTrigger, page, itemsPerPage]);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      setMedications([]);
      setPage(0);
      setHasMore(true);
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100 && hasMore && !loading) {
        setPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  if (loading && medications.length === 0) return <div className="p-4 text-center">Loading medications...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Medications</h2>
      {medications.length === 0 ? (
        <p>No medications found. Add your first medication!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Dosage</th>
                <th className="py-3 px-6 text-left">Frequency</th>
                <th className="py-3 px-6 text-left">Start Date</th>
                <th className="py-3 px-6 text-left">End Date</th>
                <th className="py-3 px-6 text-left">Reminders</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {medications.map((med) => (
                <tr key={med.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{med.name}</td>
                  <td className="py-3 px-6 text-left">{med.dosage}</td>
                  <td className="py-3 px-6 text-left">{med.frequency}</td>
                  <td className="py-3 px-6 text-left">{new Date(med.start_date).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-left">{med.end_date ? new Date(med.end_date).toLocaleDateString() : 'N/A'}</td>
                  <td className="py-3 px-6 text-left">
                    {med.reminders && med.reminders.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {med.reminders.map((r: any, index: number) => (
                          <li key={index}>{r.time} ({r.dose})</li>
                        ))}
                      </ul>
                    ) : (
                      'No reminders'
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {/* Placeholder for Edit and Delete buttons */}
                    <button onClick={() => router.push(`/medications/edit/${med.id}`)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">Edit</button>
                    <button onClick={() => handleDelete(med.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
