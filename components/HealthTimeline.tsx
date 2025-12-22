"use client";

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HealthEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_date: string;
  title: string;
  description: string | null;
  metadata: any | null;
  created_at: string;
}

export default function HealthTimeline() {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchHealthEvents() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('health_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error fetching health events:', error);
        setError('Failed to load health events.');
        setHealthEvents([]);
      } else if (data) {
        setHealthEvents(data as HealthEvent[]);
      } else {
        setHealthEvents([]);
      }
      setLoading(false);
    }

    fetchHealthEvents();
  }, [supabase]);

  if (loading) return <div className="p-4 text-center">Loading health timeline...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Health Timeline</h2>
      {healthEvents.length === 0 ? (
        <p>No health events found. Start by adding some!</p>
      ) : (
        <div className="space-y-6">
          {healthEvents.map((event) => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 text-sm mb-1">{new Date(event.event_date).toLocaleDateString()} - {event.event_type}</p>
              {event.description && <p className="text-gray-700 mb-2">{event.description}</p>}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Details:</strong>
                  <pre className="bg-gray-100 p-2 rounded-md mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(event.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
